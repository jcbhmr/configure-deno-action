import { createRequire } from "node:module";
import readAction, { resolveAction } from "./lib/readAction.js";
import { dirname, resolve } from "node:path";

console.log(process.execArgv, process.argv);

const actionPath = await resolveAction();
const action = await readAction(actionPath);
const { runs, ".runs": $runs } = action;

const require = createRequire(actionPath);
const argv1 = require.resolve(process.argv[1]);

const stage = (
  {
    [runs.pre && resolve(dirname(actionPath), runs.pre)]: "pre",
    [resolve(dirname(actionPath), runs.main)]: "main",
    [runs.post && resolve(dirname(actionPath), runs.post)]: "post",
  } as const
)[argv1];
if (!stage) {
  throw new DOMException(
    `Could not find stage for ${process.argv[1]}`,
    "NotFoundError"
  );
}

const runtimes = {
  deno1: () => import("./deno1.js"),
};

const { default: runtime } = await runtimes[$runs.using]();
await runtime($runs[stage]);
