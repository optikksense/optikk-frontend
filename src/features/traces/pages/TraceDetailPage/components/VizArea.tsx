import { memo } from "react";

import type { TraceErrorGroup } from "@shared/api/schemas/tracesSchemas";
import type { ServiceTopologyResponse } from "@shared/api/topology";
import type { TraceRecord } from "@shared/entities/trace/model";

import type { VisualizationTab } from "../../../store/tracesStore";
import type { SpanEvent } from "../../../types";

import { ErrorsTab } from "./ErrorsTab";
import { RawJsonTab } from "./RawJsonTab";
import { ServiceMapView } from "./ServiceMapView";
import { WaterfallView } from "./WaterfallView";

interface Props {
  readonly activeTab: VisualizationTab;
  readonly spans: readonly TraceRecord[];
  readonly traceId: string;
  readonly selectedSpanId: string | null;
  readonly onSpanClick: (span: { span_id: string }) => void;
  readonly criticalPathSpanIds: Set<string>;
  readonly errorPathSpanIds: Set<string>;
  readonly serviceMap: ServiceTopologyResponse | null;
  readonly spanEvents?: readonly SpanEvent[];
  readonly errorGroups?: readonly TraceErrorGroup[];
}

function VizAreaComponent(props: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {props.activeTab === "timeline" && (
        <WaterfallView
          spans={props.spans}
          selectedSpanId={props.selectedSpanId}
          onSpanClick={props.onSpanClick}
          criticalPathSpanIds={props.criticalPathSpanIds}
          errorPathSpanIds={props.errorPathSpanIds}
          spanEvents={props.spanEvents}
        />
      )}
      {props.activeTab === "servicemap" && <ServiceMapView map={props.serviceMap} />}
      {props.activeTab === "errors" && (
        <ErrorsTab
          spans={props.spans}
          onSelect={props.onSpanClick}
          errorGroups={props.errorGroups}
        />
      )}
      {props.activeTab === "raw" && <RawJsonTab traceId={props.traceId} spans={props.spans} />}
    </div>
  );
}

export const VizArea = memo(VizAreaComponent);
