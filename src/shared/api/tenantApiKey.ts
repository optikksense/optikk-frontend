import api from "@/shared/api/http/client";
import { API_CONFIG } from "@config/apiConfig";

export interface RotateApiKeyResponse {
  readonly id: number;
  readonly name: string;
  readonly active: boolean;
  /** The new key in plaintext — shown once, never retrievable again. */
  readonly apiKey: string;
  readonly apiKeyPrefix: string;
}

/** Rotates the tenant ingest API key (admin only). */
export async function rotateApiKey(): Promise<RotateApiKeyResponse> {
  return api.post<RotateApiKeyResponse>(`${API_CONFIG.ENDPOINTS.V1_BASE}/settings/api-key/rotate`);
}
