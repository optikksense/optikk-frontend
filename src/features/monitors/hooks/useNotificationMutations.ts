import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  type Channel,
  type CreateChannelPayload,
  type CreatePolicyPayload,
  type CreateTemplatePayload,
  type Policy,
  type Template,
  createChannel,
  createPolicy,
  createTemplate,
  deleteChannel,
  deletePolicy,
  deleteTemplate,
  updateChannel,
  updatePolicy,
  updateTemplate,
} from "../api/notificationsApi";

const CHANNELS_KEY = ["notifications", "channels"] as const;
const POLICIES_KEY = ["notifications", "policies"] as const;
const TEMPLATES_KEY = ["notifications", "templates"] as const;

// Channels ------------------------------------------------------------------

export function useChannelMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: CHANNELS_KEY });

  const create = useMutation<Channel, Error, CreateChannelPayload>({
    mutationFn: (payload) => createChannel(payload),
    onSuccess: () => void invalidate(),
  });
  const update = useMutation<Channel, Error, { id: number; payload: CreateChannelPayload }>({
    mutationFn: ({ id, payload }) => updateChannel(id, payload),
    onSuccess: () => void invalidate(),
  });
  const remove = useMutation<void, Error, number>({
    mutationFn: (id) => deleteChannel(id),
    onSuccess: () => void invalidate(),
  });

  return { create, update, remove };
}

// Policies ------------------------------------------------------------------

export function usePolicyMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: POLICIES_KEY });

  const create = useMutation<Policy, Error, CreatePolicyPayload>({
    mutationFn: (payload) => createPolicy(payload),
    onSuccess: () => void invalidate(),
  });
  const update = useMutation<Policy, Error, { id: number; payload: CreatePolicyPayload }>({
    mutationFn: ({ id, payload }) => updatePolicy(id, payload),
    onSuccess: () => void invalidate(),
  });
  const remove = useMutation<void, Error, number>({
    mutationFn: (id) => deletePolicy(id),
    onSuccess: () => void invalidate(),
  });

  return { create, update, remove };
}

// Templates -----------------------------------------------------------------

export function useTemplateMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: TEMPLATES_KEY });

  const create = useMutation<Template, Error, CreateTemplatePayload>({
    mutationFn: (payload) => createTemplate(payload),
    onSuccess: () => void invalidate(),
  });
  const update = useMutation<Template, Error, { id: number; payload: CreateTemplatePayload }>({
    mutationFn: ({ id, payload }) => updateTemplate(id, payload),
    onSuccess: () => void invalidate(),
  });
  const remove = useMutation<void, Error, number>({
    mutationFn: (id) => deleteTemplate(id),
    onSuccess: () => void invalidate(),
  });

  return { create, update, remove };
}
