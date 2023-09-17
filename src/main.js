#!/usr/bin/env node
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { join } from "node:path";
import { createReadStream } from "node:fs";
import { mktempd, appendFile, readFile } from "node:fs/promises";

const execFileAsync = promisify(execFile);

const tempFolder = await mktempd(join(process.env.RUNNER_TEMP, "using-deno1"));
await execFileAsync("curl", [
  "-fsSL",
  "https://deno.land/x/install/install.sh",
  "-o",
  join(tempFolder, "install.sh"),
]);

await execFileAsync("sh", [join(tempFolder, "install.sh"), "v1.36.4"], {
  env: {
    DENO_INSTALL: tempFolder,
  },
});

const firstLine = await new Promise((resolve, reject) => {
  const readable = createReadStream(process.env.INPUT_MAIN);
  let buffer = "";
  readable.on("data", (chunk) => {
    const index = chunk.indexOf("\n");
    if (~index) {
      buffer += chunk.slice(0, index);
      readable.close();
    } else {
      buffer += chunk;
    }
  });
  readable.on("close", () => {
    if (buffer.charCodeAt(0) === 0xfeff) {
      buffer = buffer.slice(1);
    }
    resolve(buffer);
  });
  readable.on("error", reject);
});
return line;
