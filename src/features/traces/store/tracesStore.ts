import type { VisualizationTab } from "@shared/traces/types/detail";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type { VisualizationTab };

interface TracesState {
                                                                                    
  visualizationTab: VisualizationTab;
  setVisualizationTab: (tab: VisualizationTab) => void;

  collapsedSpanIds: ReadonlySet<string>;
  toggleCollapsedSpan: (spanId: string) => void;
  clearCollapsedSpans: () => void;
}

export const useTracesStore = create<TracesState>()(
  persist(
    (set, get) => ({
      visualizationTab: "waterfall",
      setVisualizationTab: (tab) => set({ visualizationTab: tab }),
      collapsedSpanIds: new Set<string>(),
      toggleCollapsedSpan: (spanId) => {
        const next = new Set(get().collapsedSpanIds);
        if (next.has(spanId)) next.delete(spanId);
        else next.add(spanId);
        set({ collapsedSpanIds: next });
      },
      clearCollapsedSpans: () => set({ collapsedSpanIds: new Set<string>() }),
    }),
    {
      name: "traces-store",
      partialize: (s) => ({
        visualizationTab: s.visualizationTab,
      }),
    }
  )
);
