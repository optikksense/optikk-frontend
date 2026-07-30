import { useRef } from "react";

import {
  type ClientExplorerDefinition,
  useClientExplorer,
} from "@shared/search/hooks/useClientExplorer";
import { useExplorerKeyboard } from "@shared/search/hooks/useExplorerKeyboard";
import { useExplorerState } from "@shared/search/hooks/useExplorerState";

interface UseClientExplorerControllerArgs<T> {
  readonly rows: readonly T[];
  readonly definition: ClientExplorerDefinition<T>;
}

export function useClientExplorerController<T>({
  rows,
  definition,
}: UseClientExplorerControllerArgs<T>) {
  const state = useExplorerState();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const explorer = useClientExplorer({ rows, filters: state.filters, definition });

  useExplorerKeyboard({ onSearchFocus: () => searchInputRef.current?.focus() });

  return { ...explorer, state, searchInputRef };
}
