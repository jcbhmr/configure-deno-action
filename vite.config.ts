import { defineConfig } from "vite";

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
});
