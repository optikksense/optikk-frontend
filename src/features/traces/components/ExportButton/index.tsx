import { Download } from "lucide-react";
import { memo, useCallback } from "react";

import type { TraceSummary } from "../../types/trace";

interface Props {
  readonly traces: readonly TraceSummary[];
}

/** Exports the currently-loaded page of traces as JSON or CSV (no server trip). */
function ExportButtonComponent({ traces }: Props) {
  const onJson = useCallback(() => downloadBlob(toJson(traces), "traces.json", "application/json"), [traces]);
  const onCsv = useCallback(() => downloadBlob(toCsv(traces), "traces.csv", "text/csv"), [traces]);
  const disabled = traces.length === 0;
  return (
    <div className="flex items-center gap-1 text-[11px]">
      <Download size={12} className="text-[var(--text-muted)]" />
      <button
        type="button"
        onClick={onJson}
        disabled={disabled}
        className="rounded px-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-40"
      >
        JSON
      </button>
      <span className="text-[var(--text-muted)]">·</span>
      <button
        type="button"
        onClick={onCsv}
        disabled={disabled}
        className="rounded px-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-40"
      >
        CSV
      </button>
    </div>
  );
}

function toJson(rows: readonly TraceSummary[]): string {
  return JSON.stringify(rows, null, 2);
}

function toCsv(rows: readonly TraceSummary[]): string {
  const cols: Array<keyof TraceSummary> = [
    "trace_id", "start_ms", "duration_ns", "root_service",
    "root_operation", "root_status", "span_count", "has_error", "error_count",
  ];
  const header = cols.join(",");
  const body = rows.map((r) => cols.map((c) => csvCell(r[c])).join(",")).join("\n");
  return `${header}\n${body}`;
}

function csvCell(v: unknown): string {
  if (v == null) return "";
  const s = String(v);
  return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const ExportButton = memo(ExportButtonComponent);
