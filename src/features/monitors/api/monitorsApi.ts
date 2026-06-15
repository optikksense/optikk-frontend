import api from "@/shared/api/api/client";
import { API_CONFIG } from "@config/apiConfig";
import { unwrapEnvelope } from "@shared/api/utils/unwrapEnvelope";

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

export type MonitorType = "metric" | "apm" | "log";
export type MonitorPriority = "P1" | "P2" | "P3" | "P4";
export type MonitorStatus = "alert" | "warn" | "ok" | "no_data";

export interface ScopeTag {
  readonly key: string;
  readonly value: string;
}
export interface MonitorScope {
  readonly tags?: ScopeTag[];
}

export interface MetricQueryShape {
  readonly metric: string;
  readonly aggregation: string;
  readonly window_sec: number;
}
export interface APMQueryShape {
  readonly service: string;
  readonly resource?: string;
  readonly track: string;
  readonly window_sec: number;
}
export interface LogQueryShape {
  readonly query: string;
  readonly group_by?: string;
  readonly window_sec: number;
}
export interface MonitorQuery {
  readonly metric?: MetricQueryShape;
  readonly apm?: APMQueryShape;
  readonly log?: LogQueryShape;
}

export interface MonitorConditions {
  readonly comparator: "above" | "below" | "equal";
  readonly alert_threshold?: number;
  readonly warn_threshold?: number;
  readonly recovery_threshold?: number;
  readonly no_data_after_sec: number;
  readonly no_data_as?: "no_data" | "alert" | "ok";
  readonly min_sample?: number;
}

export interface MonitorNotifyTargets {
  readonly channel_ids: number[];
}

export interface Monitor {
  readonly id: number;
  readonly name: string;
  readonly type: MonitorType;
  readonly priority: MonitorPriority;
  readonly status: MonitorStatus;
  readonly current_value?: number;
  readonly scope: MonitorScope;
  readonly query: MonitorQuery;
  readonly conditions: MonitorConditions;
  readonly notify: MonitorNotifyTargets;
  readonly message_body?: string;
  readonly runbook_url?: string;
  readonly tags: string[];
  readonly eval_every_sec: number;
  readonly renotify_every_sec?: number;
  readonly muted_until?: string;
  readonly active: boolean;
  readonly last_evaluated_at?: string;
  readonly triggered_at?: string;
  readonly created_at: string;
  readonly updated_at?: string;
}

export interface MonitorListStatusCounts {
  readonly alert: number;
  readonly warn: number;
  readonly ok: number;
  readonly no_data: number;
  readonly muted: number;
  readonly total: number;
}

export interface MonitorListResponse {
  readonly items: Monitor[];
  readonly counts: MonitorListStatusCounts;
}

export interface MonitorEvent {
  readonly id: number;
  readonly monitor_id: number;
  readonly monitor_name: string;
  readonly kind: "triggered" | "recovered" | "acked" | "muted" | "test";
  readonly value?: number;
  readonly threshold?: number;
  readonly started_at: string;
  readonly ended_at?: string;
}

export interface SeriesPoint {
  readonly bucket_ms: number;
  readonly value: number;
}

export interface MonitorSeriesResponse {
  readonly points: SeriesPoint[];
  readonly alert_threshold?: number;
  readonly warn_threshold?: number;
  readonly recovery_threshold?: number;
}

export interface StatusBand {
  readonly status: MonitorStatus;
  readonly started_at: string;
  readonly ended_at: string;
}

export interface StatusTimelineResponse {
  readonly bands: StatusBand[];
  readonly started_at: string;
  readonly ended_at: string;
}

export interface ListMonitorsParams {
  readonly status?: MonitorStatus;
  readonly type?: MonitorType;
  readonly priority?: MonitorPriority;
  readonly muted?: boolean;
  readonly q?: string;
  readonly limit?: number;
  readonly offset?: number;
}

export async function listMonitors(params: ListMonitorsParams = {}): Promise<MonitorListResponse> {
  const raw = await api.get<unknown>(`${V1}/monitors`, { params });
  return unwrapEnvelope<MonitorListResponse>(raw);
}

export async function getMonitor(id: number): Promise<Monitor> {
  const raw = await api.get<unknown>(`${V1}/monitors/${id}`);
  return unwrapEnvelope<Monitor>(raw);
}

export interface CreateMonitorPayload {
  name: string;
  type: MonitorType;
  priority: MonitorPriority;
  scope: MonitorScope;
  query: MonitorQuery;
  conditions: MonitorConditions;
  notify: MonitorNotifyTargets;
  message_body?: string;
  runbook_url?: string;
  tags?: string[];
  eval_every_sec: number;
  renotify_every_sec?: number;
}

export async function createMonitor(payload: CreateMonitorPayload): Promise<Monitor> {
  const raw = await api.post<unknown>(`${V1}/monitors`, payload);
  return unwrapEnvelope<Monitor>(raw);
}

export async function updateMonitor(id: number, payload: CreateMonitorPayload): Promise<Monitor> {
  const raw = await api.put<unknown>(`${V1}/monitors/${id}`, payload);
  return unwrapEnvelope<Monitor>(raw);
}

export async function deleteMonitor(id: number): Promise<void> {
  await api.delete<unknown>(`${V1}/monitors/${id}`);
}

export async function ackMonitor(id: number): Promise<void> {
  await api.post<unknown>(`${V1}/monitors/${id}/ack`, {});
}

export async function muteMonitor(id: number, durationSec: number): Promise<void> {
  await api.post<unknown>(`${V1}/monitors/${id}/mute`, { duration_sec: durationSec });
}

export async function unmuteMonitor(id: number): Promise<void> {
  await api.post<unknown>(`${V1}/monitors/${id}/unmute`, {});
}

export async function testMonitor(id: number): Promise<{
  value: number;
  has_data: boolean;
  would_decide_as: string;
  threshold: number;
}> {
  const raw = await api.post<unknown>(`${V1}/monitors/${id}/test`, {});
  return unwrapEnvelope(raw);
}

export async function getMonitorSeries(
  id: number,
  windowMs: number
): Promise<MonitorSeriesResponse> {
  const raw = await api.get<unknown>(`${V1}/monitors/${id}/series`, {
    params: { window_ms: windowMs },
  });
  return unwrapEnvelope<MonitorSeriesResponse>(raw);
}

export async function getMonitorEvents(id: number, limit = 20): Promise<MonitorEvent[]> {
  const raw = await api.get<unknown>(`${V1}/monitors/${id}/events`, { params: { limit } });
  return unwrapEnvelope<MonitorEvent[]>(raw);
}

export async function getMonitorStatusTimeline(
  id: number,
  windowMs = 24 * 60 * 60 * 1000
): Promise<StatusTimelineResponse> {
  const raw = await api.get<unknown>(`${V1}/monitors/${id}/status-timeline`, {
    params: { window_ms: windowMs },
  });
  return unwrapEnvelope<StatusTimelineResponse>(raw);
}

export async function getMonitorsActivity(sinceMs?: number, limit = 20): Promise<MonitorEvent[]> {
  const params: Record<string, number> = { limit };
  if (sinceMs) params.since = sinceMs;
  const raw = await api.get<unknown>(`${V1}/monitors/activity`, { params });
  return unwrapEnvelope<MonitorEvent[]>(raw);
}
