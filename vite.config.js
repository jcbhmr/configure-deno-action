import { defineConfig } from "vite";
import { writeFile, readFile } from "node:fs/promises";

function myPlugin() {
  return /** @satisfies {import('vite').PluginOption} */ ({
    async closeBundle() {
      const file = "dist/index.js";
      let js = await readFile(file, "utf8");
      js =
        `import(\`data:text/javascript,\${encodeURIComponent(\n` +
        `\`${js.replaceAll(/\\|`|\$(?={)/g, (x) => "\\" + x)}\`\n` +
        `)}\`)`;
      await writeFile(file, js);
      console.debug(`wrote ${file}`);
    },
  });
}

export default defineConfig({
  build: {
    minify: false,
    target: "node20",
    ssr: "index.js",
    rollupOptions: {
      output: {
        inlineDynamicImports: true
      }
    }
  },
  resolve: {
    alias: {
      "@actions/tool-cache": "patches/@actions+tool-cache+2.0.1.js",
    },
  },
  ssr: {
    noExternal: /^(?!node:)/,
  },
  plugins: [myPlugin()],
});
