import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  type CreateMemberPayload,
  type Member,
  type MemberRole,
  createMember,
  listMembers,
  removeMember,
  updateMemberRole,
} from "../api/membersApi";

const MEMBERS_KEY = ["settings", "members"] as const;

export function useMembers() {
  return useQuery<Member[], Error>({
    queryKey: MEMBERS_KEY,
    queryFn: listMembers,
  });
}

export function useMemberMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: MEMBERS_KEY });

  const create = useMutation<Member, Error, CreateMemberPayload>({
    mutationFn: (payload) => createMember(payload),
    onSuccess: () => void invalidate(),
  });
  const updateRole = useMutation<Member, Error, { id: number; role: MemberRole }>({
    mutationFn: ({ id, role }) => updateMemberRole(id, role),
    onSuccess: () => void invalidate(),
  });
  const remove = useMutation<void, Error, number>({
    mutationFn: (id) => removeMember(id),
    onSuccess: () => void invalidate(),
  });

  return { create, updateRole, remove };
}
