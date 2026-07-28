import type { TraceSummary } from "@shared/api/traces/types";

export type TraceSortMode = "recent" | "slowest" | "errors_first";

   
                                                                       
                                                                         
                                                                             
   
export function sortTraces(
  rows: readonly TraceSummary[],
  mode: TraceSortMode
): readonly TraceSummary[] {
  if (mode === "recent" || rows.length === 0) return rows;
  const copy = rows.slice();
  if (mode === "slowest") {
    copy.sort((a, b) => b.durationNs - a.durationNs);
    return copy;
  }
  copy.sort(byErrorsThenRecent);
  return copy;
}

function byErrorsThenRecent(a: TraceSummary, b: TraceSummary): number {
  if (a.hasError !== b.hasError) return a.hasError ? -1 : 1;
  return b.startMs - a.startMs;
}
