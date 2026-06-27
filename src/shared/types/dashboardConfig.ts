import type {
  FormulaDefinition,
  MetricQueryDefinition,
  MetricSpaceAggregation,
  TimeStep,
} from "@/features/metrics/types";

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
  | "databaseSystem"
  | "deployment"
  | "errorGroup"
  | "kafkaGroup"
  | "kafkaTopic"
  | "node"
  | "redisInstance"
  | "service";
export const DASHBOARD_PANEL_TYPES = [
  "bar",
  "db-systems-overview",
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
  "stat-card",
  "stat-cards-grid",
  "stat-summary",
  "table",
  "trace-waterfall",
  "metrics-timeseries",
  "metrics-value",
  "metrics-toplist",
  "metrics-table",
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

  w: number;

  h: number;
}

/** Curated-endpoint widget query: points at an allowlisted GET endpoint. */
export interface DashboardEndpointQuerySpec {
  method: string;
  endpoint: string;
  params?: Record<string, DashboardQueryParamValue>;
}

/** SigNoz-style builder query replayed through the metrics explorer engine. */
export interface DashboardMetricsQuerySpec {
  kind: "metrics";
  step: TimeStep;
  spaceAggregation: MetricSpaceAggregation;
  queries: MetricQueryDefinition[];
  formulas?: FormulaDefinition[];
}

export type DashboardQuerySpec = DashboardEndpointQuerySpec | DashboardMetricsQuerySpec;

/** Narrows a widget query to the metrics builder variant. */
export function isMetricsQuerySpec(
  query: DashboardQuerySpec | undefined
): query is DashboardMetricsQuerySpec {
  return query != null && "kind" in query && query.kind === "metrics";
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

export interface BasePanelSpec {
  readonly id: string;
  readonly panelType: DashboardPanelType;
  readonly layoutVariant: DashboardLayoutVariant;
  readonly sectionId: string;
  readonly order: number;
  readonly query?: DashboardQuerySpec;
  readonly layout: DashboardLayout;
  readonly title?: string;
  readonly description?: string;
  readonly titleIcon?: string;
  readonly icon?: string;
  readonly dataSource?: string;
  readonly dataKey?: string;
}

export interface ChartPanelSpecKeys {
  readonly xKey?: string;
  readonly yKey?: string;
  readonly yPrefix?: string;
  readonly yDecimals?: number;
  readonly stacked?: boolean;
  readonly color?: string;
  readonly datasetLabel?: string;
  // Per-widget render hints for the metrics builder variant.
  readonly legend?: boolean;
  readonly smooth?: boolean;
}

export interface TablePanelSpecKeys {
  readonly columns?: DashboardTableColumn[];
  readonly drawerAction?: DashboardDrawerAction;
}

export interface StatPanelSpecKeys {
  readonly valueField?: string;
  readonly valueKey?: string;
  readonly valueKeys?: string[];
  readonly formatter?: string;
  readonly targetThreshold?: number;
  readonly summaryFields?: DashboardStatSummaryField[];
}

export interface ListPanelSpecKeys {
  readonly listSortField?: string;
  readonly listType?: string;
  readonly listTitle?: string;
  readonly groupByKey?: string;
  readonly labelKey?: string;
  readonly endpointDataSource?: string;
  readonly endpointMetricsSource?: string;
  readonly endpointListType?: string;
  readonly bucketKey?: string;
}

export interface DashboardPanelSpec
  extends BasePanelSpec,
    ChartPanelSpecKeys,
    TablePanelSpecKeys,
    StatPanelSpecKeys,
    ListPanelSpecKeys {}

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
