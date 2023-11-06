import * as core from "npm:@actions/core";
import * as github from "npm:@actions/github";

console.log("github.context.payload", github.context.payload);
console.log(`Hello ${core.getInput("name")}!`);
core.setOutput("time", new Date().toLocaleTimeString());
