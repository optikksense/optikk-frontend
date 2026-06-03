import { api } from "@shared/api/api/client";

export async function infraGet<T>(
  path: string,
  teamId: number,
  startMs: number,
  endMs: number,
  extraParams?: Record<string, string | number | undefined>
): Promise<T> {
  const params: Record<string, string | number> = {
    start: startMs,
    end: endMs,
  };
  if (extraParams) {
    for (const [k, v] of Object.entries(extraParams)) {
      if (v !== undefined && v !== "") {
        params[k] = v;
      }
    }
  }
  return api.get<T>(path, { params });
}
