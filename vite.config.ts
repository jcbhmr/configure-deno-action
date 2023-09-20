/// <reference lib="ESNext" />
import { readFile, writeFile } from "node:fs/promises";
import { defineConfig } from "vite";

// https://github.com/vitejs/vite/discussions/9217#discussioncomment-4188099
function myPlugin() {
  return {
    name: "my-plugin",
    async closeBundle() {
      let js = await readFile("dist/index.mjs", "utf8");
      // prettier-ignore
      js = `(async () => {
        const { writeFile } = await import("node:fs/promises");
        const { join } = await import("node:path");
        const { pathToFileURL } = await import("node:url");

        const js = Buffer.from("${Buffer.from(js).toString("base64")}", "base64").toString("utf8");
        const file = join(process.env.RUNNER_TEMP, "runs-using.mjs");
        await writeFile(file, js)
        await import(pathToFileURL(file));
      })()`;
      await writeFile("dist/index.js", js);
      console.debug(`Created dist/index.js base64 fetch+eval compat bundle`);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: "node20",
    ssr: "index.js",
  },
  ssr: {
    noExternal: /^(?!node:)/,
  },
  plugins: [myPlugin()],
});
