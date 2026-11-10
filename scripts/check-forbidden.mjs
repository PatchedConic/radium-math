#!/usr/bin/env node
// SEC-01 code search (requirements Section 9, inspection): proves there is no
// eval, Function constructor, dynamic import, CortexJS compile() or raw HTML
// injection anywhere in src/. ESLint enforces the same rules; this is a plain
// text search that does not depend on ESLint being configured correctly.
//
// Comments are stripped first, so documentation may name the banned calls.
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = "src";
const EXTENSIONS = /\.(ts|tsx|js|jsx|mjs|cjs)$/;

const PATTERNS = [
  [/\beval\s*\(/, "eval()"],
  [/\bFunction\s*\(/, "Function constructor"],
  [/\bimport\s*\(/, "dynamic import()"],
  [/\.compile\s*\(/, ".compile() (CortexJS generates JavaScript)"],
  [/\bset(?:Timeout|Interval)\s*\(\s*["'`]/, "setTimeout/setInterval with a string"],
  [/\.(?:inner|outer)HTML\s*=(?!=)/, "innerHTML/outerHTML assignment"],
  [/\binsertAdjacentHTML\b/, "insertAdjacentHTML"],
  [/\bdangerouslySetInnerHTML\b/, "dangerouslySetInnerHTML"],
  [/\bdocument\.write(?:ln)?\b/, "document.write"],
];

/** Replace comments with spaces, keeping line numbers and string contents. */
function stripComments(src) {
  let out = "";
  let i = 0;
  let quote = null; // ' " or `
  while (i < src.length) {
    const c = src[i];
    const next = src[i + 1];
    if (quote) {
      out += c;
      if (c === "\\") {
        out += next ?? "";
        i += 2;
        continue;
      }
      if (c === quote) quote = null;
      i += 1;
    } else if (c === "/" && next === "/") {
      while (i < src.length && src[i] !== "\n") i += 1;
    } else if (c === "/" && next === "*") {
      const end = src.indexOf("*/", i + 2);
      const stop = end === -1 ? src.length : end + 2;
      out += src.slice(i, stop).replace(/[^\n]/g, " ");
      i = stop;
    } else {
      if (c === "'" || c === '"' || c === "`") quote = c;
      out += c;
      i += 1;
    }
  }
  return out;
}

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (EXTENSIONS.test(entry.name)) yield path;
  }
}

const hits = [];
let files = 0;
for (const file of walk(ROOT)) {
  files += 1;
  const lines = stripComments(readFileSync(file, "utf8")).split("\n");
  lines.forEach((line, n) => {
    for (const [re, what] of PATTERNS) {
      if (re.test(line)) hits.push(`${relative(".", file)}:${n + 1}  ${what}\n    ${line.trim()}`);
    }
  });
}

if (hits.length > 0) {
  console.error(`SEC-01 check failed: ${hits.length} forbidden construct(s):\n`);
  for (const h of hits) console.error(`  ✗ ${h}`);
  process.exit(1);
}
console.log(`SEC-01 check passed: ${files} files in ${ROOT}/, no forbidden constructs.`);
