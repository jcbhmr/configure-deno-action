import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import { pipeline } from "node:stream/promises";
import { createWriteStream } from "node:fs";
import { $ } from "execa";
import { mkdir } from "node:fs/promises";

export default async function deno1(file: string): Promise<void> {
  const version = await (async () => {
    const response = await fetch("https://deno.com/versions.json");
    const json = (await response.json()) as { cli: string[] };
    const tag = json.cli.find((x) => x.startsWith("v1."));
    return tag.slice(1);
  })();

  const denoInstall = join(tmpdir(), "deno");
  await mkdir(denoInstall, { recursive: true });
  const installSh = join(denoInstall, "install.sh");
  {
    const response = await fetch("https://deno.land/install.sh");
    await pipeline(response.body as any, createWriteStream(installSh));
  }

  process.env.DENO_INSTALL = denoInstall;
  await $`sh ${installSh} v${version}`;

  const bin = join(denoInstall, "bin");
  process.env.PATH += delimiter + bin;

  const $$ = $({ stdio: "inherit" });

  await $$`deno run -Aq ${file}`;
}
