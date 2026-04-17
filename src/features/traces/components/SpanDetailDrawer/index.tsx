import { Badge, Surface, Tabs } from "@/components/ui";
import { formatDuration } from "@shared/utils/formatters";

import type { RelatedTrace, SpanAttributes, SpanEvent, SpanSelfTime } from "../../types";

import "./SpanDetailDrawer.css";
import { STATUS_VARIANT } from "./statusVariant";
import { AttributesTab } from "./tabs/AttributesTab";
import { EventsTab } from "./tabs/EventsTab";
import { RelatedTab } from "./tabs/RelatedTab";
import { SelfTimeTab } from "./tabs/SelfTimeTab";

interface Props {
  selectedSpanId: string | null;
  selectedSpan: { operation_name?: string; status?: string; duration_ms?: number } | null;
  spanAttributes: SpanAttributes | null;
  spanAttributesLoading: boolean;
  spanEvents: SpanEvent[];
  spanSelfTimes: SpanSelfTime[];
  relatedTraces: RelatedTrace[];
  activeTab: string;
  onActiveTabChange: (nextTab: string) => void;
}

export default function SpanDetailDrawer({
  selectedSpanId,
  selectedSpan,
  spanAttributes,
  spanAttributesLoading,
  spanEvents,
  spanSelfTimes,
  relatedTraces,
  activeTab,
  onActiveTabChange,
}: Props) {
  if (!selectedSpanId) return null;

  const eventCount = spanEvents.filter((e) => e.spanId === selectedSpanId).length;

  return (
    <Surface elevation={1} padding="md" className="span-detail-drawer">
      <div className="sdd-header">
        <div>
          <div className="sdd-header__name">{selectedSpan?.operation_name || "Span Detail"}</div>
          <div className="sdd-header__meta">
            <Badge variant={STATUS_VARIANT[selectedSpan?.status ?? ""] ?? "default"}>
              {selectedSpan?.status || "UNSET"}
            </Badge>
            <span className="text-muted text-xs">
              {selectedSpan?.duration_ms != null ? formatDuration(selectedSpan.duration_ms) : ""}
            </span>
          </div>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={onActiveTabChange}
        variant="compact"
        size="sm"
        items={[
          { key: "attributes", label: "Attributes" },
          { key: "events", label: `Events${eventCount > 0 ? ` (${eventCount})` : ""}` },
          { key: "selftime", label: "Self-Time" },
          {
            key: "related",
            label: `Related${relatedTraces.length > 0 ? ` (${relatedTraces.length})` : ""}`,
          },
        ]}
      />

      <div className="sdd-tab-content">
        {activeTab === "attributes" && (
          <AttributesTab attrs={spanAttributes} loading={spanAttributesLoading} />
        )}
        {activeTab === "events" && (
          <EventsTab events={spanEvents} selectedSpanId={selectedSpanId} />
        )}
        {activeTab === "selftime" && <SelfTimeTab selfTimes={spanSelfTimes} />}
        {activeTab === "related" && <RelatedTab traces={relatedTraces} />}
      </div>
    </Surface>
  );
}
