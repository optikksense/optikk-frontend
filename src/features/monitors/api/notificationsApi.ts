import api from "@/shared/api/api/client";
import { API_CONFIG } from "@config/apiConfig";
import { unwrapEnvelope } from "@shared/api/utils/unwrapEnvelope";

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

export type ChannelType =
  | "slack"
  | "pagerduty"
  | "opsgenie"
  | "teams"
  | "email"
  | "webhook"
  | "jira";

export interface Channel {
  readonly id: number;
  readonly type: ChannelType;
  readonly name: string;
  readonly config: Record<string, unknown>;
  readonly status: "ok" | "warn" | "muted";
  readonly used_by_count: number;
  readonly last_used_at?: string;
  readonly last_delivery_at?: string;
  readonly last_error_text?: string;
  readonly created_at: string;
}

export interface Integration {
  readonly id: string;
  readonly name: string;
  readonly desc: string;
  readonly status: "connected" | "not_connected";
  readonly count: number;
  readonly color: string;
}

export interface Policy {
  readonly id: number;
  readonly name: string;
  readonly match_dsl: string;
  readonly actions: unknown[];
  readonly hits_30d: number;
  readonly last_used_at?: string;
  readonly enabled: boolean;
  readonly position: number;
  readonly created_at: string;
}

export interface Template {
  readonly id: number;
  readonly name: string;
  readonly description?: string;
  readonly body: string;
  readonly used_count: number;
  readonly created_at: string;
}

// Channels ------------------------------------------------------------------

export async function listChannels(): Promise<Channel[]> {
  const raw = await api.get<unknown>(`${V1}/notifications/channels`);
  return unwrapEnvelope<Channel[]>(raw);
}

export interface CreateChannelPayload {
  type: ChannelType;
  name: string;
  config: Record<string, unknown>;
}
export async function createChannel(payload: CreateChannelPayload): Promise<Channel> {
  const raw = await api.post<unknown>(`${V1}/notifications/channels`, payload);
  return unwrapEnvelope<Channel>(raw);
}

export async function updateChannel(id: number, payload: CreateChannelPayload): Promise<Channel> {
  const raw = await api.put<unknown>(`${V1}/notifications/channels/${id}`, payload);
  return unwrapEnvelope<Channel>(raw);
}

export async function deleteChannel(id: number): Promise<void> {
  await api.delete<unknown>(`${V1}/notifications/channels/${id}`);
}

export async function testChannel(id: number): Promise<{ ok: boolean; error_text?: string }> {
  const raw = await api.post<unknown>(`${V1}/notifications/channels/${id}/test`, {});
  return unwrapEnvelope(raw);
}

// Integrations -------------------------------------------------------------

export async function listIntegrations(): Promise<Integration[]> {
  const raw = await api.get<unknown>(`${V1}/notifications/integrations`);
  return unwrapEnvelope<Integration[]>(raw);
}

// Policies -----------------------------------------------------------------

export async function listPolicies(): Promise<Policy[]> {
  const raw = await api.get<unknown>(`${V1}/notifications/policies`);
  return unwrapEnvelope<Policy[]>(raw);
}

export interface CreatePolicyPayload {
  name: string;
  match_dsl: string;
  actions: unknown[];
  enabled?: boolean;
  position?: number;
}
export async function createPolicy(payload: CreatePolicyPayload): Promise<Policy> {
  const raw = await api.post<unknown>(`${V1}/notifications/policies`, payload);
  return unwrapEnvelope<Policy>(raw);
}
export async function updatePolicy(id: number, payload: CreatePolicyPayload): Promise<Policy> {
  const raw = await api.put<unknown>(`${V1}/notifications/policies/${id}`, payload);
  return unwrapEnvelope<Policy>(raw);
}
export async function deletePolicy(id: number): Promise<void> {
  await api.delete<unknown>(`${V1}/notifications/policies/${id}`);
}

// Templates ----------------------------------------------------------------

export async function listTemplates(): Promise<Template[]> {
  const raw = await api.get<unknown>(`${V1}/notifications/templates`);
  return unwrapEnvelope<Template[]>(raw);
}

export interface CreateTemplatePayload {
  name: string;
  description?: string;
  body: string;
}
export async function createTemplate(payload: CreateTemplatePayload): Promise<Template> {
  const raw = await api.post<unknown>(`${V1}/notifications/templates`, payload);
  return unwrapEnvelope<Template>(raw);
}
export async function updateTemplate(
  id: number,
  payload: CreateTemplatePayload
): Promise<Template> {
  const raw = await api.put<unknown>(`${V1}/notifications/templates/${id}`, payload);
  return unwrapEnvelope<Template>(raw);
}
export async function deleteTemplate(id: number): Promise<void> {
  await api.delete<unknown>(`${V1}/notifications/templates/${id}`);
}
