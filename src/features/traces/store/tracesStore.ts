import { create } from "zustand";
import { persist } from "zustand/middleware";

export type VisualizationTab = "servicemap" | "timeline" | "errors" | "raw";
export type SpanDetailTab = "overview" | "attributes" | "events" | "related";

export const DRAWER_WIDTH_DEFAULT = 480;
export const DRAWER_WIDTH_MIN = 360;
export const DRAWER_WIDTH_MAX = 900;

interface TracesState {
  /** User's preferred visualization — persisted so it sticks across navigations. */
  visualizationTab: VisualizationTab;
  setVisualizationTab: (tab: VisualizationTab) => void;
  /** Span detail drawer width in px (persisted). */
  drawerWidthPx: number;
  setDrawerWidthPx: (px: number) => void;
  /** Last-active detail tab — persisted so reopening drawer lands on the same tab. */
  spanDetailTab: SpanDetailTab;
  setSpanDetailTab: (tab: SpanDetailTab) => void;
  /** Collapsed span ids in the waterfall. Ephemeral per session. */
  collapsedSpanIds: ReadonlySet<string>;
  toggleCollapsedSpan: (spanId: string) => void;
  clearCollapsedSpans: () => void;
  /** Waterfall search term (ephemeral). */
  waterfallSearch: string;
  setWaterfallSearch: (s: string) => void;
  /** Errors-only filter toggle (ephemeral). */
  waterfallErrorsOnly: boolean;
  setWaterfallErrorsOnly: (v: boolean) => void;
}

function clampDrawerWidth(px: number): number {
  if (!Number.isFinite(px)) return DRAWER_WIDTH_DEFAULT;
  const max =
    typeof window === "undefined"
      ? DRAWER_WIDTH_MAX
      : Math.min(DRAWER_WIDTH_MAX, Math.floor(window.innerWidth * 0.6));
  return Math.max(DRAWER_WIDTH_MIN, Math.min(max, Math.round(px)));
}

export const useTracesStore = create<TracesState>()(
  persist(
    (set, get) => ({
      visualizationTab: "timeline",
      setVisualizationTab: (tab) => set({ visualizationTab: tab }),
      drawerWidthPx: DRAWER_WIDTH_DEFAULT,
      setDrawerWidthPx: (px) => set({ drawerWidthPx: clampDrawerWidth(px) }),
      spanDetailTab: "overview",
      setSpanDetailTab: (tab) => set({ spanDetailTab: tab }),
      collapsedSpanIds: new Set<string>(),
      toggleCollapsedSpan: (spanId) => {
        const next = new Set(get().collapsedSpanIds);
        if (next.has(spanId)) next.delete(spanId);
        else next.add(spanId);
        set({ collapsedSpanIds: next });
      },
      clearCollapsedSpans: () => set({ collapsedSpanIds: new Set<string>() }),
      waterfallSearch: "",
      setWaterfallSearch: (s) => set({ waterfallSearch: s }),
      waterfallErrorsOnly: false,
      setWaterfallErrorsOnly: (v) => set({ waterfallErrorsOnly: v }),
    }),
    {
      name: "traces-store",
      partialize: (s) => ({
        visualizationTab: s.visualizationTab,
        drawerWidthPx: s.drawerWidthPx,
        spanDetailTab: s.spanDetailTab,
      }),
    }
  )
);
