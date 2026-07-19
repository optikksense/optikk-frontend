import api from "@/shared/api/http/client";
import { API_CONFIG } from "@config/apiConfig";

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

export type MemberRole = "admin" | "member";

export interface Member {
  readonly id: number;
  readonly email: string;
  readonly name: string;
  readonly role: MemberRole;
  readonly active: boolean;
  readonly tenantId: number;
}

export interface CreateMemberPayload {
  email: string;
  name: string;
  password?: string;
  role: MemberRole;
}

export async function listMembers(): Promise<Member[]> {
  return api.get<Member[]>(`${V1}/users`);
}

export async function createMember(payload: CreateMemberPayload): Promise<Member> {
  return api.post<Member>(`${V1}/users`, payload);
}

export async function updateMemberRole(id: number, role: MemberRole): Promise<Member> {
  return api.request<Member>({
    method: "PATCH",
    url: `${V1}/users/${id}/role`,
    data: { role },
  });
}

export async function removeMember(id: number): Promise<void> {
  await api.delete<unknown>(`${V1}/users/${id}`);
}
