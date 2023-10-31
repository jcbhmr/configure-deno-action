# Deno runtime for GitHub Actions

🦕 Write your GitHub Actions in Deno

<table align=center><td>

```ts
import * as core from "npm:@actions/core@^1.10.1";
import * as github from "npm:@actions/github@^6.0.0";
console.log("github.context.payload", github.context.payload);
console.log(`Hello ${core.getInput("name")}!`);
core.setOutput("time", new Date().toLocaleTimeString());
```

</table>

✍ Lets you write your GitHub Actions using TypeScript \
🚀 Supports `node_modules`-less development \
🦕 Uses the Deno runtime for your GitHub Action \
👨‍💻 Extremely hackish, but it works!

## Installation

![Node.js](https://img.shields.io/static/v1?style=for-the-badge&message=Node.js&color=339933&logo=Node.js&logoColor=FFFFFF&label=)

📋 Looking for a premade template? Check out [jcbhmr/hello-world-deno-action]!

Create `_main.mjs` (or some other `.mjs` file with `main` in it) and add this
JavaScript code to it:

```js
// _main.mjs
// https://github.com/jcbhmr/runs-using-deno
const response = await fetch("https://unpkg.com/runs-using-deno@2");
const buffer = Buffer.from(await response.arrayBuffer());
await import(`data:text/javascript;base64,${buffer.toString("base64")}`);
```

📌 You can also pin that `@2` to `@2.x.y` if you want. Note that this will **lock** the Deno version to v1.37.2.

<details><summary>⬇️ You can also download and commit a local copy if you prefer</summary>

```sh
wget https://unpkg.com/runs-using-deno -O _main.mjs
```

⚠️ This will **lock** the Deno version to v1.37.2.

</details>

ℹ This tool sniffs the `(main|pre|post)` name from the `process.argv[1]` file
(the entry point) so make sure you name your `main: main.mjs` something like
`_main.mjs` or `.main.mjs`. It's recommended to use the `.mjs` extension so that
the script is interpreted as ESM even when no Node.js `package.json`
`type: "module"` is present.

## Usage

![Deno](https://img.shields.io/static/v1?style=for-the-badge&message=Deno&color=000000&logo=Deno&logoColor=FFFFFF&label=)
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
`deno.json` to make importing the same libraries across multiple files easier.

<table align=center><td>

```jsonc
// deno.json
{
  "imports": {
    "@actions/core": "npm:@actions/core@^1.10.1",
    "@actions/github": "npm:@actions/github@^6.0.0"
  }
}
```

<td>

```ts
// main.ts
import * as core from "@actions/core";
import * as github from "@actions/github";
```

</table>

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
  pre: pre.ts
  post: post.ts
```

You'll need to create `_pre.mjs` and `_post.mjs` files as separate entry points.
All of these should import the same `https://unpkg.com/runs-using-deno@1` module
which will sniff the `(main|pre|post)` from the entry point file name and choose
the right `runs-using-deno`-defined stage to run from there. Check out the
[`test/` folder] for a demo of an action using `_main.mjs`, `_pre.mjs`, and
`_post.mjs`.

## How it works

This is a wrapper Node.js script that downloads, installs, and caches the latest
Deno version. Then, using the fields from `action.yml`, it executes Deno with
the `main: main.ts` script as a subprocess. You automagically inherit all the
environment variables, working directory, GitHub context, and more. It's pretty
seamless! You can even use the @actions/core and other packages to interact as
you would in Node.js. To learn more about how the Deno runtime works, check out
[the Deno manual].

## Development

![Vite](https://img.shields.io/static/v1?style=for-the-badge&message=Vite&color=646CFF&logo=Vite&logoColor=FFFFFF&label=)

There's not really a good local test loop. The best way to test the code is to
run the `test/action.yml` in GitHub Actions on each push or Pull Request. To
test your changes, just push to the `main` branch or open a Pull Request (even a
Draft one). 👍

<!-- prettier-ignore-start -->
[deno configuration file]: https://docs.deno.com/runtime/manual/getting_started/configuration_file
[`test/` folder]: https://github.com/jcbhmr/runs-using-deno/tree/main/test
[the deno manual]: https://docs.deno.com/runtime/manual
[jcbhmr/hello-world-deno-action]: https://github.com/jcbhmr/hello-world-deno-action
<!-- prettier-ignore-end -->
