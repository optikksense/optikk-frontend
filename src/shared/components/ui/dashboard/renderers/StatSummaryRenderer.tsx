import {
  asDashboardRecord,
  asDashboardRecordArray,
} from "../utils/runtimeValue";
import { firstValue, formatStatValue, splitValueUnit } from "../utils/dashboardFormatters";

interface StatSummaryField {
  label: string;
  field?: string;
  keys?: string[];
}

export function renderStatSummary(
  rawData: unknown,
  options?: {
    formatter?: string;
    fields?: StatSummaryField[];
  }
) {
  const summary = Array.isArray(rawData)
    ? asDashboardRecordArray(rawData)[0]
    : asDashboardRecord(rawData);
  if (!summary) {
    return (
      <div className="text-muted" style={{ textAlign: "center", padding: 32 }}>
        No data
      </div>
    );
  }

  const defaultFields: StatSummaryField[] = [
    { label: "P50", keys: ["p50", "p50_ms", "p50Latency", "p50_latency"] },
    { label: "P95", keys: ["p95", "p95_ms", "p95Latency", "p95_latency"] },
    { label: "P99", keys: ["p99", "p99_ms", "p99Latency", "p99_latency"] },
    { label: "Avg", keys: ["avg", "avg_ms", "avgLatency", "avg_latency"] },
  ];
  const fields = options?.fields && options.fields.length > 0 ? options.fields : defaultFields;

  const cells = fields
    .map((field) => ({
      label: field.label,
      value: field.field
        ? firstValue(summary, [field.field], null)
        : firstValue(summary, field.keys ?? [], null),
    }))
    .filter((cell) => cell.value !== null && cell.value !== undefined);

  if (cells.length === 0) {
    return (
      <div className="text-muted" style={{ textAlign: "center", padding: 32 }}>
        No data
      </div>
    );
  }

  const formatter = options?.formatter ?? (fields === defaultFields ? "ms" : undefined);

  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
      {cells.map((cell) => {
        const fullVal = formatStatValue(formatter, cell.value);
        const { val, unit } = splitValueUnit(String(fullVal));
        return (
          <div key={cell.label} style={{ padding: "8px 0" }}>
            <div
              style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--text-muted)",
                whiteSpace: "nowrap",
                marginBottom: 4,
              }}
            >
              {cell.label}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 2, whiteSpace: "nowrap" }}>
              <span style={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>{val}</span>
              {unit && (
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>
                  {unit}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
