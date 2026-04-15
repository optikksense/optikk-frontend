import fs from "node:fs"
import path from "node:path"

const distDir = path.resolve("dist")
const manifestPath = path.join(distDir, ".vite", "manifest.json")
const contentPath = path.resolve("src/features/marketing/content.json")

if (!fs.existsSync(manifestPath)) {
  process.exit(0)
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"))
const content = JSON.parse(fs.readFileSync(contentPath, "utf8"))
const entry = manifest["index.html"]

if (!entry?.file) {
  process.exit(0)
}

const cssLinks = (entry.css ?? [])
  .map((file) => `<link rel="stylesheet" href="/${file}" />`)
  .join("\n")

for (const page of content.pages) {
  const title = `${page.title} | Optikk`
  const body = `<div id="root"></div><script type="module" src="/${entry.file}"></script>`
  const html = [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="UTF-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    `<title>${title}</title>`,
    `<meta name="description" content="${page.description}" />`,
    cssLinks,
    "</head>",
    `<body data-prerendered-route="${page.path}">`,
    body,
    "</body>",
    "</html>",
  ].join("\n")
  const targetDir = page.path === "/" ? distDir : path.join(distDir, page.path.slice(1))
  fs.mkdirSync(targetDir, { recursive: true })
  fs.writeFileSync(path.join(targetDir, "index.html"), html)
}
