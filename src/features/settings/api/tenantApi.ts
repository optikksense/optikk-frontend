import api from "@/shared/api/http/client";
import { API_CONFIG } from "@config/apiConfig";
import { unwrapEnvelope } from "@shared/api/utils/unwrapEnvelope";

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

export interface RotateApiKeyResponse {
  readonly id: number;
  readonly name: string;
  readonly active: boolean;
  /** Raw key — present only in this response and never shown again. */
  readonly api_key: string;
  readonly api_key_prefix: string;
}

export async function rotateApiKey(): Promise<RotateApiKeyResponse> {
  const raw = await api.post<unknown>(`${V1}/settings/api-key/rotate`);
  return unwrapEnvelope<RotateApiKeyResponse>(raw);
}
