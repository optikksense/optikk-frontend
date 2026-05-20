import { memo, useMemo } from "react";

import { useTimezone } from "@/app/store/appStore";

import type { SpanEvent } from "../../../../types";

interface Props {
  readonly events: readonly SpanEvent[];
  readonly selectedSpanId: string;
}

function safeParseAttrs(s: string): readonly [string, string][] {
  try {
    const obj = JSON.parse(s);
    if (obj && typeof obj === "object") {
      return Object.entries(obj as Record<string, unknown>).map(([k, v]) => [k, String(v)]);
    }
  } catch {
    /* fall through */
  }
  return [];
}

function formatTs(ts: string, tz: string): string {
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

function levelOf(eventName: string): "info" | "warn" | "error" {
  const n = eventName.toLowerCase();
  if (n.includes("exception") || n.includes("error")) return "error";
  if (n.includes("warn") || n.includes("retry")) return "warn";
  return "info";
}

function EventsTabComponent({ events, selectedSpanId }: Props) {
  const tz = useTimezone();
  const sorted = useMemo(
    () =>
      [...events]
        .filter((e) => e.spanId === selectedSpanId)
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
    [events, selectedSpanId]
  );

  if (sorted.length === 0) {
    return (
      <div className="tdp-sd-pane">
        <div className="tdp-muted">No events recorded on this span.</div>
      </div>
    );
  }

  return (
    <div className="tdp-sd-pane">
      <div className="tdp-evt-list">
        {sorted.map((event, i) => {
          const level = levelOf(event.eventName);
          const attrs = safeParseAttrs(event.attributes);
          const isLast = i === sorted.length - 1;
          return (
            <div
              key={`${event.spanId}-${event.timestamp}-${i}`}
              className={`tdp-evt tdp-evt-${level}`}
            >
              <div className="tdp-evt-rail">
                <div className="tdp-evt-dot" />
                {!isLast && <div className="tdp-evt-line" />}
              </div>
              <div className="tdp-evt-body">
                <div className="tdp-evt-row">
                  <span className={`tdp-evt-lvl tdp-evt-lvl-${level}`}>{level}</span>
                  <span className="tdp-evt-t">{formatTs(event.timestamp, tz)}</span>
                  <span className="tdp-evt-msg">{event.eventName}</span>
                </div>
                {attrs.length > 0 && (
                  <div className="tdp-evt-attrs">
                    {attrs.map(([k, v]) => (
                      <span key={k} className="tdp-evt-chip">
                        <b>{k}</b>={v}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const EventsTab = memo(EventsTabComponent);
