import type {
  FormulaDefinition,
  MetricQueryDefinition,
  MetricSpaceAggregation,
  TimeStep,
} from "@shared/metrics/types";

export type DashboardDrawerEntity =
  | "databaseSystem"
  | "deployment"
  | "errorGroup"
  | "kafkaGroup"
  | "kafkaTopic"
  | "node"
  | "redisInstance"
  | "service";
// Panel types and layout variants the metrics widget builder produces; the
// backend validator accepts exactly these (see dashboards/endpoints.go).
const DASHBOARD_PANEL_TYPES = [
  "metrics-timeseries",
  "metrics-value",
  "metrics-toplist",
  "metrics-table",
] as const;
export type DashboardPanelType = (typeof DASHBOARD_PANEL_TYPES)[number];
const DASHBOARD_LAYOUT_VARIANTS = ["standard-chart", "kpi", "ranking", "detail-table"] as const;
export type DashboardLayoutVariant = (typeof DASHBOARD_LAYOUT_VARIANTS)[number];

export interface DashboardLayout {
  x: number;
  y: number;

  w: number;

  h: number;
}

/** SigNoz-style builder query replayed through the metrics explorer engine. */
export interface DashboardMetricsQuerySpec {
  kind: "metrics";
  step: TimeStep;
  spaceAggregation: MetricSpaceAggregation;
  queries: MetricQueryDefinition[];
  formulas?: FormulaDefinition[];
}

export type DashboardQuerySpec = DashboardMetricsQuerySpec;

/** Narrows a widget query to the metrics builder variant. */
export function isMetricsQuerySpec(
  query: DashboardQuerySpec | undefined
): query is DashboardMetricsQuerySpec {
  return query != null && "kind" in query && query.kind === "metrics";
}

export interface DashboardDrawerAction {
  entity: DashboardDrawerEntity;
  idField: string;
  titleField?: string;
}

/** A saved metrics-builder widget: what the builder writes and the card reads. */
export interface DashboardPanelSpec {
  readonly id: string;
  readonly panelType: DashboardPanelType;
  readonly layoutVariant: DashboardLayoutVariant;
  readonly sectionId: string;
  readonly order: number;
  readonly query?: DashboardQuerySpec;
  readonly layout: DashboardLayout;
  readonly title?: string;
  readonly dataSource?: string;
  /** Per-widget render hints. */
  readonly legend?: boolean;
  readonly smooth?: boolean;
}
