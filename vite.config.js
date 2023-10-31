import { defineConfig } from "vite";
import notice from "./vite-plugin-notice.js";

export default defineConfig({
  build: {
    minify: false,
    target: "node20",
    ssr: "index.js",
  },
  ssr: {
    noExternal: /^(?!node:)/,
  },
  plugins: [notice()],
});
