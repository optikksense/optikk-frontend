import axios from "axios"
import type { AxiosRequestConfig, AxiosResponse } from "axios"

import { API_CONFIG } from "@/platform/config/api"

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? API_CONFIG.baseUrl,
  timeout: API_CONFIG.timeoutMs,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

async function unwrapResponse<T>(request: Promise<AxiosResponse<T>>) {
  const response = await request
  return response.data
}

export const httpClient = {
  get<T>(url: string, config?: AxiosRequestConfig) {
    return unwrapResponse(client.get<T>(url, config))
  },
  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return unwrapResponse(client.post<T>(url, data, config))
  },
}
