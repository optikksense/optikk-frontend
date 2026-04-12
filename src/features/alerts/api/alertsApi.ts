import { api } from "@shared/api/api/client";

import type {
  AlertBacktestResult,
  AlertActivityEntry,
  AlertEvent,
  AlertIncident,
  AlertPreview,
  AlertRule,
  AlertRulePayload,
  AlertSilence,
  AlertSlackTestResult,
  AlertTestResult,
} from "../types";

const BASE = "/api/v1/alerts";

export interface ListRulesParams {
  readonly teamId?: number | null;
}

export interface BacktestParams {
  readonly from: string;
  readonly to: string;
}

export interface ListIncidentsParams {
  readonly state?: "firing" | "resolved" | "all";
  readonly teamId?: number | null;
}

export const alertsApi = {
  listRules(params: ListRulesParams = {}): Promise<AlertRule[]> {
    return api.get<AlertRule[]>(`${BASE}/rules`, { params });
  },

  getRule(id: string): Promise<AlertRule> {
    return api.get<AlertRule>(`${BASE}/rules/${id}`);
  },

  createRule(payload: AlertRulePayload): Promise<AlertRule> {
    return api.post<AlertRule>(`${BASE}/rules`, payload);
  },

  updateRule(id: string, payload: Partial<AlertRulePayload>): Promise<AlertRule> {
    return api.request<AlertRule>({
      url: `${BASE}/rules/${id}`,
      method: "PATCH",
      data: payload,
    });
  },

  previewRule(payload: AlertRulePayload): Promise<AlertPreview> {
    return api.post<AlertPreview>(`${BASE}/rules/preview`, payload);
  },

  deleteRule(id: string): Promise<void> {
    return api.delete<void>(`${BASE}/rules/${id}`);
  },

  muteRule(id: string, until: string | null): Promise<AlertRule> {
    return api.post<AlertRule>(`${BASE}/rules/${id}/mute`, { until });
  },

  testRule(id: string): Promise<AlertTestResult> {
    return api.post<AlertTestResult>(`${BASE}/rules/${id}/test`, {});
  },

  backtestRule(id: string, params: BacktestParams): Promise<AlertBacktestResult> {
    return api.post<AlertBacktestResult>(`${BASE}/rules/${id}/backtest`, {
      from_ms: new Date(params.from).getTime(),
      to_ms: new Date(params.to).getTime(),
      step_ms: 15 * 60 * 1000,
    });
  },

  ruleAudit(id: string): Promise<AlertEvent[]> {
    return api.get<AlertEvent[]>(`${BASE}/rules/${id}/audit`);
  },

  listIncidents(params: ListIncidentsParams = {}): Promise<AlertIncident[]> {
    return api.get<AlertIncident[]>(`${BASE}/incidents`, { params });
  },

  listActivity(limit = 100): Promise<AlertActivityEntry[]> {
    return api.get<AlertActivityEntry[]>(`${BASE}/activity`, { params: { limit } });
  },

  ackInstance(alertId: string, instanceKey: string, until?: string | null): Promise<void> {
    return api.post<void>(`${BASE}/instances/${alertId}/ack`, {
      instance_key: instanceKey,
      until,
    });
  },

  snoozeInstance(alertId: string, instanceKey: string, minutes: number): Promise<void> {
    return api.post<void>(`${BASE}/instances/${alertId}/snooze`, {
      instance_key: instanceKey,
      minutes,
    });
  },

  listSilences(): Promise<AlertSilence[]> {
    return api.get<AlertSilence[]>(`${BASE}/silences`);
  },

  createSilence(silence: AlertSilence & { alert_id: string }): Promise<AlertSilence> {
    return api.post<AlertSilence>(`${BASE}/silences`, silence);
  },

  updateSilence(
    id: string,
    alertId: string,
    silence: Partial<AlertSilence>
  ): Promise<AlertSilence> {
    return api.request<AlertSilence>({
      url: `${BASE}/silences/${id}?alertId=${encodeURIComponent(alertId)}`,
      method: "PATCH",
      data: silence,
    });
  },

  deleteSilence(id: string, alertId: string): Promise<void> {
    return api.delete<void>(`${BASE}/silences/${id}?alertId=${encodeURIComponent(alertId)}`);
  },

  testSlack(rule: AlertRulePayload): Promise<AlertSlackTestResult> {
    return api.post<AlertSlackTestResult>(`${BASE}/slack/test`, { rule });
  },
};
