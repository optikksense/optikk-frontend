// Ring-buffer size for the traces live tail. Virtualisation in
// ExplorerResultsTable handles render cost, so the cap is chosen to
// survive 5 s of a 50-event/s burst without evicting visible rows.
export const TRACES_LIVE_TAIL_MAX_ROWS = 250;

export const TRACE_STATUS_SORT_ORDER: Record<string, number> = {
  UNSET: 0,
  OK: 1,
  ERROR: 2,
};

export const TRACE_METRIC_FIELDS = [
  { value: "duration_nano", label: "duration (ns)" },
  { value: "duration", label: "duration" },
];
