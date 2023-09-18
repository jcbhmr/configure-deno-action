import { readFile } from "node:fs/promises";

async function main() {
  const action = await readFile("/etc/os-release", "utf8");
  console.log(action);

  console.log(process.env);
  console.log(__dirname, __filename);
  console.log(new Error().stack);
}
main();
