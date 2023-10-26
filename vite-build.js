#!/usr/bin/env node
import { build } from "vite";
import packageJSON from "./package.json" assert { type: "json" }

// https://vitejs.dev/config/
await build({
  build: {
    minify: false,
    target: "node20",
    ssr: "main.js",
  },
  resolve: {
    alias: {
      undici: "patches/undici.js",
    },
  },
  ssr: {
    noExternal: /^(?!node:)/,
  },
})

// https://vitejs.dev/config/
await build({
  build: {
    minify: false,
    target: "node20",
    ssr: "http-loader.js",
  },
  resolve: {
    alias: {
      undici: "patches/undici.js",
    },
  },
  ssr: {
    noExternal: /^(?!node:)/,
  },
})

// https://vitejs.dev/config/
await build({
  define: {
    __NAME__: JSON.stringify(packageJSON.name),
    __VERSION__: JSON.stringify(packageJSON.version),
    __HTTP_LOADER__: JSON.stringify("./dist/http-loader.js"),
  },
  build: {
    emptyOutDir:false,
    minify: false,
    target: "node20",
    ssr: true,
    lib: {
      entry: "index.js",
      formats: ["iife"],
      fileName: () => "index.js",
      name: "runs2",
    }
  },
  ssr: {
    noExternal: /^(?!node:)/,
  },
})
