import { memo } from "react";

import { formatDuration, formatNumber } from "@shared/utils/formatters";

import { useDatastoreBreakdowns } from "../hooks/useDatastoreBreakdowns";
import { useDatastoreLatencyHeatmap } from "../hooks/useDatastoreLatencyHeatmap";

import { GroupedSeriesPanel } from "./GroupedSeriesPanel";
import { ReadVsWritePanel } from "./ReadVsWritePanel";

function DatastoreBreakdownsComponent({ system }: { system: string }) {
  const breakdowns = useDatastoreBreakdowns(system);
  const heatmap = useDatastoreLatencyHeatmap(system);
  const ms = (v: number) => formatDuration(v);
  const ops = (v: number) => formatNumber(v);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 xl:grid-cols-2">
        <GroupedSeriesPanel
          eyebrow="Latency p95"
          title="By operation"
          result={breakdowns.latencyByOperation}
          emptyLabel="No per-operation latency in this window."
          yFormatter={ms}
        />
        <GroupedSeriesPanel
          eyebrow="Latency p95"
          title="By collection"
          result={breakdowns.latencyByCollection}
          emptyLabel="No per-collection latency in this window."
          yFormatter={ms}
        />
        <GroupedSeriesPanel
          eyebrow="Latency p95"
          title="By namespace"
          result={breakdowns.latencyByNamespace}
          emptyLabel="No per-namespace latency in this window."
          yFormatter={ms}
        />
        <GroupedSeriesPanel
          eyebrow="Latency p95"
          title="By server"
          result={breakdowns.latencyByServer}
          emptyLabel="No per-server latency in this window."
          yFormatter={ms}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <GroupedSeriesPanel
          eyebrow="Volume"
          title="Ops by operation"
          result={breakdowns.opsByOperation}
          emptyLabel="No per-operation volume in this window."
          yFormatter={ops}
        />
        <GroupedSeriesPanel
          eyebrow="Volume"
          title="Ops by collection"
          result={breakdowns.opsByCollection}
          emptyLabel="No per-collection volume in this window."
          yFormatter={ops}
        />
        <GroupedSeriesPanel
          eyebrow="Volume"
          title="Ops by namespace"
          result={breakdowns.opsByNamespace}
          emptyLabel="No per-namespace volume in this window."
          yFormatter={ops}
        />
        <ReadVsWritePanel series={breakdowns.readVsWrite} />
      </div>

      <GroupedSeriesPanel
        eyebrow="Latency distribution"
        title="Sample count by latency band"
        result={heatmap}
        emptyLabel="No latency-distribution samples in this window."
        yFormatter={ops}
      />
    </div>
  );
}

export const DatastoreBreakdowns = memo(DatastoreBreakdownsComponent);
