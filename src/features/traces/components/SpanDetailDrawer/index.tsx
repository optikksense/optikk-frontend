import { Surface, Tabs } from "@/components/ui";

import type { RelatedTrace, SpanAttributes, SpanEvent, SpanSelfTime } from "../../types";

import { DrawerHeader } from "./DrawerHeader";
import "./SpanDetailDrawer.css";
import { TabBody } from "./TabBody";
import { useTabItems } from "./useTabItems";

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
  const tabItems = useTabItems(selectedSpanId, spanEvents, relatedTraces);
  if (!selectedSpanId) return null;

  return (
    <Surface elevation={1} padding="md" className="span-detail-drawer">
      <DrawerHeader selectedSpan={selectedSpan} />
      <Tabs
        activeKey={activeTab}
        onChange={onActiveTabChange}
        variant="compact"
        size="sm"
        items={tabItems}
      />
      <div className="sdd-tab-content">
        <TabBody
          activeTab={activeTab}
          selectedSpanId={selectedSpanId}
          spanAttributes={spanAttributes}
          spanAttributesLoading={spanAttributesLoading}
          spanEvents={spanEvents}
          spanSelfTimes={spanSelfTimes}
          relatedTraces={relatedTraces}
        />
      </div>
    </Surface>
  );
}
