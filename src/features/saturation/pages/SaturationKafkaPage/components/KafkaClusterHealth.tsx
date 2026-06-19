import { fmtNum } from "@/features/services/pages/ServiceDetailPage/formatters";
import { PanelCard } from "@/features/services/pages/ServiceDetailPage/panels/PanelCard";
import { cn } from "@/lib/utils";

import { useKafkaClusterHealth } from "../hooks/useKafkaClusterHealth";

interface StatProps {
  readonly label: string;
  readonly value: string;
  readonly tone?: "ok" | "err";
}

function Stat({ label, value, tone }: StatProps) {
  return (
    <div className="rounded-lg border border-border bg-[var(--bg-2)] p-3">
      <div className="text-[11px] text-foreground-muted uppercase tracking-wide">{label}</div>
      <div
        className={cn(
          "mt-1 font-mono font-semibold text-[20px] text-foreground",
          tone === "err" && "text-error",
          tone === "ok" && "text-success"
        )}
      >
        {value}
      </div>
    </div>
  );
}

// kafkametrics receiver gives broker-scraped health, not host CPU; surface the
// broker count, active controller, and replication health instead.
export function KafkaClusterHealth() {
  const { data, isPending } = useKafkaClusterHealth();
  const underReplicated = data?.under_replicated_partitions ?? 0;
  return (
    <PanelCard title="Cluster health" subtitle="brokers · controller · replication" padded={false}>
      {data === undefined ? (
        <div className="px-4 py-8 text-center text-[12px] text-foreground-muted">
          {isPending ? "Loading…" : "No cluster metrics in window."}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-[10px] p-4">
          <Stat label="Brokers" value={fmtNum(data.broker_count)} />
          <Stat
            label="Active controller"
            value={fmtNum(data.active_controllers)}
            tone={data.active_controllers >= 1 ? "ok" : "err"}
          />
          <Stat
            label="Under-replicated"
            value={fmtNum(underReplicated)}
            tone={underReplicated > 0 ? "err" : "ok"}
          />
        </div>
      )}
    </PanelCard>
  );
}
