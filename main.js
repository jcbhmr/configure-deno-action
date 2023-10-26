import { readFile } from "node:fs/promises";
import * as YAML from "yaml";

const action = YAML.parse(await readFile(process.argv[1], "utf8"));
async function importUMD(url, name) {
  const response = await fetch(url)
  const text = await response.text()
  (0, eval)(text)
  const mod = globalThis[name]
  return mod
}
const runtimes = {
  deno1: () => import("https://unpkg.com/@runs2/deno@1.0.0")
};
const { default: runtime } = await runtimes[action.runs2.using]();
await runtime(action)