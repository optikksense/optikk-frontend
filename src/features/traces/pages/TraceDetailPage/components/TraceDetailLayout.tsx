import { memo } from "react";

import type { ServiceTopologyResponse } from "@shared/api/topology";
import type { TraceErrorGroup, TraceLog } from "@shared/api/traces/schemas";
import type { TraceRecord } from "@shared/api/traces/schemas";

import type { VisualizationTab } from "../../../store/tracesStore";
import type { RelatedTrace, SpanAttributes, SpanEvent } from "../../../types";

import { SpanDetailDrawer } from "./SpanDetailDrawer";
import { TraceTabBar } from "./TraceTabBar";
import { VizArea } from "./VizArea";

interface SelectedSpan {
  readonly spanId?: string;
  readonly operationName?: string;
  readonly serviceName?: string;
  readonly status?: string;
  readonly spanKind?: string;
  readonly durationMs?: number;
  readonly httpMethod?: string;
  readonly responseStatusCode?: string;
  readonly startTime?: string;
  readonly endTime?: string;
}

export interface TraceDetailLayoutProps {
  readonly activeTab: VisualizationTab;
  readonly onActiveTabChange: (tab: VisualizationTab) => void;
  readonly spans: readonly TraceRecord[];
  readonly traceId: string;
  readonly errorCount: number;
  readonly selectedSpanId: string | null;
  readonly selectedSpan: SelectedSpan | null;
  readonly onSpanClick: (span: { spanId: string }) => void;
  readonly onCloseSpan: () => void;
  readonly criticalPathSpanIds: Set<string>;
  readonly errorPathSpanIds: Set<string>;
  readonly serviceMap: ServiceTopologyResponse | null;
  readonly errorGroups: readonly TraceErrorGroup[];
  readonly spanAttributes: SpanAttributes | null;
  readonly spanAttributesLoading: boolean;
  readonly spanEvents: readonly SpanEvent[];
  readonly relatedTraces: readonly RelatedTrace[];
  readonly traceLogs: readonly TraceLog[];
  readonly traceStartMs?: number;
  readonly traceEndMs?: number;
  readonly onAddFilter: (key: string, value: string) => void;
  readonly onOpenSpanInLogs: () => void;
}

import { Route } from "@/routes/_app/traces/$traceId";
import { useNavigate } from "@tanstack/react-router";

function TraceDetailLayoutComponent(props: TraceDetailLayoutProps) {
  const drawerOpen = !!props.selectedSpanId && !!props.selectedSpan;
  const navigate = useNavigate();
  const searchParams = Route.useSearch();

  const search = searchParams.q ?? "";
  const setSearch = (s: string) => {
    navigate({
      search: ((prev: Record<string, unknown>) => ({ ...prev, q: s || undefined })) as never,
      replace: true,
    });
  };

  return (
    <>
      <TraceTabBar
        activeTab={props.activeTab}
        onActiveTabChange={props.onActiveTabChange}
        search={search}
        onSearchChange={setSearch}
        errorCount={props.errorCount}
      />
      <div className="relative flex min-h-0 flex-1 flex-col">
        <VizArea
          activeTab={props.activeTab}
          spans={props.spans}
          traceId={props.traceId}
          selectedSpanId={props.selectedSpanId}
          onSpanClick={props.onSpanClick}
          criticalPathSpanIds={props.criticalPathSpanIds}
          errorPathSpanIds={props.errorPathSpanIds}
          serviceMap={props.serviceMap}
          spanEvents={props.spanEvents}
          errorGroups={props.errorGroups}
        />
      </div>

      <SpanDetailDrawer
        open={drawerOpen}
        onClose={props.onCloseSpan}
        span={props.selectedSpan}
        spanId={props.selectedSpanId}
        spans={props.spans}
        traceId={props.traceId}
        spanAttributes={props.spanAttributes}
        spanAttributesLoading={props.spanAttributesLoading}
        spanEvents={props.spanEvents}
        relatedTraces={props.relatedTraces}
        traceLogs={props.traceLogs}
        traceStartMs={props.traceStartMs}
        traceEndMs={props.traceEndMs}
        isCritical={!!props.selectedSpanId && props.criticalPathSpanIds.has(props.selectedSpanId)}
        onSpanClick={props.onSpanClick}
        onAddFilter={props.onAddFilter}
        onOpenInLogs={props.onOpenSpanInLogs}
      />
    </>
  );
}

export const TraceDetailLayout = memo(TraceDetailLayoutComponent);
