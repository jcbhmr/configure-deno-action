async function main() {
    const { register } = await import("node:module")
    const { pipeline } = await import("node:stream/promises")
    const { createWriteStream } = await import("node:fs")
    const { tmpdir } = await import("node:os")
    const { join } = await import("node:path")
    const path = join(tmpdir(), Math.random().toString() + ".mjs")
    const response = await fetch(`https://unpkg.com/${__NAME__}@${__VERSION__}/${__HTTP_LOADER__}`)
    await pipeline(response.body, createWriteStream(path))
    register(path)

}
main()