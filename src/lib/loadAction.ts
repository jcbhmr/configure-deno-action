import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import * as YAML from "yaml";

export default async function loadAction() {
  for (
    let path = dirname(process.argv[1]);
    resolve(path, "..") !== path;
    path = resolve(path, "..")
  ) {
    for (const file of ["action.yml", "action.yaml"]) {
      const text = await readFile(resolve(path, file), "utf8").catch(() => {});
      if (text == null) {
        continue;
      }
      const yaml = YAML.parse(text);
      return yaml;
    }
  }
  throw new DOMException(
    `Could not find action.yml parent of ${process.argv[1]}`,
    "NotFoundError"
  );
}
