#!/usr/bin/env node
process.env.INPUT_MAIN = process.env.INPUT_PRE;
await import("./main.js");
