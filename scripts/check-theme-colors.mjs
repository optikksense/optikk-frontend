#!/usr/bin/env node
/**
 * Theme-color guardrail.
 *
 * Fails if any component authors color through a non-theme-aware channel, so the
 * light/dark consistency established by the token system can't silently rot:
 *   1. Tailwind named-color utilities  (text-red-500, bg-zinc-500/15, …)
 *   2. raw hex in a className arbitrary value   (text-[#fff], bg-[#1a1a1a])
 *   3. raw rgba()/rgb() in a className arbitrary value   (bg-[rgba(255,255,255,.04)])
 *
 * Allowed: theme tokens via `[var(--token)]`, `color-mix(...)` arbitrary values,
 * and inline `style={{}}` (used for dynamic/canvas colors). The marketing feature
 * has its own scoped theme system and is excluded.
 *
 * Run: `node scripts/check-theme-colors.mjs`  (wired into `yarn ci`).
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("../src", import.meta.url).pathname;
const EXCLUDE_DIRS = ["features/marketing"];

const NAMED_COLORS =
  "red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone";
const PREFIXES =
  "text|bg|border|border-[tblrxyse]|ring|fill|stroke|divide|from|via|to|shadow|outline";

const RULES = [
  {
    name: "named-color utility",
    re: new RegExp(`\\b(?:${PREFIXES})-(?:${NAMED_COLORS})-[0-9]{2,3}(?:/[0-9]{1,3})?\\b`, "g"),
  },
  { name: "raw hex in className", re: new RegExp(`\\b(?:${PREFIXES})-\\[#[0-9a-fA-F]{3,8}`, "g") },
  { name: "raw rgb/rgba in className", re: new RegExp(`\\b(?:${PREFIXES})-\\[rgba?\\(`, "g") },
];

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const rel = full.slice(ROOT.length + 1);
    if (EXCLUDE_DIRS.some((d) => rel.startsWith(d))) continue;
    if (statSync(full).isDirectory()) walk(full, files);
    else if (entry.endsWith(".tsx") || entry.endsWith(".ts")) files.push(full);
  }
  return files;
}

const violations = [];
for (const file of walk(ROOT)) {
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    for (const rule of RULES) {
      rule.re.lastIndex = 0;
      const m = rule.re.exec(line);
      if (m)
        violations.push(`${file.replace(`${ROOT}/`, "src/")}:${i + 1}  [${rule.name}]  ${m[0]}`);
    }
  });
}

if (violations.length > 0) {
  console.error(`\n✖ Theme-color guardrail: ${violations.length} violation(s).`);
  console.error("  Use theme tokens (text-error, bg-surface, [var(--token)]) — not raw colors.\n");
  for (const v of violations) console.error(`  ${v}`);
  console.error("");
  process.exit(1);
}

console.log("✓ Theme-color guardrail: no raw colors in className.");
