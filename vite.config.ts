/// <reference lib="ESNext" />
import { readFile, writeFile } from "node:fs/promises";
import { defineConfig } from "vite";
import { minify } from "terser";

// https://github.com/vitejs/vite/discussions/9217#discussioncomment-4188099
function myPlugin() {
  return {
    name: "my-plugin",
    async closeBundle() {
      const packageText = await readFile("package.json", "utf8");
      const { name, version } = JSON.parse(packageText);

      let js = await readFile("src/_bootstrap.js", "utf8");
      js = js.replaceAll(
        "__UNPKG_BASE_URL__",
        JSON.stringify(`https://unpkg.com/${name}@${version}/`)
      );
      js = "export default " + js;
      js = (await minify(js)).code!;
      js = js.replace(/^export default ?/, "");
      await writeFile("dist/_bootstrap.js", js, "utf8");
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: "node20",
    ssr: "src/index.ts",
  },
  ssr: {
    noExternal: /^(?!node:)/,
  },
  plugins: [myPlugin()],
});
