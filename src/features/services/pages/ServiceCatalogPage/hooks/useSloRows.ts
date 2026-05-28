import { useMemo } from "react";

import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { type SloRow, getSloList } from "@/features/services/api/serviceCatalogApi";

export interface SloTableRow extends SloRow {
  readonly remainingBudget: number;
  readonly burnRate: number;
}

function sortByBudget(rows: SloTableRow[]): SloTableRow[] {
  return [...rows].sort((a, b) => a.remainingBudget - b.remainingBudget);
}

function toTableRow(slo: SloRow): SloTableRow {
  const budget = typeof slo.error_budget_remaining === "number" ? slo.error_budget_remaining : 0;
  return {
    ...slo,
    remainingBudget: budget,
    burnRate: slo.burn_rate ?? 0,
  };
}

export function useSloRows(): { rows: SloTableRow[]; isPending: boolean } {
  const query = useTimeRangeQuery<SloRow[]>("service-hub.slo-rows", (_team, s, e) =>
    getSloList(s, e)
  );
  const rows = useMemo(() => sortByBudget((query.data ?? []).map(toTableRow)), [query.data]);
  return { rows, isPending: query.isPending };
}
