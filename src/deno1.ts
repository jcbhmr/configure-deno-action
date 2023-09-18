import { delimiter, dirname, join } from "node:path";
import { pipeline } from "node:stream/promises";
import { createWriteStream } from "node:fs";
import { $ } from "execa";
import { mkdir } from "node:fs/promises";
import assert from "node:assert";

export default async function deno1(action: File, file: string) {
  const version = await (async () => {
    const response = await fetch("https://deno.com/versions.json");
    assert(response.ok, `${response.url} ${response.status}`);
    const json = (await response.json()) as { cli: string[] };
    const tag = json.cli.find((x) => x.startsWith("v1."));
    return tag.slice(1);
  })();
  const denoInstall = join(process.env.RUNNER_TEMP, "deno");
  await mkdir(denoInstall, { recursive: true });
  const installSh = join(denoInstall, "install.sh");
  {
    const response = await fetch("https://deno.land/x/install/install.sh");
    assert(response.ok, `${response.url} ${response.status}`);
    await pipeline(response.body as any, createWriteStream(installSh));
  }
  process.env.DENO_INSTALL = denoInstall;
  await $`sh ${installSh} v${version}`;
  const bin = join(denoInstall, "bin");
  process.env.PATH += delimiter + bin;
  const $$ = $({ stdio: "inherit" });
  await $$`deno run -Aq ${join(dirname(action.webkitRelativePath), file)}`;
}
