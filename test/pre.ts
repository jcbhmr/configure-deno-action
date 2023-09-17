#!/usr/bin/env -S deno run -Aq
import * as core from "@actions/core";
const message = core.getInput("message", { required: true });
console.log(message);
core.setOutput("message", message);
