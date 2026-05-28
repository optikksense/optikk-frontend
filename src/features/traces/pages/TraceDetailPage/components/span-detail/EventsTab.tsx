import { memo, useMemo } from "react";

import { cn } from "@/lib/utils";
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
      <div className="p-4 flex flex-col gap-4">
        <div className="text-[var(--text-caption)] text-[12px] py-2">
          No events recorded on this span.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex flex-col">
        {sorted.map((event, i) => {
          const level = levelOf(event.eventName);
          const attrs = safeParseAttrs(event.attributes);
          const isLast = i === sorted.length - 1;
          const dotColor =
            level === "error"
              ? "bg-[var(--color-error)]"
              : level === "warn"
                ? "bg-[var(--color-warning)]"
                : "bg-[var(--color-primary)]";
          const lvlPillColor =
            level === "error"
              ? "bg-[var(--color-error-subtle)] text-[var(--color-error)]"
              : level === "warn"
                ? "bg-[var(--color-warning-subtle)] text-[var(--color-warning)]"
                : "bg-[var(--color-primary-subtle-18)] text-[var(--color-primary)]";
          return (
            <div
              key={`${event.spanId}-${event.timestamp}-${i}`}
              className="grid grid-cols-[18px_1fr] gap-2 pb-2.5"
            >
              <div className="relative">
                <div
                  className={cn(
                    "absolute top-1 left-1 w-2.5 h-2.5 rounded-full",
                    dotColor
                  )}
                />
                {!isLast && (
                  <div className="absolute top-4 left-2 -bottom-2.5 w-0.5 bg-[var(--border-color)]" />
                )}
              </div>
              <div className="text-[12px]">
                <div className="flex gap-2 items-baseline flex-wrap">
                  <span
                    className={cn(
                      "font-mono text-[10px] px-1.5 py-px rounded-[3px] uppercase tracking-[0.04em]",
                      lvlPillColor
                    )}
                  >
                    {level}
                  </span>
                  <span className="text-[var(--text-caption)] font-mono text-[11px]">
                    {formatTs(event.timestamp, tz)}
                  </span>
                  <span className="text-[var(--text-primary)]">{event.eventName}</span>
                </div>
                {attrs.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {attrs.map(([k, v]) => (
                      <span
                        key={k}
                        className="bg-[var(--bg-tertiary)] px-1.5 py-px rounded-[4px] font-mono text-[10.5px] text-[var(--text-secondary)]"
                      >
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
