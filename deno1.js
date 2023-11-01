import { dirname, join, resolve } from "node:path";
import * as tc from "@actions/tool-cache";
import { $ } from "execa";
export default async function deno1(action) {
  const version = "1.37.2";
  const tag = "v" + version;
  let denoPath = tc.find("deno", version);
  if (!denoPath) {
    const file = {
      "darwin,arm64": "deno-aarch64-apple-darwin.zip",
      "darwin,x64": "deno-x86_64-apple-darwin.zip",
      "win32,x64": "deno-x86_64-pc-windows-msvc.zip",
      "linux,x64": "deno-x86_64-unknown-linux-gnu.zip",
    }[[process.platform, process.arch].toString()];
    const zipPath = await tc.downloadTool(
      `https://github.com/denoland/deno/releases/download/${tag}/${file}`,
    );
    const extractedPath = await tc.extractZip(zipPath);
    denoPath = await tc.cacheDir(extractedPath, "deno", version);
  }
  const deno = join(denoPath, "deno");
  const file = resolve(dirname(process.argv[1]), action.runs2[stage]);
  const { exitCode } = await $({
    stdio: "inherit",
    reject: false,
  })`${deno} run -A ${file}`;
  process.exit(exitCode);
}
