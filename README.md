# Deno for GitHub Actions authors

## Installation

```js
// _start (NO extension)
fetch("https://unpkg.com/using-deno@1/main").then((r) => r.text().then(eval));
```

## Usage

```yml
# action.yml
runs:
  using: node20
  main: _start

.runs:
  using: deno1
  main: main.ts
```

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
