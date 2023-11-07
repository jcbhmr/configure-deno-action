import * as core from "npm:@actions/core";
import * as github from "npm:@actions/github";
console.log(`Hello ${core.getInput("name")}!`);
core.setOutput("time", new Date().toLocaleTimeString());
