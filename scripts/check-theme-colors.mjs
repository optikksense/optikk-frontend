// Theme-color guardrail: components must use semantic utilities or
// [var(--token)] in className — no Tailwind named colors, raw hex, or rgb().
// Raw colors are only allowed in inline style={{}} and .css files.
// Marketing keeps its own scoped theme and is excluded.
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const TAILWIND_NAMED =
  /\b(?:text|bg|border|ring|fill|stroke|from|to|via|divide|outline|decoration|accent|caret)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/;
const RAW_HEX = /\[#[0-9a-fA-F]{3,8}\]/;
const RAW_RGB = /\[rgba?\(/;

const files = execSync('git ls-files "src/**/*.tsx" "src/**/*.ts"', { encoding: "utf8" })
  .split("\n")
  .filter(Boolean)
  .filter((f) => existsSync(f))
  .filter((f) => !f.startsWith("src/features/marketing/"));

let failed = false;
for (const file of files) {
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    if (!line.includes("className")) return;
    for (const [name, re] of [
      ["Tailwind named color", TAILWIND_NAMED],
      ["raw hex color", RAW_HEX],
      ["raw rgb() color", RAW_RGB],
    ]) {
      const m = line.match(re);
      if (m) {
        console.error(`${file}:${i + 1} ${name} in className: ${m[0]}`);
        failed = true;
      }
    }
  });
}

if (failed) {
  console.error("\nUse semantic utilities (text-error, bg-surface) or [var(--token)] instead.");
  process.exit(1);
}
console.log("check:colors ok");
