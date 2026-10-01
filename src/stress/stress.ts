import http from 'k6/http';
import { check, sleep } from 'k6';
import type { Options } from 'k6/options';
import { buildUrls, loadTargets } from '../https';

const urls = buildUrls(loadTargets());

export const options: Options = {
  scenarios: {
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 20 },
        { duration: '1m', target: 50 },
        { duration: '30s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<2000'],
  },
};

export default function stress(): void {
  const url = urls[Math.floor(Math.random() * urls.length)];
  const res = http.get(url);

  check(res, {
    'status is not a server error': (r) => r.status < 500,
  });

  sleep(Math.random());
}
