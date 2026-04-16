import { parseTimestampMs } from "@shared/utils/logUtils";

export function compareText(left: unknown, right: unknown): number {
  return String(left ?? "").localeCompare(String(right ?? ""), undefined, { sensitivity: "base" });
}

/** Table sorter — must handle OTLP/log ns integers from WebSocket, not only ISO strings. */
export function compareTimestamp(left: unknown, right: unknown): number {
  return parseTimestampMs(left) - parseTimestampMs(right);
}
