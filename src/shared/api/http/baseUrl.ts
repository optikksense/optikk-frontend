import { API_CONFIG } from "@config/apiConfig";

/** Ensures absolute `VITE_API_BASE_URL` values end with `/api` so `/v1/...` paths hit `/api/v1/...`. */
export function resolveApiBaseURL(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (fromEnv == null || fromEnv === "") {
    return API_CONFIG.BASE_URL;
  }

  if (/^https?:\/\//.test(fromEnv)) {
    let base = fromEnv.replace(/\/+$/, "");
    if (base.endsWith("/api/v1")) {
      base = base.slice(0, -"/v1".length);
    }
    if (base.endsWith("/api")) {
      return base;
    }
    return `${base}/api`;
  }

  return fromEnv;
}
