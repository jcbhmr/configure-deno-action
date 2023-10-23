import { defineConfig } from "vite";
import license from "rollup-plugin-license";
import { readFile, writeFile, rm } from "node:fs/promises";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    minify: false,
    target: "node20",
    ssr: "index.js",
  },
  resolve: {
    alias: {
      undici: "data:text/javascript,",
    },
  },
  ssr: {
    noExternal: /^(?!node:)/,
  },
  plugins: [
    license({
      banner: {
        commentStyle: "ignored",
        content: { file: "LICENSE" },
      },
      thirdParty: { output: "dist/THIRD_PARTY_LICENSE.txt" },
    }),
    {
      name: "my-plugin",
      async closeBundle() {
        const tpl = await readFile("dist/THIRD_PARTY_LICENSE.txt", "utf8");
        const blockComment = `/*!\n${tpl.replaceAll("*/", "_/")}\n*/`;
        let js = await readFile("dist/index.js", "utf8");
        js = blockComment + "\n\n" + js;
        await writeFile("dist/index.js", js);
        await rm("dist/THIRD_PARTY_LICENSE.txt");
      },
    },
  ],
});
