import { Badge } from "@/components/ui";
import { formatTimestamp } from "@shared/utils/formatters";
import { memo, useMemo } from "react";

import type { SpanEvent } from "../../../types";

interface Props {
  event: SpanEvent;
  expanded: boolean;
  onToggle: () => void;
}

function EventHeader({
  event,
  parsed,
  expanded,
  onToggle,
  isException,
}: {
  event: SpanEvent;
  parsed: Record<string, string>;
  expanded: boolean;
  onToggle: () => void;
  isException: boolean;
}) {
  return (
    <div
      className="sdd-event__header"
      onClick={() => {
        if (isException) onToggle();
      }}
    >
      <span className="font-mono text-muted text-xs">{formatTimestamp(event.timestamp)}</span>
      <Badge variant={isException ? "error" : "default"}>{event.eventName}</Badge>
      {parsed["exception.type"] && (
        <span className="font-medium text-error text-sm">{parsed["exception.type"]}</span>
      )}
      {isException && <span className="sdd-event__toggle">{expanded ? "▲" : "▼"}</span>}
    </div>
  );
}

function EventBody({ parsed }: { parsed: Record<string, string> }) {
  return (
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
  );
}

function EventItemComponent({ event, expanded, onToggle }: Props) {
  const parsed = useMemo<Record<string, string>>(() => {
    try {
      return JSON.parse(event.attributes);
    } catch {
      return {};
    }
  }, [event.attributes]);

  const isException = event.eventName === "exception";

  return (
    <div className={`sdd-event ${isException ? "sdd-event--error" : ""}`}>
      <EventHeader
        event={event}
        parsed={parsed}
        expanded={expanded}
        onToggle={onToggle}
        isException={isException}
      />
      {isException && expanded ? <EventBody parsed={parsed} /> : null}
    </div>
  );
}

export const EventItem = memo(EventItemComponent);
