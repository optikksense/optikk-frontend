export type DashboardScalarValue = string | number | boolean | null;
export type DashboardQueryParamValue =
  | DashboardScalarValue
  | readonly string[]
  | readonly number[]
  | readonly boolean[];
export type DashboardRuntimeValue =
  | DashboardScalarValue
  | readonly DashboardScalarValue[]
  | { readonly [key: string]: DashboardRuntimeValue }
  | readonly DashboardRuntimeValue[];
export interface DashboardRecord {
  readonly [key: string]: DashboardRuntimeValue;
}
export type DashboardDataSourceValue = DashboardRuntimeValue | undefined;
export type DashboardDataSources = Record<string, DashboardDataSourceValue>;
export type DashboardExtraContext = Record<string, DashboardRuntimeValue>;
/** Canonical schema for newly authored pages; API may still return v1 until migrated. */
export const DASHBOARD_SCHEMA_VERSION = 2 as const;
export type DashboardSchemaVersion = 1 | 2;

export type DashboardRenderMode = "dashboard" | "explorer";
export type DashboardColumnAlign = "left" | "center" | "right";
export type DashboardDrawerEntity =
  | "aiModel"
  | "databaseSystem"
  | "deployment"
  | "errorGroup"
  | "kafkaGroup"
  | "kafkaTopic"
  | "node"
  | "redisInstance"
  | "service";
export const DASHBOARD_PANEL_TYPES = [
  "ai-bar",
  "ai-line",
  "bar",
  "db-systems-overview",
  "error-hotspot-ranking",
  "error-rate",
  "exception-type-line",
  "gauge",
  "heatmap",
  "latency",
  "latency-heatmap",
  "latency-histogram",
  "log-histogram",
  "pie",
  "request",
  "service-catalog",
  "service-health-grid",
  "service-map",
  "slo-indicators",
  "stat-card",
  "stat-cards-grid",
  "stat-summary",
  "table",
  "trace-waterfall",
] as const;
export type DashboardPanelType = (typeof DASHBOARD_PANEL_TYPES)[number];
export const DASHBOARD_LAYOUT_VARIANTS = [
  "kpi",
  "summary",
  "standard-chart",
  "wide-chart",
  "ranking",
  "summary-table",
  "detail-table",
  "hero",
  "hero-map",
  "hero-detail",
  "compact",
  "wide-compact",
] as const;
export type DashboardLayoutVariant = (typeof DASHBOARD_LAYOUT_VARIANTS)[number];
export const DASHBOARD_SECTION_TEMPLATES = [
  "kpi-band",
  "summary-plus-health",
  "two-up",
  "three-up",
  "stacked",
  "hero-plus-table",
  "chart-grid-plus-details",
  "table-stack",
] as const;
export type DashboardSectionTemplate = (typeof DASHBOARD_SECTION_TEMPLATES)[number];

export interface DashboardLayout {
  x: number;
  y: number;
  /** Grid width in columns (12-column model; must match backend layoutVariant footprint). */
  w: number;
  /** Grid height in rows. */
  h: number;
}

export interface DashboardQuerySpec {
  method: string;
  endpoint: string;
  params?: Record<string, DashboardQueryParamValue>;
}

export interface DashboardSectionSpec {
  id: string;
  title: string;
  order: number;
  collapsible: boolean;
  sectionTemplate: DashboardSectionTemplate;
}

export interface DashboardStatSummaryField {
  label: string;
  field?: string;
  keys?: string[];
}

export interface DashboardTableColumn {
  key: string;
  label: string;
  formatter?: string;
  align?: DashboardColumnAlign;
  width?: number;
}

export interface DashboardDrawerAction {
  entity: DashboardDrawerEntity;
  idField: string;
  titleField?: string;
}

export interface DashboardPanelSpec {
  id: string;
  panelType: DashboardPanelType;
  layoutVariant: DashboardLayoutVariant;
  sectionId: string;
  order: number;
  query?: DashboardQuerySpec;
  layout: DashboardLayout;
  title?: string;
  description?: string;
  titleIcon?: string;
  icon?: string;
  dataSource?: string;
  dataKey?: string;
  groupByKey?: string;
  labelKey?: string;
  xKey?: string;
  yKey?: string;
  endpointDataSource?: string;
  endpointMetricsSource?: string;
  endpointListType?: string;
  valueField?: string;
  valueKey?: string;
  valueKeys?: string[];
  bucketKey?: string;
  datasetLabel?: string;
  color?: string;
  formatter?: string;
  stacked?: boolean;
  listSortField?: string;
  listType?: string;
  listTitle?: string;
  columns?: DashboardTableColumn[];
  drawerAction?: DashboardDrawerAction;
  targetThreshold?: number;
  summaryFields?: DashboardStatSummaryField[];
  yPrefix?: string;
  yDecimals?: number;
}

export interface DefaultConfigPage {
  schemaVersion: DashboardSchemaVersion;
  id: string;
  path: string;
  label: string;
  icon: string;
  group: string;
  order: number;
  defaultTabId?: string;
  navigable: boolean;
  renderMode: DashboardRenderMode;
  title?: string;
  subtitle?: string;
}

export interface DefaultConfigTab {
  id: string;
  pageId: string;
  label: string;
  order: number;
}

export interface DashboardTabDocument {
  id: string;
  pageId: string;
  label: string;
  order: number;
  sections: DashboardSectionSpec[];
  panels: DashboardPanelSpec[];
}

export interface DataSourceSpec {
  id: string;
  endpoint: string;
  params?: Record<string, string | number>;
}

export interface StatCardSpec {
  title: string;
  dataSource: string;
  valueField: string;
  formatter?: "ms" | "bytes" | "percent1" | "number";
  icon?: string;
}

export interface TabSpec {
  id: string;
  label: string;
  dataSources: DataSourceSpec[];
  statCards?: StatCardSpec[];
  charts: DashboardPanelSpec[];
}
