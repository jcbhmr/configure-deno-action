import { dirname, join, resolve } from "node:path";
import * as tc from "@actions/tool-cache";
import { $ } from "execa";
export default async function deno1(action) {
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
    }[[process.platform, process.arch].toString()];
    const zipPath = await tc.downloadTool(
        `https://github.com/denoland/deno/releases/download/${tag}/${file}`,
    );
    const extractedPath = await tc.extractZip(zipPath);
    denoPath = await tc.cacheDir(extractedPath, "deno", tag.slice(1));
    }
    const deno = join(denoPath, "deno");
    const stage = process.argv[1].match(/(main|pre|post)/)[1];
    const file = resolve(dirname(process.argv[1]), action.runs2[stage]);
    const { exitCode } = await $({
    stdio: "inherit",
    reject: false,
    })`${deno} run -A ${file}`;
    process.exit(exitCode);
}