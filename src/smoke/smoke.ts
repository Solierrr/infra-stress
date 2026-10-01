import http from 'k6/http';
import { check, sleep } from 'k6';
import type { Options } from 'k6/options';
import { buildUrls, loadTargets } from '../https';

const urls = buildUrls(loadTargets());

export const options: Options = {
  vus: 1,
  iterations: Math.max(urls.length, 1),
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1000'],
  },
};

export default function smoke(): void {
  const url = urls[__ITER % urls.length];
  const res = http.get(url);

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
