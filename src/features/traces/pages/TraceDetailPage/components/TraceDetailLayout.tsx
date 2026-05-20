import { memo, useEffect, useMemo, useRef } from "react";

import type Flamegraph from "@shared/components/ui/charts/specialized/Flamegraph";
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
import { EventsTab } from "./span-detail/EventsTab";
import { InfoTab } from "./span-detail/InfoTab";
import { InfraTab } from "./span-detail/InfraTab";
import { LinksTab } from "./span-detail/LinksTab";
import { LogsTab } from "./span-detail/LogsTab";

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

interface LogEntry {
  readonly id?: string;
  readonly timestamp: string;
  readonly severity_text?: string;
  readonly body?: string;
  readonly message?: string;
  readonly span_id?: string;
  readonly level?: string;
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
  readonly flamegraphData: Parameters<typeof Flamegraph>[0]["data"] | null;
  readonly flamegraphLoading: boolean;
  readonly flamegraphError: boolean;
  readonly spanAttributes: SpanAttributes | null;
  readonly spanAttributesLoading: boolean;
  readonly spanEvents: readonly SpanEvent[];
  readonly traceLogs: readonly LogEntry[];
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

  const spanScopedLogsCount = useMemo(
    () =>
      props.selectedSpanId
        ? props.traceLogs.filter((l) => l.span_id === props.selectedSpanId).length
        : 0,
    [props.traceLogs, props.selectedSpanId]
  );

  const spanScopedEvents = useMemo(
    () =>
      props.selectedSpanId ? props.spanEvents.filter((e) => e.spanId === props.selectedSpanId) : [],
    [props.spanEvents, props.selectedSpanId]
  );

  const spanLinks: readonly SpanLink[] = props.spanAttributes?.links ?? [];

  const availability = useMemo(
    () =>
      detectTabAvailability(
        props.spanAttributes,
        props.spanEvents,
        props.selectedSpanId,
        spanScopedLogsCount
      ),
    [props.spanAttributes, props.spanEvents, props.selectedSpanId, spanScopedLogsCount]
  );

  const lastSpanIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!props.selectedSpanId) {
      lastSpanIdRef.current = null;
      return;
    }
    if (lastSpanIdRef.current !== props.selectedSpanId && !props.spanAttributesLoading) {
      lastSpanIdRef.current = props.selectedSpanId;
      const next = getDefaultDetailTab(props.spanAttributes, availability);
      const visibleNow: SpanDetailTab[] = [
        "info",
        ...(availability.hasLogs ? (["logs"] as SpanDetailTab[]) : []),
        ...(availability.hasEvents ? (["events"] as SpanDetailTab[]) : []),
        ...(availability.hasLinks ? (["links"] as SpanDetailTab[]) : []),
        ...(availability.hasInfra ? (["infra"] as SpanDetailTab[]) : []),
      ];
      if (!visibleNow.includes(activeDetailTab)) setActiveDetailTab(next);
    }
  }, [
    props.selectedSpanId,
    props.spanAttributes,
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
      { key: "info", label: "Info", visible: true },
      { key: "logs", label: "Logs", count: spanScopedLogsCount, visible: availability.hasLogs },
      {
        key: "events",
        label: "Events",
        count: spanScopedEvents.length,
        visible: availability.hasEvents,
      },
      { key: "links", label: "Links", count: spanLinks.length, visible: availability.hasLinks },
      { key: "infra", label: "Infra", visible: availability.hasInfra },
    ],
    [availability, spanScopedLogsCount, spanScopedEvents.length, spanLinks.length]
  );

  const activeTabResolved: SpanDetailTab = useMemo(() => {
    const visible = tabs.filter((t) => t.visible).map((t) => t.key);
    return visible.includes(activeDetailTab) ? activeDetailTab : "info";
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
            flamegraphData={props.flamegraphData}
            flamegraphLoading={props.flamegraphLoading}
            flamegraphError={props.flamegraphError}
            spanEvents={props.spanEvents}
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
                {activeTabResolved === "info" && (
                  <InfoTab
                    spanAttributes={props.spanAttributes}
                    loading={props.spanAttributesLoading}
                    spans={props.spans}
                    selectedSpanId={props.selectedSpanId}
                    traceStartMs={props.traceStartMs}
                    traceEndMs={props.traceEndMs}
                    onSpanClick={props.onSpanClick}
                    onAddFilter={props.onAddFilter}
                  />
                )}
                {activeTabResolved === "logs" && (
                  <LogsTab
                    logs={props.traceLogs}
                    selectedSpanId={props.selectedSpanId}
                    onOpenInLogs={props.onOpenSpanInLogs}
                  />
                )}
                {activeTabResolved === "events" && (
                  <EventsTab events={props.spanEvents} selectedSpanId={props.selectedSpanId} />
                )}
                {activeTabResolved === "links" && (
                  <LinksTab links={spanLinks} relatedTraces={props.relatedTraces} />
                )}
                {activeTabResolved === "infra" && (
                  <InfraTab resourceAttributes={props.spanAttributes?.resourceAttributes ?? {}} />
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
