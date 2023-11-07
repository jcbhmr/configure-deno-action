# "Hello world!" GitHub Action using Deno

🦕 Demo action using Deno \
💡 Inspired by [actions/hello-world-javascript-action]

<table align=center><td>

```ts
import * as core from "npm:@actions/core";
import * as github from "npm:@actions/github";
console.log(`Hello ${core.getInput("name")}!`);
core.setOutput("time", new Date().toLocaleTimeString());
```

</table>

🟦 Uses TypeScript \
😍 No compile step! \
🦕 Runs on the [Deno runtime] \
👩‍⚖️ [0BSD licensed] template

## Usage

![Deno](https://img.shields.io/static/v1?style=for-the-badge&message=Deno&color=000000&logo=Deno&logoColor=FFFFFF&label=)
![GitHub Actions](https://img.shields.io/static/v1?style=for-the-badge&message=GitHub+Actions&color=2088FF&logo=GitHub+Actions&logoColor=FFFFFF&label=)

<img align=right src="https://github.com/jcbhmr/hello-world-deno-action/assets/61068799/42566bcc-4466-4601-9aee-c78484589b44">

This is a **template repository** that is meant to be used as a base or example
for your own project. To get started, just click the <kbd>Use this
template</kbd> button in the top left of this repository page and edit the
`main.ts` file to customize your new Deno-based GitHub Action. There's no
`node_modules/`, no `dist/`, and no compile step. How's that for ease-of-use! 😉

After instantiating this template repository, you will need to manually do the
following:

1. Write your code in the `main.ts` file. You can use `npm:` specifiers, `http:`
   imports, `node:` builtins, and even `Deno.*` APIs.
2. Make sure you edit the `.github/workflows/test-action.yml` test workflow if you
   want to test any additional inputs or scenarios.
3. Replace the `LICENSE` file with your preferred software license. Check out
   [choosealicense.com] if you're unsure of which one to pick.
4. Replace this `README.md` file with a fancy readme to suit your new GitHub
   Action. Make sure you document all your inputs & outputs!
5. Create a new Release (with **no build step**) on GitHub Releases and publish
   your new GitHub Action to the [GitHub Actions Marketplace]! 🚀

You'll notice that the example code uses `npm:` imports to directly import from
npm. If you want to get more advanced, you can use an [import map] in a
`deno.json` [Deno configuration file] to alias `@actions/core` to a specific
version shared across your action.

<table align=center><td>

```jsonc
// deno.json
{
  "imports": {
    "@actions/core": "npm:@actions/core@1.10.1",
    "@actions/github": "npm:@actions/github@6.0.0"
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

<!-- prettier-ignore-start -->
[import map]: https://docs.deno.com/runtime/manual/basics/import_maps
[deno configuration file]: https://docs.deno.com/runtime/manual/getting_started/configuration_file
[deno runtime]: https://deno.com/
[choosealicense.com]: https://choosealicense.com/
[github actions marketplace]: https://github.com/marketplace?type=actions
[actions/hello-world-javascript-action]: https://github.com/actions/hello-world-javascript-action
[0bsd licensed]: https://github.com/jcbhmr/hello-world-deno-action/blob/main/LICENSE
<!-- prettier-ignore-end -->
