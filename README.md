# Deno for GitHub Actions authors

## Installation

```js
// main-wrapper.js
fetch("https://unpkg.com/using-deno@1/main").then((r) => r.text().then(eval));
```

## Usage

```yml
# action.yml
runs:
  using: node20
  main: _main
```
