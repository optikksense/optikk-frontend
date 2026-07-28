import type { DashboardDrawerAction, DashboardDrawerEntity } from "@shared/types/dashboardConfig";

export const DASHBOARD_DRAWER_PARAMS = {
  entity: "drawerEntity",
  id: "drawerId",
  title: "drawerTitle",
  data: "drawerData",
} as const;

function asStringValue(value: unknown): string | null {
  if (value == null) {
    return null;
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return null;
}

export function buildDashboardDrawerSearch(
  currentSearch: string | Record<string, unknown>,
  action: DashboardDrawerAction | undefined,
  row: Record<string, unknown>
): string | null {
  if (!action) {
    return null;
  }

  const drawerId = asStringValue(row[action.idField]);
  if (!drawerId) {
    return null;
  }

  const searchInput =
    typeof currentSearch === "string" ? currentSearch : (currentSearch as Record<string, string>);
  const nextSearchParams = new URLSearchParams(searchInput);
  nextSearchParams.set(DASHBOARD_DRAWER_PARAMS.entity, action.entity);
  nextSearchParams.set(DASHBOARD_DRAWER_PARAMS.id, drawerId);

  const titleValue = asStringValue(row[action.titleField || action.idField]);
  if (titleValue) {
    nextSearchParams.set(DASHBOARD_DRAWER_PARAMS.title, titleValue);
  } else {
    nextSearchParams.delete(DASHBOARD_DRAWER_PARAMS.title);
  }

  const serializedData = serializeDashboardDrawerData(row);
  if (serializedData) {
    nextSearchParams.set(DASHBOARD_DRAWER_PARAMS.data, serializedData);
  } else {
    nextSearchParams.delete(DASHBOARD_DRAWER_PARAMS.data);
  }

  const search = nextSearchParams.toString();
  return search ? `?${search}` : "";
}

export function buildLegacyDashboardDrawerSearch(
  currentSearch: string | Record<string, unknown>,
  entity: DashboardDrawerEntity,
  drawerId: string,
  drawerTitle?: string
): string {
  const searchInput =
    typeof currentSearch === "string" ? currentSearch : (currentSearch as Record<string, string>);
  const nextSearchParams = new URLSearchParams(searchInput);
  nextSearchParams.set(DASHBOARD_DRAWER_PARAMS.entity, entity);
  nextSearchParams.set(DASHBOARD_DRAWER_PARAMS.id, drawerId);
  if (drawerTitle) {
    nextSearchParams.set(DASHBOARD_DRAWER_PARAMS.title, drawerTitle);
  }
  nextSearchParams.delete(DASHBOARD_DRAWER_PARAMS.data);
  const search = nextSearchParams.toString();
  return search ? `?${search}` : "";
}

/** Search patch that removes every drawer param from the URL. */
export function clearedDashboardDrawerSearch(): Record<string, undefined> {
  return {
    [DASHBOARD_DRAWER_PARAMS.entity]: undefined,
    [DASHBOARD_DRAWER_PARAMS.id]: undefined,
    [DASHBOARD_DRAWER_PARAMS.title]: undefined,
    [DASHBOARD_DRAWER_PARAMS.data]: undefined,
  };
}

export function readDashboardDrawerState(search: Record<string, unknown>): {
  entity: DashboardDrawerEntity | null;
  id: string | null;
  title: string | null;
  data: Record<string, unknown> | null;
} {
  const rawEntity = search[DASHBOARD_DRAWER_PARAMS.entity];
  const entity = typeof rawEntity === "string" ? (rawEntity as DashboardDrawerEntity) : null;
  const id = asStringValue(search[DASHBOARD_DRAWER_PARAMS.id]);
  const title = asStringValue(search[DASHBOARD_DRAWER_PARAMS.title]);
  const data = deserializeDashboardDrawerData(search[DASHBOARD_DRAWER_PARAMS.data]);

  return { entity, id, title, data };
}

function serializeDashboardDrawerData(data: Record<string, unknown>): string | null {
  try {
    return JSON.stringify(data);
  } catch {
    return null;
  }
}

function deserializeDashboardDrawerData(value: unknown): Record<string, unknown> | null {
  // The router auto-parses JSON-looking params, so the payload may already
  // be an object; legacy links deliver it as a JSON string.
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  if (typeof value !== "string" || value === "") {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}
