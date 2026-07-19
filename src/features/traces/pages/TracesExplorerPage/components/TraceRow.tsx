import type { TraceSummary } from "@shared/api/traces/types";
import { formatTimestamp } from "@shared/utils/formatters";
import { ChevronRight } from "lucide-react";
import { memo } from "react";
import { getServiceColor } from "../../../utils/serviceColor";

export const TraceRow = memo(function TraceRow({
  t,
  maxDur,
  onRowClick,
}: {
  t: TraceSummary;
  maxDur: number;
  onRowClick: (t: TraceSummary) => void;
}) {
  const durMs = t.durationNs / 1e6;
  const pct = Math.min((durMs / maxDur) * 100, 100);
  const color = getServiceColor(t.rootService);
  const isErr = t.hasError || t.rootStatus?.toUpperCase() === "ERROR";

  return (
    <tr
      onClick={() => onRowClick(t)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onRowClick(t);
        }
      }}
      tabIndex={0}
      className="cursor-pointer hover:bg-card-hover"
      style={{ borderBottom: "1px solid var(--line-2)" }}
    >
      <td className="py-2 pl-[18px]">
        <div className="max-w-full truncate whitespace-nowrap font-mono text-[12.5px] text-foreground-secondary">
          {formatTimestamp(t.startMs)}
        </div>
        <div className="font-mono text-[12px] text-foreground-muted">{t.traceId.slice(0, 10)}…</div>
      </td>
      <td className="py-2">
        <div className="flex items-center gap-2">
          <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
          <div className="min-w-0">
            <div className="truncate font-medium font-mono text-[13px] text-foreground">
              {t.rootOperation || "—"}
            </div>
            <div className="truncate font-mono text-[12px] text-foreground-muted">
              {t.rootService}
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
          <div className="h-full opacity-85" style={{ width: `${pct}%`, backgroundColor: color }} />
        </div>
      </td>
      <td className="py-2">
        <span
          className="inline-flex items-center rounded-full px-2 py-0.5 font-semibold text-[12px]"
          style={{
            color: isErr ? "var(--color-error)" : "var(--color-success)",
            backgroundColor: isErr ? "var(--color-error-subtle)" : "var(--color-success-subtle)",
          }}
        >
          <span
            className="mr-1.5 size-1.5 rounded-full"
            style={{ backgroundColor: "currentColor" }}
          />
          {t.rootHttpStatus || (isErr ? "ERR" : "OK")}
        </span>
      </td>
      <td className="py-2 text-right">
        <span className="font-mono text-[13px]">{t.spanCount}</span>
        {t.errorCount > 0 && (
          <span className="ml-1 inline-block rounded-sm bg-error/10 px-1 py-px font-medium text-[11px] text-error">
            {t.errorCount}
          </span>
        )}
      </td>
      <td className="py-2 pr-2 text-right text-foreground-muted">
        <ChevronRight size={14} />
      </td>
    </tr>
  );
});
