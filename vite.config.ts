import { defineConfig } from "vite";

export default defineConfig({
  build: {
    ssr: "./src/index.js",
  },
  ssr: {
    noExternal: true,
  },
});
