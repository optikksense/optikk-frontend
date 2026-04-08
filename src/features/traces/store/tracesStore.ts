import { create } from "zustand";

interface TracesState {
  waterfallViewMode: "compact" | "detailed";
  setWaterfallViewMode: (mode: "compact" | "detailed") => void;
  selectedSpanId: string | null;
  setSelectedSpanId: (spanId: string | null) => void;
}

export const useTracesStore = create<TracesState>((set) => ({
  waterfallViewMode: "detailed",
  setWaterfallViewMode: (mode) => set({ waterfallViewMode: mode }),
  selectedSpanId: null,
  setSelectedSpanId: (spanId) => set({ selectedSpanId: spanId }),
}));
