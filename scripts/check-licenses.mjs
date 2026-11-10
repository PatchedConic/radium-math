#!/usr/bin/env node
// License check (architecture Section 10, Q7): every npm package, including
// dev tooling, must carry a license on the allow-list below. Anything else,
// including GPL, LGPL, AGPL and unknown licenses, fails unless it has a
// reviewed exception.
//
// Rust crates are not covered here; see CLAUDE.md.
import { execFileSync } from "node:child_process";

/** Permissive licenses that are compatible with shipping under MIT. */
const ALLOWED = new Set([
  "MIT",
  "MIT-0",
  "ISC",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "0BSD",
  "Apache-2.0",
  "BlueOak-1.0.0",
  "CC0-1.0",
  "Unlicense",
  "Python-2.0",
  "Zlib",
]);

/**
 * Reviewed exceptions: package name → why it is acceptable.
 * Only build-time tools whose code is not shipped in the app belong here.
 */
const EXCEPTIONS = {
  lightningcss: "MPL-2.0, Vite's CSS transformer; build-time only, not shipped.",
  "lightningcss-linux-x64-gnu": "MPL-2.0, native binary for lightningcss; build-time only.",
  "lightningcss-darwin-arm64": "MPL-2.0, native binary for lightningcss; build-time only.",
  "lightningcss-win32-x64-msvc": "MPL-2.0, native binary for lightningcss; build-time only.",
  "caniuse-lite": "CC-BY-4.0, browser-support data read by build tools; not shipped.",
};

/**
 * True if an SPDX expression is acceptable. Conservative: with AND, every
 * license must be allowed; with only OR, any one may be.
 */
function isAllowed(expression) {
  const ids = expression
    .replace(/[()]/g, " ")
    .split(/\s+(?:OR|AND)\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (ids.length === 0) return false;
  return /\sAND\s/.test(expression)
    ? ids.every((id) => ALLOWED.has(id))
    : ids.some((id) => ALLOWED.has(id));
}

const raw = execFileSync("pnpm", ["licenses", "list", "--json"], { encoding: "utf8" });
/** @type {Record<string, { name: string; versions: string[] }[]>} */
const byLicense = JSON.parse(raw);

const failures = [];
const excepted = [];
let total = 0;
for (const [license, pkgs] of Object.entries(byLicense)) {
  for (const p of pkgs) {
    total += 1;
    if (isAllowed(license)) continue;
    const id = `${p.name}@${p.versions.join(",")} (${license})`;
    if (Object.hasOwn(EXCEPTIONS, p.name)) excepted.push(id);
    else failures.push(id);
  }
}

for (const id of excepted) console.log(`  excepted: ${id}`);
if (failures.length > 0) {
  console.error(`\nLicense check failed: ${failures.length} package(s) not on the allow-list:`);
  for (const id of failures) console.error(`  ✗ ${id}`);
  console.error(
    "\nReplace the package, or add a reviewed entry to EXCEPTIONS in scripts/check-licenses.mjs.",
  );
  process.exit(1);
}
console.log(`License check passed: ${total} packages, ${excepted.length} reviewed exception(s).`);
