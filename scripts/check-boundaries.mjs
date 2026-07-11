// Enforces import boundaries (see CODE_INDEX.md "No Cross-Feature Imports"):
//   1. src/features/<a> must not import from src/features/<b> (a !== b)
//   2. src/shared must not import from src/features
// Known pre-existing violations live in scripts/boundaries-allowlist.json and
// are ratcheted down to zero; new violations fail immediately.
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

// Mirrors tsconfig.json "paths" (keep in sync). Order matters: longest first.
const ALIASES = [
  ["@app/", "src/app/"],
  ["@shared/", "src/shared/"],
  ["@config/", "src/config/"],
  ["@/", "src/"],
];

const IMPORT_RE = /(?:from|import)\s*\(?\s*["']([^"']+)["']/g;

const ALLOWLIST_PATH = "scripts/boundaries-allowlist.json";
const allowlist = new Set(
  existsSync(ALLOWLIST_PATH) ? JSON.parse(readFileSync(ALLOWLIST_PATH, "utf8")) : []
);

function resolveSpecifier(fromFile, spec) {
  if (spec.startsWith(".")) {
    return path.join(path.dirname(fromFile), spec);
  }
  for (const [alias, target] of ALIASES) {
    if (spec === alias || spec === alias.replace(/\/$/, "")) return target;
    if (spec.startsWith(alias)) return target + spec.slice(alias.length);
  }
  return null; // bare package import
}

function featureOf(p) {
  const m = p.match(/^src\/features\/([^/]+)/);
  return m ? m[1] : null;
}

const files = execSync('git ls-files "src/**/*.ts" "src/**/*.tsx"', { encoding: "utf8" })
  .split("\n")
  .filter(Boolean)
  .filter((f) => existsSync(f));

const violations = [];
for (const file of files) {
  const fromFeature = featureOf(file);
  const fromShared = file.startsWith("src/shared/");
  if (!fromFeature && !fromShared) continue;

  const source = readFileSync(file, "utf8");
  for (const m of source.matchAll(IMPORT_RE)) {
    const resolved = resolveSpecifier(file, m[1]);
    if (!resolved) continue;
    const toFeature = featureOf(path.normalize(resolved));
    if (!toFeature) continue;
    if (fromShared) {
      violations.push(`${file} -> ${m[1]} (shared must not import features)`);
    } else if (toFeature !== fromFeature) {
      violations.push(`${file} -> ${m[1]} (cross-feature: ${fromFeature} -> ${toFeature})`);
    }
  }
}

const newViolations = violations.filter((v) => !allowlist.has(v));
const fixed = [...allowlist].filter((a) => !violations.includes(a));

for (const v of newViolations) console.error(`NEW  ${v}`);
if (fixed.length > 0) {
  console.warn(`stale allowlist entries (fixed — remove from ${ALLOWLIST_PATH}): ${fixed.length}`);
}
console.log(
  `check:boundaries ${newViolations.length === 0 ? "ok" : "FAILED"} — ` +
    `${violations.length} total, ${violations.length - newViolations.length} allowlisted, ${newViolations.length} new`
);
if (newViolations.length > 0) process.exit(1);
