#!/usr/bin/env -S deno run -Aq
import * as core from "@actions/core";
import { userInfo } from "node:os";

const format = core.getInput("format", { required: true });
let output = format;
output = output.replace("%s", userInfo().username);
console.log(output);
core.setOutput("output", output);
