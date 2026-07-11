import { memo, useMemo } from "react";

import { useTimezone } from "@/app/store/appStore";
import { cn } from "@shared/lib/utils";
import { formatTime } from "@shared/utils/formatters";

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

function levelOf(eventName: string): "info" | "warn" | "error" {
  const n = eventName.toLowerCase();
  if (n.includes("exception") || n.includes("error")) return "error";
  if (n.includes("warn") || n.includes("retry")) return "warn";
  return "info";
}

const LEVEL_DOT = {
  info: "var(--accent)",
  warn: "var(--warn)",
  error: "var(--err)",
} as const;

function SpanEventsSectionComponent({ events, selectedSpanId }: Props) {
  const tz = useTimezone();
  const sorted = useMemo(
    () =>
      [...events]
        .filter((e) => e.spanId === selectedSpanId)
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
        .map((e) => ({
          ...e,
          level: levelOf(e.eventName),
          parsedAttrs: safeParseAttrs(e.attributes),
        })),
    [events, selectedSpanId]
  );

  if (sorted.length === 0) return null;

  return (
    <div className="flex flex-col">
      {sorted.map((event, i) => {
        const isLast = i === sorted.length - 1;
        return (
          <div
            key={`${event.spanId}-${event.timestamp}-${i}`}
            className="grid grid-cols-[18px_1fr] gap-2 pb-2.5"
          >
            <div className="relative">
              <div
                className="absolute top-1 left-1 h-2.5 w-2.5 rounded-full"
                style={{ background: LEVEL_DOT[event.level] }}
              />
              {!isLast && (
                <div className="-bottom-2.5 absolute top-4 left-2 w-0.5 bg-[var(--line)]" />
              )}
            </div>
            <div className="text-[12px]">
              <div className="flex flex-wrap items-baseline gap-2">
                <span
                  className="rounded-[3px] px-1.5 py-px font-mono text-[10px] uppercase tracking-[0.04em]"
                  style={{ color: LEVEL_DOT[event.level], background: "var(--bg-inset)" }}
                >
                  {event.level}
                </span>
                <span className="font-mono text-[11px] text-[var(--fg-3)]">
                  {formatTime(event.timestamp, tz)}
                </span>
                <span className="text-[var(--fg-0)]">{event.eventName}</span>
              </div>
              {event.parsedAttrs.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {event.parsedAttrs.map(([k, v]) => (
                    <span
                      key={k}
                      className={cn(
                        "rounded-[4px] bg-[var(--bg-inset)] px-1.5 py-px font-mono text-[10.5px] text-[var(--fg-2)]"
                      )}
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
  );
}

export const SpanEventsSection = memo(SpanEventsSectionComponent);
