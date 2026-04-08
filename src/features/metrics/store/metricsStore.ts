import { create } from "zustand";

interface MetricsState {
  chartDensity: "low" | "high";
  setChartDensity: (density: "low" | "high") => void;
  syncTooltips: boolean;
  setSyncTooltips: (sync: boolean) => void;
}

export const useMetricsStore = create<MetricsState>((set) => ({
  chartDensity: "low",
  setChartDensity: (density) => set({ chartDensity: density }),
  syncTooltips: true,
  setSyncTooltips: (sync) => set({ syncTooltips: sync }),
}));
