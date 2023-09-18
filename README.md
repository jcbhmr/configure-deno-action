# Deno for GitHub Actions authors

## Installation

```js
// _start (NO extension)
fetch("https://esm.run/actions-using@1")
  .then((x) => x.text())
  .then((x) => eval(x));
```

## Usage

```yml
# action.yml
runs:
  using: node20
  main: _start
  pre: _start
  post: _start

  using2: deno1
  main2: main.ts
  pre-if: runner.os == 'Linux'
  pre2: pre.ts
  post-if: failure()
  post2: post.ts
```
