import type { ServiceSummary } from "./useServiceSummary";
import { useServiceSummary } from "./useServiceSummary";

export type HeroStatus = "healthy" | "warn" | "error" | "unknown";

export interface HeroData {
  readonly summary: ServiceSummary | null;
  readonly status: HeroStatus;
  readonly loading: boolean;
}

function classifyStatus(summary: ServiceSummary | null): HeroStatus {
  if (!summary) return "unknown";
  if (summary.errorRate >= 2 || summary.p99Ms >= 2000) return "error";
  if (summary.errorRate >= 0.5 || summary.p99Ms >= 1000) return "warn";
  return "healthy";
}

export function useServiceHeroData(serviceName: string, windowMs: number): HeroData {
  const summaryQ = useServiceSummary(serviceName, windowMs);
  return {
    summary: summaryQ.summary,
    status: classifyStatus(summaryQ.summary),
    loading: summaryQ.isPending,
  };
}
