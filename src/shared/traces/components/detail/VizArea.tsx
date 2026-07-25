import type { ServiceTopologyResponse } from "@shared/api/topology";
import type { TraceErrorGroup, TraceRecord } from "@shared/api/traces/schemas";
import { memo } from "react";
import type { SpanEvent, VisualizationTab } from "../../types/detail";
import { ErrorsTab } from "../errors/ErrorsTab";
import { RawJsonTab } from "../json/RawJsonTab";

import { WaterfallView } from "../waterfall/WaterfallView";

interface Props {
  readonly activeTab: VisualizationTab;
  readonly spans: readonly TraceRecord[];
  readonly traceId: string;
  readonly selectedSpanId: string | null;
  readonly onSpanClick: (span: { spanId: string }) => void;
  readonly criticalPathSpanIds: Set<string>;
  readonly errorPathSpanIds: Set<string>;
  readonly serviceMap: ServiceTopologyResponse | null;
  readonly spanEvents?: readonly SpanEvent[];
  readonly errorGroups?: readonly TraceErrorGroup[];
  readonly search?: string;
}

function VizAreaComponent(props: Props) {
  const isWaterfall = props.activeTab === "waterfall" || (props.activeTab as string) === "timeline";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {isWaterfall && (
        <WaterfallView
          spans={props.spans}
          selectedSpanId={props.selectedSpanId}
          onSpanClick={props.onSpanClick}
          criticalPathSpanIds={props.criticalPathSpanIds}
          errorPathSpanIds={props.errorPathSpanIds}
          spanEvents={props.spanEvents}
          search={props.search}
        />
      )}
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
