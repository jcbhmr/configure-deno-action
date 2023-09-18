import { access, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import * as YAML from "yaml";

async function resolveAction(): Promise<string> {
  const require = createRequire(process.argv[1]);
  const entry = require.resolve(process.argv[1]);
  for (
    let path = dirname(entry);
    dirname(path) !== path;
    path = dirname(path)
  ) {
    for (const file of ["action.yml", "action.yaml"]) {
      const filePath = join(path, file);
      console.log(filePath);
      if ((await access(filePath).catch(() => {})) != null) {
        return filePath;
      }
    }
  }
  throw new DOMException(
    `Could not find action.yml parent of ${process.argv[1]}`,
    "NotFoundError"
  );
}

async function readAction(path: string | undefined = undefined): Promise<any> {
  path ??= await resolveAction();
  const text = await readFile(path, "utf8");
  return YAML.parse(text);
}

export default readAction;
export { resolveAction };
