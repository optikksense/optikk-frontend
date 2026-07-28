import type { PaletteAction } from "@/app/layout/CommandPalette/types";
import { useMetricsStore } from "./store/metricsStore";

export const metricsPaletteActions: PaletteAction[] = [
  {
    id: "metrics.toggle-density",
    label: "Toggle Metrics Density",
    keywords: ["metrics", "density", "compact", "comfortable"],
    group: "feature",
    perform: () => {
      const store = useMetricsStore.getState();
      store.setChartDensity(store.chartDensity === "low" ? "high" : "low");
    },
  },
];
