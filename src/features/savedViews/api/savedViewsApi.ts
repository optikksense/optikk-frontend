import api from "@/shared/api/api/client";
import { API_CONFIG } from "@config/apiConfig";

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

export interface SavedView {
  readonly id: number;
  readonly team_id: number;
  readonly user_id: number;
  readonly scope: string;
  readonly name: string;
  readonly url: string;
  readonly visibility: "private" | "team";
  readonly created_at: string;
  readonly updated_at: string;
}

export interface CreateSavedViewRequest {
  readonly scope: string;
  readonly name: string;
  readonly url: string;
  readonly visibility?: "private" | "team";
}

export function listSavedViews(scope?: string): Promise<SavedView[]> {
  return api.get<SavedView[]>(`${V1}/saved-views`, {
    params: scope ? { scope } : undefined,
  });
}

export function createSavedView(req: CreateSavedViewRequest): Promise<SavedView> {
  return api.post<SavedView>(`${V1}/saved-views`, req);
}

export function deleteSavedView(id: number): Promise<{ deleted: number }> {
  return api.delete<{ deleted: number }>(`${V1}/saved-views/${id}`);
}
