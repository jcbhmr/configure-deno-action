# GitHub Actions shebang

🦕 Write your GitHub Actions using Deno, Bash, Python, Go, or anything!

<table align=center><td>

```ts
// 2>/dev/null; v=1.38.0; ...; exec ".../bin/deno" run -Aq "$0" "$@"
console.log("Hello Deno!")
```

<td>

```py

```

<td>

```go

```

</table>

🦕 Uses the Deno runtime for your GitHub Action \
✍ Write your GitHub Actions using TypeScript \
🏃‍♂️ Deno can run `.ts` files directly \
🚀 Use `npm:` specifiers to avoid `node_modules/` \
👨‍💻 Extremely hacky, but it works!

## Installation

![Node.js](https://img.shields.io/static/v1?style=for-the-badge&message=Node.js&color=339933&logo=Node.js&logoColor=FFFFFF&label=)

Add the magic `/*: #fetch()...` and `#*/` hacky comments and the native `runs: { main: action.yml }` to your `action.yml` file and you're all set!

```yml
#! action.yml
/*: #*/fetch("https://unpkg.com/runs-using-deno@2.0.0").then(r=>r.text().then(x=>eval(x)))/*
runs: { using: node20, main: action.yml }
runs-using-deno:
  using: deno1
  main: main.ts
#*/
```

📌 Each version of runs-using-deno uses a pinned version of Deno. v2.0.0 uses Deno v1.37.2. Try to keep that `@x.y.z` version up to date!

<details><summary>If you prefer, you can use a version range</summary>

```yaml
#! action.yml
/*: #*/fetch("https://unpkg.com/runs-using-deno@2").then(r=>r.text().then(x=>eval(x)))/*
runs: { using: node20, main: action.yml }
runs-using-deno:
  using: deno1
  main: main.ts
#*/
```

</details>

<details><summary>Also works in a separate JavaScript file</summary>

You can put it anywhere in your repository. Good spots are `_index.js`, `.main.js`, `.github/runs-using-deno.js`, or `.runs-using-deno.js`.

```js
fetch("https://unpkg.com/runs-using-deno@2")
  .then((r) => r.text())
  .then((x) => eval(x));
```

</details>

## Usage

![Deno](https://img.shields.io/static/v1?style=for-the-badge&message=Deno&color=000000&logo=Deno&logoColor=FFFFFF&label=)
![GitHub Actions](https://img.shields.io/static/v1?style=for-the-badge&message=GitHub+Actions&color=2088FF&logo=GitHub+Actions&logoColor=FFFFFF&label=)

To use this wrapper, add the following to your `action.yml`:

```yml
#! action.yml
/*: #*/fetch("https://unpkg.com/runs-using-deno@2.0.0").then(r=>r.text().then(x=>eval(x)))/*
runs: { using: node20, main: action.yml }
runs-using-deno:
  using: deno1
  main: main.ts
#*/
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

### Options

- **`using`:** Specifies the runtime to use similar to the native `runs.using` value. This value **must be `deno1`**.

- **`main`:** The file that contains your action code. This can be a JavaScript file or a TypeScript file. The runtime specified in using executes this file. This is **required**.

`pre`, `pre-if`, `post`, and `post-if` from the native Node.js runtime are **not currently supported**.

Got other ideas for options? [Open an Issue!]

## How it works

The `action.yml` file acts as **both** a YAML manifest file and a CommonJS Node.js JavaScript file through clever comment trickery. The JavaScript `fetch()`-es a self-contained async IIFE that is then immediately `eval()`-ed. The `eval()`-ed code will then find the `action.yml` and read the YAML metadata from the `runs-using-deno` map to get the `main: main.ts` or similar entry and invoke `deno run -A /path/to/main.ts` or similar.

## Development

![Vite](https://img.shields.io/static/v1?style=for-the-badge&message=Vite&color=646CFF&logo=Vite&logoColor=FFFFFF&label=)

There's not really a good local test loop. The best way to test the code is to
run the `test/action.yml` in GitHub Actions on each push or Pull Request. To
test your changes, just push to the `main` branch or open a Pull Request (even a
Draft one). 👍

This npm package **hardcodes** the Deno version that is installed. Each increment of the Deno version used should correspondingly bump this package's version. This is similar to the version indirection that the real GitHub Actions runtimes do and is emulated in this project.

**Why no `pre` and `post`?** Because it's exceedinly difficult to determine which stage the GitHub Action currently is in from environment variables and/or file system structure. If you have an idea to reuse the `main: action.yml` for `pre: action.yml` and `post: action.yml` and differentiate between them, I'm open to ideas! ❤️

Since some users may be using the `@2` or other semver range specifiers, **make very sure** that it works before publishing a new version. That means probably doing a prerelease

<!-- prettier-ignore-start -->
[deno configuration file]: https://docs.deno.com/runtime/manual/getting_started/configuration_file
[`test/` folder]: https://github.com/jcbhmr/runs-using-deno/tree/main/test
[the deno manual]: https://docs.deno.com/runtime/manual
[import map]: https://github.com/WICG/import-maps
[open an issue!]: https://github.com/jcbhmr/runs-using-deno/issues
<!-- prettier-ignore-end -->
