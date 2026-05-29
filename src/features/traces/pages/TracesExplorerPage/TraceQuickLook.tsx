import { useNavigate } from "@tanstack/react-router";
import { Copy, ExternalLink, X } from "lucide-react";
import { memo, useMemo } from "react";

import { useAppStore } from "@/app/store/appStore";
import { cn } from "@/lib/utils";
import { tracesService } from "@shared/api/tracesService";
import { Button } from "@shared/components/primitives/ui";
import { useImmutableQuery as useStandardQuery } from "@shared/hooks/useImmutableQuery";
import { formatDuration, formatRelativeTime } from "@shared/utils/formatters";

import { getServiceColor } from "../../utils/serviceColor";
import type { TraceSummary } from "../../types/trace";

interface Props {
  readonly trace: TraceSummary;
  readonly onClose: () => void;
}

const ASIDE =
  "flex min-w-0 flex-col gap-3 overflow-y-auto rounded-[8px] border border-[var(--border-color)] bg-[var(--bg-secondary)] p-[14px]";
const sectT =
  "border-t border-[var(--border-color)] pt-1.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--text-caption)]";
const kvK = "text-[11px] text-[var(--text-caption)]";
const kvV = "text-[12px] text-[var(--text-primary)] font-mono break-words";
const iconBtn =
  "inline-grid h-7 w-7 place-items-center rounded-[5px] border-0 bg-transparent text-[var(--text-muted)] cursor-pointer hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]";

interface SlowOp {
  readonly operation: string;
  readonly service: string;
  readonly durationMs: number;
}

/**
 * Right-rail preview for the focused trace row. Status, operation, duration and
 * span/error counts come straight from the `/traces/query` row; the slowest
 * operations are an optional lazy enrichment from `getTraceSpans`. Mirrors the
 * logs `LogDetailPanel` inline-aside pattern.
 */
function TraceQuickLookComponent({ trace, onClose }: Props) {
  const navigate = useNavigate();
  const selectedTeamId = useAppStore((s) => s.selectedTeamId);
  const durationMs = trace.duration_ns / 1e6;

  const { data: spans } = useStandardQuery({
    queryKey: ["trace-spans", selectedTeamId, trace.trace_id],
    queryFn: () => tracesService.getTraceSpans(selectedTeamId, trace.trace_id),
    enabled: !!selectedTeamId && !!trace.trace_id,
  });

  const topOps = useMemo<readonly SlowOp[]>(() => {
    if (!spans) return [];
    return [...spans]
      .map((s) => ({
        operation: s.operation_name,
        service: s.service_name,
        durationMs: s.duration_ms ?? 0,
      }))
      .filter((s) => s.durationMs > 0)
      .sort((a, b) => b.durationMs - a.durationMs)
      .slice(0, 5);
  }, [spans]);

  const services = trace.service_set ?? [];

  return (
    <aside className={ASIDE}>
      <div className="flex items-center gap-2">
        <StatusPill status={trace.root_status} hasError={trace.has_error} />
        <span className="flex-1" />
        <button
          type="button"
          className={iconBtn}
          title="Copy trace id"
          onClick={() => void navigator.clipboard.writeText(trace.trace_id)}
        >
          <Copy size={14} />
        </button>
        <button type="button" className={iconBtn} title="Close" onClick={onClose}>
          <X size={14} />
        </button>
      </div>

      <div className="flex items-center gap-1.5 min-w-0">
        <span
          className="inline-block size-2 shrink-0 rounded-full"
          style={{ backgroundColor: getServiceColor(trace.root_service) }}
          aria-hidden
        />
        <span className="text-[13px] font-medium text-[var(--text-primary)] truncate">
          {trace.root_service}
        </span>
      </div>
      <div className="break-words text-[13px] leading-[1.45] text-[var(--text-primary)] font-mono">
        {trace.root_operation || "—"}
      </div>
      <div className="flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-[var(--text-caption)] font-mono">
        <span>{formatRelativeTime(trace.start_ms)}</span>
        {trace.environment ? (
          <>
            <span>·</span>
            <span>{trace.environment}</span>
          </>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <div>
          <div className={kvK}>Duration</div>
          <div className={kvV}>{formatDuration(durationMs)}</div>
        </div>
        <div>
          <div className={kvK}>Spans</div>
          <div className={kvV}>{trace.span_count}</div>
        </div>
        <div>
          <div className={kvK}>Errors</div>
          <div className={cn(kvV, trace.error_count > 0 && "!text-[var(--color-error)]")}>
            {trace.error_count}
          </div>
        </div>
        {trace.root_http_method || trace.root_http_status ? (
          <div>
            <div className={kvK}>HTTP</div>
            <div className={kvV}>
              {[trace.root_http_method, trace.root_http_status].filter(Boolean).join(" ")}
            </div>
          </div>
        ) : null}
        {trace.root_endpoint ? (
          <div className="col-span-2">
            <div className={kvK}>Endpoint</div>
            <div className={kvV}>{trace.root_endpoint}</div>
          </div>
        ) : null}
      </div>

      {services.length > 0 && (
        <>
          <div className={sectT}>Services ({services.length})</div>
          <div className="flex flex-wrap gap-1.5">
            {services.map((svc) => (
              <span
                key={svc}
                className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] px-2 py-0.5 text-[11px] text-[var(--text-secondary)]"
              >
                <span
                  className="size-2 rounded-sm flex-shrink-0"
                  style={{ background: getServiceColor(svc) }}
                />
                {svc}
              </span>
            ))}
          </div>
        </>
      )}

      {topOps.length > 0 && (
        <>
          <div className={sectT}>Slowest spans</div>
          <div className="flex flex-col gap-px overflow-hidden rounded-md border border-[var(--border-color)]">
            {topOps.map((op, i) => (
              <div
                key={`${op.operation}-${i}`}
                className="grid grid-cols-[1fr_auto] items-center gap-2 bg-[var(--bg-primary)] px-2.5 py-1.5 text-[11.5px] font-mono [&:not(:last-child)]:border-b [&:not(:last-child)]:border-[var(--border-color)]"
              >
                <span className="truncate text-[var(--text-primary)]" title={op.operation}>
                  {op.operation}
                </span>
                <span className="text-[var(--text-caption)]">{formatDuration(op.durationMs)}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <Button
        type="button"
        variant="primary"
        onClick={() =>
          navigate({ to: `/traces/${encodeURIComponent(trace.trace_id)}` })
        }
      >
        <ExternalLink size={13} /> Open trace
      </Button>
    </aside>
  );
}

function StatusPill({ status, hasError }: { status: string; hasError: boolean }) {
  const isErr = hasError || status?.toUpperCase() === "ERROR";
  const unset = !status || status.toUpperCase() === "UNSET";
  const color = isErr ? "var(--color-error)" : unset ? "var(--text-muted)" : "var(--color-success)";
  const label = isErr ? "Error" : unset ? "Unset" : "OK";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ color, background: `color-mix(in oklch, ${color}, transparent 86%)` }}
    >
      <span className="size-1.5 rounded-full" style={{ background: color }} aria-hidden />
      {label}
    </span>
  );
}

export const TraceQuickLook = memo(TraceQuickLookComponent);
