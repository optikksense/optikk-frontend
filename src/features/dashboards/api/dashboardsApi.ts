import api from "@/shared/api/http/client";
import { API_CONFIG } from "@config/apiConfig";
import type {
  DashboardLayout,
  DashboardLayoutVariant,
  DashboardPanelSpec,
  DashboardPanelType,
} from "@shared/types/dashboardConfig";
import { z } from "zod";

const PAGES = API_CONFIG.ENDPOINTS.DASHBOARDS.PAGES;

interface DashboardPageOwner {
  readonly name: string;
  readonly initials: string;
}

export interface DashboardPage {
  readonly id: number;
  readonly name: string;
  readonly description?: string;
  readonly icon: string;
  readonly iconColor: string;
  readonly tags: string[];
  readonly isFavorite: boolean;
  readonly widgetCount: number;
  readonly owner?: DashboardPageOwner;
  readonly createdAt: string;
  readonly updatedAt?: string;
}

/** A persisted Dashboard (widget): its full definition round-trips via spec. */
export interface Dashboard {
  readonly id: number;
  readonly pageId: number;
  readonly title?: string;
  readonly panelType: DashboardPanelType;
  readonly layoutVariant?: DashboardLayoutVariant;
  readonly spec: DashboardPanelSpec;
  readonly layout: DashboardLayout;
  readonly position: number;
  readonly createdAt: string;
  readonly updatedAt?: string;
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
  iconColor?: string;
  tags?: string[];
  isFavorite?: boolean;
}

export interface CreateWidgetPayload {
  title?: string;
  panelType: DashboardPanelType;
  layoutVariant?: DashboardLayoutVariant;
  spec: DashboardPanelSpec;
  layout: DashboardLayout;
  position?: number;
}

const legacySpecSchema = z.object({ type: z.string() }).passthrough();

function normalizeWidget(widget: Dashboard): Dashboard {
  const parsed = legacySpecSchema.safeParse(widget.spec);
  const legacyType = parsed.success ? parsed.data.type : undefined;

  return {
    ...widget,
    spec: {
      ...widget.spec,
      panelType: widget.spec.panelType || legacyType || widget.panelType,
      layoutVariant: widget.spec.layoutVariant || widget.layoutVariant,
      layout: widget.spec.layout || widget.layout,
      title: widget.spec.title || widget.title,
    },
  };
}

export async function listDashboardPages(
  params: ListDashboardPagesParams = {}
): Promise<DashboardPageListResponse> {
  return api.get<DashboardPageListResponse>(PAGES, { params });
}

export async function getDashboardPage(id: number): Promise<DashboardPageDetail> {
  const detail = await api.get<DashboardPageDetail>(`${PAGES}/${id}`);
  return {
    ...detail,
    widgets: (detail.widgets || []).map(normalizeWidget),
  };
}

export async function createDashboardPage(
  payload: CreateDashboardPagePayload
): Promise<DashboardPage> {
  return api.post<DashboardPage>(PAGES, payload);
}

export async function updateDashboardPage(
  id: number,
  payload: CreateDashboardPagePayload
): Promise<DashboardPage> {
  return api.put<DashboardPage>(`${PAGES}/${id}`, payload);
}

export async function deleteDashboardPage(id: number): Promise<void> {
  await api.delete<unknown>(`${PAGES}/${id}`);
}

export async function createWidget(
  pageId: number,
  payload: CreateWidgetPayload
): Promise<Dashboard> {
  const dashboard = await api.post<Dashboard>(`${PAGES}/${pageId}/dashboards`, payload);
  return normalizeWidget(dashboard);
}

export async function updateWidget(
  pageId: number,
  widgetId: number,
  payload: CreateWidgetPayload
): Promise<Dashboard> {
  const dashboard = await api.put<Dashboard>(`${PAGES}/${pageId}/dashboards/${widgetId}`, payload);
  return normalizeWidget(dashboard);
}

export async function deleteWidget(pageId: number, widgetId: number): Promise<void> {
  await api.delete<unknown>(`${PAGES}/${pageId}/dashboards/${widgetId}`);
}
