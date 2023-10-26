import { createWriteStream, existsSync } from "node:fs";
import { cp, mkdir, readdir, rm, writeFile } from "node:fs/promises"
import { delimiter, dirname, join } from "node:path";
import { pipeline } from "node:stream/promises";

const _getCacheDirectory = () => process.env.RUNNER_TOOL_CACHE || ""
async function _createToolPath(tool, version, arch) {
    const folderPath = join(_getCacheDirectory(), tool, version, arch);
    const markerPath = `${folderPath}.complete`;
    await rm(folderPath, { recursive: true, force: true });
    await rm(markerPath, { recursive: true, force: true });
    await mkdir(folderPath, { recursive: true });
    return folderPath;
}
async function _completeToolPath(tool, version, arch) {
    const folderPath = path.join(_getCacheDirectory(), tool, version, arch);
    const markerPath = `${folderPath}.complete`;
    await writeFile(markerPath, '');
}
async function cacheDir(sourceDir, tool, version) {
    const arch = process.arch
    const destPath = await _createToolPath(tool, version, arch);
    for (const itemName of await readdir(sourceDir)) {
        const s = join(sourceDir, itemName);
        await cp(s, destPath, { recursive: true });
    }
    await _completeToolPath(tool, version, arch);
    return destPath;
}

function find(toolName, versionSpec) {
    const arch = process.arch
    let toolPath = '';
    if (versionSpec) {
        const cachePath = path.join(_getCacheDirectory(), toolName, versionSpec, arch);
        if (existsSync(cachePath) && existsSync(`${cachePath}.complete`)) {
            toolPath = cachePath;
        }
    }
    return toolPath;
}

const _getTempDirectory = () => process.env.RUNNER_TEMP
async function downloadTool(url) {
    const dest = join(_getTempDirectory(), Math.random().toString());
    await mkdir(dirname(dest), { recursive: true });
    return await downloadToolAttempt(url, dest);
}
async function downloadToolAttempt(url, dest) {
    const response = await fetch(url)
    if (response.status !== 200) {
        throw new DOMException(`${response.status} ${response.url}`, "NetworkError")
    }
    await pipeline(response.body, createWriteStream(dest))
    return dest
}

async function _createExtractFolder() {
        const dest = path.join(_getTempDirectory(), Math.random().toString());
        await mkdir(dest, { recursive: true });
        return dest;
}
function normalizeSeparators(p) {
    if (process.platform === "win32") {
        return p.replace(/\//g, '\\').replace(/\\\\+/g, '\\');
    } else {
        return p.replace(/\/\/+/g, '/');
    }
}
function isRooted(p1)  {
    const p = normalizeSeparators(p1)
    if (process.platform === "win32") {
        return p.startsWith('\\') || /^[A-Z]:/i.test(p)
    } else {
        return p.startsWith('/');
    }
}
async function findInPath(tool) {
    const extensions = [];
    if (process.platform === "win32" && process.env.PATHEXT) {
        for (const extension of process.env.PATHEXT.split(delimiter)) {
            if (extension) {
                extensions.push(extension);
            }
        }
    }
    if (isRooted(tool)) {
        const filePath = yield tryGetExecutablePath(tool, extensions);
        if (filePath) {
            return [filePath];
        }
        return [];
    }
    // if any path separators, return empty
    if (tool.includes(path.sep)) {
        return [];
    }
    // build the list of directories
    //
    // Note, technically "where" checks the current directory on Windows. From a toolkit perspective,
    // it feels like we should not do this. Checking the current directory seems like more of a use
    // case of a shell, and the which() function exposed by the toolkit should strive for consistency
    // across platforms.
    const directories = [];
    if (process.env.PATH) {
        for (const p of process.env.PATH.split(path.delimiter)) {
            if (p) {
                directories.push(p);
            }
        }
    }
    // find all matches
    const matches = [];
    for (const directory of directories) {
        const filePath = yield ioUtil.tryGetExecutablePath(path.join(directory, tool), extensions);
        if (filePath) {
            matches.push(filePath);
        }
    }
    return matches;
}
async function which(tool) {
    const matches = await findInPath(tool)
    return matches?.[0] ?? ""
}
async function extractZipWin(file, dest) {
    // build the powershell command
    const escapedFile = file.replace(/'/g, "''").replace(/"|\n|\r/g, ''); // double-up single quotes, remove double quotes and newlines
    const escapedDest = dest.replace(/'/g, "''").replace(/"|\n|\r/g, '');
    const pwshPath = await which('pwsh', false);
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
        core.debug(`Using pwsh at path: ${pwshPath}`);
        yield exec_1.exec(`"${pwshPath}"`, args, { silent: !core.isDebug() });
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
        const powershellPath = yield io.which('powershell', true);
        core.debug(`Using powershell at path: ${powershellPath}`);
        yield exec_1.exec(`"${powershellPath}"`, args, { silent: !core.isDebug() });
    }
}
async function extractZip(file) {
    const dest = await _createExtractFolder()
    if (process.platform === "win32") {
        await extractZipWin(file, dest)
    } else {
        await extractZipNix(file, dest)
    }
    return dest
}

export { cacheDir, find, downloadTool }