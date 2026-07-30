import { create } from "zustand";

interface LogsExplorerState {
  expandedRows: Set<string>;
  facetCollapsed: boolean;

  toggleRowExpanded: (id: string) => void;
  setFacetCollapsed: (collapsed: boolean) => void;
}

export const useLogsExplorerStore = create<LogsExplorerState>((set) => ({
  expandedRows: new Set(),
  facetCollapsed: false,

  toggleRowExpanded: (id) =>
    set((s) => {
      const next = new Set(s.expandedRows);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { expandedRows: next };
    }),

  setFacetCollapsed: (facetCollapsed) => set({ facetCollapsed }),
}));
