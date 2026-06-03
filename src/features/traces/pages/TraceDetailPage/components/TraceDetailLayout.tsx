import { memo, useEffect, useMemo, useRef } from "react";

import type { TraceErrorGroup } from "@shared/api/schemas/tracesSchemas";
import type { ServiceTopologyResponse } from "@shared/components/ui/charts/ServiceTopologyGraph";
import type { TraceRecord } from "@shared/entities/trace/model";

import {
  type SpanDetailTab,
  type VisualizationTab,
  useTracesStore,
} from "../../../store/tracesStore";
import type { RelatedTrace, SpanAttributes, SpanEvent, SpanLink } from "../../../types";
import { useDrawerWidth } from "../hooks/useDrawerWidth";
import { detectTabAvailability, getDefaultDetailTab } from "../utils";

import { SpanDetailTabs, type TabSpec } from "./SpanDetailTabs";
import { SpanDrawer } from "./SpanDrawer";
import { SpanDrawerHeader } from "./SpanDrawerHeader";
import { TraceTabBar } from "./TraceTabBar";
import { VizArea } from "./VizArea";
import { AttributesTab } from "./span-detail/AttributesTab";
import { EventsTab } from "./span-detail/EventsTab";
import { LinksTab } from "./span-detail/LinksTab";
import { OverviewTab } from "./span-detail/OverviewTab";

interface SelectedSpan {
  readonly span_id?: string;
  readonly operation_name?: string;
  readonly service_name?: string;
  readonly status?: string;
  readonly span_kind?: string;
  readonly duration_ms?: number;
  readonly http_method?: string;
  readonly response_status_code?: string;
  readonly start_time?: string;
  readonly end_time?: string;
}

export interface TraceDetailLayoutProps {
  readonly activeTab: VisualizationTab;
  readonly onActiveTabChange: (tab: VisualizationTab) => void;
  readonly spans: readonly TraceRecord[];
  readonly traceId: string;
  readonly errorCount: number;
  readonly selectedSpanId: string | null;
  readonly selectedSpan: SelectedSpan | null;
  readonly onSpanClick: (span: { span_id: string }) => void;
  readonly onCloseSpan: () => void;
  readonly criticalPathSpanIds: Set<string>;
  readonly errorPathSpanIds: Set<string>;
  readonly serviceMap: ServiceTopologyResponse | null;
  readonly errorGroups: readonly TraceErrorGroup[];
  readonly spanAttributes: SpanAttributes | null;
  readonly spanAttributesLoading: boolean;
  readonly spanEvents: readonly SpanEvent[];
  readonly relatedTraces: readonly RelatedTrace[];
  readonly traceStartMs?: number;
  readonly traceEndMs?: number;
  readonly onAddFilter: (key: string, value: string) => void;
  readonly onOpenSpanInLogs: () => void;
}

function TraceDetailLayoutComponent(props: TraceDetailLayoutProps) {
  const drawer = useDrawerWidth();
  const drawerOpen = !!props.selectedSpanId && !!props.selectedSpan;
  const drawerHeaderRef = useRef<HTMLDivElement>(null);

  const search = useTracesStore((s) => s.waterfallSearch);
  const setSearch = useTracesStore((s) => s.setWaterfallSearch);

  const activeDetailTab = useTracesStore((s) => s.spanDetailTab);
  const setActiveDetailTab = useTracesStore((s) => s.setSpanDetailTab);

  const spanScopedEvents = useMemo(
    () =>
      props.selectedSpanId ? props.spanEvents.filter((e) => e.spanId === props.selectedSpanId) : [],
    [props.spanEvents, props.selectedSpanId]
  );

  const spanLinks: readonly SpanLink[] = props.spanAttributes?.links ?? [];
  const attrCount = Object.keys(props.spanAttributes?.attributesString ?? {}).length;
  const relatedCount = spanLinks.length + props.relatedTraces.length;

  const availability = useMemo(
    () => detectTabAvailability(props.spanAttributes, props.spanEvents, props.selectedSpanId),
    [props.spanAttributes, props.spanEvents, props.selectedSpanId]
  );

  const lastSpanIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!props.selectedSpanId) {
      lastSpanIdRef.current = null;
      return;
    }
    if (lastSpanIdRef.current !== props.selectedSpanId && !props.spanAttributesLoading) {
      lastSpanIdRef.current = props.selectedSpanId;
      const visibleNow: SpanDetailTab[] = [
        "overview",
        "attributes",
        ...(availability.hasEvents ? (["events"] as SpanDetailTab[]) : []),
        "related",
      ];
      if (!visibleNow.includes(activeDetailTab)) setActiveDetailTab(getDefaultDetailTab());
    }
  }, [
    props.selectedSpanId,
    props.spanAttributesLoading,
    availability,
    activeDetailTab,
    setActiveDetailTab,
  ]);

  const lastFocusedRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (drawerOpen) {
      lastFocusedRef.current = (document.activeElement as HTMLElement | null) ?? null;
      drawerHeaderRef.current?.focus();
    } else if (lastFocusedRef.current) {
      lastFocusedRef.current.focus();
      lastFocusedRef.current = null;
    }
  }, [drawerOpen]);

  const tabs: TabSpec[] = useMemo(
    () => [
      { key: "overview", label: "Overview", visible: true },
      { key: "attributes", label: "Attributes", count: attrCount, visible: true },
      {
        key: "events",
        label: "Events",
        count: spanScopedEvents.length,
        visible: availability.hasEvents,
      },
      { key: "related", label: "Related", count: relatedCount, visible: true },
    ],
    [availability, spanScopedEvents.length, attrCount, relatedCount]
  );

  const activeTabResolved: SpanDetailTab = useMemo(() => {
    const visible = tabs.filter((t) => t.visible).map((t) => t.key);
    return visible.includes(activeDetailTab) ? activeDetailTab : "overview";
  }, [tabs, activeDetailTab]);

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
        <div
          className="flex min-h-0 flex-1 flex-col transition-[padding-right] duration-100"
          style={{ paddingRight: drawerOpen ? drawer.widthPx : 0 }}
        >
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

        <SpanDrawer
          open={drawerOpen}
          widthPx={drawer.widthPx}
          minPx={drawer.minPx}
          maxPx={drawer.maxPx}
          onResize={drawer.setWidthPx}
          onClose={props.onCloseSpan}
        >
          {props.selectedSpan && props.selectedSpanId ? (
            <>
              <SpanDrawerHeader
                ref={drawerHeaderRef}
                span={props.selectedSpan}
                spanId={props.selectedSpanId}
                traceStartMs={props.traceStartMs}
                traceEndMs={props.traceEndMs}
                isCritical={props.criticalPathSpanIds.has(props.selectedSpanId)}
                onClose={props.onCloseSpan}
              />
              <SpanDetailTabs
                tabs={tabs}
                active={activeTabResolved}
                onChange={setActiveDetailTab}
              />
              <div className="min-h-0 flex-1 overflow-y-auto">
                {activeTabResolved === "overview" && (
                  <OverviewTab
                    spanAttributes={props.spanAttributes}
                    loading={props.spanAttributesLoading}
                    spans={props.spans}
                    selectedSpanId={props.selectedSpanId}
                    traceStartMs={props.traceStartMs}
                    traceEndMs={props.traceEndMs}
                    onSpanClick={props.onSpanClick}
                    onOpenInLogs={props.onOpenSpanInLogs}
                  />
                )}
                {activeTabResolved === "attributes" && (
                  <AttributesTab
                    spanAttributes={props.spanAttributes}
                    onAddFilter={props.onAddFilter}
                  />
                )}
                {activeTabResolved === "events" && (
                  <EventsTab events={props.spanEvents} selectedSpanId={props.selectedSpanId} />
                )}
                {activeTabResolved === "related" && (
                  <LinksTab links={spanLinks} relatedTraces={props.relatedTraces} />
                )}
              </div>
            </>
          ) : null}
        </SpanDrawer>
      </div>
    </>
  );
}

export const TraceDetailLayout = memo(TraceDetailLayoutComponent);
