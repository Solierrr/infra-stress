/**
 * Requests and checks for the web-app (React SPA served as static files).
 * One virtual user iteration is one page load: the HTML plus the hashed
 * assets the HTML references, discovered once in setup().
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

// Public routes of the SPA (routes.json, pt-BR). Deep links only work when the
// host rewrites unknown paths to index.html, which is part of what is tested.
export const PAGES = [
  '/',
  '/pt-BR',
  '/pt-BR/placas-solares',
  '/pt-BR/empresas',
  '/pt-BR/profissionais',
  '/pt-BR/infraestrutura',
  '/pt-BR/login',
];

export interface AppData {
  assets: string[];
}

/**
 * Waits for the host to answer (Render's free tier sleeps and takes about 30
 * seconds to wake up) and collects the /assets/* files the home page loads.
 */
export function setupApp(baseUrl: string): AppData {
  let html = '';
  for (let attempt = 0; attempt < 12; attempt++) {
    const res = http.get(`${baseUrl}/`, { timeout: '30s', responseCallback: http.expectedStatuses({ min: 200, max: 599 }) });
    if (res.status === 200) {
      html = String(res.body);
      break;
    }
    sleep(5);
  }
  if (!html) {
    throw new Error(`${baseUrl} did not answer 200 within the warm-up window`);
  }

  const assets = new Set<string>();
  for (const match of html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)) {
    assets.add(match[1]);
  }
  return { assets: [...assets] };
}

export function pageLoad(baseUrl: string, data: AppData, path: string): void {
  const responses = http.batch([
    ['GET', `${baseUrl}${path}`],
    ...data.assets.map((asset): ['GET', string] => ['GET', `${baseUrl}${asset}`]),
  ]);

  check(responses[0], {
    'page is 200': (r) => r.status === 200,
    'page is the SPA shell': (r) => String(r.body).includes('id="root"'),
  });
  check(responses.slice(1), {
    'assets are 200': (rs) => rs.every((r) => r.status === 200),
  });
}

export function pickPage(): string {
  return PAGES[(__VU * 7 + __ITER) % PAGES.length];
}
