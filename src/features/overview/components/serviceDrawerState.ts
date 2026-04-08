import { ROUTES } from "@/shared/constants/routes";
import {
  DASHBOARD_DRAWER_PARAMS,
  buildDashboardDrawerSearch,
  buildLegacyDashboardDrawerSearch,
} from "@shared/components/ui/dashboard/utils/dashboardDrawerState";

export interface ServiceDrawerSeedData {
  readonly name: string;
  readonly requestCount?: number;
  readonly errorCount?: number;
  readonly errorRate?: number;
  readonly avgLatency?: number;
  readonly p95Latency?: number;
  readonly p99Latency?: number;
}

export function buildServiceDrawerSearch(
  currentSearch: string,
  service: string | ServiceDrawerSeedData
): string {
  const serviceName = typeof service === "string" ? service : service.name;
  const row =
    typeof service === "string"
      ? { service_name: serviceName }
      : {
          service_name: service.name,
          request_count: service.requestCount,
          error_count: service.errorCount,
          error_rate: service.errorRate,
          avg_latency: service.avgLatency,
          p95_latency: service.p95Latency,
          p99_latency: service.p99Latency,
        };

  return (
    buildDashboardDrawerSearch(
      currentSearch,
      { entity: "service", idField: "service_name", titleField: "service_name" },
      row
    ) ?? buildLegacyDashboardDrawerSearch(currentSearch, "service", serviceName, serviceName)
  );
}

function searchParamsToObject(searchParams: URLSearchParams): Record<string, string | string[]> {
  const search: Record<string, string | string[]> = {};

  for (const [key, value] of searchParams.entries()) {
    const currentValue = search[key];
    if (currentValue === undefined) {
      search[key] = value;
      continue;
    }

    if (Array.isArray(currentValue)) {
      currentValue.push(value);
      continue;
    }

    search[key] = [currentValue, value];
  }

  return search;
}

function clearServiceDrawerParams(searchParams: URLSearchParams): void {
  searchParams.delete(DASHBOARD_DRAWER_PARAMS.entity);
  searchParams.delete(DASHBOARD_DRAWER_PARAMS.id);
  searchParams.delete(DASHBOARD_DRAWER_PARAMS.title);
  searchParams.delete(DASHBOARD_DRAWER_PARAMS.data);
}

export function buildServiceTracesSearch(
  currentSearch: string,
  serviceName: string
): Record<string, string | string[]> {
  const next = new URLSearchParams(currentSearch);
  clearServiceDrawerParams(next);
  next.delete("view");
  next.delete("topologyFocus");
  next.delete("filters");
  next.delete("serviceName");
  next.set("service", serviceName);
  return searchParamsToObject(next);
}

export function buildServiceLogsSearch(
  currentSearch: string,
  serviceName: string
): Record<string, string | string[]> {
  const next = new URLSearchParams(currentSearch);
  clearServiceDrawerParams(next);
  next.delete("view");
  next.delete("topologyFocus");
  next.delete("service");
  next.delete("serviceName");
  next.set("filters", `service_name:equals:${encodeURIComponent(serviceName)}`);
  return searchParamsToObject(next);
}

export function buildLegacyServicePagePath(serviceName: string): string {
  return `${ROUTES.service}?serviceName=${encodeURIComponent(serviceName)}`;
}
