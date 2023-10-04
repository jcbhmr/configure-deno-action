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

const runtime = action.rusing.using;
const stage = process.argv[1].match(/_(main|pre|post)/)[1];

if (runtime === "deno1") {
  const version = "1.37.1";

  let denoPath = tc.find("deno", version);
  if (!denoPath) {
    const targetPartA = {
      x64: "x86_64",
      arm64: "aarch64",
    }[process.arch];
    const targetPartB = {
      win32: "pc-windows-msvc",
      darwin: "apple-darwin",
      linux: "unknown-linux-gnu",
    }[process.platform];
    const target = `${targetPartA}-${targetPartB}`;

    const zipPath = await tc.downloadTool(
      `https://github.com/denoland/deno/releases/download/${version}/deno-${target}.zip`
    );
    const extractedPath = await tc.extractZip(zipPath);
    denoPath = await tc.cacheDir(extractedPath, "deno", version);
  }

  const deno = join(denoPath, "bin", "deno");

  const { exitCode } = await $({
    stdio: "inherit",
    reject: false,
  })`${deno} run -A ${action.rusing[stage]}`;
  process.exitCode = exitCode;
} else {
  throw new DOMException(`${runtime} is not supported`, "NotSupportedError");
}
