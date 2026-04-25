/**
 * Builds a best-effort `curl` command from HTTP span attributes. Missing fields
 * are skipped gracefully; callers get back `null` when there's nothing useful.
 */
export function buildCurl(attrs: Readonly<Record<string, string>>): string | null {
  const method = (attrs["http.method"] ?? attrs["http.request.method"] ?? "").toUpperCase();
  const url = attrs["http.url"] ?? attrs["url.full"] ?? "";
  if (!url) return null;
  const parts = ["curl"];
  if (method && method !== "GET") parts.push("-X", method);
  parts.push(`'${url.replace(/'/g, "'\\''")}'`);
  appendHeaders(parts, attrs);
  return parts.join(" ");
}

function appendHeaders(parts: string[], attrs: Readonly<Record<string, string>>) {
  for (const [key, value] of Object.entries(attrs)) {
    if (!key.startsWith("http.request.header.")) continue;
    const name = key.slice("http.request.header.".length);
    parts.push("-H", `'${name}: ${value.replace(/'/g, "'\\''")}'`);
  }
}
