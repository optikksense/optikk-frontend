import { ExternalLink } from "lucide-react";
import { memo, useMemo, useState } from "react";

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
      <div className="tdp-sd-pane">
        <div className="tdp-muted">No logs for this span.</div>
      </div>
    );
  }

  return (
    <div className="tdp-sd-pane">
      <div className="tdp-log-toolbar">
        {(["all", "info", "warn", "error"] as const).map((k) => (
          <button
            key={k}
            type="button"
            className={`tdp-chip ${filter === k ? "is-on" : ""} ${k === "error" ? "tdp-chip-err" : ""}`}
            onClick={() => setFilter(k)}
          >
            {k}
          </button>
        ))}
        {onOpenInLogs && (
          <div className="tdp-log-toolbar-r">
            <button type="button" className="tdp-btn-sm tdp-btn-sm-ghost" onClick={onOpenInLogs}>
              <ExternalLink size={11} /> Open in Logs
            </button>
          </div>
        )}
      </div>

      <div className="tdp-log-list">
        {filtered.map((log, i) => {
          const level = normalizeLevel(log.severity_text || log.level || "INFO");
          const body = log.body || log.message || "";
          return (
            <div
              key={log.id || `${log.timestamp}-${i}`}
              className={`tdp-log ${level === "error" ? "tdp-log-error" : ""}`}
            >
              <span className="tdp-log-t">{formatLogTs(log.timestamp, tz)}</span>
              <span className={`tdp-log-lvl tdp-log-lvl-${level}`}>{level}</span>
              <span className="tdp-log-svc">
                {(log.severity_text || log.level || "INFO").slice(0, 9)}
              </span>
              <span className="tdp-log-msg">
                {body.length > 600 ? `${body.slice(0, 600)}…` : body}
              </span>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="tdp-muted">No logs match this filter.</div>}
      </div>
    </div>
  );
}

export const LogsTab = memo(LogsTabComponent);
