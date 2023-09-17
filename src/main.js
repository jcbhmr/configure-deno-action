#!/usr/bin/env node
import { join, delimiter } from "node:path";
import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import { $ } from "execa";
import JSONParse from "json-parse-even-better-errors";
import assert from "node:assert";

const inputs = JSONParse(core.getInput("inputs", { required: true }));
assert.equal(typeof inputs, "object");
for (const [name, value] of Object.entries(inputs)) {
  assert.equal(typeof value, "string");
}

const env = JSONParse(core.getInput("env", { required: true }));
assert.equal(typeof env, "object");
for (const [name, value] of Object.entries(env)) {
  assert.equal(typeof value, "string");
}

for (const [name, value] of Object.entries(inputs)) {
  env[`INPUT_${name.toUpperCase()}`] = value;
}

const main = core.getInput("main", { required: true });
const mainPath = join(env.GITHUB_ACTION_PATH, main);

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
const baseHref = `https://github.com/denoland/deno/releases/download/v${version}/`;
const fileName = `deno-${arch}-${platform}.zip`;
const url = baseHref + fileName;

const zipPath = await tc.downloadTool(url);
const extractedPath = await tc.extractZip(zipPath);
process.env.PATH += delimiter + extractedPath;
env.PATH += delimiter + extractedPath;

const $$ = $({ stdio: "inherit", env });
await $$`deno run -Aq ${mainPath}`;
