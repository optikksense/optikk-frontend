import { useEffect, useMemo, useRef } from "react";

import { queryClient } from "@shared/api/queryClient";

import { useAppStore } from "@store/appStore";
import { useAuthStore } from "@store/authStore";

import type { ReactNode } from "react";

interface QueryLifecycleBridgeProps {
  readonly children: ReactNode;
}

export default function QueryLifecycleBridge({ children }: QueryLifecycleBridgeProps): JSX.Element {
  const selectedTeamId = useAppStore((state) => state.selectedTeamId);
  const selectedTeamIds = useAppStore((state) => state.selectedTeamIds);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const teamScopeKey = useMemo(
    () => JSON.stringify({ selectedTeamId, selectedTeamIds }),
    [selectedTeamId, selectedTeamIds]
  );

  const isFirstTeamScope = useRef(true);
  const previousAuthState = useRef(isAuthenticated);

  useEffect(() => {
    if (isFirstTeamScope.current) {
      isFirstTeamScope.current = false;
      return;
    }

    void queryClient.invalidateQueries();
  }, [teamScopeKey]);

  useEffect(() => {
    if (previousAuthState.current && !isAuthenticated) {
      queryClient.clear();
    }

    previousAuthState.current = isAuthenticated;
  }, [isAuthenticated]);

  return <>{children}</>;
}
