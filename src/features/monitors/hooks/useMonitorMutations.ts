import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  type CreateMonitorPayload,
  type Monitor,
  deleteMonitor,
  updateMonitor,
} from "../api/monitorsApi";

export function useUpdateMonitor(id: number) {
  const queryClient = useQueryClient();
  return useMutation<Monitor, Error, CreateMonitorPayload>({
    mutationFn: (payload) => updateMonitor(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["monitors", "detail", id] });
      void queryClient.invalidateQueries({ queryKey: ["monitors", "list"] });
    },
  });
}

export function useDeleteMonitor() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (id) => deleteMonitor(id),
    onSuccess: (_void, id) => {
      void queryClient.removeQueries({ queryKey: ["monitors", "detail", id] });
      void queryClient.invalidateQueries({ queryKey: ["monitors", "list"] });
    },
  });
}
