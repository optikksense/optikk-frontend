#!/usr/bin/env node
/**
 * CI gate: marketing routes must stay image-free (PR 1 rewrite).
 *
 * Fails if public/marketing/ contains any file that isn't an .svg
 * or a hidden metadata file. Inline SVG motifs co-located in
 * src/features/marketing/svg/ are the canonical place for marketing
 * imagery; raster assets should never come back.
 */
import { existsSync, readdirSync, statSync } from "node:fs"
import path from "node:path"

const MARKETING_DIR = path.resolve("public/marketing")
const ALLOWED_EXT = new Set([".svg"])

if (!existsSync(MARKETING_DIR)) {
  console.log("✅ public/marketing/ absent — nothing to check.")
  process.exit(0)
}

const offenders = []

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith(".")) continue
    const full = path.join(dir, entry)
    const s = statSync(full)
    if (s.isDirectory()) {
      walk(full)
      continue
    }
    const ext = path.extname(entry).toLowerCase()
    if (!ALLOWED_EXT.has(ext)) {
      offenders.push(path.relative(process.cwd(), full))
    }
  }
}

walk(MARKETING_DIR)

if (offenders.length > 0) {
  console.error("❌ public/marketing/ must only contain .svg files.")
  console.error("   Marketing routes are image-free — inline SVG only.")
  console.error("   Offending files:")
  for (const file of offenders) {
    console.error(`     - ${file}`)
  }
  process.exit(1)
}

console.log("✅ public/marketing/ is SVG-only.")
