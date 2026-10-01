/**
 * Loads the list of attack targets (urls.json) and expands them into a flat
 * list of full URLs that test scripts can hit.
 *
 * k6 scripts run in a JS runtime without Node's `fs` module, so reading a
 * local file has to go through k6's own `open()` builtin, which is only
 * available at init time (outside any exported function) and resolves
 * relative paths against the compiled script's own location on disk.
 */

export interface TargetDefinition {
  url: string;
  paths: string | string[];
}

export interface Target {
  url: string;
  paths: string[];
}

/**
 * Reads and parses the targets file. Defaults to `./urls.json`, which the
 * build script (scripts/build.mjs) copies next to every compiled test entry.
 */
export function loadTargets(path = './urls.json'): Target[] {
  const raw = open(path);
  const parsed = JSON.parse(raw) as TargetDefinition[];

  return parsed.map((entry) => ({
    url: entry.url.replace(/\/+$/, ''),
    paths: Array.isArray(entry.paths) ? entry.paths : [entry.paths],
  }));
}

/** Flattens targets (url + paths) into a plain list of full URLs. */
export function buildUrls(targets: Target[]): string[] {
  return targets.flatMap((target) =>
    target.paths.map((path) => `${target.url}${path.startsWith('/') ? path : `/${path}`}`),
  );
}
