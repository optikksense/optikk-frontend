import { create } from "zustand";

interface LogsExplorerState {
  expandedRows: Set<string>;
  facetCollapsed: boolean;
  columnWidths: Record<string, number>;

  // Cursor-based pagination state
  /** Cursor strings keyed by page index. Page 0 has no cursor (undefined). */
  cursors: (string | undefined)[];
  /** Currently viewed page index (0-based). */
  pageIndex: number;
  /** Cursor for the next page after the last loaded page (from the latest API response). */
  nextCursor: string | undefined;
  /** Whether the backend reported more pages available. */
  hasMore: boolean;

  toggleRowExpanded: (id: string) => void;
  collapseAllRows: () => void;
  setFacetCollapsed: (collapsed: boolean) => void;
  setColumnWidth: (key: string, width: number) => void;

  // Pagination actions
  /** Record the cursor + hasMore from the current page's API response. */
  setPageResponse: (nextCursor: string | undefined, hasMore: boolean) => void;
  /** Navigate to the next page. Pushes the stored nextCursor if needed. */
  goNextPage: () => void;
  /** Navigate to the previous page. */
  goPrevPage: () => void;
  /** Reset pagination to page 0 (on filter/time change). */
  resetPagination: () => void;
}

export const useLogsExplorerStore = create<LogsExplorerState>((set, get) => ({
  expandedRows: new Set(),
  facetCollapsed: false,
  columnWidths: {},

  // Pagination defaults
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
      // Already loaded — just navigate
      set({ pageIndex: pageIndex + 1 });
    } else if (hasMore && nextCursor) {
      // Guard: don't push the same cursor twice (happens when user clicks
      // Next before the current page's response has updated nextCursor)
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
