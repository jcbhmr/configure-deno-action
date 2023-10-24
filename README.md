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

<details><summary>📌 You can also pin the script</summary>

```js
// _main.mjs
// https://github.com/jcbhmr/runs-using-deno
const response = await fetch("https://unpkg.com/runs-using-deno@1.2.0");
const buffer = Buffer.from(await response.arrayBuffer());
await import(`data:text/javascript;base64,${buffer.toString("base64")}`);
```

⚠️ This will still dynamically download the latest Deno v1.x release.

</details>

<details><summary>⬇️ You can also vendor the script</summary>

```sh
wget https://unpkg.com/runs-using-deno@1 -O _main.mjs
```

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

You'll need to create `_pre.mjs` and `_post.mjs` files as separate entry points.
All of these should import the same `https://unpkg.com/runs-using-deno@1` module
which will sniff the `(main|pre|post)` from the entry point file name and choose
the right `runs-using-deno`-defined stage to run from there. Check out the
[`test/` folder] for a demo of an action using `_main.mjs`, `_pre.mjs`, and
`_post.mjs`.

## Development

![Vite](https://img.shields.io/static/v1?style=for-the-badge&message=Vite&color=646CFF&logo=Vite&logoColor=FFFFFF&label=)

[![](https://developer.stackblitz.com/img/open_in_codeflow.svg)](https://pr.new/https://github.com/jcbhmr/runs-using-deno)

You can test the action by committing to the `main` branch and checking the
<kbd>Actions</kbd> tab to see if the `test-action.yml` workflow succeeded. If
you're opening a PR, the `test-action.yml` workflow will automatically run.

<!-- prettier-ignore-start -->
[deno configuration file]: https://docs.deno.com/runtime/manual/getting_started/configuration_file
[`test/` folder]: https://github.com/jcbhmr/runs-using-deno/tree/main/test
<!-- prettier-ignore-end -->
