#!/usr/bin/env node
import { join, delimiter } from "node:path";
import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import { $ } from "execa";
import JSONParse from "json-parse-even-better-errors";

console.debug(process.env);

const rootPath = core.getInput("github-action-path", { required: true });
const main = core.getInput("main", { required: true });
const mainPath = join(rootPath, main);

const inputs = JSONParse(core.getInput("inputs", { required: true }));
const env = { ...process.env };
env.GITHUB_ACTION_PATH = rootPath;
for (const [name, value] of Object.entries(inputs)) {
  env[`INPUT_${name.toUpperCase()}`] = value;
}

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

const baseHref = `https://github.com/denoland/deno/releases/download/v${version}/`;
const fileName = `deno-${target}.zip`;

const zipPath = await tc.downloadTool(baseHref + fileName);
const extractedPath = await tc.extractZip(zipPath);
process.env.PATH = process.env.PATH + delimiter + extractedPath;

const $$ = $({ stdio: "inherit", env });
await $$`deno run -Aq ${mainPath}`;
