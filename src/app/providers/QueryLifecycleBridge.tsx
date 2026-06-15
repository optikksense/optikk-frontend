import { useEffect, useMemo, useRef } from "react";

import { queryClient } from "@shared/api/queryClient";

import { useAppStore } from "@store/appStore";

import type { ReactNode } from "react";

interface QueryLifecycleBridgeProps {
  readonly children: ReactNode;
}

export default function QueryLifecycleBridge({ children }: QueryLifecycleBridgeProps): JSX.Element {
  const selectedTeamId = useAppStore((state) => state.selectedTeamId);
  const selectedTeamIds = useAppStore((state) => state.selectedTeamIds);

  const teamScopeKey = useMemo(
    () => JSON.stringify({ selectedTeamId, selectedTeamIds }),
    [selectedTeamId, selectedTeamIds]
  );

  const isFirstTeamScope = useRef(true);

  useEffect(() => {
    if (isFirstTeamScope.current) {
      isFirstTeamScope.current = false;
      return;
    }

    void queryClient.invalidateQueries({ queryKey: ["component-query"] });
    void queryClient.invalidateQueries({ queryKey: ["datasource"] });
  }, [teamScopeKey]);

  return <>{children}</>;
}
