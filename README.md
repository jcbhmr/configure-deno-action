# Deno runtime for GitHub Actions

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

✍ Lets you write your GitHub Actions using TypeScript \
🚀 Supports `node_modules`-less development \
🦕 Uses the Deno runtime for your GitHub Action \
👨‍💻 Extremely hackish, but it works!

## Installation

Create `_main.mjs` (or some other `.mjs` file with `main` in it) and add this
JavaScript code to it:

```js
// _main.mjs
// https://github.com/jcbhmr/runs-using-deno
const response = await fetch("https://unpkg.com/runs-using-deno@1");
const buffer = Buffer.from(await response.arrayBuffer());
await import(`data:text/javascript;base64,${buffer.toString("base64")}`);
```

📌 You can pin the `@1.x.x` version if you want

## Usage

![Node.js](https://img.shields.io/static/v1?style=for-the-badge&message=Node.js&color=339933&logo=Node.js&logoColor=FFFFFF&label=)
![GitHub Actions](https://img.shields.io/static/v1?style=for-the-badge&message=GitHub+Actions&color=2088FF&logo=GitHub+Actions&logoColor=FFFFFF&label=)

To use this wrapper, add the following to your `action.yml`:

```yml
# action.yml
runs:
  using: node20
  main: _main.mjs
runs-using-deno:
  using: deno1
  main: main.ts
```

💡 Deno will auto-detect a `deno.json` [Deno configuration file] if it's near
your `main.ts` Deno script. You can use this to provide an import map inside the
`deno.json` to make importing libraries more ergonomic.

### `pre-if` and `post-if`

To get the native `pre-if` and `post-if` behaviour, you **must** specify these
keys on the native `runs` YAML map instead of the custom `runs-using-deno` YAML
map.

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
  main: main.ts
  pre: main.ts
  post: main.ts
```

## Development

![Vite](https://img.shields.io/static/v1?style=for-the-badge&message=Vite&color=646CFF&logo=Vite&logoColor=FFFFFF&label=)

[![](https://developer.stackblitz.com/img/open_in_codeflow.svg)](https://pr.new/https://github.com/jcbhmr/runs-using-deno)

[deno configuration file]:
  https://docs.deno.com/runtime/manual/getting_started/configuration_file
