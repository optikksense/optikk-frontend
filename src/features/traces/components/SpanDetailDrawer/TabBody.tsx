import type { RelatedTrace, SpanAttributes, SpanEvent, SpanSelfTime } from "../../types";

import { AttributesTab } from "./tabs/AttributesTab";
import { EventsTab } from "./tabs/EventsTab";
import { RelatedTab } from "./tabs/RelatedTab";
import { SelfTimeTab } from "./tabs/SelfTimeTab";

interface Props {
  activeTab: string;
  selectedSpanId: string | null;
  spanAttributes: SpanAttributes | null;
  spanAttributesLoading: boolean;
  spanEvents: SpanEvent[];
  spanSelfTimes: SpanSelfTime[];
  relatedTraces: RelatedTrace[];
}

export function TabBody({
  activeTab,
  selectedSpanId,
  spanAttributes,
  spanAttributesLoading,
  spanEvents,
  spanSelfTimes,
  relatedTraces,
}: Props) {
  if (activeTab === "attributes") {
    return <AttributesTab attrs={spanAttributes} loading={spanAttributesLoading} />;
  }
  if (activeTab === "events") {
    return <EventsTab events={spanEvents} selectedSpanId={selectedSpanId} />;
  }
  if (activeTab === "selftime") {
    return <SelfTimeTab selfTimes={spanSelfTimes} />;
  }
  if (activeTab === "related") {
    return <RelatedTab traces={relatedTraces} />;
  }
  return null;
}
