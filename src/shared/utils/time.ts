import { parseTimestampMs } from "@shared/utils/logUtils";
import { format } from "date-fns";

const EMPTY_LABEL = "—";

/**
 * Formats a timestamp into "YYYY-MM-DD HH:mm:ss".
 * @param value Timestamp-like value.
 */
export function tsLabel(value: unknown): string {
  const ms = parseTimestampMs(value);
  if (!ms) return EMPTY_LABEL;
  return format(new Date(ms), "yyyy-MM-dd HH:mm:ss");
}
