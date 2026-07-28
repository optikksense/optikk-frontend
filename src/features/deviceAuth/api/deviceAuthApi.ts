import api from "@/shared/api/http/client";
import { API_CONFIG } from "@config/apiConfig";

                                                                              
export function approveDevice(userCode: string): Promise<{ message: string }> {
  return api.post<{ message: string }>(API_CONFIG.ENDPOINTS.AUTH.DEVICE_APPROVE, {
    userCode: userCode,
  });
}
