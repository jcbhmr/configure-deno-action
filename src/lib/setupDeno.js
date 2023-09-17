import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import { join, delimiter } from "node:path";

export default async function setupDeno() {
  const response = await fetch("https://deno.com/versions.json");
  const json = await response.json();
  const version = json.cli.find((x) => x.startsWith("v1")).slice(1);

  const arch = {
    arm64: "aarch64",
    x64: "x86_64",
  }[process.arch];
  const platform = {
    linux: "unknown-linux-gnu",
    darwin: "apple-darwin",
    win32: "pc-windows-msvc",
  }[process.platform];
  const target = `${arch}-${platform}`;

  const baseHref = `https://github.com/denoland/deno/releases/download/${version}/`;
  const fileName = `deno-${target}.zip`;

  const zipPath = await tc.downloadTool(baseHref + fileName);
  const extractedPath = await tc.extractZip(zipPath);
  process.env.PATH = process.env.PATH + delimiter + extractedPath;
}
