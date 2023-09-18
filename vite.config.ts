import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "node20",
    ssr: "./src/index.ts",
  },
  ssr: {
    noExternal: /^(?!node:)/,
    format: "cjs",
  },
});
