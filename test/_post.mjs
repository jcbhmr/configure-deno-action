import { readFile } from "node:fs/promises"
const buffer = await readFile("dist/index.js");
await import(`data:text/javascript;base64,${buffer.toString("base64")}`);