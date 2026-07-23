import {
  type ServiceSummary,
  useServiceSummaryQuery,
} from "@shared/metrics/hooks/useServiceSummaryQuery";

export type { ServiceSummary };

export function useServiceSummary(serviceName: string, _windowMs?: number) {
  return useServiceSummaryQuery(serviceName);
}
