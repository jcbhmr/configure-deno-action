# `using: deno` for GitHub Actions

🦕 Write your GitHub Actions in Deno

<p align=center>
  <img src="">
</p>

👨‍💻 Extremely hackish, but it works!

## Installation

```sh
wget https://unpkg.com/runs-using-deno@1 -O _main.mjs
# cp _main.mjs _pre.mjs
# cp _main.mjs _post.mjs
```

<details><summary>Or <code>import()</code> it from unpkg</summary>

```js
// _main.mjs
const response = await fetch("https://unpkg.com/runs-using-deno@1");
const buffer = Buffer.from(await response.arrayBuffer());
await import(`data:text/javascript;base64,${buffer.toString("base64")}`);
```

</details>

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
