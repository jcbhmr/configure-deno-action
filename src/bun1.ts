import { delimiter, dirname, join } from "node:path";
import { pipeline } from "node:stream/promises";
import { createWriteStream } from "node:fs";
import { $ } from "execa";
import { mkdir } from "node:fs/promises";
import assert from "node:assert";

export default async function bun1(action: File, file: string) {
  const version = await (async () => {
    const response = await fetch("https://ungh.cc/repos/oven-sh/bun/releases");
    assert(response.ok, `${response.url} ${response.status}`);
    const json = (await response.json()) as { tag_name: string }[];
    const tag = json
      .map((x) => x.tag_name)
      .find((x) => x.startsWith("bun-v1."));
    return tag.slice(5);
  })();
  const bunInstall = join(process.env.RUNNER_TEMP, "bun");
  await mkdir(bunInstall, { recursive: true });
  const install = join(bunInstall, "install");
  {
    const response = await fetch("https://bun.sh/install");
    assert(response.ok, `${response.url} ${response.status}`);
    await pipeline(response.body as any, createWriteStream(install));
  }
  process.env.BUN_INSTALL = bunInstall;
  await $`bash ${install} bun-v${version}`;
  const bin = join(bunInstall, "bin");
  process.env.PATH += delimiter + bin;
  const $$ = $({ stdio: "inherit" });
  await $$`bun run ${join(dirname(action.webkitRelativePath), file)}`;
}
