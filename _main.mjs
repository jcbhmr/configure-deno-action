import { createReadStream, createWriteStream } from "node:fs";
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { createGunzip } from "node:zlib";
import { chmod } from "node:fs/promises";
import { once } from "node:events";
const name = "main"; // 👈 CHANGE ME!
const ext = process.platform === "win32" ? ".exe" : "";
let file;
if (dirname(process.argv[1]).startsWith(process.cwd())) {
  file = join(dirname(process.argv[1]), name + ext);
} else {
  const target = {
    "win32,x64": "x86_64-pc-windows-msvc",
    "darwin,x64": "x86_64-apple-darwin",
    "linux,x64": "x86_64-unknown-linux-gnu",
  }[[process.platform, process.arch].toString()];
  file = join(dirname(process.argv[1]), `${name}-${target}${ext}`);
  await pipeline(
    createReadStream(`${file}.gz`),
    createGunzip(),
    createWriteStream(file)
  );
  await chmod(file, 0o755);
}
const subprocess = spawn(file, { stdio: "inherit" });
process.exitCode = (await once(subprocess, "exit"))[0];
