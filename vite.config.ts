/// <reference lib="ESNext" />
import { readFile, writeFile } from "node:fs/promises";
import { defineConfig } from "vite";

// https://github.com/vitejs/vite/discussions/9217#discussioncomment-4188099
function myPlugin() {
  return {
    name: "my-plugin",
    async closeBundle() {
      const bytes = await readFile("dist/index.mjs");
      const base64 = bytes.toString("base64");
      const js = `import("data:text/javascript;base64,${base64}")`;
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
