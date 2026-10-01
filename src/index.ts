// Default k6 entry point. Re-exports the smoke test so `k6 run dist/index.js`
// works out of the box; point k6 directly at dist/smoke/smoke.js or
// dist/stress/stress.js to run a specific suite instead.
export { default, options } from './smoke/smoke';
