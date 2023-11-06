import { spawn } from "node:child_process";
import { once } from "node:events";
import { join, dirname } from "node:path";
const response = await fetch("https://deno.com/versions.json");
const json = await response.json();
const version = json.cli.find((x) => x.startsWith("v1.")).slice(1);
const file = join(dirname(process.argv[1]), "main.ts"); // 👈 CHANGE ME!
const subprocess = spawn(
  `export -n version arch file
  cache="$RUNNER_TOOL_CACHE/deno/$version/$arch"
  if [[ ! -d $cache ]]; then
    curl -fsSL https://deno.land/x/install/install.sh \\
      | DENO_INSTALL="$cache" sh -s "v$version" &> /dev/null
  fi
  exec "$cache/bin/deno" run -Aq "$file"`,
  {
    shell: "bash",
    stdio: "inherit",
    env: { ...process.env, version, arch: process.arch, file },
  },
);
await once(subprocess, "spawn");
subprocess.on("exit", (x) => process.exit(x));
