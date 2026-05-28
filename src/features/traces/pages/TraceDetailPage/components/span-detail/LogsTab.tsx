import { ExternalLink } from "lucide-react";
import { memo, useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import { useTimezone } from "@/app/store/appStore";

interface LogEntry {
  readonly id?: string;
  readonly timestamp: string;
  readonly severity_text?: string;
  readonly body?: string;
  readonly message?: string;
  readonly span_id?: string;
  readonly level?: string;
}

interface Props {
  readonly logs: readonly LogEntry[];
  readonly selectedSpanId: string;
  readonly onOpenInLogs?: () => void;
}

type LevelFilter = "all" | "info" | "warn" | "error";

const pane = "p-4 flex flex-col gap-4";
const btnSmGhost =
  "px-2.5 py-[5px] text-[11.5px] rounded-[5px] bg-transparent text-[var(--text-muted)] border border-transparent cursor-pointer hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]";
const muted = "text-[var(--text-caption)] text-[12px] py-2";

function normalizeLevel(sev: string): LevelFilter {
  const s = sev.toUpperCase();
  if (s.includes("ERR") || s.includes("FATAL") || s.includes("CRIT")) return "error";
  if (s.includes("WARN")) return "warn";
  return "info";
}

function formatLogTs(ts: string, tz: string): string {
  try {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return ts;
    const opts: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      fractionalSecondDigits: 3,
    };
    if (tz !== "local") opts.timeZone = tz;
    return new Intl.DateTimeFormat("sv-SE", opts).format(d);
  } catch {
    return ts;
  }
}

function LogsTabComponent({ logs, selectedSpanId, onOpenInLogs }: Props) {
  const tz = useTimezone();
  const [filter, setFilter] = useState<LevelFilter>("all");

  const scoped = useMemo(
    () => logs.filter((log) => log.span_id === selectedSpanId),
    [logs, selectedSpanId]
  );

  const filtered = useMemo(() => {
    if (filter === "all") return scoped;
    return scoped.filter((l) => normalizeLevel(l.severity_text || l.level || "INFO") === filter);
  }, [scoped, filter]);

  if (scoped.length === 0) {
    return (
      <div className={pane}>
        <div className={muted}>No logs for this span.</div>
      </div>
    );
  }

  return (
    <div className={pane}>
      <div className="flex gap-1.5 items-center mb-2 flex-wrap">
        {(["all", "info", "warn", "error"] as const).map((k) => (
          <button
            key={k}
            type="button"
            className={cn(
              "px-2 py-[3px] rounded-full bg-[var(--bg-tertiary)] text-[var(--text-muted)] text-[11px] border border-[var(--border-color)] cursor-pointer",
              filter === k &&
                "bg-[var(--color-primary-subtle-15)] text-[var(--text-primary)] border-[var(--color-primary)]",
              k === "error" && "text-[var(--color-error)]"
            )}
            onClick={() => setFilter(k)}
          >
            {k}
          </button>
        ))}
        {onOpenInLogs && (
          <div className="ml-auto">
            <button type="button" className={btnSmGhost} onClick={onOpenInLogs}>
              <ExternalLink size={11} /> Open in Logs
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-px bg-[var(--border-color)] rounded-md overflow-hidden">
        {filtered.map((log, i) => {
          const level = normalizeLevel(log.severity_text || log.level || "INFO");
          const body = log.body || log.message || "";
          const lvlColor =
            level === "error"
              ? "text-[var(--color-error)]"
              : level === "warn"
                ? "text-[var(--color-warning)]"
                : "text-[var(--color-primary)]";
          return (
            <div
              key={log.id || `${log.timestamp}-${i}`}
              className={cn(
                "grid grid-cols-[80px_50px_90px_1fr] gap-2 px-2.5 py-[5px] bg-[var(--bg-primary)] font-mono text-[11.5px] items-baseline hover:bg-[var(--bg-secondary)]",
                level === "error" && "!bg-[var(--color-error-subtle)]"
              )}
            >
              <span className="text-[var(--text-caption)]">{formatLogTs(log.timestamp, tz)}</span>
              <span className={cn("text-[10px] uppercase", lvlColor)}>{level}</span>
              <span className="text-[var(--text-muted)]">
                {(log.severity_text || log.level || "INFO").slice(0, 9)}
              </span>
              <span className="text-[var(--text-primary)] break-words whitespace-pre-wrap">
                {body.length > 600 ? `${body.slice(0, 600)}…` : body}
              </span>
            </div>
          );
        })}
        {filtered.length === 0 && <div className={muted}>No logs match this filter.</div>}
      </div>
    </div>
  );
}

export const LogsTab = memo(LogsTabComponent);
