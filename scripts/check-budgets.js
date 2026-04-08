import fs from "node:fs";
import path from "node:path";

const distAssets = path.join(process.cwd(), "dist", "assets");
if (!fs.existsSync(distAssets)) {
  console.log(
    "Warning: No dist/assets directory found. Skipping budget checks. (Did you run build?)"
  );
  process.exit(0);
}

const files = fs.readdirSync(distAssets).filter((f) => f.endsWith(".js"));
let failed = false;

for (const file of files) {
  const stats = fs.statSync(path.join(distAssets, file));
  const sizeKb = stats.size / 1024;

  // Datadog-level strict UI budgeting
  if (file.includes("ui-runtime") && sizeKb > 200) {
    console.error(`❌ Error!! UI chunk exceeds 200kb budget: ${sizeKb.toFixed(2)}kb`);
    failed = true;
  } else if ((file.includes("vendor") || file.includes("index")) && sizeKb > 500) {
    console.error(`❌ Error!! Vendor chunk exceeds 500kb budget: ${sizeKb.toFixed(2)}kb`);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
} else {
  console.log("✅ Datadog architecture performance budgets passed!");
}
