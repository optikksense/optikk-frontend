import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useStandardQuery } from "@shared/hooks/useStandardQuery";

import {
  type CreateSavedViewRequest,
  type SavedView,
  createSavedView,
  deleteSavedView,
  listSavedViews,
} from "../api/savedViewsApi";

const VIEWS_KEY = "saved-views";

export function useSavedViews(scope: string) {
  const qc = useQueryClient();

  const list = useStandardQuery<SavedView[]>({
    queryKey: [VIEWS_KEY, scope],
    queryFn: () => listSavedViews(scope),
  });

  const createMut = useMutation({
    mutationFn: (req: Omit<CreateSavedViewRequest, "scope">) =>
      createSavedView({ ...req, scope }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [VIEWS_KEY, scope] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteSavedView(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [VIEWS_KEY, scope] }),
  });

  return {
    views: list.data ?? [],
    isLoading: list.isPending,
    create: createMut.mutate,
    creating: createMut.isPending,
    remove: deleteMut.mutate,
    removing: deleteMut.isPending,
  };
}
