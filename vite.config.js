import { defineConfig } from "vite";
import license from "rollup-plugin-license";
import { readFile, rm, writeFile } from "node:fs/promises";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    minify: false,
    target: "node20",
    ssr: "index.js",
  },
  ssr: {
    noExternal: /^(?!node:)/,
  },
  plugins: [
    license({
      banner: {
        content: { file: "LICENSE" },
      },
      thirdParty: { output: "dist/TPL.txt" },
    }),
    {
      name: "my-plugin",
      async closeBundle() {
        let js = await readFile("dist/index.js", "utf8");
        const tpl = await readFile("dist/TPL.txt", "utf8");
        js = `/*!\n${tpl}\n*/\n\n${js}`;
        await writeFile("dist/index.js", js);
        await rm("dist/TPL.txt");
      },
    },
  ],
});
