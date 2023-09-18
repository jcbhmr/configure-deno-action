(async function () {
  "use strict";
  const { spawn } = await import("node:child_process");

  function resolve(specifier, context, next) {
    const { parentURL } = context;

    if (specifier.startsWith(__UNPKG_BASE_URL__)) {
      return { url: specifier, shortCircuit: true };
    } else if (
      parentURL?.startsWith(__UNPKG_BASE_URL__) &&
      /^\.?\.?\//.test(specifier)
    ) {
      return { url: new URL(specifier, parentURL).href, shortCircuit: true };
    }

    return next(specifier, context);
  }

  async function load(url, context, next) {
    if (url.startsWith(__UNPKG_BASE_URL__)) {
      const response = await fetch(url);
      if (!response.ok) {
        throw new DOMException(
          `Failed to fetch ${url}: ${response.status} ${response.statusText}`,
          "NetworkError"
        );
      }
      let format;
      const type = response.headers.get("Content-Type");
      if (!type) {
        throw new ReferenceError("Missing Content-Type header");
      }
      if (/javascript|ecmascript/.test(type)) {
        format = "module";
      } else if (type === "application/node") {
        format = "commonjs";
      } else if (type === "application/json") {
        format = "json";
      } else if (type === "application/wasm") {
        format = "wasm";
      } else {
        throw new DOMException(`${type} is not supported`, "NotSupportedError");
      }
      const buffer = await response.arrayBuffer();
      return { format, source: buffer, shortCircuit: true };
    }

    return next(url, context);
  }

  const loaderJS =
    `export const resolve=${resolve};` + `export const load=${load};`;

  const toDataURL = (source, type) =>
    `data:${type};base64,${Buffer.from(source).toString("base64")}`;

  const child = spawn(
    process.execPath,
    [
      "--no-warnings=ExperimentalWarning",
      "--loader",
      toDataURL(loaderJS, "text/javascript"),
      "--import",
      __UNPKG_BASE_URL__ + "dist/main.js",
      "-e",
      "",
      ...process.argv.slice(2),
    ],
    {
      stdio: "inherit",
    }
  );
  child.on("exit", (code) => {
    process.exitCode = code ?? 0;
  });
})();
