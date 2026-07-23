import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useStandardQuery } from "@shared/hooks/useStandardQuery";

import {
  type CreateProviderKeyRequest,
  createProviderKey,
  deleteProviderKey,
  listProviderKeys,
} from "../api/providerKeysApi";

const LIST_KEY = ["llm", "providerKeys", "list"];

export function useProviderKeys() {
  return useStandardQuery({ queryKey: LIST_KEY, queryFn: listProviderKeys });
}

export function useProviderKeyMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => void queryClient.invalidateQueries({ queryKey: LIST_KEY });
  const create = useMutation({
    mutationFn: (req: CreateProviderKeyRequest) => createProviderKey(req),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: number) => deleteProviderKey(id),
    onSuccess: invalidate,
  });
  return { create, remove };
}
