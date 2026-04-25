import { Surface, Tabs } from "@/components/ui";

import type { RelatedTrace, SpanAttributes, SpanEvent, SpanSelfTime } from "../../types";

import { DrawerHeader } from "./DrawerHeader";
import "./SpanDetailDrawer.css";
import { TabBody } from "./TabBody";
import { useTabItems } from "./useTabItems";

interface Props {
  traceId: string;
  selectedSpanId: string | null;
  selectedSpan: { operation_name?: string; service_name?: string; status?: string; duration_ms?: number; start_time?: string; end_time?: string } | null;
  spanAttributes: SpanAttributes | null;
  spanAttributesLoading: boolean;
  spanEvents: SpanEvent[];
  spanSelfTimes: SpanSelfTime[];
  relatedTraces: RelatedTrace[];
  activeTab: string;
  onActiveTabChange: (nextTab: string) => void;
}

export default function SpanDetailDrawer(props: Props) {
  const { selectedSpanId, selectedSpan, spanAttributes, activeTab, onActiveTabChange } = props;
  const tabItems = useTabItems(selectedSpanId, props.spanEvents, props.relatedTraces, spanAttributes);
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
          traceId={props.traceId}
          selectedSpanId={selectedSpanId}
          selectedSpan={selectedSpan}
          spanAttributes={spanAttributes}
          spanAttributesLoading={props.spanAttributesLoading}
          spanEvents={props.spanEvents}
          spanSelfTimes={props.spanSelfTimes}
          relatedTraces={props.relatedTraces}
        />
      </div>
    </Surface>
  );
}
