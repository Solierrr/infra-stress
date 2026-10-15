/**
 * Requests and checks for the Cloudflare Worker (web-worker) that fronts the
 * root domain: it forwards to the origin and answers a 503 maintenance page
 * when the (ephemeral) origin is down, and it answers honeypot paths with a
 * 404 decoy without reaching the origin.
 */
import http from 'k6/http';
import { check } from 'k6';
import { Rate } from 'k6/metrics';

/** Share of requests the Worker answered with its maintenance page. */
export const originUnavailable = new Rate('origin_unavailable');

/** The maintenance page is expected behaviour, not a failed request. */
export function allowMaintenancePage(): void {
  http.setResponseCallback(http.expectedStatuses({ min: 200, max: 399 }, 503));
}

// A few of the paths in web-worker/src/honeypot/paths.json.
export const HONEYPOT_PATHS = ['/wp-login.php', '/.env', '/phpmyadmin/'];

export function edgeRequest(baseUrl: string, path: string): void {
  const res = http.get(`${baseUrl}${path}`);
  const unavailable = res.status === 503;
  originUnavailable.add(unavailable);

  check(res, {
    'edge answers 2xx/3xx or the 503 maintenance page': (r) => (r.status >= 200 && r.status < 400) || r.status === 503,
    'maintenance page is complete': (r) =>
      r.status !== 503 ||
      (r.headers['Retry-After'] === '60' && String(r.body).includes('Estamos voltando em breve')),
  });
}

export function honeypotRequest(baseUrl: string, path: string): void {
  const res = http.get(`${baseUrl}${path}`, { responseCallback: http.expectedStatuses(404) });
  check(res, {
    'honeypot answers the 404 decoy': (r) => r.status === 404 && String(r.body).includes('Not Found'),
    'honeypot is not cacheable': (r) => r.headers['Cache-Control'] === 'no-store',
  });
}

/**
 * A honeypot hit on a real deployment adds the caller's IP to the Cloudflare
 * ban list (Managed Challenge afterwards), so it is opt-in and only runs
 * locally unless ALLOW_BAN=yes.
 */
export function honeypotAllowed(env: string): boolean {
  return __ENV.HONEYPOT === 'yes' && (env === 'local' || __ENV.ALLOW_BAN === 'yes');
}
