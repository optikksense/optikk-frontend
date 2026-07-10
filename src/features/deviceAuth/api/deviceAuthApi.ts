import api from "@/shared/api/http/client";
import { API_CONFIG } from "@config/apiConfig";

// Approves a CLI device-login by binding its user_code to the current session.
export function approveDevice(userCode: string): Promise<{ message: string }> {
  return api.post<{ message: string }>(API_CONFIG.ENDPOINTS.AUTH.DEVICE_APPROVE, {
    user_code: userCode,
  });
}
