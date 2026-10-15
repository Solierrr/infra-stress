/**
 * Resolves which target (web-worker or web-app) and which environment a run
 * hits, from k6's `-e` flags:
 *
 *   TARGET        web-app | web-worker            (required)
 *   ENV           local | qa | prod               (default local)
 *   BASE_URL      overrides the URL from targets.json
 *   PEAK_VUS      overrides the stress peak
 *   CONFIRM_PROD  must be "yes" for ENV=prod
 *
 * Production is the shared Cloudflare/Render free tier, so the guard rails
 * are strict: prod needs an explicit confirmation and gets a lower peak.
 */
import targets from './targets.json';

export type Environment = 'local' | 'qa' | 'prod';

export interface Profile {
  target: string;
  env: Environment;
  baseUrl: string;
  peakVus: number;
}

const ENVIRONMENTS: Environment[] = ['local', 'qa', 'prod'];
const DEFAULT_PEAK_VUS: Record<Environment, number> = { local: 50, qa: 20, prod: 10 };

type TargetMap = Record<string, Partial<Record<Environment, string>>>;

function stripTrailingSlashes(url: string): string {
  let end = url.length;
  while (end > 0 && url[end - 1] === '/') end--;
  return url.slice(0, end);
}

export function resolveProfile(): Profile {
  const map = targets as TargetMap;
  const target = __ENV.TARGET ?? '';
  if (!map[target]) {
    throw new Error(`TARGET must be one of: ${Object.keys(map).join(', ')} (got "${target}")`);
  }

  const env = (__ENV.ENV ?? 'local') as Environment;
  if (!ENVIRONMENTS.includes(env)) {
    throw new Error(`ENV must be one of: ${ENVIRONMENTS.join(', ')} (got "${env}")`);
  }

  const baseUrl = stripTrailingSlashes(__ENV.BASE_URL ?? map[target][env] ?? '');
  if (!baseUrl) {
    throw new Error(`${target} has no "${env}" environment in targets.json; set BASE_URL to override`);
  }

  if (env === 'prod' && __ENV.CONFIRM_PROD !== 'yes') {
    throw new Error(`Refusing to hit production (${baseUrl}) without CONFIRM_PROD=yes`);
  }

  const peak = Number(__ENV.PEAK_VUS ?? DEFAULT_PEAK_VUS[env]);
  return { target, env, baseUrl, peakVus: Number.isFinite(peak) && peak > 0 ? Math.floor(peak) : DEFAULT_PEAK_VUS[env] };
}

/** Ramp-up, plateau and ramp-down scaled to the profile's peak. */
export function stressStages(peakVus: number): { duration: string; target: number }[] {
  return [
    { duration: '30s', target: Math.max(1, Math.ceil(peakVus / 2)) },
    { duration: '1m', target: peakVus },
    { duration: '30s', target: 0 },
  ];
}
