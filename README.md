# `using: deno` for GitHub Actions

🦕 Write your GitHub Actions in Deno

<p align=center>
  <img src="">
</p>

👨‍💻 Extremely hackish, but it works!

## Installation

```sh
wget https://unpkg.com/rusing-deno@1 -O _main.mjs
```

<details><summary>Or <code>import()</code> it from unpkg</summary>

```js
// _main.mjs
const response = await fetch("https://unpkg.com/rusing-deno@1");
await import(URL.createObjectURL(await response.blob()));
```

</details>

```yml
# action.yml
runs:
  using: node20
  main: _main.js

rusing:
  using: deno1
  main: main.ts
```

## Usage

TODO
