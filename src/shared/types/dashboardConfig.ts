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
export const DASHBOARD_SCHEMA_VERSION = 1 as const;
export type DashboardSchemaVersion = typeof DASHBOARD_SCHEMA_VERSION;

export type DashboardRenderMode = 'dashboard' | 'explorer';
export type DashboardSectionKind = 'summary' | 'trends' | 'breakdowns' | 'details';
export type DashboardSectionLayoutMode = 'kpi-strip' | 'two-up' | 'three-up' | 'stack';
export type DashboardPanelPreset = 'kpi' | 'trend' | 'hero' | 'breakdown' | 'detail';
export const DASHBOARD_PANEL_TYPES = [
  'ai-bar',
  'ai-line',
  'bar',
  'db-systems-overview',
  'error-rate',
  'exception-type-line',
  'gauge',
  'heatmap',
  'latency',
  'latency-heatmap',
  'latency-histogram',
  'log-histogram',
  'pie',
  'request',
  'scorecard',
  'service-health-grid',
  'service-map',
  'slo-indicators',
  'stat-card',
  'stat-cards-grid',
  'stat-summary',
  'table',
  'trace-waterfall',
] as const;
export type DashboardPanelType = (typeof DASHBOARD_PANEL_TYPES)[number];

export interface DashboardLayout {
  preset: DashboardPanelPreset;
  h?: number;
  x?: number;
  y?: number;
  w?: number;
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
  kind: DashboardSectionKind;
  layoutMode: DashboardSectionLayoutMode;
  collapsible: boolean;
}

export interface DashboardStatSummaryField {
  label: string;
  field?: string;
  keys?: string[];
}

export interface DashboardPanelSpec {
  id: string;
  panelType: DashboardPanelType;
  sectionId?: string;
  order: number;
  query?: DashboardQuerySpec;
  layout?: DashboardLayout;
  title?: string;
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
  drilldownRoute?: string;
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
  formatter?: 'ms' | 'bytes' | 'percent1' | 'number';
  icon?: string;
}

export interface TabSpec {
  id: string;
  label: string;
  dataSources: DataSourceSpec[];
  statCards?: StatCardSpec[];
  charts: DashboardPanelSpec[];
}
