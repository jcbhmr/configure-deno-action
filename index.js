import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { findUp } from "find-up";
import * as YAML from "yaml";

const ErrorPrepareStackTrace = Error.prepareStackTrace;
Error.prepareStackTrace = function f(error, stack) {
  Error.prepareStackTrace = ErrorPrepareStackTrace;
  error.stack = error.stack;
  Error.prepareStackTrace = f;
  error.stack = error.stack.replaceAll(
    /data:\S{70,}/g,
    (match) => match.slice(0, 70) + "..."
  );
  return error.stack;
};

const require = createRequire("/");
const main = require.resolve(process.argv[1]);
const path = await findUp(["action.yml", "action.yaml"], { cwd: main });
const action = YAML.parse(await readFile(path, "utf8"));

const stage = ["pre", "main", "post"].find(
  (x) =>
    action.runs[x] &&
    require.resolve(join(dirname(path), action.runs[x])) === main
);

const knownRuntimes = {
  deno1: "https://unpkg.com/@runs-using/deno1@1.0.0",
};
const runtimes = { ...knownRuntimes, ...globalThis.runtimes };

const response = await fetch(runtimes[action.uses]);
console.assert(response.ok, `${response.url} ${response.status}`);
const buffer = await response.arrayBuffer();
const base64 = Buffer.from(buffer).toString("base64");
const { default: run } = await import(`data:text/javascript;base64,${base64}`);
await run(path, stage);
