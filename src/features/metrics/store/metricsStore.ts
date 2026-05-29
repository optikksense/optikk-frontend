import { create } from "zustand";

import type { MetricYAxisScale } from "../types";

const MAX_RECENT_METRICS = 12;

interface MetricsState {
  chartDensity: "low" | "high";
  setChartDensity: (density: "low" | "high") => void;
  syncTooltips: boolean;
  setSyncTooltips: (sync: boolean) => void;

  // Chart view toggles (design: Markers / Legend / Smooth + Y-axis scale).
  showMarkers: boolean;
  setShowMarkers: (show: boolean) => void;
  showLegend: boolean;
  setShowLegend: (show: boolean) => void;
  smooth: boolean;
  setSmooth: (smooth: boolean) => void;
  yAxisScale: MetricYAxisScale;
  setYAxisScale: (scale: MetricYAxisScale) => void;

  // Recently queried metric names (most-recent first, capped).
  recentMetrics: string[];
  pushRecentMetric: (metricName: string) => void;
}

export const useMetricsStore = create<MetricsState>((set) => ({
  chartDensity: "low",
  setChartDensity: (density) => set({ chartDensity: density }),
  syncTooltips: true,
  setSyncTooltips: (sync) => set({ syncTooltips: sync }),

  showMarkers: true,
  setShowMarkers: (show) => set({ showMarkers: show }),
  showLegend: true,
  setShowLegend: (show) => set({ showLegend: show }),
  smooth: true,
  setSmooth: (smooth) => set({ smooth }),
  yAxisScale: "linear",
  setYAxisScale: (scale) => set({ yAxisScale: scale }),

  recentMetrics: [],
  pushRecentMetric: (metricName) =>
    set((state) => {
      if (!metricName) return state;
      const next = [metricName, ...state.recentMetrics.filter((m) => m !== metricName)];
      return { recentMetrics: next.slice(0, MAX_RECENT_METRICS) };
    }),
}));
