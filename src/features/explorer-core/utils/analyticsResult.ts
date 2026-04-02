import type { ExplorerAnalyticsResult } from '../api/explorerAnalyticsApi';

export function cellValue(
  row: ExplorerAnalyticsResult['rows'][0],
  key: string
): string | number | null {
  const cell = row.cells.find((c) => c.key === key);
  if (!cell) return null;
  if (cell.stringValue !== undefined && cell.stringValue !== null) return cell.stringValue;
  if (cell.integerValue !== undefined && cell.integerValue !== null) return cell.integerValue;
  if (cell.numberValue !== undefined && cell.numberValue !== null) return cell.numberValue;
  return null;
}

export function rowToRecord(
  columns: string[],
  row: ExplorerAnalyticsResult['rows'][0]
): Record<string, string | number | null> {
  const out: Record<string, string | number | null> = {};
  for (const col of columns) {
    out[col] = cellValue(row, col);
  }
  return out;
}
