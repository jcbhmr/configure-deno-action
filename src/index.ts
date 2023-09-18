import { createRequire } from "node:module";
import { basename, dirname } from "node:path";
import { findUp } from "find-up";
import { openAsBlob } from "node:fs";
import * as YAML from "yaml";

const runtimes = {
  deno1: () => import("./deno1.js"),
  bun1: () => import("./bun1.js"),
};
const entry = createRequire("/").resolve(process.argv[1]);
const action = await (async () => {
  const path = await findUp(["action.yml", "action.yaml"], {
    cwd: dirname(entry),
  });
  const blob = await openAsBlob(path);
  const file = new File([blob], basename(path), { type: "text/yaml" });
  (file as any).webkitRelativePath = path;
  return file;
})();
const require = createRequire(action.webkitRelativePath);
const { runs, ".runs": $runs } = YAML.parse(await action.text());
const stage = ["pre", "main", "post"]
  .filter((x) => $runs[x])
  .find((x) => require.resolve($runs[x]) === entry);
const { default: runtime } = await runtimes[$runs.using]();
await runtime(action, $runs[stage]);
