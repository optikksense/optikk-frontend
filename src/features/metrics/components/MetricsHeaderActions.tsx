import { Link } from "@tanstack/react-router";
import { Bell, Download, Plus } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { Button } from "@shared/components/primitives/ui/button";

import type {
  FormulaDefinition,
  MetricQueryDefinition,
  MetricSpaceAggregation,
  TimeStep,
} from "@shared/metrics/types";
import type { MetricQueryResult } from "@shared/metrics/types";
import { buildBreakdownCsv, downloadCsv } from "../utils/breakdownCsv";
import { SaveGraphDialog } from "./SaveGraphDialog";

interface MetricsHeaderActionsProps {
  readonly primaryQuery: MetricQueryDefinition | undefined;
  readonly primaryResult: MetricQueryResult | undefined;
  readonly queries: MetricQueryDefinition[];
  readonly formulas: FormulaDefinition[];
  readonly step: TimeStep;
  readonly spaceAgg: MetricSpaceAggregation;
}

export function MetricsHeaderActions({
  primaryQuery,
  primaryResult,
  queries,
  formulas,
  step,
  spaceAgg,
}: MetricsHeaderActionsProps) {
  const [saveOpen, setSaveOpen] = useState(false);

  const handleExport = useCallback(() => {
    const csv = buildBreakdownCsv(primaryResult);
    if (!csv) {
      toast.error("Nothing to export yet");
      return;
    }
    downloadCsv(`${primaryQuery?.metricName || "metrics"}-breakdown.csv`, csv);
  }, [primaryQuery, primaryResult]);

  const monitorSearch = {
    from: "metrics" as const,
    metric: primaryQuery?.metricName ?? "",
  };

  return (
    <>
      <div className="flex items-center gap-1.5">
        <Link to="/monitors/new" search={monitorSearch}>
          <Button variant="ghost" size="sm" icon={<Bell size={13} />}>
            Create monitor
          </Button>
        </Link>
        <Button variant="ghost" size="sm" icon={<Download size={13} />} onClick={handleExport}>
          Export
        </Button>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus size={13} />}
          onClick={() => setSaveOpen(true)}
        >
          Save graph
        </Button>
      </div>

      <SaveGraphDialog
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        queries={queries}
        formulas={formulas}
        step={step}
        spaceAgg={spaceAgg}
      />
    </>
  );
}
