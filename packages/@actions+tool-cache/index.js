import { join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { createWriteStream } from 'node:fs';
import fetchRetry from "fetch-retry"
import { mkdir } from 'node:fs/promises';
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

export async function cacheDir(sourceDir, tool, version) {
    version = semver.clean(version) || version;
    arch = arch || os.arch();
    core.debug(`Caching tool ${tool} ${version} ${arch}`);
    core.debug(`source dir: ${sourceDir}`);
    if (!fs.statSync(sourceDir).isDirectory()) {
        throw new Error('sourceDir is not a directory');
    }
    // Create the tool dir
    const destPath = await _createToolPath(tool, version, arch);
    // copy each child item. do not move. move can fail on Windows
    // due to anti-virus software having an open handle on a file.
    for (const itemName of fs.readdirSync(sourceDir)) {
        const s = path.join(sourceDir, itemName);
        await io.cp(s, destPath, { recursive: true });
    }
    // write .complete
    _completeToolPath(tool, version, arch);
    return destPath;
}

export function find(toolName, versionSpec) {
    arch = arch || os.arch();
    // attempt to resolve an explicit version
    if (!isExplicitVersion(versionSpec)) {
        const localVersions = findAllVersions(toolName, arch);
        const match = evaluateVersions(localVersions, versionSpec);
        versionSpec = match;
    }
    // check for the explicit version in the cache
    let toolPath = '';
    if (versionSpec) {
        versionSpec = semver.clean(versionSpec) || '';
        const cachePath = path.join(_getCacheDirectory(), toolName, versionSpec, arch);
        core.debug(`checking cache: ${cachePath}`);
        if (fs.existsSync(cachePath) && fs.existsSync(`${cachePath}.complete`)) {
            core.debug(`Found tool in cache ${toolName} ${versionSpec} ${arch}`);
            toolPath = cachePath;
        }
        else {
            core.debug('not found');
        }
    }
    return toolPath;
}
/**
 * Finds the paths to all versions of a tool that are installed in the local tool cache
 *
 * @param toolName  name of the tool
 * @param arch      optional arch.  defaults to arch of computer
 */
export function findAllVersions(toolName, arch) {
    const versions = [];
    arch = arch || os.arch();
    const toolPath = path.join(_getCacheDirectory(), toolName);
    if (fs.existsSync(toolPath)) {
        const children = fs.readdirSync(toolPath);
        for (const child of children) {
            if (isExplicitVersion(child)) {
                const fullPath = path.join(toolPath, child, arch || '');
                if (fs.existsSync(fullPath) && fs.existsSync(`${fullPath}.complete`)) {
                    versions.push(child);
                }
            }
        }
    }
    return versions;
}
export async function getManifestFromRepo(owner, repo, auth, branch = 'master') {
    let releases = [];
    const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}`;
    const http = new httpm.HttpClient('tool-cache');
    const headers = {};
    if (auth) {
        core.debug('set auth');
        headers.authorization = auth;
    }
    const response = await http.getJson(treeUrl, headers);
    if (!response.result) {
        return releases;
    }
    let manifestUrl = '';
    for (const item of response.result.tree) {
        if (item.path === 'versions-manifest.json') {
            manifestUrl = item.url;
            break;
        }
    }
    headers['accept'] = 'application/vnd.github.VERSION.raw';
    let versionsRaw = await (await http.get(manifestUrl, headers)).readBody();
    if (versionsRaw) {
        // shouldn't be needed but protects against invalid json saved with BOM
        versionsRaw = versionsRaw.replace(/^\uFEFF/, '');
        try {
            releases = JSON.parse(versionsRaw);
        }
        catch {
            core.debug('Invalid json');
        }
    }
    return releases;
}
export async function findFromManifest(versionSpec, stable, manifest, archFilter = os.arch()) {
    // wrap the internal impl
    const match = await mm._findMatch(versionSpec, stable, manifest, archFilter);
    return match;
}
async function _createExtractFolder(dest) {
    if (!dest) {
        // create a temp dir
        dest = path.join(_getTempDirectory(), uuidV4());
    }
    await io.mkdirP(dest);
    return dest;
}
async function _createToolPath(tool, version, arch) {
    const folderPath = path.join(_getCacheDirectory(), tool, semver.clean(version) || version, arch || '');
    core.debug(`destination ${folderPath}`);
    const markerPath = `${folderPath}.complete`;
    await io.rmRF(folderPath);
    await io.rmRF(markerPath);
    await io.mkdirP(folderPath);
    return folderPath;
}
function _completeToolPath(tool, version, arch) {
    const folderPath = path.join(_getCacheDirectory(), tool, semver.clean(version) || version, arch || '');
    const markerPath = `${folderPath}.complete`;
    fs.writeFileSync(markerPath, '');
    core.debug('finished caching tool');
}
/**
 * Check if version string is explicit
 *
 * @param versionSpec      version string to check
 */
export function isExplicitVersion(versionSpec) {
    const c = semver.clean(versionSpec) || '';
    core.debug(`isExplicit: ${c}`);
    const valid = semver.valid(c) != null;
    core.debug(`explicit? ${valid}`);
    return valid;
}
/**
 * Get the highest satisfiying semantic version in `versions` which satisfies `versionSpec`
 *
 * @param versions        array of versions to evaluate
 * @param versionSpec     semantic version spec to satisfy
 */
export function evaluateVersions(versions, versionSpec) {
    let version = '';
    core.debug(`evaluating ${versions.length} versions`);
    versions = versions.sort((a, b) => {
        if (semver.gt(a, b)) {
            return 1;
        }
        return -1;
    });
    for (let i = versions.length - 1; i >= 0; i--) {
        const potential = versions[i];
        const satisfied = semver.satisfies(potential, versionSpec);
        if (satisfied) {
            version = potential;
            break;
        }
    }
    if (version) {
        core.debug(`matched: ${version}`);
    }
    else {
        core.debug('match not found');
    }
    return version;
}
/**
 * Gets RUNNER_TOOL_CACHE
 */
function _getCacheDirectory() {
    const cacheDirectory = process.env['RUNNER_TOOL_CACHE'] || '';
    ok(cacheDirectory, 'Expected RUNNER_TOOL_CACHE to be defined');
    return cacheDirectory;
}
/**
 * Gets RUNNER_TEMP
 */
function _getTempDirectory() {
    const tempDirectory = process.env['RUNNER_TEMP'] || '';
    return tempDirectory;
}
/**
 * Gets a global variable
 */
function _getGlobal(key, defaultValue) {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const value = global[key];
    /* eslint-enable @typescript-eslint/no-explicit-any */
    return value !== undefined ? value : defaultValue;
}
/**
 * Returns an array of unique values.
 * @param values Values to make unique.
 */
function _unique(values) {
    return Array.from(new Set(values));
}