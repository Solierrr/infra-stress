import { sleep } from 'k6';
import type { Options } from 'k6/options';
import { resolveProfile, stressStages } from '../config';
import { allowMaintenancePage, edgeRequest } from '../web-worker';

const profile = resolveProfile();
const PATHS = ['/', '/pt-BR', '/pt-BR/placas-solares', '/pt-BR/login'];

export const options: Options = {
  scenarios: {
    stress: { executor: 'ramping-vus', startVUs: 0, stages: stressStages(profile.peakVus) },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<4000'],
  },
};

export default function stress(): void {
  allowMaintenancePage();
  edgeRequest(profile.baseUrl, PATHS[Math.floor(Math.random() * PATHS.length)]);
  sleep(Math.random());
}
