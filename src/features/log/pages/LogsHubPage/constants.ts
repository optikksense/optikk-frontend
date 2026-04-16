export const LOG_METRIC_FIELDS = [
  { value: "duration", label: "duration (logs)" },
  { value: "body", label: "body" },
];

export const LOG_LEVEL_SORT_ORDER: Record<string, number> = {
  TRACE: 0,
  DEBUG: 1,
  INFO: 2,
  WARN: 3,
  WARNING: 3,
  ERROR: 4,
  FATAL: 5,
};
