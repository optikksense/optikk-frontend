import { CHART_COLORS } from "@config/constants";

import { getResolvedChartPalette } from "./chartTheme";

                                                          
export function getChartColor(index: number): string {
  const palette = getResolvedChartPalette();
  const effectivePalette = palette.length > 0 ? palette : CHART_COLORS;
  return effectivePalette[index % effectivePalette.length];
}
