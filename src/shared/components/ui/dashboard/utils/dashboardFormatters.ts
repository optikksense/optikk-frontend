import type {
  DashboardDataSources,
  DashboardPanelSpec,
  DashboardPanelType,
  DashboardRecord,
} from "@/types/dashboardConfig";

import { formatBytes, formatDuration, formatNumber } from "@shared/utils/formatters";
import {
  asDashboardRecord,
  asDashboardRecordArray,
  getDashboardRecordArrayField,
  getDashboardValue,
} from "./runtimeValue";

export function formatStatValue(formatter: string | undefined, value: unknown): string | number {
  switch (formatter) {
    case "ms":
      return formatDuration(typeof value === "string" || typeof value === "number" ? value : 0);
    case "ns":
      return formatDuration((Number(value) || 0) / 1_000_000);
    case "bytes":
      return formatBytes(Number(value) || 0);
    case "percent1":
      return `${Number(value || 0).toFixed(1)}%`;
    case "percent2":
      return `${Number(value || 0).toFixed(2)}%`;
    case "number":
      return formatNumber(Number(value) || 0);
    default:
      return typeof value === "number" ? value : String(value ?? "0");
  }
}

export function resolveComponentData(
  chartConfig: DashboardPanelSpec,
  dataSources: DashboardDataSources
) {
  const dataSourceId = chartConfig.dataSource || chartConfig.id;
  return dataSourceId ? dataSources?.[dataSourceId] : undefined;
}

export function normalizeDashboardRows(rawData: unknown, dataKey?: string): DashboardRecord[] {
  if (dataKey) {
    return getDashboardRecordArrayField(rawData, dataKey);
  }

  if (Array.isArray(rawData)) {
    return asDashboardRecordArray(rawData);
  }

  return getDashboardRecordArrayField(rawData, "data");
}

export function resolveFieldValue(raw: unknown, field: string | undefined): unknown {
  if (!field) return 0;
  if (field === "_count") {
    return Array.isArray(raw) ? raw.length : 0;
  }
  if (Array.isArray(raw)) {
    const first = asDashboardRecordArray(raw)[0];
    return first?.[field] ?? 0;
  }
  return getDashboardValue(raw, field) ?? 0;
}

export function resolveComponentKey(chartConfig: DashboardPanelSpec): DashboardPanelType {
  return chartConfig.panelType;
}

export function firstValue(row: unknown, keys: string[], fallback: unknown = ""): unknown {
  const record = asDashboardRecord(row);
  if (!record) return fallback;
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return fallback;
}

export function strValue(row: unknown, keys: string[], fallback = "") {
  const value = firstValue(row, keys, fallback);
  return value == null ? fallback : String(value);
}

export function numValue(row: unknown, keys: string[], fallback = 0) {
  const value = firstValue(row, keys, fallback);
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function splitValueUnit(str: string) {
  const match = String(str).match(/^([+-]?[\d.,]+)\s*(.*)$/);
  if (match) return { val: match[1], unit: match[2] };
  return { val: str, unit: "" };
}
