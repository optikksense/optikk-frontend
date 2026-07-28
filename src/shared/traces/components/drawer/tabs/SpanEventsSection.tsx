import { DrawerSection } from "@shared/components/ui/overlay/detail-drawer/DrawerSection";
import type { SpanEvent } from "@shared/traces/types/detail";
import { formatDuration } from "@shared/utils/formatters";
import { memo } from "react";

interface Props {
  readonly events: readonly SpanEvent[];
  readonly traceStartMs?: number;
}

function SpanEventsSectionComponent({ events, traceStartMs }: Props) {
  if (events.length === 0) return null;

  return (
    <DrawerSection title={`Events & Logs (${events.length})`}>
      <div className="flex flex-col gap-2">
        {events.map((ev, i) => {
          const tMs = ev.timestamp ? new Date(ev.timestamp).getTime() : 0;
          const offset = traceStartMs && tMs ? tMs - traceStartMs : null;

          return (
            <div
              key={`${ev.eventName}-${i}`}
              className="flex flex-col gap-1 rounded-md border border-border bg-secondary p-2.5 text-[12px]"
            >
              <div className="flex items-center justify-between font-mono">
                <span className="font-semibold text-foreground">{ev.eventName}</span>
                {offset != null && (
                  <span className="text-[11px] text-foreground-caption">
                    +{formatDuration(offset)}
                  </span>
                )}
              </div>
              {ev.attributes && (
                <div className="break-words font-mono text-[11px] text-foreground-muted">
                  {ev.attributes}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </DrawerSection>
  );
}

export const SpanEventsSection = memo(SpanEventsSectionComponent);
