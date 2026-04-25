/**
 * Deterministic service → color mapping. Same service name always returns the
 * same color so the trace list is visually stable across refreshes.
 * Palette mirrors the 12-hue set Datadog uses for service topology coloring.
 */
const SERVICE_PALETTE = [
  "#4285f4", // blue
  "#9b59b6", // purple
  "#06aed5", // teal
  "#27ae60", // green
  "#e67e22", // orange
  "#e91e8c", // pink
  "#f39c12", // amber
  "#16a085", // cyan-green
  "#2980b9", // steel blue
  "#8e44ad", // deep purple
  "#c0392b", // crimson
  "#1abc9c", // mint
] as const;

function djb2(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    hash = hash >>> 0; // keep unsigned 32-bit
  }
  return hash;
}

export function getServiceColor(serviceName: string): string {
  const idx = djb2(serviceName) % SERVICE_PALETTE.length;
  return SERVICE_PALETTE[idx] ?? SERVICE_PALETTE[0];
}
