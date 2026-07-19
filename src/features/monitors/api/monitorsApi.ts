import api from "@/shared/api/http/client";
import { API_CONFIG } from "@config/apiConfig";

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

export type MonitorType = "metric" | "apm" | "log";
export type MonitorPriority = "P1" | "P2" | "P3" | "P4";
export type MonitorStatus = "alert" | "warn" | "ok" | "no_data";

interface ScopeTag {
  readonly key: string;
  readonly value: string;
}
interface MonitorScope {
  readonly tags?: ScopeTag[];
}

export interface MetricQueryShape {
  readonly metric: string;
  readonly aggregation: string;
  readonly windowSec: number;
}
export interface APMQueryShape {
  readonly service: string;
  readonly resource?: string;
  readonly track: string;
  readonly windowSec: number;
}
export interface LogQueryShape {
  readonly query: string;
  readonly groupBy?: string;
  readonly windowSec: number;
}
interface MonitorQuery {
  readonly metric?: MetricQueryShape;
  readonly apm?: APMQueryShape;
  readonly log?: LogQueryShape;
}

export interface MonitorConditions {
  readonly comparator: "above" | "below" | "equal";
  readonly alertThreshold?: number;
  readonly warnThreshold?: number;
  readonly recoveryThreshold?: number;
  readonly noDataAfterSec: number;
  readonly noDataAs?: "no_data" | "alert" | "ok";
  readonly minSample?: number;
}

interface MonitorNotifyTargets {
  readonly channelIds: number[];
}

export interface Monitor {
  readonly id: number;
  readonly name: string;
  readonly type: MonitorType;
  readonly priority: MonitorPriority;
  readonly status: MonitorStatus;
  readonly currentValue?: number;
  readonly scope: MonitorScope;
  readonly query: MonitorQuery;
  readonly conditions: MonitorConditions;
  readonly notify: MonitorNotifyTargets;
  readonly messageBody?: string;
  readonly runbookUrl?: string;
  readonly tags: string[];
  readonly evalEverySec: number;
  readonly renotifyEverySec?: number;
  readonly mutedUntil?: string;
  readonly active: boolean;
  readonly lastEvaluatedAt?: string;
  readonly triggeredAt?: string;
  readonly createdAt: string;
  readonly updatedAt?: string;
}

export interface MonitorListStatusCounts {
  readonly alert: number;
  readonly warn: number;
  readonly ok: number;
  readonly noData: number;
  readonly muted: number;
  readonly total: number;
}

export interface MonitorListResponse {
  readonly items: Monitor[];
  readonly counts: MonitorListStatusCounts;
}

export interface MonitorEvent {
  readonly id: number;
  readonly monitorId: number;
  readonly monitorName: string;
  readonly kind: "triggered" | "recovered" | "acked" | "muted" | "test";
  readonly value?: number;
  readonly threshold?: number;
  readonly startedAt: string;
  readonly endedAt?: string;
}

interface SeriesPoint {
  readonly bucketMs: number;
  readonly value: number;
}

export interface MonitorSeriesResponse {
  readonly points: SeriesPoint[];
  readonly alertThreshold?: number;
  readonly warnThreshold?: number;
  readonly recoveryThreshold?: number;
}

interface StatusBand {
  readonly status: MonitorStatus;
  readonly startedAt: string;
  readonly endedAt: string;
}

export interface StatusTimelineResponse {
  readonly bands: StatusBand[];
  readonly startedAt: string;
  readonly endedAt: string;
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
  return api.get<MonitorListResponse>(`${V1}/monitors`, { params });
}

export async function getMonitor(id: number): Promise<Monitor> {
  return api.get<Monitor>(`${V1}/monitors/${id}`);
}

export interface CreateMonitorPayload {
  name: string;
  type: MonitorType;
  priority: MonitorPriority;
  scope: MonitorScope;
  query: MonitorQuery;
  conditions: MonitorConditions;
  notify: MonitorNotifyTargets;
  messageBody?: string;
  runbookUrl?: string;
  tags?: string[];
  evalEverySec: number;
  renotifyEverySec?: number;
}

export async function createMonitor(payload: CreateMonitorPayload): Promise<Monitor> {
  return api.post<Monitor>(`${V1}/monitors`, payload);
}

export async function updateMonitor(id: number, payload: CreateMonitorPayload): Promise<Monitor> {
  return api.put<Monitor>(`${V1}/monitors/${id}`, payload);
}

export async function deleteMonitor(id: number): Promise<void> {
  await api.delete<unknown>(`${V1}/monitors/${id}`);
}

export async function ackMonitor(id: number): Promise<void> {
  await api.post<unknown>(`${V1}/monitors/${id}/ack`, {});
}

export async function muteMonitor(id: number, durationSec: number): Promise<void> {
  await api.post<unknown>(`${V1}/monitors/${id}/mute`, { durationSec: durationSec });
}

export async function testMonitor(id: number): Promise<{
  value: number;
  hasData: boolean;
  wouldDecideAs: string;
  threshold: number;
}> {
  return api.post<{
    value: number;
    hasData: boolean;
    wouldDecideAs: string;
    threshold: number;
  }>(`${V1}/monitors/${id}/test`, {});
}

export async function getMonitorSeries(
  id: number,
  windowMs: number
): Promise<MonitorSeriesResponse> {
  return api.get<MonitorSeriesResponse>(`${V1}/monitors/${id}/series`, {
    params: { windowMs: windowMs },
  });
}

export async function getMonitorEvents(id: number, limit = 20): Promise<MonitorEvent[]> {
  return api.get<MonitorEvent[]>(`${V1}/monitors/${id}/events`, { params: { limit } });
}

export async function getMonitorStatusTimeline(
  id: number,
  windowMs = 24 * 60 * 60 * 1000
): Promise<StatusTimelineResponse> {
  return api.get<StatusTimelineResponse>(`${V1}/monitors/${id}/status-timeline`, {
    params: { windowMs: windowMs },
  });
}

export async function getMonitorsActivity(sinceMs?: number, limit = 20): Promise<MonitorEvent[]> {
  const params: Record<string, number> = { limit };
  if (sinceMs) params.since = sinceMs;
  return api.get<MonitorEvent[]>(`${V1}/monitors/activity`, { params });
}
