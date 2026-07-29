import { useMemo } from "react";

import type { ExplorerFilter } from "@shared/search/types/filters";

import { useLogsExplorer } from "../hooks/useLogsExplorer";
import { LogsExplorerContent } from "./LogsExplorerContent";

interface ScopedLogsPanelProps {
  /** Filter field the panel is locked to — `serviceName`, `host`, `pod`, … */
  readonly field: string;
  readonly value: string;
}

/**
 * The logs explorer (stat pills + trend + table + detail drawer) locked to a
 * single entity, for embedding in a detail page. Shared by the service detail
 * Logs tab and the host/container detail Logs sections; URL filter chips still
 * apply on top of the lock, exactly as on /logs.
 */
export function ScopedLogsPanel({ field, value }: ScopedLogsPanelProps) {
  // Identity matters: it feeds the explorer's filter memo and query keys.
  const baseFilters = useMemo<readonly ExplorerFilter[]>(
    () => [{ field, op: "eq", value }],
    [field, value]
  );

  const explorer = useLogsExplorer({ baseFilters, includeFacets: false });

  return (
    <div className="flex min-w-0 flex-col">
      <LogsExplorerContent explorer={explorer} />
    </div>
  );
}
