// k6 injects console at runtime; the project does not load the DOM or Node typings.
declare const console: {
  log(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
};
