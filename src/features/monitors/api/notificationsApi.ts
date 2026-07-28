import api from "@/shared/api/http/client";
import { API_CONFIG } from "@config/apiConfig";

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

type ChannelType = "slack";

export interface Channel {
  readonly id: number;
  readonly type: string;
  readonly name: string;
  readonly config: Record<string, unknown>;
  readonly status: "ok" | "warn" | "muted";
  readonly usedByCount: number;
  readonly lastUsedAt?: string;
  readonly lastDeliveryAt?: string;
  readonly lastErrorText?: string;
  readonly createdAt: string;
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
  readonly matchDsl: string;
  readonly actions: unknown[];
  readonly hits30d: number;
  readonly lastUsedAt?: string;
  readonly enabled: boolean;
  readonly position: number;
  readonly createdAt: string;
}

export interface Template {
  readonly id: number;
  readonly name: string;
  readonly description?: string;
  readonly body: string;
  readonly usedCount: number;
  readonly createdAt: string;
}

// Channels ------------------------------------------------------------------

export async function listChannels(): Promise<Channel[]> {
  return api.get<Channel[]>(`${V1}/notifications/channels`);
}

export interface CreateChannelPayload {
  type: ChannelType;
  name: string;
  config: Record<string, unknown>;
}
export async function createChannel(payload: CreateChannelPayload): Promise<Channel> {
  return api.post<Channel>(`${V1}/notifications/channels`, payload);
}

export async function updateChannel(id: number, payload: CreateChannelPayload): Promise<Channel> {
  return api.put<Channel>(`${V1}/notifications/channels/${id}`, payload);
}

export async function deleteChannel(id: number): Promise<void> {
  await api.delete<unknown>(`${V1}/notifications/channels/${id}`);
}

export async function testChannel(id: number): Promise<{ ok: boolean; errorText?: string }> {
  return api.post<{ ok: boolean; errorText?: string }>(
    `${V1}/notifications/channels/${id}/test`,
    {}
  );
}

export async function listIntegrations(): Promise<Integration[]> {
  return api.get<Integration[]>(`${V1}/notifications/integrations`);
}

export async function listPolicies(): Promise<Policy[]> {
  return api.get<Policy[]>(`${V1}/notifications/policies`);
}

export interface CreatePolicyPayload {
  name: string;
  matchDsl: string;
  actions: unknown[];
  enabled?: boolean;
  position?: number;
}
export async function createPolicy(payload: CreatePolicyPayload): Promise<Policy> {
  return api.post<Policy>(`${V1}/notifications/policies`, payload);
}
export async function updatePolicy(id: number, payload: CreatePolicyPayload): Promise<Policy> {
  return api.put<Policy>(`${V1}/notifications/policies/${id}`, payload);
}
export async function deletePolicy(id: number): Promise<void> {
  await api.delete<unknown>(`${V1}/notifications/policies/${id}`);
}

export async function listTemplates(): Promise<Template[]> {
  return api.get<Template[]>(`${V1}/notifications/templates`);
}

export interface CreateTemplatePayload {
  name: string;
  description?: string;
  body: string;
}
export async function createTemplate(payload: CreateTemplatePayload): Promise<Template> {
  return api.post<Template>(`${V1}/notifications/templates`, payload);
}
export async function updateTemplate(
  id: number,
  payload: CreateTemplatePayload
): Promise<Template> {
  return api.put<Template>(`${V1}/notifications/templates/${id}`, payload);
}
export async function deleteTemplate(id: number): Promise<void> {
  await api.delete<unknown>(`${V1}/notifications/templates/${id}`);
}
