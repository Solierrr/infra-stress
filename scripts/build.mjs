// Bundles every k6 test entry point (src/index.ts, src/smoke/*.ts, src/stress/*.ts)
// into dist/, preserving the src folder layout, then copies the targets JSON
// next to each compiled file so k6's `open()` can find it at runtime.
import { build } from 'esbuild';
import { mkdirSync, copyFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const SRC = 'src';
const DIST = 'dist';
const TEST_DIRS = ['smoke', 'stress'];

function findEntries(dir) {
  const full = join(SRC, dir);
  if (!existsSync(full)) return [];
  return readdirSync(full)
    .filter((f) => f.endsWith('.ts'))
    .map((f) => join(full, f));
}

const entries = [join(SRC, 'index.ts'), ...TEST_DIRS.flatMap(findEntries)];

mkdirSync(DIST, { recursive: true });

await build({
  entryPoints: entries,
  bundle: true,
  outdir: DIST,
  outbase: SRC,
  platform: 'node',
  target: 'es2020',
  format: 'cjs',
  // k6 resolves its own built-in modules (k6, k6/http, k6/options, ...);
  // esbuild must not try to bundle them.
  external: ['k6', 'k6/*'],
  logLevel: 'info',
});

// urls.json is gitignored (real targets); fall back to the committed example
// so a fresh checkout still has something runnable.
const urlsSource = existsSync(join(SRC, 'urls.json'))
  ? join(SRC, 'urls.json')
  : join(SRC, 'urls.example.json');

for (const dir of ['.', ...TEST_DIRS]) {
  const outDir = join(DIST, dir);
  mkdirSync(outDir, { recursive: true });
  copyFileSync(urlsSource, join(outDir, 'urls.json'));
}

console.log(`\nTargets file used: ${urlsSource}`);
console.log('Build complete ->', DIST);
