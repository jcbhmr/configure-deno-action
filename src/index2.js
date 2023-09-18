import { readFile } from "node:fs/promises";

console.log(new Error().stack);

const action = await readFile("/etc/os-release");
console.log(action);

console.log(process.env);
