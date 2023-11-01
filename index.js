import { readFile } from "node:fs/promises";
import * as YAML from "yaml";
import { findUp } from "find-up";

const actionFile = await findUp(["action.yml", "action.yaml"], {
  cwd: process.argv[2],
});
const action = YAML.parse(await readFile(actionFile, "utf8"));
const runtimes = {
  deno1: () => import("./deno1.js"),
};
const { default: runtime } = await runtimes[action["runs-using-deno"].using]();
await runtime(action);
