import { readFile, rename, writeFile } from "node:fs/promises";
import { defineConfig } from "vite";

// https://github.com/vitejs/vite/discussions/9217#discussioncomment-4188099
function myPlugin() {
  return {
    name: "my-plugin",
    async closeBundle() {
      const base64 = await readFile("dist/index.js", "base64");
      const js = `import("data:text/javascript;base64,${base64}")`;
      await writeFile("dist/index.js", js);
      await rename("dist/index.js", "dist/index.cjs");
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
