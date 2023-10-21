import { dirname, join } from "node:path";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { $ } from "execa";
import * as YAML from "yaml";
import * as tc from "@actions/tool-cache";
let actionPath = join(dirname(process.argv[1]), "action.yml");
if (!existsSync(actionPath)) {
  actionPath = join(dirname(process.argv[1]), "action.yaml");
}
const action = YAML.parse(await readFile(actionPath, "utf8"));
if (action["runs-using-deno"].using === "deno1") {
  const response = await fetch("https://deno.com/versions.json");
  const json = await response.json();
  const tag = json.cli.find((x) => x.startsWith("v1."));
  let denoPath = tc.find("deno", tag.slice(1));
  if (!denoPath) {
    const file = {
      "darwin,arm64": "deno-aarch64-apple-darwin.zip",
      "darwin,x64": "deno-x86_64-apple-darwin.zip",
      "win32,x64": "deno-x86_64-pc-windows-msvc.zip",
      "linux,x64": "deno-x86_64-unknown-linux-gnu.zip",
    }[[process.platform, process.arch]];
    const zipPath = await tc.downloadTool(
      `https://github.com/denoland/deno/releases/download/${tag}/${file}`,
    );
    const extractedPath = await tc.extractZip(zipPath);
    denoPath = await tc.cacheDir(extractedPath, "deno", tag.slice(1));
  }
  const deno = join(denoPath, "deno");
  const stage = process.argv[1].match(/(main|pre|post)/)[1];
  const file = join(dirname(actionPath), action["runs-using-deno"][stage]);
  const importMap =
    action["runs-using-deno"]["import-map"] &&
    join(dirname(actionPath), action["runs-using-deno"]["import-map"]);
  const { exitCode } = await $({
    stdio: "inherit",
    reject: false,
  })`${deno} run ${importMap ? ["--import-map", importMap] : []} -A ${file}`;
  process.exitCode = exitCode;
} else {
  throw new DOMException(
    `${action["runs-using-deno"].using} is not supported`,
    "NotSupportedError",
  );
}
