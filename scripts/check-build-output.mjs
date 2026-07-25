import { readdirSync } from "node:fs";
import { join } from "node:path";

function findSourceMaps(directory) {
  const entries = readdirSync(directory, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return findSourceMaps(path);
    return entry.name.endsWith(".map") ? [path] : [];
  });
}

const sourceMaps = findSourceMaps("dist");
if (sourceMaps.length > 0) {
  console.error(`Production bundle contains source maps:\n${sourceMaps.join("\n")}`);
  process.exit(1);
}

console.log("check:build-output ok — no public source maps");
