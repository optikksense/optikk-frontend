import api from "@/shared/api/api/client";
import { API_CONFIG } from "@config/apiConfig";
import { unwrapEnvelope } from "@shared/api/utils/unwrapEnvelope";

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
  password: string;
  role: MemberRole;
}

export async function listMembers(): Promise<Member[]> {
  const raw = await api.get<unknown>(`${V1}/users`);
  return unwrapEnvelope<Member[]>(raw);
}

export async function createMember(payload: CreateMemberPayload): Promise<Member> {
  const raw = await api.post<unknown>(`${V1}/users`, payload);
  return unwrapEnvelope<Member>(raw);
}

export async function updateMemberRole(id: number, role: MemberRole): Promise<Member> {
  const raw = await api.request<unknown>({
    method: "PATCH",
    url: `${V1}/users/${id}/role`,
    data: { role },
  });
  return unwrapEnvelope<Member>(raw);
}

export async function removeMember(id: number): Promise<void> {
  await api.delete<unknown>(`${V1}/users/${id}`);
}
