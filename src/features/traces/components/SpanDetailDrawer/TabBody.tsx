import type { RelatedTrace, SpanAttributes, SpanEvent, SpanSelfTime } from "../../types";

import { AttributesTab } from "./tabs/AttributesTab";
import { CodeTab } from "./tabs/CodeTab";
import { ErrorsTab } from "./tabs/ErrorsTab";
import { EventsTab } from "./tabs/EventsTab";
import { HostTab } from "./tabs/HostTab";
import { LinksTab } from "./tabs/LinksTab";
import { LogsTab } from "./tabs/LogsTab";
import { MetricsTab } from "./tabs/MetricsTab";
import { NetworkTab } from "./tabs/NetworkTab";
import { RelatedTab } from "./tabs/RelatedTab";
import { SelfTimeTab } from "./tabs/SelfTimeTab";

interface Props {
  activeTab: string;
  traceId: string;
  selectedSpanId: string | null;
  selectedSpan: { operation_name?: string; service_name?: string; start_time?: string; end_time?: string } | null;
  spanAttributes: SpanAttributes | null;
  spanAttributesLoading: boolean;
  spanEvents: SpanEvent[];
  spanSelfTimes: SpanSelfTime[];
  relatedTraces: RelatedTrace[];
}

export function TabBody(p: Props) {
  if (p.activeTab === "attributes") return <AttributesTab attrs={p.spanAttributes} loading={p.spanAttributesLoading} />;
  if (p.activeTab === "errors") return <ErrorsTab attrs={p.spanAttributes} />;
  if (p.activeTab === "events") return <EventsTab events={p.spanEvents} selectedSpanId={p.selectedSpanId} />;
  if (p.activeTab === "logs") return <LogsTab traceId={p.traceId} spanId={p.selectedSpanId} />;
  if (p.activeTab === "metrics") return <MetricsTab span={p.selectedSpan} />;
  if (p.activeTab === "host") return <HostTab attrs={p.spanAttributes} />;
  if (p.activeTab === "network") return <NetworkTab attrs={p.spanAttributes} />;
  if (p.activeTab === "code") return <CodeTab attrs={p.spanAttributes} />;
  if (p.activeTab === "links") return <LinksTab attrs={p.spanAttributes} />;
  if (p.activeTab === "selftime") return <SelfTimeTab selfTimes={p.spanSelfTimes} />;
  if (p.activeTab === "related") return <RelatedTab traces={p.relatedTraces} />;
  return null;
}
