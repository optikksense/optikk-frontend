export type DashboardDataSources = Record<string, any>;

export type DashboardExtraContext = Record<string, any>;

export interface DashboardLayout {
  col?: number;
  [key: string]: any;
}

export interface DashboardComponentSpec extends Record<string, any> {
  id: string;
  componentKey: string;
  layout?: DashboardLayout;
  title?: string;
  titleIcon?: string;
  type?: string;
  key?: string;
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
  charts: DashboardComponentSpec[];
}

export interface DashboardRenderConfig extends Record<string, any> {
  components: DashboardComponentSpec[];
  tabs?: TabSpec[];
  dataSources?: DataSourceSpec[];
  statCards?: StatCardSpec[];
}

export interface DashboardConfigApiResponse extends Record<string, any> {
  pageId?: string;
  configYaml?: string;
  components?: unknown;
  charts?: unknown;
}

export interface DashboardPagesResponse {
  pages?: string[];
}
