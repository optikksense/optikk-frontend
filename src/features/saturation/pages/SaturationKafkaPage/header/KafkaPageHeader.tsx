import { RefreshCw, Waves } from "lucide-react";

import { useAppStore } from "@app/store/appStore";
import { Pill } from "@shared/components/primitives/ui/pill";

import type { KafkaSummary } from "@/features/saturation/api/kafkaExplorerSchemas";
import { fmtNum } from "@shared/utils/metricFormatters";

interface KafkaPageHeaderProps {
  readonly summary: KafkaSummary | undefined;
  readonly degraded?: { readonly label: string } | null;
}

function RefreshButton() {
  const triggerRefresh = useAppStore((s) => s.triggerRefresh);
  return (
    <button
      type="button"
      title="Refresh"
      onClick={triggerRefresh}
      className="grid h-8 w-8 place-items-center rounded-md border border-border bg-card text-foreground-muted hover:text-foreground"
    >
      <RefreshCw size={14} />
    </button>
  );
}

function Subtitle({ summary }: { summary: KafkaSummary | undefined }) {
  if (!summary) {
    return <div className="text-[12px] text-foreground-muted">Loading cluster summary…</div>;
  }
  return (
    <div className="text-[12px] text-foreground-muted">
      {fmtNum(summary.topic_count)} topics · {fmtNum(summary.group_count)} consumer groups ·{" "}
      {fmtNum(summary.assigned_partitions)} partitions
    </div>
  );
}

export function KafkaPageHeader({ summary, degraded }: KafkaPageHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-md bg-[var(--color-primary-bg)] text-primary">
          <Waves size={18} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-[20px] text-foreground">Kafka</h1>
            {degraded && (
              <Pill variant="warning" dot>
                {degraded.label}
              </Pill>
            )}
          </div>
          <Subtitle summary={summary} />
        </div>
      </div>
      <RefreshButton />
    </header>
  );
}
