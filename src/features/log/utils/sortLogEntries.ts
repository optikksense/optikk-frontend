import type { LogEntry } from '@entities/log/model';
import { parseTimestampMs } from '@shared/utils/logUtils';

/** Convert log timestamp to milliseconds for comparison (backend may send ns int or ISO string). */
export function logEntryTimeMs(entry: LogEntry): number {
  return parseTimestampMs(entry.timestamp);
}

/** Newest first; stable tie-break on id so order does not flicker when timestamps collide. */
export function sortLogEntriesNewestFirst(entries: LogEntry[]): LogEntry[] {
  return [...entries].sort((a, b) => {
    const tb = logEntryTimeMs(b);
    const ta = logEntryTimeMs(a);
    if (tb !== ta) return tb - ta;
    return String(b.id).localeCompare(String(a.id));
  });
}
