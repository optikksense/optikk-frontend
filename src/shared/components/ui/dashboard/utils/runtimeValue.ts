import type { DashboardRecord, DashboardRuntimeValue } from "@/types/dashboardConfig";

export function isDashboardRecord(value: unknown): value is DashboardRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function asDashboardRecord(value: unknown): DashboardRecord | null {
  return isDashboardRecord(value) ? value : null;
}

export function asDashboardRecordArray(value: unknown): DashboardRecord[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isDashboardRecord);
}

export function getDashboardValue(value: unknown, key: string): DashboardRuntimeValue | undefined {
  const record = asDashboardRecord(value);
  return record?.[key];
}

export function getDashboardRecordArrayField(value: unknown, key: string): DashboardRecord[] {
  return asDashboardRecordArray(getDashboardValue(value, key));
}
