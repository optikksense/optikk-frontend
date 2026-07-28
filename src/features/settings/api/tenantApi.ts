import api from "@/shared/api/http/client";
import { API_CONFIG } from "@config/apiConfig";

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

export interface RotateApiKeyResponse {
  readonly id: number;
  readonly name: string;
  readonly active: boolean;
                                                                       
  readonly apiKey: string;
  readonly apiKeyPrefix: string;
}

export async function rotateApiKey(): Promise<RotateApiKeyResponse> {
  return api.post<RotateApiKeyResponse>(`${V1}/settings/api-key/rotate`);
}
