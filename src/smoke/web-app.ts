import { sleep } from 'k6';
import type { Options } from 'k6/options';
import { resolveProfile } from '../config';
import { pageLoad, PAGES, setupApp } from '../web-app';

const profile = resolveProfile();

export const options: Options = {
  vus: 1,
  iterations: PAGES.length,
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: [profile.env === 'local' ? 'p(95)<1000' : 'p(95)<2500'],
  },
};

export function setup() {
  return setupApp(profile.baseUrl);
}

export default function smoke(data: ReturnType<typeof setup>): void {
  pageLoad(profile.baseUrl, data, PAGES[__ITER % PAGES.length]);
  sleep(1);
}
