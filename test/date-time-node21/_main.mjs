import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { once } from "node:events";

const base = dirname(process.argv[1]);
const main = "main.js"; // 👈 CHANGE ME!
const subprocess = spawn(join(base, main), {
  shell: "bash",
  stdio: "inherit",
});
await once(subprocess, "spawn");
subprocess.on("exit", (exitCode) => {
  process.exit(exitCode);
});
