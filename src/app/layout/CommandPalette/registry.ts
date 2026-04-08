import { logsPaletteActions } from "@/features/log/palette";
import { metricsPaletteActions } from "@/features/metrics/palette";
import { tracePaletteActions } from "@/features/traces/palette";
import { navigationPaletteActions } from "./navigationPalette";

export const allActions = [
  ...navigationPaletteActions,
  ...tracePaletteActions,
  ...metricsPaletteActions,
  ...logsPaletteActions,
];
