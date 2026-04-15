import fs from "node:fs"
import path from "node:path"

const root = path.resolve("src")
const fileLimit = 200
const results = []

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const next = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(next)
      continue
    }
    if (!/\.(ts|tsx|css)$/.test(entry.name)) {
      continue
    }
    const lineCount = fs.readFileSync(next, "utf8").split(/\r?\n/).length
    if (lineCount > fileLimit) {
      results.push({ lineCount, file: path.relative(process.cwd(), next) })
    }
  }
}

walk(root)

if (results.length > 0) {
  console.error("Files over budget:")
  for (const result of results) {
    console.error(`${result.lineCount} ${result.file}`)
  }
  process.exitCode = 1
}
