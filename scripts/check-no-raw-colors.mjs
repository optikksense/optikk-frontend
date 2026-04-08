import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");
const CONFIG_DIR = path.join(SRC_DIR, "config");

const FILE_EXTENSIONS = new Set([".css", ".ts", ".tsx"]);
const COLOR_PATTERN = /#[0-9A-Fa-f]{3,8}\b|rgba?\([^\)]*\)|hsla?\([^\)]*\)/g;

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist") {
        continue;
      }
      files.push(...walk(fullPath));
      continue;
    }

    const ext = path.extname(entry.name);
    if (!FILE_EXTENSIONS.has(ext)) {
      continue;
    }

    files.push(fullPath);
  }
  return files;
}

function isDynamicColor(match) {
  return match.includes("${");
}

function indexToLineCol(content, index) {
  const before = content.slice(0, index);
  const lines = before.split("\n");
  const line = lines.length;
  const col = lines[lines.length - 1].length + 1;
  return { line, col };
}

const violations = [];

for (const filePath of walk(SRC_DIR)) {
  if (filePath.startsWith(CONFIG_DIR)) {
    continue;
  }

  const content = fs.readFileSync(filePath, "utf8");
  let match;
  while ((match = COLOR_PATTERN.exec(content)) !== null) {
    const literal = match[0];
    if (isDynamicColor(literal)) {
      continue;
    }

    const { line, col } = indexToLineCol(content, match.index);
    violations.push({
      file: path.relative(ROOT, filePath),
      line,
      col,
      literal,
    });
  }
}

if (violations.length > 0) {
  console.error("Raw color literals are only allowed under src/config. Found:");
  for (const violation of violations) {
    console.error(`${violation.file}:${violation.line}:${violation.col} -> ${violation.literal}`);
  }
  process.exit(1);
}

console.log("No raw color literals outside src/config.");
