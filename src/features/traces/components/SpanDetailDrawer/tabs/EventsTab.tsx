import { Badge } from "@/components/ui";
import { formatTimestamp } from "@shared/utils/formatters";
import { memo, useCallback, useMemo, useState } from "react";

import type { SpanEvent } from "../../../types";

interface Props {
  events: SpanEvent[];
  selectedSpanId: string | null;
}

function EventsTabComponent({ events, selectedSpanId }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const spanEvents = useMemo(
    () => events.filter((e) => !selectedSpanId || e.spanId === selectedSpanId),
    [events, selectedSpanId]
  );

  const toggle = useCallback((key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  if (spanEvents.length === 0) {
    return <div className="sdd-center sdd-empty">No events recorded for this span</div>;
  }

  return (
    <div className="flex-col gap-xs">
      {spanEvents.map((ev, idx) => {
        const key = `${ev.spanId}-${idx}`;
        const isException = ev.eventName === "exception";
        let parsed: Record<string, string> = {};
        try {
          parsed = JSON.parse(ev.attributes);
        } catch {
          /* empty */
        }
        const isExpanded = expanded.has(key);

        return (
          <div key={key} className={`sdd-event ${isException ? "sdd-event--error" : ""}`}>
            <div
              className="sdd-event__header"
              onClick={() => {
                if (isException) toggle(key);
              }}
            >
              <span className="font-mono text-muted text-xs">{formatTimestamp(ev.timestamp)}</span>
              <Badge variant={isException ? "error" : "default"}>{ev.eventName}</Badge>
              {parsed["exception.type"] && (
                <span className="font-medium text-error text-sm">{parsed["exception.type"]}</span>
              )}
              {isException && <span className="sdd-event__toggle">{isExpanded ? "▲" : "▼"}</span>}
            </div>

            {isException && isExpanded && (
              <div className="mt-xs">
                {parsed["exception.message"] && (
                  <div className="mb-xs text-secondary text-sm">{parsed["exception.message"]}</div>
                )}
                {parsed["exception.stacktrace"] && (
                  <pre className="sdd-stacktrace sdd-stacktrace--error">
                    {parsed["exception.stacktrace"]}
                  </pre>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export const EventsTab = memo(EventsTabComponent);
