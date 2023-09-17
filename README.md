# Deno for GitHub Actions authors

## Usage

```yml
# action.yml
runs:
  using: composite
  steps:
    - uses: jcbhmr/using-deno1@v1
      with:
        inputs: ${{ toJSON(inputs) }}
        env: ${{ toJSON(env) }}
        main: main.ts
```

<details><summary>What it's trying to emulate</summary>

```yml
# action.yml
runs:
  # 😭 This 'deno1' doesn't exist.
  using: deno1
  main: main.ts
```

</details>
