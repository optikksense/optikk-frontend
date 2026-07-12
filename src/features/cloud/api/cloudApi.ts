import api from "@/shared/api/http/client";
import type { RequestTime } from "@/shared/api/service-types";
import { API_CONFIG } from "@config/apiConfig";

import type { CloudOverview, CloudProviderDetail } from "../types";

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

function range(s: RequestTime, e: RequestTime) {
  return { startTime: s, endTime: e };
}

export function getCloudOverview(s: RequestTime, e: RequestTime): Promise<CloudOverview> {
  return api.get<CloudOverview>(`${V1}/cloud/overview`, { params: range(s, e) });
}

export function getCloudProvider(
  provider: string,
  s: RequestTime,
  e: RequestTime
): Promise<CloudProviderDetail> {
  return api.get<CloudProviderDetail>(`${V1}/cloud/${provider}`, { params: range(s, e) });
}
