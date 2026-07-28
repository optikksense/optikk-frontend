                                                                              
                                                 
export type IngestionUnit = "records" | "bytes";

                                            
export function fmtCount(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}k`;
  return Math.round(n).toLocaleString();
}

                                                           
export function fmtBytes(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  let v = n;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${i === 0 ? Math.round(v) : v.toFixed(v >= 100 ? 0 : 1)} ${units[i]}`;
}

                                                        
export function fmtValue(unit: IngestionUnit, n: number | null | undefined): string {
  return unit === "bytes" ? fmtBytes(n) : fmtCount(n);
}

                                                                               
export function fmtMoney(currency: string, n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);
  } catch {
    return `${n.toFixed(2)} ${currency}`;
  }
}

                                                                           
export const SIGNAL_COLORS: Record<string, string> = {
  logs: "var(--color-info,#3b82f6)",
  spans: "#6366f1",
  metrics: "var(--color-success,#10b981)",
};

                                                         
export const SERVICE_PALETTE = [
  "var(--color-info,#3b82f6)",
  "#6366f1",
  "var(--color-success,#10b981)",
  "#eab308",
  "var(--color-error,#ef4444)",
  "#f97316",
  "#818cf8",
];
