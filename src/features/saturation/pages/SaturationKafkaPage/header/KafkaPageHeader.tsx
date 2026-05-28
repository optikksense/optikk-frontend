import { RefreshCw, Waves } from "lucide-react";

import { useAppStore } from "@store/appStore";

import type { KafkaSummary } from "@/features/saturation/api/kafkaExplorerSchemas";
import { fmtNum } from "@/features/services/pages/ServiceDetailPage/formatters";

interface KafkaPageHeaderProps {
  readonly summary: KafkaSummary | undefined;
}

function RefreshButton() {
  const triggerRefresh = useAppStore((s) => s.triggerRefresh);
  return (
    <button
      type="button"
      title="Refresh"
      onClick={triggerRefresh}
      className="grid h-8 w-8 place-items-center rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
    >
      <RefreshCw size={14} />
    </button>
  );
}

function Subtitle({ summary }: { summary: KafkaSummary | undefined }) {
  if (!summary) {
    return <div className="text-[12px] text-[var(--text-muted)]">Loading cluster summary…</div>;
  }
  return (
    <div className="text-[12px] text-[var(--text-muted)]">
      {fmtNum(summary.topic_count)} topics · {fmtNum(summary.group_count)} consumer groups ·{" "}
      {fmtNum(summary.assigned_partitions)} partitions
    </div>
  );
}

export function KafkaPageHeader({ summary }: KafkaPageHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-md bg-[var(--color-primary-bg,rgba(59,130,246,0.12))] text-[var(--color-primary,#3b82f6)]">
          <Waves size={18} />
        </div>
        <div>
          <h1 className="font-semibold text-[20px] text-[var(--text-primary)]">Kafka</h1>
          <Subtitle summary={summary} />
        </div>
      </div>
      <RefreshButton />
    </header>
  );
}
