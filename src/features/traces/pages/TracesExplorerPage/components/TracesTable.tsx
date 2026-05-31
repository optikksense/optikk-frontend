import { formatTimestamp } from "@shared/utils/formatters";
import { ChevronRight } from "lucide-react";
import type { TraceSummary } from "../../../types/trace";
import { getServiceColor } from "../../../utils/serviceColor";

interface Props {
  traces: readonly TraceSummary[];
  onRowClick: (trace: TraceSummary) => void;
  onNextPage: () => void;
  onPrevPage: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function TracesTable({
  traces,
  onRowClick,
  onNextPage,
  onPrevPage,
  hasNextPage,
  hasPrevPage,
}: Props) {
  const maxDur = Math.max(...traces.map((t) => t.duration_ns / 1e6), 1);

  return (
    <div
      className="overflow-hidden bg-card"
      style={{ border: "1px solid var(--line)", borderRadius: 8 }}
    >
      {/* Results toolbar header (icons are presentational, matching the design) */}
      <div
        className="flex flex-row items-center justify-between"
        style={{ padding: "12px 16px", borderBottom: "1px solid var(--line-2)" }}
      >
        <div className="font-semibold text-[12px] text-foreground-muted uppercase tracking-[0.06em]">
          Results
        </div>
      </div>

      <table className="w-full border-collapse text-left">
        <thead className="font-semibold text-[11.5px] text-foreground-muted uppercase tracking-[0.06em]">
          <tr style={{ borderBottom: "1px solid var(--line-2)" }}>
            <th className="py-2.5 pl-[18px]">
              <div className="resize-x overflow-hidden whitespace-nowrap" style={{ width: 110 }}>Time</div>
            </th>
            <th className="py-2.5">
              <div className="resize-x overflow-hidden whitespace-nowrap" style={{ minWidth: 150 }}>Operation</div>
            </th>
            <th className="py-2.5 text-right">
              <div className="resize-x overflow-hidden whitespace-nowrap ml-auto" style={{ width: 90 }}>Duration</div>
            </th>
            <th className="px-3 py-2.5">
              <div className="resize-x overflow-hidden whitespace-nowrap" style={{ minWidth: 150, width: "100%" }}>Latency bar</div>
            </th>
            <th className="py-2.5">
              <div className="resize-x overflow-hidden whitespace-nowrap" style={{ width: 80 }}>Status</div>
            </th>
            <th className="py-2.5 text-right">
              <div className="resize-x overflow-hidden whitespace-nowrap ml-auto" style={{ width: 56 }}>Spans</div>
            </th>
            <th className="w-[18px] py-2.5" />
          </tr>
        </thead>
        <tbody className="text-[13px]">
          {traces.map((t) => {
            const durMs = t.duration_ns / 1e6;
            const pct = Math.min((durMs / maxDur) * 100, 100);
            const color = getServiceColor(t.root_service);
            const isErr = t.has_error || t.root_status?.toUpperCase() === "ERROR";

            return (
              <tr
                key={t.trace_id}
                onClick={() => onRowClick(t)}
                className="cursor-pointer hover:bg-card-hover"
                style={{ borderBottom: "1px solid var(--line-2)" }}
              >
                <td className="py-2 pl-[18px]">
                  <div className="font-mono text-[12.5px] text-foreground-secondary whitespace-nowrap truncate max-w-full">
                    {formatTimestamp(t.start_ms)}
                  </div>
                  <div className="font-mono text-[12px] text-foreground-muted">
                    {t.trace_id.slice(0, 10)}…
                  </div>
                </td>
                <td className="py-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="size-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <div className="min-w-0">
                      <div className="truncate font-medium font-mono text-[13px] text-foreground">
                        {t.root_operation || "—"}
                      </div>
                      <div className="truncate font-mono text-[12px] text-foreground-muted">
                        {t.root_service}
                        {t.environment ? ` · ${t.environment}` : ""}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-2 text-right">
                  <span
                    className="font-mono font-semibold tabular-nums"
                    style={{
                      color:
                        durMs > 1000
                          ? "var(--color-error)"
                          : durMs > 500
                            ? "var(--color-warning)"
                            : "var(--text-secondary)",
                    }}
                  >
                    {durMs >= 1000 ? `${(durMs / 1000).toFixed(2)} s` : `${Math.round(durMs)} ms`}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div
                    className="h-2 overflow-hidden rounded-[3px]"
                    style={{ background: "var(--bg-inset)" }}
                  >
                    <div
                      className="h-full opacity-85"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </td>
                <td className="py-2">
                  <span
                    className="inline-flex items-center rounded-full px-2 py-0.5 font-semibold text-[12px]"
                    style={{
                      color: isErr ? "var(--color-error)" : "var(--color-success)",
                      backgroundColor: isErr
                        ? "var(--color-error-subtle)"
                        : "var(--color-success-subtle)",
                    }}
                  >
                    <span
                      className="mr-1.5 size-1.5 rounded-full"
                      style={{ backgroundColor: "currentColor" }}
                    />
                    {t.root_http_status || (isErr ? "ERR" : "OK")}
                  </span>
                </td>
                <td className="py-2 text-right">
                  <span className="font-mono text-[13px]">{t.span_count}</span>
                  {t.error_count > 0 && (
                    <span className="ml-1 inline-block rounded-sm bg-error/10 px-1 py-px font-medium text-[11px] text-error">
                      {t.error_count}
                    </span>
                  )}
                </td>
                <td className="py-2 pr-2 text-right text-foreground-muted">
                  <ChevronRight size={14} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Footer pager (explicit cursor pagination) */}
      <div
        className="flex flex-row items-center justify-between"
        style={{ padding: "12px 16px", borderTop: "1px solid var(--line-2)" }}
      >
        <span className="text-[12.5px] text-foreground-muted">
          Page 1 of 1+ · {traces.length} rows
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!hasPrevPage}
            onClick={onPrevPage}
            className="rounded-md border border-border px-3 py-1.5 font-medium text-sm hover:bg-card-hover disabled:opacity-50 disabled:hover:bg-transparent"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={!hasNextPage}
            onClick={onNextPage}
            className="rounded-md border border-border px-3 py-1.5 font-medium text-sm hover:bg-card-hover disabled:opacity-50 disabled:hover:bg-transparent"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
