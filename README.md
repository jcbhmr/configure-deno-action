# `runs: using: deno1` for GitHub Actions

🦕 Write your GitHub Actions using Deno instead of Node.js

<p align=center>
  <img src="">
</p>

✂️ Cut out the unweildly `dist/index.js` from your Git repo \
🟦 Write your GitHub Actions in runnable TypeScript \
👨‍💻 Extremely hackish, but it works!

## Installation

🤩 Check out [runs-using/runs-using] for more information on how things work and
for more runtimes.

1. Somewhere in your source tree create a JavaScript file (like
   `.github/main.js`). Then add this JavaScript code to that file:

   ```js
   // .github/main.mjs
   // using: deno1 is a known plugin to the main runs-using package.
   eval(await fetch("https://unpkg.com/runs-using@1").then((r) => r.text()));
   ```

2. In your `action.yml` make sure you use Node.js to execute the magic wrapper
   `main.js` file! That's what will magically run your Deno code.

   ```yml
   # action.yml
   runs:
     using: node20
     main: .github/main.js
   ```

<details><summary>Using <code>pre</code> and <code>post</code> scripts</summary>

```js
// .github/pre.mjs and .github/post.mjs
eval(await fetch("https://unpkg.com/runs-using@1").then((r) => r.text()));
```

```yml
# action.yml
runs:
  using: node20
  main: .github/main.js
  pre: .github/pre.js
  post: .github/post.js

  pre-if: runner.os == 'Linux'
  post-if: failure()
.runs:
  using: deno1
  main: main.ts
  pre: pre.ts
  post: post.ts
```

</details>

## Usage

To configure your new Deno action, just add a `.runs` entry to your `action.yml`
file like this:

```yml
# action.yml
.runs:
  using: deno1
  main: hello-world.ts
```

[📂 Complete example action]

Then you can write your action in TypeScript and even use Deno's `npm:` URLs to
write your _entire action_ in a single file! 🚀

```ts
// hello-world.ts
import * as core from "npm:@actions/core";
console.log("Hello world!");
```

### Options

- **`using`:** Must be `deno1` to use this runtime.

- **`main`:** Same as Node.js `main` field, just running under Deno instead!
  Things like `main.ts` or `src/index.ts` are typical values.

- **`pre`:** Same as Node.js `pre` field, just running under Deno instead!
  Things like `pre.ts` or `src/setup.ts` are typical values.

- **`post`:** Same as Node.js `post` field, just running under Deno instead!
  Things like `post.ts` or `src/cleanup.ts` are typical values.

Note that you _can_ reuse the same file in `pre`, `main`, and `post` multiple
times if you want. Just be warned you'll need to **manually distinguish** which
stage your action is currently at. There's no `STAGE=pre` env var to help you.
