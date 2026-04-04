import type { DashboardDrawerAction, DashboardDrawerEntity } from '@/types/dashboardConfig';

export const DASHBOARD_DRAWER_PARAMS = {
  entity: 'drawerEntity',
  id: 'drawerId',
  title: 'drawerTitle',
  data: 'drawerData',
} as const;

function asStringValue(value: unknown): string | null {
  if (value == null) {
    return null;
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return null;
}

export function buildDashboardDrawerSearch(
  currentSearch: string,
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

  const nextSearchParams = new URLSearchParams(currentSearch);
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
  return search ? `?${search}` : '';
}

export function buildLegacyDashboardDrawerSearch(
  currentSearch: string,
  entity: DashboardDrawerEntity,
  drawerId: string,
  drawerTitle?: string
): string {
  const nextSearchParams = new URLSearchParams(currentSearch);
  nextSearchParams.set(DASHBOARD_DRAWER_PARAMS.entity, entity);
  nextSearchParams.set(DASHBOARD_DRAWER_PARAMS.id, drawerId);
  if (drawerTitle) {
    nextSearchParams.set(DASHBOARD_DRAWER_PARAMS.title, drawerTitle);
  }
  nextSearchParams.delete(DASHBOARD_DRAWER_PARAMS.data);
  const search = nextSearchParams.toString();
  return search ? `?${search}` : '';
}

export function clearDashboardDrawerSearch(currentSearch: string): string {
  const nextSearchParams = new URLSearchParams(currentSearch);
  nextSearchParams.delete(DASHBOARD_DRAWER_PARAMS.entity);
  nextSearchParams.delete(DASHBOARD_DRAWER_PARAMS.id);
  nextSearchParams.delete(DASHBOARD_DRAWER_PARAMS.title);
  nextSearchParams.delete(DASHBOARD_DRAWER_PARAMS.data);
  const search = nextSearchParams.toString();
  return search ? `?${search}` : '';
}

export function readDashboardDrawerState(searchParams: URLSearchParams): {
  entity: DashboardDrawerEntity | null;
  id: string | null;
  title: string | null;
  data: Record<string, unknown> | null;
} {
  const entity = searchParams.get(DASHBOARD_DRAWER_PARAMS.entity) as DashboardDrawerEntity | null;
  const id = searchParams.get(DASHBOARD_DRAWER_PARAMS.id);
  const title = searchParams.get(DASHBOARD_DRAWER_PARAMS.title);
  const data = deserializeDashboardDrawerData(searchParams.get(DASHBOARD_DRAWER_PARAMS.data));

  return { entity, id, title, data };
}

function serializeDashboardDrawerData(data: Record<string, unknown>): string | null {
  try {
    return JSON.stringify(data);
  } catch {
    return null;
  }
}

function deserializeDashboardDrawerData(value: string | null): Record<string, unknown> | null {
  if (!value) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null;
    }
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}
