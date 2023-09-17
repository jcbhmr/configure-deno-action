#!/usr/bin/env node
import { $ } from "zx";
import { join } from "node:path";

process.env.DENO_INSTALL = join(process.env.RUNNER_TEMP, "using-deno1");
await $`curl -fsSL https://deno.land/x/install/install.sh | sh`;
process.env.PATH = `${process.env.PATH}:${join(
  process.env.DENO_INSTALL,
  "bin"
)}`;
await $`deno run -Aq ${join(
  process.env["INPUT_GITHUB-ACTION-PATH"],
  process.env.INPUT_MAIN
)}`;
