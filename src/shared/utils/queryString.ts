/** URL → flat record helpers shared by saved-views loaders and any other
 *  consumer that needs to round-trip a `?key=value&…` search string into
 *  the shape TanStack Router's `search` param expects. */

/** Parse a raw search-string (with or without the leading `?`) into a flat
 *  record. Empty / undefined input returns an empty record so callers can
 *  spread without guards. */
export function parseSearchString(search: string | undefined): Record<string, string> {
  if (!search) return {};
  const params = new URLSearchParams(search);
  const out: Record<string, string> = {};
  for (const [k, v] of params.entries()) out[k] = v;
  return out;
}

/** Split a saved-view URL (`/logs?service=foo&…`) into a `{ pathname, search }`
 *  pair compatible with TanStack Router's `navigate`. */
export function splitSavedViewUrl(url: string, fallbackPath: string): {
  readonly pathname: string;
  readonly search: Record<string, string>;
} {
  const [pathname, search] = url.split("?");
  return {
    pathname: pathname || fallbackPath,
    search: parseSearchString(search),
  };
}
