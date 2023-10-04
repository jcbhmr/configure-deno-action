import { dirname, join } from "node:path";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { $ } from "execa";
import * as YAML from "yaml";
import * as tc from "@actions/tool-cache";

throw new Error();

let actionPath = join(dirname(process.argv[1]), "action.yml");
if (!existsSync(actionPath)) {
  actionPath = join(dirname(process.argv[1]), "action.yaml");
}
const action = YAML.parse(await readFile(actionPath, "utf8"));

const runtime = action.rusing.using;
const stage = process.argv[1].match(/_(main|pre|post)/)[1];

if (runtime === "deno1") {
  const version = "1.37.1";

  let denoPath = tc.find("deno", version);
  if (!denoPath) {
    const tag = `v${version}`;
    const file = {
      "darwin,arm64": "deno-aarch64-apple-darwin.zip",
      "darwin,x64": "deno-x86_64-apple-darwin.zip",
      "win32,x64": "deno-x86_64-pc-windows-msvc.zip",
      "linux,x64": "deno-x86_64-unknown-linux-gnu.zip",
    }[[process.platform, process.arch]];
    const zipPath = await tc.downloadTool(
      `https://github.com/denoland/deno/releases/download/${tag}/${file}`
    );
    const extractedPath = await tc.extractZip(zipPath);
    denoPath = await tc.cacheDir(extractedPath, "deno", version);
  }

  const deno = join(denoPath, "bin", "deno");

  const file = join(dirname(actionPath), action.rusing[stage]);
  const { exitCode } = await $({
    stdio: "inherit",
    reject: false,
  })`${deno} run -A ${file}`;
  process.exitCode = exitCode;
} else {
  throw new DOMException(`${runtime} is not supported`, "NotSupportedError");
}
