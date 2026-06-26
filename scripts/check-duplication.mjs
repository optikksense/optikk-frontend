// Guards against re-introducing duplicate formatter implementations.
// Display formatting lives in src/shared/utils/formatters.ts; the only other
// allowed homes are listed below. See AGENTS.md "one home per concept".
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const GUARDED =
  /\b(?:function|const)\s+(formatRelativeTime|relativeTime|timeAgo|formatRelative|formatNumber|formatDuration)\s*[=(]/;

const ALLOWED_FILES = new Set([
  "src/shared/utils/formatters.ts",

  "src/shared/components/ui/charts/ServiceTopologyGraph/format.ts",
]);

const files = execSync('git ls-files "src/**/*.ts" "src/**/*.tsx"', { encoding: "utf8" })
  .split("\n")
  .filter(Boolean)
  .filter((f) => existsSync(f))
  .filter((f) => !f.startsWith("src/features/marketing/"));

let failed = false;
for (const file of files) {
  if (ALLOWED_FILES.has(file)) continue;
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    const m = line.match(GUARDED);
    if (m) {
      console.error(
        `${file}:${i + 1} defines ${m[1]} — import it from @shared/utils/formatters instead`
      );
      failed = true;
    }
  });
}

if (failed) process.exit(1);
console.log("check:dupes ok");
