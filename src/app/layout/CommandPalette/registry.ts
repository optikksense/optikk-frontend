import { metricsPaletteActions } from "@/features/metrics/palette";
import { navigationPaletteActions } from "./navigationPalette";

export const allActions = [...navigationPaletteActions, ...metricsPaletteActions];
