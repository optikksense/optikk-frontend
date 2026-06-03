import type { RequestTime } from "@shared/api/service-types";

import { getJson } from "./overviewClient";

export function getErrorHotspot(startTime: RequestTime, endTime: RequestTime): Promise<unknown[]> {
  return getJson("/spans/error-hotspot", startTime, endTime);
}
