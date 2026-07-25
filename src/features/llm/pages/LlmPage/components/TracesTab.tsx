import { useMemo } from "react";

import { StatCard } from "@shared/components/ui";
import { formatNumber } from "@shared/utils/formatters";

import { useLlmOverview, useLlmRange } from "../../../hooks/useLlmQueries";
import LiveTraceStream from "./LiveTraceStream";

export default function TracesTab({
  service,
  onClearService,
}: {
  readonly service: string | null;
  readonly onClearService: () => void;
}) {
  const overviewQ = useLlmOverview();
  const { startTime, endTime } = useLlmRange();

  const cur = overviewQ.data?.current;

  const perMinute = useMemo(() => {
    if (!cur || endTime <= startTime) return null;
    return cur.traces / ((endTime - startTime) / 60_000);
  }, [cur, startTime, endTime]);

  const avgSpans = (w?: { totalSpans: number; traces: number }) =>
    w && w.traces > 0 ? w.totalSpans / w.traces : 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          metric={{
            title: "Traces",
            value: formatNumber(cur?.traces ?? 0),
            description: perMinute !== null ? `≈${perMinute.toFixed(1)}/min` : undefined,
          }}
          visuals={{ loading: overviewQ.isPending }}
        />
        <StatCard
          metric={{
            title: "Avg spans / trace",
            value: avgSpans(cur).toFixed(1),
            description: "gen_ai spans per trace",
          }}
          visuals={{ loading: overviewQ.isPending }}
        />
        <StatCard
          metric={{ title: "LLM error rate", value: `${(cur?.errorRate ?? 0).toFixed(2)}%` }}
          visuals={{ loading: overviewQ.isPending }}
        />
        <StatCard
          metric={{ title: "LLM calls", value: formatNumber(cur?.llmSpans ?? 0) }}
          visuals={{ loading: overviewQ.isPending }}
        />
      </div>

      <LiveTraceStream service={service} onClearService={onClearService} />
    </div>
  );
}
