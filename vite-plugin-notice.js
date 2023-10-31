import { writeFileSync } from "node:fs";
import license from "rollup-plugin-license";
import semver from "semver";

function addIndent(text, level) {
  const prefix = typeof level === "number" ? " ".repeat(level) : level;
  return text.replaceAll(/^|\r?\n/g, (m) => m + prefix);
}

function dependencyToNoticeText(dep) {
  const {
    name,
    version,
    license,
    licenseText,
    author,
    maintainers,
    contributors,
    repository,
  } = dep;
  let text = "";
  text += `${name}@${version}\n`;
  text += "=".repeat(name.length + 1 + version.length) + "\n";
  if (license) {
    text += `License: ${license}\n`;
  }
  let names = [author, ...maintainers, ...contributors].map(
    (x) => x?.name ?? x,
  );
  names = names.filter((x) => x);
  names = [...new Set(names)];
  if (names.length) {
    text += `By: ${names.join(", ")}\n`;
  }
  if (repository) {
    text += `Repository: ${repository?.url ?? repository}\n`;
  }
  if (licenseText) {
    text += "\n";
    text += addIndent(licenseText, 4) + "\n";
  }
  return text;
}

function notice(options = {}) {
    const file = options.file ?? "NOTICE"
  return license({
    thirdParty(dependencies) {
      dependencies.sort((a, b) => {
        const x = a.name.localeCompare(b.name);
        return x || semver.compare(a.version, b.version);
      });
      let text = "";
      text += `The published artifact contains code with the following licenses:\n`;
      const licenses = [...new Set(dependencies.map((x) => x.license))].sort();
      text += licenses.join(", ") + "\n";
      text += "\n";
      const noticeTexts = dependencies.map((x) => dependencyToNoticeText(x));
      text += noticeTexts.join(`\n${"-".repeat(80)}\n\n`);
      writeFileSync(file, text);
      console.debug(`wrote ${text.length} bytes to ${file}`);
    },
  });
}

export default notice;
