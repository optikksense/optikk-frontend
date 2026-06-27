import api from "@/shared/api/api/client";
import type {
  DashboardLayout,
  DashboardLayoutVariant,
  DashboardPanelSpec,
  DashboardPanelType,
} from "@/types/dashboardConfig";
import { API_CONFIG } from "@config/apiConfig";
import { unwrapEnvelope } from "@shared/api/utils/unwrapEnvelope";

const PAGES = API_CONFIG.ENDPOINTS.DASHBOARDS.PAGES;

export interface DashboardPageOwner {
  readonly name: string;
  readonly initials: string;
}

export interface DashboardPage {
  readonly id: number;
  readonly name: string;
  readonly description?: string;
  readonly icon: string;
  readonly icon_color: string;
  readonly tags: string[];
  readonly is_favorite: boolean;
  readonly widget_count: number;
  readonly owner?: DashboardPageOwner;
  readonly created_at: string;
  readonly updated_at?: string;
}

/** A persisted Dashboard (widget): its full definition round-trips via spec. */
export interface Dashboard {
  readonly id: number;
  readonly page_id: number;
  readonly title?: string;
  readonly panel_type: DashboardPanelType;
  readonly layout_variant?: DashboardLayoutVariant;
  readonly spec: DashboardPanelSpec;
  readonly layout: DashboardLayout;
  readonly position: number;
  readonly created_at: string;
  readonly updated_at?: string;
}

export interface DashboardPageDetail extends DashboardPage {
  readonly widgets: Dashboard[];
}

export interface DashboardPageListResponse {
  readonly items: DashboardPage[];
  readonly total: number;
}

export interface ListDashboardPagesParams {
  readonly q?: string;
  readonly favorite?: boolean;
  readonly tag?: string;
  readonly limit?: number;
  readonly offset?: number;
}

export interface CreateDashboardPagePayload {
  name: string;
  description?: string;
  icon?: string;
  icon_color?: string;
  tags?: string[];
  is_favorite?: boolean;
}

export interface CreateWidgetPayload {
  title?: string;
  panel_type: DashboardPanelType;
  layout_variant?: DashboardLayoutVariant;
  spec: DashboardPanelSpec;
  layout: DashboardLayout;
  position?: number;
}

export async function listDashboardPages(
  params: ListDashboardPagesParams = {}
): Promise<DashboardPageListResponse> {
  const raw = await api.get<unknown>(PAGES, { params });
  return unwrapEnvelope<DashboardPageListResponse>(raw);
}

export async function getDashboardPage(id: number): Promise<DashboardPageDetail> {
  const raw = await api.get<unknown>(`${PAGES}/${id}`);
  return unwrapEnvelope<DashboardPageDetail>(raw);
}

export async function createDashboardPage(
  payload: CreateDashboardPagePayload
): Promise<DashboardPage> {
  const raw = await api.post<unknown>(PAGES, payload);
  return unwrapEnvelope<DashboardPage>(raw);
}

export async function updateDashboardPage(
  id: number,
  payload: CreateDashboardPagePayload
): Promise<DashboardPage> {
  const raw = await api.put<unknown>(`${PAGES}/${id}`, payload);
  return unwrapEnvelope<DashboardPage>(raw);
}

export async function deleteDashboardPage(id: number): Promise<void> {
  await api.delete<unknown>(`${PAGES}/${id}`);
}

export async function listWidgets(pageId: number): Promise<Dashboard[]> {
  const raw = await api.get<unknown>(`${PAGES}/${pageId}/dashboards`);
  return unwrapEnvelope<{ items: Dashboard[] }>(raw).items;
}

export async function createWidget(
  pageId: number,
  payload: CreateWidgetPayload
): Promise<Dashboard> {
  const raw = await api.post<unknown>(`${PAGES}/${pageId}/dashboards`, payload);
  return unwrapEnvelope<Dashboard>(raw);
}

export async function updateWidget(
  pageId: number,
  widgetId: number,
  payload: CreateWidgetPayload
): Promise<Dashboard> {
  const raw = await api.put<unknown>(`${PAGES}/${pageId}/dashboards/${widgetId}`, payload);
  return unwrapEnvelope<Dashboard>(raw);
}

export async function deleteWidget(pageId: number, widgetId: number): Promise<void> {
  await api.delete<unknown>(`${PAGES}/${pageId}/dashboards/${widgetId}`);
}
