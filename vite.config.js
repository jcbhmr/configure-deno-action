import { defineConfig } from "vite";
import license from "rollup-plugin-license";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    minify: false,
    target: "node20",
    ssr: "index.js",
  },
  resolve: {
    alias: {
      "undici": "data:text/javascript,"
    }
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
    })
  ],
});
