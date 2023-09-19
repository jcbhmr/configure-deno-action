import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { createWriteStream } from "node:fs"
import { readFile } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
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

async function downloadTo(url, path) {
  const response = await fetch(url);
  console.assert(response.ok, `${response.url} ${response.status}`);
  await pipeline(response.body, createWriteStream(path));
}

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

const file = join(process.env.RUNNER_TEMP, Math.random().toString() + ".mjs");
await downloadTo(runtimes[action.$runs.using], file);
const { default: run } = await import(file);
await run(path, stage);
