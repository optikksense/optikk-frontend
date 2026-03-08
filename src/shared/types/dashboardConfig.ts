/**
 *
 */
export type DashboardDataSources = Record<string, any>;

/**
 *
 */
export type DashboardExtraContext = Record<string, any>;

/**
 *
 */
export interface DashboardLayout {
  col?: number;
  [key: string]: any;
}

/**
 *
 */
export interface DashboardQuerySpec extends Record<string, any> {
  method: string;
  endpoint: string;
  params?: Record<string, string | number | boolean>;
}

/**
 *
 */
export interface DashboardComponentSpec extends Record<string, any> {
  id: string;
  componentKey: string;
  order: number;
  query?: DashboardQuerySpec;
  layout?: DashboardLayout;
  title?: string;
  titleIcon?: string;
  dataSource?: string;
  type?: string;
  key?: string;
}

/**
 *
 */
export interface DefaultConfigPage {
  id: string;
  path: string;
  label: string;
  icon: string;
  group: string;
  order: number;
  defaultTabId: string;
  navigable: boolean;
  title?: string;
  subtitle?: string;
}

/**
 *
 */
export interface DefaultConfigTab {
  id: string;
  pageId: string;
  label: string;
  order: number;
}

/**
 *
 */
export interface DataSourceSpec {
  id: string;
  endpoint: string;
  params?: Record<string, string | number>;
}

/**
 *
 */
export interface StatCardSpec {
  title: string;
  dataSource: string;
  valueField: string;
  formatter?: 'ms' | 'bytes' | 'percent1' | 'number';
  icon?: string;
}

/**
 *
 */
export interface TabSpec {
  id: string;
  label: string;
  dataSources: DataSourceSpec[];
  statCards?: StatCardSpec[];
  charts: DashboardComponentSpec[];
}

/**
 *
 */
export interface DashboardRenderConfig extends Record<string, any> {
  components: DashboardComponentSpec[];
}
