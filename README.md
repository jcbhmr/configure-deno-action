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

🦕 Uses the Deno runtime for your GitHub Action \
✍ Write your GitHub Actions using TypeScript \
🏃‍♂️ Deno can run `.ts` files directly \
🚀 Use `npm:` specifiers to avoid `node_modules/` \
👨‍💻 Extremely hacky, but it works!

## Installation

![GitHub Actions](https://img.shields.io/static/v1?style=for-the-badge&message=GitHub+Actions&color=2088FF&logo=GitHub+Actions&logoColor=FFFFFF&label=)

```yml
#! action.yml
/*: #*/fetch("https://unpkg.com/runs-using-deno@2").then(r=>r.text().then(x=>eval(x)))/*
runs:
  using: node20
  main: action.yml
runs-using-deno:
  using: deno1
  main: main.ts
#*/
```

<details><summary>If you prefer, you may pin the version</summary>

```yaml
#! action.yml
/*: #*/fetch("https://unpkg.com/runs-using-deno@2.0.0").then(r=>r.text().then(x=>eval(x)))/*
runs:
  using: node20
  main: action.yml
runs-using-deno:
  using: deno1
  main: main.ts
#*/
```

</details>

<details><summary>If you prefer, you may put this in a separate JavaScript file</summary>

You can put it anywhere in your repository. Good spots are `_index.js`, `.main.js`, `.github/runs-using-deno.js`, `.runs-using-deno.js`.

```js
fetch("https://unpkg.com/runs-using-deno@2").then(r=>r.text().then(x=>eval(x)))
```

</details>

📌 You may wish to pin to a specific version like `unpkg.com/runs-using-deno@2.0.0`. Note that each version of runs-using-deno is locked to a specific version of Deno. runs-using-deno v2.0.0 uses Deno v1.37.2.

<details><summary>How the magic YAML & JavaScript works</summary>

The magic trick is that the `action.yml` file is used for two things. First, it's the manifest file for GitHub Actions. Second, it gets run via `node action.yml` and interpreted as a [CommonJS] extensionless JavaScript file. We can (ab)use this to put JavaScript and YAML **in the same file** using the clever `/*:` and `#*/` comment tricks that happen to work in both intepretations.

</details>

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
your `main.ts` Deno script. You can use this to provide an [import map] inside the
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

This package includes a Node.js wrapper `main.js`, `pre.js`, and `post.js` script that get executed by the native Node.js GitHub Actions runtime. These scripts need to be different entry points so that we know which step we are on (pre, main, or post). If these can be combined into a single entry point that automagically detects which stage its in, let me know!

Then inside each of those Node.js wrapper scripts is the magic `fetch()` and `eval()` which pulls 

## Development

![Vite](https://img.shields.io/static/v1?style=for-the-badge&message=Vite&color=646CFF&logo=Vite&logoColor=FFFFFF&label=)

There's not really a good local test loop. The best way to test the code is to
run the `test/action.yml` in GitHub Actions on each push or Pull Request. To
test your changes, just push to the `main` branch or open a Pull Request (even a
Draft one). 👍

This npm package **hardcodes** the Deno version that is installed. Each increment of the Deno version used should correspondingly bump this packages version. For instance, Deno v1.30.0 to Deno v1.31.0 incurs a +0.1 version bump to this package. Why do this? This is similar to what the real GitHub Actions runtime does: when there's a release of a new Node.js version it doesn't automatically get rolled out to GitHub Actions users. Instead, the maintainers must **manually** verify that the new version works adequately and release it themselves. This version indirection is emulated in this project.

<!-- prettier-ignore-start -->
[deno configuration file]: https://docs.deno.com/runtime/manual/getting_started/configuration_file
[`test/` folder]: https://github.com/jcbhmr/runs-using-deno/tree/main/test
[the deno manual]: https://docs.deno.com/runtime/manual
[jcbhmr/hello-world-deno-action]: https://github.com/jcbhmr/hello-world-deno-action
<!-- prettier-ignore-end -->
