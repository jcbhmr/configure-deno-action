import { readFile } from "node:fs/promises";

async function main() {
  const action = await readFile("package.json", "utf8");
  console.log(action);

  console.log(process.env);
  console.log(process.argv);
}
main();
