import { create } from "zustand";
import { persist } from "zustand/middleware";

export type VisualizationTab = "flamegraph" | "timeline";

interface TracesState {
  waterfallViewMode: "compact" | "detailed";
  setWaterfallViewMode: (mode: "compact" | "detailed") => void;
  selectedSpanId: string | null;
  setSelectedSpanId: (spanId: string | null) => void;
  /** User's preferred visualization — persisted so it sticks across navigations (B2). */
  visualizationTab: VisualizationTab;
  setVisualizationTab: (tab: VisualizationTab) => void;
  /** Collapsed span ids in the waterfall (B3). Ephemeral per session. */
  collapsedSpanIds: ReadonlySet<string>;
  toggleCollapsedSpan: (spanId: string) => void;
  clearCollapsedSpans: () => void;
  /** Waterfall search term + current hit index (B12). */
  waterfallSearch: string;
  setWaterfallSearch: (s: string) => void;
  /** Errors-only filter toggle (B3). */
  waterfallErrorsOnly: boolean;
  setWaterfallErrorsOnly: (v: boolean) => void;
}

export const useTracesStore = create<TracesState>()(
  persist(
    (set, get) => ({
      waterfallViewMode: "detailed",
      setWaterfallViewMode: (mode) => set({ waterfallViewMode: mode }),
      selectedSpanId: null,
      setSelectedSpanId: (spanId) => set({ selectedSpanId: spanId }),
      visualizationTab: "flamegraph",
      setVisualizationTab: (tab) => set({ visualizationTab: tab }),
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
      // Only persist user preferences — not ephemeral search/collapse state.
      partialize: (s) => ({
        waterfallViewMode: s.waterfallViewMode,
        visualizationTab: s.visualizationTab,
      }),
    },
  ),
);
