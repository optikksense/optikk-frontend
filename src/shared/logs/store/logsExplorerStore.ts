import { create } from "zustand";

interface LogsExplorerState {
  expandedRows: Set<string>;
  facetCollapsed: boolean;
  columnWidths: Record<string, number>;

                                  
                                                                              
  cursors: (string | undefined)[];

  pageIndex: number;

  nextCursor: string | undefined;

  hasMore: boolean;

  toggleRowExpanded: (id: string) => void;
  collapseAllRows: () => void;
  setFacetCollapsed: (collapsed: boolean) => void;
  setColumnWidth: (key: string, width: number) => void;

  setPageResponse: (nextCursor: string | undefined, hasMore: boolean) => void;

  goNextPage: () => void;

  goPrevPage: () => void;

  resetPagination: () => void;
}

export const useLogsExplorerStore = create<LogsExplorerState>((set, get) => ({
  expandedRows: new Set(),
  facetCollapsed: false,
  columnWidths: {},

  cursors: [undefined],
  pageIndex: 0,
  nextCursor: undefined,
  hasMore: false,

  toggleRowExpanded: (id) =>
    set((s) => {
      const next = new Set(s.expandedRows);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { expandedRows: next };
    }),

  collapseAllRows: () => set({ expandedRows: new Set() }),

  setFacetCollapsed: (facetCollapsed) => set({ facetCollapsed }),

  setColumnWidth: (key, width) =>
    set((s) => ({ columnWidths: { ...s.columnWidths, [key]: width } })),

  setPageResponse: (nextCursor, hasMore) => set({ nextCursor, hasMore }),

  goNextPage: () => {
    const { pageIndex, cursors, nextCursor, hasMore } = get();
    if (pageIndex + 1 < cursors.length) {
      set({ pageIndex: pageIndex + 1 });
    } else if (hasMore && nextCursor) {
      const lastCursor = cursors[cursors.length - 1];
      if (nextCursor === lastCursor) return;
      set({
        cursors: [...cursors, nextCursor],
        pageIndex: pageIndex + 1,
      });
    }
  },

  goPrevPage: () => set((s) => ({ pageIndex: Math.max(0, s.pageIndex - 1) })),

  resetPagination: () =>
    set({ cursors: [undefined], pageIndex: 0, nextCursor: undefined, hasMore: false }),
}));
