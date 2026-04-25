/**
 * Builds a clickable repo URL from OTel semconv code/vcs attributes (O14).
 * Supports GitHub/GitLab/Bitbucket via `/blob/<ref>/<file>#L<lineno>` layout.
 * Returns null when required attributes are missing or the host is unknown.
 */
export function buildCodeRepoLink(attrs: Readonly<Record<string, string>>): string | null {
  const filepath = attrs["code.filepath"];
  if (!filepath) return null;
  const repoUrl = pickRepoUrl(attrs);
  if (!repoUrl) return null;
  const ref = pickRef(attrs);
  const base = repoUrl.replace(/\.git$/, "").replace(/\/$/, "");
  const layout = pathLayoutFor(base);
  if (!layout) return null;
  const lineno = attrs["code.lineno"];
  const anchor = lineno ? `#L${lineno}` : "";
  const relFile = filepath.replace(/^\//, "");
  return `${base}/${layout}/${encodeURIComponent(ref)}/${relFile}${anchor}`;
}

function pickRepoUrl(attrs: Readonly<Record<string, string>>): string | null {
  return attrs["vcs.repository.url"]
    ?? attrs["code.repository"]
    ?? attrs["vcs.repository.url.full"]
    ?? null;
}

function pickRef(attrs: Readonly<Record<string, string>>): string {
  return attrs["vcs.repository.ref.name"]
    ?? attrs["vcs.repository.ref.revision"]
    ?? attrs["code.commit"]
    ?? "main";
}

function pathLayoutFor(base: string): string | null {
  if (base.includes("github.com") || base.includes("gitlab.com")) return "blob";
  if (base.includes("bitbucket.org")) return "src";
  return null;
}
