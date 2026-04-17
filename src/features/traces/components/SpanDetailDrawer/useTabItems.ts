import { useMemo } from "react";

import type { RelatedTrace, SpanEvent } from "../../types";

export function useTabItems(
  selectedSpanId: string | null,
  spanEvents: SpanEvent[],
  relatedTraces: RelatedTrace[]
) {
  const eventCount = useMemo(
    () =>
      selectedSpanId ? spanEvents.filter((e) => e.spanId === selectedSpanId).length : 0,
    [spanEvents, selectedSpanId]
  );

  return useMemo(
    () => [
      { key: "attributes", label: "Attributes" },
      { key: "events", label: `Events${eventCount > 0 ? ` (${eventCount})` : ""}` },
      { key: "selftime", label: "Self-Time" },
      {
        key: "related",
        label: `Related${relatedTraces.length > 0 ? ` (${relatedTraces.length})` : ""}`,
      },
    ],
    [eventCount, relatedTraces.length]
  );
}
