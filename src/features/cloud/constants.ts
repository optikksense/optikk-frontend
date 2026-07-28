                                                                               
                                                                           

export interface ProviderMeta {
  readonly label: string;
  readonly accent: string;
  readonly soft: string;
}

export const PROVIDER_META: Record<string, ProviderMeta> = {
  aws: { label: "AWS", accent: "#f97316", soft: "rgba(249,115,22,0.14)" },
  gcp: { label: "GCP", accent: "#34d399", soft: "rgba(52,211,153,0.14)" },
  azure: { label: "Azure", accent: "#22d3ee", soft: "rgba(34,211,238,0.14)" },
};

export function providerMeta(provider: string): ProviderMeta {
  return (
    PROVIDER_META[provider] ?? {
      label: provider ? provider.toUpperCase() : "Unknown",
      accent: "var(--chart-1)",
      soft: "color-mix(in oklch, var(--chart-1), transparent 86%)",
    }
  );
}

export const CATEGORY_LABEL: Record<string, string> = {
  compute: "Compute",
  data: "Databases",
  storage: "Storage",
  network: "Network",
  streaming: "Streaming",
  ai: "AI / ML",
  other: "Other",
};

export function categoryLabel(category: string): string {
  return CATEGORY_LABEL[category] ?? category;
}

export const CATEGORY_COLOR: Record<string, string> = {
  compute: "var(--chart-1)",
  data: "var(--chart-2)",
  storage: "var(--chart-3)",
  network: "var(--chart-4)",
  streaming: "var(--chart-6)",
  ai: "var(--accent-violet, var(--chart-5))",
  other: "var(--chart-5)",
};

export function categoryColor(category: string): string {
  return CATEGORY_COLOR[category] ?? "var(--chart-1)";
}

export const HEALTH_COLOR: Record<string, string> = {
  healthy: "var(--color-success)",
  degraded: "var(--color-warning)",
  unhealthy: "var(--color-error)",
};
