import { useEffect, useMemo, useRef } from "react";

import { queryClient } from "@shared/api/queryClient";

import { useAppStore } from "@store/appStore";

import type { ReactNode } from "react";

interface QueryLifecycleBridgeProps {
  readonly children: ReactNode;
}

export default function QueryLifecycleBridge({ children }: QueryLifecycleBridgeProps): JSX.Element {
  const selectedTenantId = useAppStore((state) => state.selectedTenantId);
  const selectedTenantIds = useAppStore((state) => state.selectedTenantIds);

  const tenantScopeKey = useMemo(
    () => JSON.stringify({ selectedTenantId, selectedTenantIds }),
    [selectedTenantId, selectedTenantIds]
  );

  const isFirstTenantScope = useRef(true);

  useEffect(() => {
    if (isFirstTenantScope.current) {
      isFirstTenantScope.current = false;
      return;
    }

    void queryClient.invalidateQueries({ queryKey: ["component-query"] });
    void queryClient.invalidateQueries({ queryKey: ["datasource"] });
  }, [tenantScopeKey]);

  return <>{children}</>;
}
