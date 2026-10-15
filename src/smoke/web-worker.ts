import { sleep } from 'k6';
import type { Options } from 'k6/options';
import { resolveProfile } from '../config';
import { allowMaintenancePage, edgeRequest, HONEYPOT_PATHS, honeypotAllowed, honeypotRequest } from '../web-worker';

const profile = resolveProfile();
const PATHS = ['/', '/pt-BR', '/pt-BR/login'];

export const options: Options = {
  vus: 1,
  iterations: PATHS.length,
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<2500'],
  },
};

export function setup(): void {
  allowMaintenancePage();
  if (__ENV.HONEYPOT === 'yes' && !honeypotAllowed(profile.env)) {
    console.warn('HONEYPOT=yes ignored: it would ban this IP on a real deployment (use ENV=local or ALLOW_BAN=yes)');
  }
}

export default function smoke(): void {
  allowMaintenancePage();
  edgeRequest(profile.baseUrl, PATHS[__ITER % PATHS.length]);

  if (honeypotAllowed(profile.env)) {
    honeypotRequest(profile.baseUrl, HONEYPOT_PATHS[__ITER % HONEYPOT_PATHS.length]);
  }
  sleep(1);
}
