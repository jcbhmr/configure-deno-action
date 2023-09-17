# Deno for GitHub Actions authors

## Usage

```yml
# action.yml
runs:
  # 😭
  using: deno1
  main: main.ts
```

```yml
# action.yml
runs:
  using: composite
  steps:
    - uses: jcbhmr/using-deno@1
      with:
        inputs: ${{ toJSON(inputs) }}
        env: ${{ toJSON(env) }}
        main: main.ts
```
