# `using: deno` for GitHub Actions

🦕 Write your GitHub Actions in Deno

<table align=center><td>

```js
// main.ts
import "resolve-me-please";
import isOdd from "npm:is-odd";

console.log(Deno.version.deno);
console.log("isOdd(2)", isOdd(2));
```

</table>

🦕 Deno supports `node_modules`-less development \
🗺️ Supports `--import-map` \
📥 Designed to be stored in source control \
👨‍💻 Extremely hackish, but it works!

## Installation

```js
// _main.mjs
const response = await fetch("https://unpkg.com/runs-using-deno@1");
const buffer = Buffer.from(await response.arrayBuffer());
await import(`data:text/javascript;base64,${buffer.toString("base64")}`);
```

## Usage

```yml
# action.yml
runs:
  using: node20
  main: _main.mjs
  pre: _pre.mjs
  post: _post.mjs

  pre-if: runner.os == 'Linux'
  post-if: runner.os == 'Windows'
runs-using-deno:
  using: deno1
  import-map: import_map.json
  main: main.ts
  pre: main.ts
  post: main.ts
```
