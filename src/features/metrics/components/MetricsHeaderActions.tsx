import { Bell, Download, ExternalLink, Plus } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";

import { Button } from "@shared/components/primitives/ui/button";

import type { MetricQueryDefinition, MetricQueryResult } from "@shared/metrics/types";
import { buildBreakdownCsv, downloadCsv } from "../utils/breakdownCsv";

interface MetricsHeaderActionsProps {
  readonly primaryQuery: MetricQueryDefinition | undefined;
  readonly primaryResult: MetricQueryResult | undefined;
}

                                                                                 
                                                                        
function createMonitorHref(primaryQuery: MetricQueryDefinition | undefined): string {
  const params = new URLSearchParams({ from: "metrics" });
  if (primaryQuery?.metricName) params.set("metric", primaryQuery.metricName);
  return `/monitors/new?${params.toString()}`;
}

export function MetricsHeaderActions({ primaryQuery, primaryResult }: MetricsHeaderActionsProps) {
  const handleExport = useCallback(() => {
    const csv = buildBreakdownCsv(primaryResult);
    if (!csv) {
      toast.error("Nothing to export yet");
      return;
    }
    downloadCsv(`${primaryQuery?.metricName || "metrics"}-breakdown.csv`, csv);
  }, [primaryQuery, primaryResult]);

  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="ghost"
        size="sm"
        icon={<ExternalLink size={13} />}
        onClick={() => toast("Notebooks are coming soon")}
      >
        Open in Notebook
      </Button>
      <a href={createMonitorHref(primaryQuery)}>
        <Button variant="ghost" size="sm" icon={<Bell size={13} />}>
          Create monitor
        </Button>
      </a>
      <Button variant="ghost" size="sm" icon={<Download size={13} />} onClick={handleExport}>
        Export
      </Button>
      <Button
        variant="primary"
        size="sm"
        icon={<Plus size={13} />}
        onClick={() => toast("Saved graphs are coming soon")}
      >
        Save graph
      </Button>
    </div>
  );
}
