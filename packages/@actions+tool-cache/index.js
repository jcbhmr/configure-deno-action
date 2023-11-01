import { join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { createWriteStream } from 'node:fs';
import fetchRetry from "fetch-retry"
import { copyFile, cp, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import which from "which"
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import semver from "semver"
const fetchWithRetry = fetchRetry(fetch)
const execAsync = promisify(exec)

/** @param {string} url */
export async function downloadTool(url) {
    const dest = join(process.env.RUNNER_TEMP, Math.random().toString().slice(2))
    const response = await fetchWithRetry(url, { retryOn: [500] })
    console.assert(response.ok, `${response.url} ${response.status}`)
    await pipeline(response.body, createWriteStream(dest))
    return dest
}

/** @param {string} file */
export async function extractZip(file) {
    const dest = join(process.env.RUNNER_TEMP, Math.random().toString().slice(2))
    await mkdir(dest, { recursive: true })
    if (process.platform === "win32") {
        await extractZipWin(file, dest);
    }
    else {
        await extractZipNix(file, dest);
    }
    return dest;
}
/**
 * @param {string} file
 * @param {string} dest
 */
async function extractZipWin(file, dest) {
    // build the powershell command
    const escapedFile = file.replace(/'/g, "''").replace(/"|\n|\r/g, ''); // double-up single quotes, remove double quotes and newlines
    const escapedDest = dest.replace(/'/g, "''").replace(/"|\n|\r/g, '');
    const pwshPath = await which('pwsh');
    //To match the file overwrite behavior on nix systems, we use the overwrite = true flag for ExtractToDirectory
    //and the -Force flag for Expand-Archive as a fallback
    if (pwshPath) {
        //attempt to use pwsh with ExtractToDirectory, if this fails attempt Expand-Archive
        const pwshCommand = [
            `$ErrorActionPreference = 'Stop' ;`,
            `try { Add-Type -AssemblyName System.IO.Compression.ZipFile } catch { } ;`,
            `try { [System.IO.Compression.ZipFile]::ExtractToDirectory('${escapedFile}', '${escapedDest}', $true) }`,
            `catch { if (($_.Exception.GetType().FullName -eq 'System.Management.Automation.MethodException') -or ($_.Exception.GetType().FullName -eq 'System.Management.Automation.RuntimeException') ){ Expand-Archive -LiteralPath '${escapedFile}' -DestinationPath '${escapedDest}' -Force } else { throw $_ } } ;`
        ].join(' ');
        const args = [
            '-NoLogo',
            '-NoProfile',
            '-NonInteractive',
            '-ExecutionPolicy',
            'Unrestricted',
            '-Command',
            pwshCommand
        ];
        // core.debug(`Using pwsh at path: ${pwshPath}`);
        await execAsync(pwshPath, args);
    }
    else {
        const powershellCommand = [
            `$ErrorActionPreference = 'Stop' ;`,
            `try { Add-Type -AssemblyName System.IO.Compression.FileSystem } catch { } ;`,
            `if ((Get-Command -Name Expand-Archive -Module Microsoft.PowerShell.Archive -ErrorAction Ignore)) { Expand-Archive -LiteralPath '${escapedFile}' -DestinationPath '${escapedDest}' -Force }`,
            `else {[System.IO.Compression.ZipFile]::ExtractToDirectory('${escapedFile}', '${escapedDest}', $true) }`
        ].join(' ');
        const args = [
            '-NoLogo',
            '-Sta',
            '-NoProfile',
            '-NonInteractive',
            '-ExecutionPolicy',
            'Unrestricted',
            '-Command',
            powershellCommand
        ];
        const powershellPath = await which('powershell');
        // core.debug(`Using powershell at path: ${powershellPath}`);
        await execAsync(powershellPath, args);
    }
}
/**
 * @param {string} file
 * @param {string} dest
 */
async function extractZipNix(file, dest) {
    const unzipPath = which('unzip');
    const args = [file];
    // if (!core.isDebug()) {
        args.unshift('-q');
    // }
    args.unshift('-o'); //overwrite with -o, otherwise a prompt is shown which freezes the run
    await execAsync(unzipPath, args, { cwd: dest });
}

/**
 * @param {string} sourceDir
 * @param {string} tool
 * @param {string} version
 */
export async function cacheDir(sourceDir, tool, version) {
    const versionClean = semver.clean(version) || version
    const dest = join(process.env.RUNNER_TOOL_CACHE, tool, versionClean, process.arch)
    const marker = dest + ".complete"
    await rm(dest, { recursive: true, force: true })
    await rm(marker, { recursive: true, force: true })
    await mkdir(dest, { recursive: true })
    for (const entry of await readdir(sourceDir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
            await cp(join(sourceDir, entry.name), join(dest, entry.name), { recursive: true })
        } else {
            await copyFile(join(sourceDir, entry.name), join(dest, entry.name))
        }
    }
    await writeFile(marker, "")
    return dest
}

/**
 * @param {string} tool
 * @param {string} version
 */
export function find(tool, version) {
    const versionClean = semver.clean(version) || ''
    const cachePath = path.join(process.env.RUNNER_TOOL_CACHE, tool, versionClean, process.arch);
    if (fs.existsSync(cachePath) && fs.existsSync(cachePath + ".complete")) {
        return cachePath;
    } else {
        return ""
    }
}