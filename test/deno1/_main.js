(async () => {
  const { createWriteStream } = await import("node:fs");
  const { join } = await import("node:path");
  const { pipeline } = await import("node:stream/promises");
  const { pathToFileURL } = await import("node:url");

  async function downloadTo(url, path) {
    const response = await fetch(url);
    console.assert(response.ok, `${response.url} ${response.status}`);
    await pipeline(response.body, createWriteStream(path));
  }

  const file = join(process.env.RUNNER_TEMP, "runs-using.mjs");
  await downloadTo("http://localhost:8378/dist/index.mjs", file);
  await import(pathToFileURL(file));
})();
