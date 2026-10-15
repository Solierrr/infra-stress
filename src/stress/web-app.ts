import { sleep } from 'k6';
import type { Options } from 'k6/options';
import { resolveProfile, stressStages } from '../config';
import { pageLoad, pickPage, setupApp } from '../web-app';

const profile = resolveProfile();

export const options: Options = {
  scenarios: {
    stress: { executor: 'ramping-vus', startVUs: 0, stages: stressStages(profile.peakVus) },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: [profile.env === 'local' ? 'p(95)<2000' : 'p(95)<4000'],
  },
};

export function setup() {
  return setupApp(profile.baseUrl);
}

export default function stress(data: ReturnType<typeof setup>): void {
  pageLoad(profile.baseUrl, data, pickPage());
  sleep(Math.random() * 2);
}
