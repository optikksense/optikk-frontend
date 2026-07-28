import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useStandardQuery } from "@shared/hooks/useStandardQuery";

import {
  type CreateVersionRequest,
  createPrompt,
  createPromptVersion,
  getPrompt,
  listPrompts,
  setPromptVersionStatus,
} from "../api/promptsApi";

const LIST_KEY = ["llm", "prompts", "list"];

export function usePrompts() {
  return useStandardQuery({ queryKey: LIST_KEY, queryFn: listPrompts });
}

export function usePrompt(name: string | null) {
  return useStandardQuery({
    queryKey: ["llm", "prompts", "detail", name],
    queryFn: () => getPrompt(name ?? ""),
    enabled: Boolean(name),
  });
}

export function usePromptMutations(name?: string) {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: LIST_KEY });
    if (name) void queryClient.invalidateQueries({ queryKey: ["llm", "prompts", "detail", name] });
  };
  const create = useMutation({ mutationFn: createPrompt, onSuccess: invalidate });
  const addVersion = useMutation({
    mutationFn: (req: CreateVersionRequest) => createPromptVersion(name ?? "", req),
    onSuccess: invalidate,
  });
  const setStatus = useMutation({
    mutationFn: (args: { version: number; status: "draft" | "production" | "archived" }) =>
      setPromptVersionStatus(name ?? "", args.version, args.status),
    onSuccess: invalidate,
  });
  return { create, addVersion, setStatus };
}
