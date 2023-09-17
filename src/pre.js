#!/usr/bin/env node
import * as core from "@actions/core";
import { $ } from "execa";
import JSONParse from "json-parse-even-better-errors";
import { join } from "node:path";
import setupDeno from "./lib/setupDeno.js";

const $$ = $({ stdio: "inherit" });

const githubActionPath = core.getInput("github-action-path", {
  required: true,
});
const inputs = JSONParse(core.getInput("inputs", { required: true }));
const pre = core.getInput("pre", { required: true });
const prePath = join(githubActionPath, pre);

await setupDeno();
await $$`deno run -Aq ${prePath}`;
