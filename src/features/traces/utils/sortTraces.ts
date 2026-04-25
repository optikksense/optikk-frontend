import type { TraceSortMode } from "../components/TraceSortToggle";
import type { TraceSummary } from "../types/trace";

/**
 * Client-side sort of the currently-loaded page of traces. The backend
 * keyset pagination is time-ordered so this only reorders what's already
 * on screen — sufficient for quick triage, not a substitute for server sort.
 */
export function sortTraces(
  rows: readonly TraceSummary[],
  mode: TraceSortMode,
): readonly TraceSummary[] {
  if (mode === "recent" || rows.length === 0) return rows;
  const copy = rows.slice();
  if (mode === "slowest") {
    copy.sort((a, b) => b.duration_ns - a.duration_ns);
    return copy;
  }
  copy.sort(byErrorsThenRecent);
  return copy;
}

function byErrorsThenRecent(a: TraceSummary, b: TraceSummary): number {
  if (a.has_error !== b.has_error) return a.has_error ? -1 : 1;
  return b.start_ms - a.start_ms;
}
