# More `runs: using` runtimes for GitHub Actions

✂️ Cut out the unweildly `dist/index.js` from your Git repo \
🧅 Write your GitHub Actions in runnable TypeScript with [Bun] or [Deno] \
👨‍💻 Extremely hackish, but it works!

## Usage

```yml
# action.yml
runs:
  using: node20
  main: _main

.runs:
  using: deno1 # or 'bun1'
  main: main.ts
```

```js
// _main (or whatever you wanna call it)
fetch("https://unpkg.com/runs-using@1").then((r) => r.text().then(eval));
```

<details><summary>You can use SRI if you like</summary>

```js
// _main (or whatever you wanna call it)
fetch("https://unpkg.com/runs-using@1.2.3", {
  integrity: "<your-hash-here>",
})
  .then((r) => r.text())
  .then(eval);
```

💡 You can use [srihash.org] or your CLI to generate the integrity hash.

</details>

| Runtime | Versions | Repository        |
| ------- | -------- | ----------------- |
| [Deno]  | `deno1`  | [runs-using/deno] |
| [Bun]   | `bun1`   | [runs-using/bun]  |

## How it works

1. You `fetch()` a remote script from [unpkg.com]. It looks vaguely like  It gets `eval()`-ed in the
   global scope. That means no `require()`, and no `import("./my-file.js")`
   (since there's no parent URL context). All that's available is
   `import("node:...")`.
2. The `eval()`-ed bootstrap script starts (replaces is more accurate) Node.js
   with a custom `--loader` that supports HTTP requests. This means we can stop
   doing the `fetch()` and `eval()` or `import("data:...")` dance and just
   `import("https:...")`.
3. The Node.js process that was just started uses the `--import https:... -e ''`
   trick to run a remote script without an actual local file present. That
   remote script is the `index.js` script.


**Why go through all that trouble just to allow

[Deno]: https://deno.land/
[Bun]: https://bun.sh/
[runs-using/deno]: https://github.com/runs-using/deno
[runs-using/bun]: https://github.com/runs-using/bun
[srihash.org]: https://www.srihash.org/

<details><summary><code>pre</code> and <code>post</code> scripts</summary>

```yml
# action.yml
runs:
  using: node20
  main: _start
  pre: _start
  post: _start

.runs:
  using: deno1
  main: main.ts
  pre: pre.ts
  post: post.ts
```

</details>

<details><summary><code>pre-if</code> and <code>post-if</code> scripts</summary>

```yml
# action.yml
runs:
  using: node20
  main: _start
  pre: _start
  post: _start

  pre-if: runner.os == 'Linux'
  post-if: failure()
.runs:
  using: deno1
  main: main.ts
  pre: pre.ts
  post: post.ts
```

</details>
