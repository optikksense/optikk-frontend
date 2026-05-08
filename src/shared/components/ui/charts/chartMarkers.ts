import type uPlot from "uplot";

import { resolveThemeColor } from "@shared/utils/chartTheme";

export type ChartMarkerKind = "deployment" | "incident" | "annotation";

export interface ChartMarker {
  /** Unix-seconds. Match uPlot's x-scale unit. */
  readonly atSeconds: number;
  readonly label?: string;
  readonly kind?: ChartMarkerKind;
  /** Override the color resolved from `kind`. */
  readonly color?: string;
}

const KIND_VAR: Record<ChartMarkerKind, string> = {
  deployment: "--color-info",
  incident: "--color-error",
  annotation: "--text-muted",
};

const KIND_FALLBACK: Record<ChartMarkerKind, string> = {
  deployment: "#3b82f6",
  incident: "#ef4444",
  annotation: "#94a3b8",
};

/**
 * Returns a uPlot `draw` hook that paints vertical dashed lines at each
 * marker's x-position. Datadog parity: deployment markers, incident pins,
 * annotations show up across the chart's plotting area.
 */
export function buildMarkerDrawHook(markers: readonly ChartMarker[]): (u: uPlot) => void {
  return (u) => {
    if (markers.length === 0) return;
    const { ctx } = u;
    const top = u.bbox.top;
    const bottom = top + u.bbox.height;
    ctx.save();
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.font = "10px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    for (const m of markers) {
      const x = u.valToPos(m.atSeconds, "x", true);
      if (!Number.isFinite(x) || x < u.bbox.left || x > u.bbox.left + u.bbox.width) continue;
      const color = resolveColor(m);
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x, bottom);
      ctx.stroke();
      if (m.label) {
        ctx.fillStyle = color;
        ctx.fillText(m.label, x + 3, top + 2);
      }
    }
    ctx.restore();
  };
}

function resolveColor(m: ChartMarker): string {
  if (m.color) return m.color;
  const kind = m.kind ?? "annotation";
  return resolveThemeColor(KIND_VAR[kind], KIND_FALLBACK[kind]);
}
