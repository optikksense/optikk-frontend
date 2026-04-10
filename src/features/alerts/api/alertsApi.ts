// API client for the alerting module.
// Routes mirror `internal/modules/alerting/handler.go` in optikk-backend
// (see plan: jazzy-exploring-mccarthy.md → "Endpoints").
// Backend is being built in parallel — this client is aligned with the
// documented contract and is safe to wire against mocks in the meantime.

import { api } from "@shared/api/api/client";

import type {
  AlertBacktestResult,
  AlertEvent,
  AlertIncident,
  AlertRule,
  AlertRulePayload,
  AlertSilence,
  AlertTestResult,
} from "../types";

const BASE = "/api/v1/alerts";

export interface ListRulesParams {
  readonly teamId?: number | null;
  readonly state?: string;
  readonly enabled?: boolean;
}

export interface BacktestParams {
  readonly from: string;
  readonly to: string;
}

export interface ListIncidentsParams {
  readonly state?: "firing" | "resolved" | "all";
  readonly teamId?: number | null;
}

export interface SlackCallbackPayload {
  readonly payload: string;
  readonly signature?: string;
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

  deleteRule(id: string): Promise<void> {
    return api.delete<void>(`${BASE}/rules/${id}`);
  },

  muteRule(id: string, until: string | null): Promise<AlertRule> {
    return api.post<AlertRule>(`${BASE}/rules/${id}/mute`, { until });
  },

  testRule(id: string): Promise<AlertTestResult> {
    return api.post<AlertTestResult>(`${BASE}/rules/${id}/test`, {});
  },

  testPayload(payload: AlertRulePayload): Promise<AlertTestResult> {
    // Convenience: lets the builder preview a rule that hasn't been saved yet.
    return api.post<AlertTestResult>(`${BASE}/rules/test`, payload);
  },

  backtestRule(id: string, params: BacktestParams): Promise<AlertBacktestResult> {
    return api.post<AlertBacktestResult>(`${BASE}/rules/${id}/backtest`, params);
  },

  ruleAudit(id: string): Promise<AlertEvent[]> {
    return api.get<AlertEvent[]>(`${BASE}/rules/${id}/audit`);
  },

  listIncidents(params: ListIncidentsParams = {}): Promise<AlertIncident[]> {
    return api.get<AlertIncident[]>(`${BASE}/incidents`, { params });
  },

  ackInstance(instanceId: string, until?: string | null): Promise<void> {
    return api.post<void>(`${BASE}/instances/${instanceId}/ack`, { until });
  },

  snoozeInstance(instanceId: string, minutes: number): Promise<void> {
    return api.post<void>(`${BASE}/instances/${instanceId}/snooze`, { minutes });
  },

  listSilences(): Promise<AlertSilence[]> {
    return api.get<AlertSilence[]>(`${BASE}/silences`);
  },

  createSilence(silence: AlertSilence): Promise<AlertSilence> {
    return api.post<AlertSilence>(`${BASE}/silences`, silence);
  },

  updateSilence(id: string, silence: Partial<AlertSilence>): Promise<AlertSilence> {
    return api.request<AlertSilence>({
      url: `${BASE}/silences/${id}`,
      method: "PATCH",
      data: silence,
    });
  },

  deleteSilence(id: string): Promise<void> {
    return api.delete<void>(`${BASE}/silences/${id}`);
  },

  // Slack action button callback — the Slack client POSTs the signed payload
  // to this URL; exposed here for completeness and for local replay tooling.
  slackCallback(payload: SlackCallbackPayload): Promise<void> {
    return api.post<void>(`${BASE}/callback/slack`, payload);
  },

  testSlackWebhook(webhookUrl: string): Promise<{ delivered: boolean; error?: string }> {
    return api.post<{ delivered: boolean; error?: string }>(`${BASE}/test-slack`, {
      webhookUrl,
    });
  },
};
