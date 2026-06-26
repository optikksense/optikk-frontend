import { resolveThemeColor } from "@shared/utils/chartTheme";
import uPlot from "uplot";

/** Default axis styling matching the app's dark theme. */
export function defaultAxes(config?: { yAxisSize?: number }): uPlot.Axis[] {
  const gridColor = resolveThemeColor("--chart-grid", "rgba(255,255,255,0.10)");
  const labelColor = resolveThemeColor("--chart-axis", "#b9c0cf");
  const font = "11px Inter, sans-serif";
  const yAxisSize = config?.yAxisSize ?? 60;

  return [
    {
      stroke: labelColor,
      grid: { stroke: gridColor, width: 1 },
      ticks: { show: false },
      font,
      gap: 8,
      values: (u: uPlot, splits: number[]) => {
        const minTs = u.scales.x.min ?? splits[0] ?? 0;
        const maxTs = u.scales.x.max ?? splits[splits.length - 1] ?? 0;
        const rangeS = maxTs - minTs;

        return splits.map((ts, idx) => {
          const d = new Date(ts * 1000);

          if (rangeS <= 3600) {
            return d.toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            });
          }

          if (rangeS <= 86400) {
            const time = d.toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            });
            if (idx === 0) {
              const date = d.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              });
              return `${date} ${time}`;
            }
            return time;
          }

          if (rangeS <= 3 * 86400) {
            return d.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            });
          }

          if (rangeS <= 14 * 86400) {
            return d.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            });
          }

          return d.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          });
        });
      },
    },
    {
      stroke: labelColor,
      grid: { stroke: gridColor, width: 1 },
      ticks: { show: false },
      font,
      size: yAxisSize,
      gap: 8,
    },
  ];
}

export function uLine(
  label: string,
  color: string,
  opts?: { fill?: boolean; dash?: number[]; width?: number; fillAlphaHex?: string }
): uPlot.Series {
  const alpha = opts?.fillAlphaHex ?? "2E";
  const resolvedColor = resolveThemeColor(color, "#ffffff");
  return {
    label,
    stroke: resolvedColor,
    width: opts?.width ?? 2,
    fill: opts?.fill ? `${resolvedColor}${alpha}` : undefined,
    dash: opts?.dash,
    points: { show: false },
  };
}

export function uComparisonLine(label: string, color: string): uPlot.Series {
  return {
    label,
    stroke: resolveThemeColor(color, "#ffffff"),
    width: 1.5,
    dash: [4, 4],
    points: { show: false },
  };
}

export function ddCrosshair(): Pick<uPlot.Cursor, "points" | "x" | "y"> {
  return {
    points: { show: false },
    x: true,
    y: false,
  };
}

export function uBars(label: string, color: string): uPlot.Series {
  const resolvedColor = resolveThemeColor(color, "#ffffff");
  return {
    label,
    stroke: resolvedColor,
    fill: `${resolvedColor}DD`,
    points: { show: false },
    paths: uPlot.paths.bars?.({ size: [0.6], radius: 2 }),
  };
}
