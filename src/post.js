#!/usr/bin/env node
process.env.INPUT_MAIN = process.env.INPUT_POST;
await import("./main.js");
