import { create } from "zustand";
import { persist } from "zustand/middleware";

export type VisualizationTab = "servicemap" | "timeline" | "errors" | "raw";

interface TracesState {
  /** User's preferred visualization — persisted so it sticks across navigations. */
  visualizationTab: VisualizationTab;
  setVisualizationTab: (tab: VisualizationTab) => void;
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

export const useTracesStore = create<TracesState>()(
  persist(
    (set, get) => ({
      visualizationTab: "timeline",
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
      partialize: (s) => ({
        visualizationTab: s.visualizationTab,
      }),
    }
  )
);
