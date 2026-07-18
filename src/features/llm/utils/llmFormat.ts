// Vendor identity: fixed gen_ai.system -> label + chart token assignment.
// Hues follow the entity, never its rank (dataviz rule).
const VENDOR_META: Record<string, { label: string; color: string }> = {
  openai: { label: "OpenAI", color: "var(--chart-3)" },
  anthropic: { label: "Anthropic", color: "var(--chart-2)" },
  "gcp.vertex_ai": { label: "Vertex AI", color: "var(--chart-1)" },
  "aws.bedrock": { label: "Bedrock", color: "var(--chart-4)" },
  azure_openai: { label: "Azure OpenAI", color: "var(--chart-6)" },
};
const VENDOR_FALLBACK_COLORS = ["var(--chart-5)", "var(--chart-7)", "var(--chart-8)"];

export function vendorLabel(vendor: string): string {
  return VENDOR_META[vendor]?.label ?? (vendor || "unknown");
}

export function vendorColor(vendor: string): string {
  if (VENDOR_META[vendor]) return VENDOR_META[vendor].color;
  // Stable fallback: hash the name so the hue follows the vendor.
  let h = 0;
  for (const c of vendor) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return VENDOR_FALLBACK_COLORS[h % VENDOR_FALLBACK_COLORS.length];
}

// Span-kind identity chips (LLM / tool / retrieval / embedding / agent).
export const OPERATION_META: Record<string, { label: string; color: string }> = {
  chat: { label: "LLM", color: "var(--chart-3)" },
  tool: { label: "Tool", color: "var(--chart-1)" },
  retrieval: { label: "Retrieval", color: "var(--chart-2)" },
  embedding: { label: "Embedding", color: "var(--chart-4)" },
  agent: { label: "Agent", color: "var(--chart-5)" },
  other: { label: "Other", color: "var(--chart-6)" },
};

// App-kind identity chips, derived server-side from the span mix.
export const KIND_META: Record<string, { label: string; color: string }> = {
  agent: { label: "agent", color: "var(--chart-5)" },
  rag: { label: "rag", color: "var(--chart-2)" },
  workflow: { label: "workflow", color: "var(--chart-6)" },
};

// Percent change vs the previous window; null when there is no baseline.
export function deltaPct(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

// Tokens/latency use shared formatNumber/formatDuration; only cost is local.
export function formatCost(n: number): string {
  if (n >= 100) return `$${Math.round(n).toLocaleString()}`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  if (n === 0) return "$0";
  return `$${n.toFixed(4)}`;
}
