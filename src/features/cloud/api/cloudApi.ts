import api from "@/shared/api/http/client";
import type { RequestTime } from "@/shared/api/service-types";
import { API_CONFIG } from "@config/apiConfig";

import type {
  AccountBreakdown,
  AttentionResource,
  CategoryCount,
  HealthCounts,
  InventoryRow,
  PlatformService,
} from "../types";

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

function range(s: RequestTime, e: RequestTime) {
  return { startTime: s, endTime: e };
}

export function getCloudInventory(s: RequestTime, e: RequestTime): Promise<InventoryRow[]> {
  return api.get<InventoryRow[]>(`${V1}/cloud/inventory`, { params: range(s, e) });
}

export function getCloudCategories(
  s: RequestTime,
  e: RequestTime
): Promise<Record<string, CategoryCount[]>> {
  return api.get<Record<string, CategoryCount[]>>(`${V1}/cloud/categories`, {
    params: range(s, e),
  });
}

export function getCloudHealth(
  s: RequestTime,
  e: RequestTime
): Promise<Record<string, HealthCounts>> {
  return api.get<Record<string, HealthCounts>>(`${V1}/cloud/health`, { params: range(s, e) });
}

export function getCloudRestarts(s: RequestTime, e: RequestTime): Promise<Record<string, number>> {
  return api.get<Record<string, number>>(`${V1}/cloud/restarts`, { params: range(s, e) });
}

export function getProviderPlatforms(
  provider: string,
  s: RequestTime,
  e: RequestTime
): Promise<PlatformService[]> {
  return api.get<PlatformService[]>(`${V1}/cloud/provider/${provider}/platforms`, {
    params: range(s, e),
  });
}

export function getProviderAccounts(
  provider: string,
  s: RequestTime,
  e: RequestTime
): Promise<AccountBreakdown[]> {
  return api.get<AccountBreakdown[]>(`${V1}/cloud/provider/${provider}/accounts`, {
    params: range(s, e),
  });
}

export function getProviderResources(
  provider: string,
  s: RequestTime,
  e: RequestTime
): Promise<AttentionResource[]> {
  return api.get<AttentionResource[]>(`${V1}/cloud/provider/${provider}/resources`, {
    params: range(s, e),
  });
}
