import { memo, useCallback, useMemo, useState } from "react";

import type { SpanEvent } from "../../../types";

import { EventItem } from "./EventItem";

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
        return (
          <EventItem
            key={key}
            event={ev}
            expanded={expanded.has(key)}
            onToggle={() => toggle(key)}
          />
        );
      })}
    </div>
  );
}

export const EventsTab = memo(EventsTabComponent);
