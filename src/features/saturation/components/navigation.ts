import { ROUTES } from "@/shared/constants/routes";
import type { StructuredFilter } from "@/shared/hooks/useURLFilters";
import { DASHBOARD_DRAWER_PARAMS } from "@shared/components/ui/dashboard/utils/dashboardDrawerState";

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

function encodeStructuredFilters(filters: StructuredFilter[]): string | null {
  if (filters.length === 0) return null;
  return filters
    .map((filter) => `${filter.field}:${filter.operator}:${encodeURIComponent(filter.value)}`)
    .join(";");
}

function clearSaturationSearch(currentSearch: string): URLSearchParams {
  const next = new URLSearchParams(currentSearch);
  next.delete("section");
  next.delete("kafkaView");
  next.delete("storeType");
  next.delete("q");
  next.delete("instance");
  next.delete(DASHBOARD_DRAWER_PARAMS.entity);
  next.delete(DASHBOARD_DRAWER_PARAMS.id);
  next.delete(DASHBOARD_DRAWER_PARAMS.title);
  next.delete(DASHBOARD_DRAWER_PARAMS.data);
  return next;
}

export function buildSaturationLogsSearch(
  currentSearch: string,
  filters: StructuredFilter[]
): Record<string, string | string[]> {
  const next = clearSaturationSearch(currentSearch);
  next.delete("service");
  const encoded = encodeStructuredFilters(filters);
  if (encoded) next.set("filters", encoded);
  else next.delete("filters");
  return searchParamsToObject(next);
}

export function buildSaturationTracesSearch(
  currentSearch: string,
  filters: StructuredFilter[]
): Record<string, string | string[]> {
  const next = clearSaturationSearch(currentSearch);
  next.delete("service");
  const encoded = encodeStructuredFilters(filters);
  if (encoded) next.set("filters", encoded);
  else next.delete("filters");
  return searchParamsToObject(next);
}

export function resolveLegacySaturationPath(
  entity: string | null,
  id: string | null
): { to: string; search?: Record<string, string | string[]> } | null {
  if (!entity || !id) return null;

  if (entity === "databaseSystem") {
    return {
      to: ROUTES.saturationDatastoreDetail.replace("$system", encodeURIComponent(id)),
    };
  }

  if (entity === "redisInstance") {
    return {
      to: ROUTES.saturationDatastoreDetail.replace("$system", "redis"),
      search: { instance: id },
    };
  }

  if (entity === "kafkaTopic") {
    return {
      to: ROUTES.saturationKafkaTopicDetail.replace("$topic", encodeURIComponent(id)),
    };
  }

  if (entity === "kafkaGroup") {
    return {
      to: ROUTES.saturationKafkaGroupDetail.replace("$groupId", encodeURIComponent(id)),
    };
  }

  return null;
}
