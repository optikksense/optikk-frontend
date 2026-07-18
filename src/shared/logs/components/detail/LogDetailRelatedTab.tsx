import { DrawerSection } from "@shared/components/ui/overlay/detail-drawer";
import { useStandardQuery } from "@shared/hooks/useStandardQuery";
import { useTimeRange } from "@shared/hooks/useTimeRangeQuery";
import { cn } from "@shared/lib/utils";
import { formatRelativeTime } from "@shared/utils/formatters";
import { memo } from "react";
import { toast } from "sonner";

import { getTraceLogs } from "../../api/traceLogsApi";
import type { LogRecord } from "../../types/log";
import { severityStyle } from "../../utils/severity";

interface RelatedLogRowProps {
  readonly l: LogRecord;
  readonly isSelf: boolean;
}

const MemoizedRelatedLogRow = memo(function RelatedLogRow({ l, isSelf }: RelatedLogRowProps) {
  const lsev = severityStyle(l.severity_bucket);
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-md border p-[7px_9px]",
        isSelf
          ? "border-[var(--accent-ln)] bg-[var(--accent-bg)]"
          : "border-[var(--line-2)] bg-[var(--bg-card)]"
      )}
    >
      <span className="mt-0.5 h-3 w-0.5 shrink-0 rounded-full" style={{ background: lsev.color }} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono font-semibold text-[11px]" style={{ color: lsev.color }}>
            {lsev.shortLabel}
          </span>
          <span className="font-mono text-[11px] text-[var(--fg-3)]">
            {formatRelativeTime(String(l.timestamp))}
          </span>
          {isSelf && (
            <span className="rounded bg-[var(--bg-inset)] px-1.5 text-[10px] text-[var(--fg-2)]">
              this event
            </span>
          )}
        </div>
        <div className="truncate font-mono text-[12.5px] text-[var(--fg-0)]">{l.body || "—"}</div>
      </div>
    </div>
  );
});

interface Props {
  readonly traceId: string | null;
  readonly log: LogRecord;
  readonly open: boolean;
  readonly isActive: boolean;
}

function LogDetailRelatedTabComponent({ traceId, log, open, isActive }: Props) {
  const { getTimeRange } = useTimeRange();
  const { startTime, endTime } = getTimeRange();
  const startTimeMs = Number(startTime);
  const endTimeMs = Number(endTime);
  const relatedQuery = useStandardQuery({
    queryKey: ["logs", "trace", traceId, startTimeMs, endTimeMs],
    queryFn: () => getTraceLogs(traceId as string, startTimeMs, endTimeMs),
    enabled: open && isActive && Boolean(traceId),
    staleTime: 30_000,
  });

  if (!traceId) {
    return (
      <div className="rounded-lg border border-[var(--line)] p-3 text-[12px] text-[var(--fg-3)]">
        This log has no trace correlation, so there are no related logs to show.
      </div>
    );
  }

  return (
    <DrawerSection
      title="Logs in this trace"
      action={
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard?.writeText(`trace_id:${traceId}`);
            toast.success("Trace filter copied — paste into search", {
              duration: 2000,
            });
          }}
          className="cursor-pointer border-0 bg-transparent font-mono text-[12px] text-[var(--accent-2)]"
        >
          copy filter
        </button>
      }
    >
      {relatedQuery.isPending ? (
        <div className="py-2 text-[12px] text-[var(--fg-3)]">Loading trace logs…</div>
      ) : (relatedQuery.data?.logs.length ?? 0) === 0 ? (
        <div className="py-2 text-[12px] text-[var(--fg-3)]">
          No other logs found in this trace.
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {relatedQuery.data?.logs.map((l, i) => (
            <MemoizedRelatedLogRow
              key={l.id || `${l.timestamp}-${i}`}
              l={l as LogRecord}
              isSelf={l.id === log.id}
            />
          ))}
        </div>
      )}
    </DrawerSection>
  );
}

export const LogDetailRelatedTab = memo(LogDetailRelatedTabComponent);
