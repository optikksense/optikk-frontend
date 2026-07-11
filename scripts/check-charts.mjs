// Enforces chart layering: features must render through the shared chart
// wrappers (ObservabilityChart / UPlotChart) rather than importing uPlot
// directly. Direct uPlot lives only under src/shared/components/ui/charts.
// The one known exception is ratcheted in the allowlist below and must
// shrink to zero over time; new direct-uPlot imports in features fail.
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

// Files still importing uPlot directly. Do not add to this list — migrate to
// ObservabilityChart (thresholds/plugins props) or extend the shared wrappers.
const ALLOWLIST = new Set([
  "src/features/overview/pages/OverviewHubPage/components/SystemPerformanceCard.tsx",
]);

const UPLOT_IMPORT_RE = /(?:from|import)\s*\(?\s*["']uplot(?:\/[^"']*)?["']/;

const files = execSync('git ls-files "src/features/**/*.ts" "src/features/**/*.tsx"', {
  encoding: "utf8",
})
  .split("\n")
  .filter(Boolean)
  .filter((f) => existsSync(f));

const offenders = files.filter((f) => UPLOT_IMPORT_RE.test(readFileSync(f, "utf8")));
const newOffenders = offenders.filter((f) => !ALLOWLIST.has(f));
const fixed = [...ALLOWLIST].filter((a) => !offenders.includes(a));

for (const f of newOffenders) console.error(`NEW  ${f} imports uplot directly`);
if (fixed.length > 0) {
  console.warn(
    `stale allowlist entries (migrated — remove from check-charts.mjs): ${fixed.length}`
  );
}
console.log(
  `check:charts ${newOffenders.length === 0 ? "ok" : "FAILED"} — ` +
    `${offenders.length} direct-uplot, ${offenders.length - newOffenders.length} allowlisted, ${newOffenders.length} new`
);
if (newOffenders.length > 0) process.exit(1);
