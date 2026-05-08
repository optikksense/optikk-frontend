import { Activity, Waves } from "lucide-react";

import { PageHeader, PageShell, PageSurface } from "@shared/components/ui";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { formatNumber } from "@shared/utils/formatters";

import {
  getBrokerConnections,
  getKafkaE2ELatency,
  getKafkaSummaryStats,
  getProduceRateByTopic,
  getPublishLatencyByTopic,
} from "../../api/kafkaPanelsApi";
import { SaturationStatTile } from "../../components/SaturationStatTile";

function fmtMs(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(2)}s`;
  return `${Math.round(v)}ms`;
}

export default function KafkaOverviewPage(): JSX.Element {
  const summary = useTimeRangeQuery("kafka-overview-summary", (_t, s, e) =>
    getKafkaSummaryStats(Number(s), Number(e))
  );
  const produce = useTimeRangeQuery("kafka-overview-produce", (_t, s, e) =>
    getProduceRateByTopic(Number(s), Number(e))
  );
  const publishLatency = useTimeRangeQuery("kafka-overview-pub-lat", (_t, s, e) =>
    getPublishLatencyByTopic(Number(s), Number(e))
  );
  const e2e = useTimeRangeQuery("kafka-overview-e2e", (_t, s, e) =>
    getKafkaE2ELatency(Number(s), Number(e))
  );
  const brokers = useTimeRangeQuery("kafka-overview-brokers", (_t, s, e) =>
    getBrokerConnections(Number(s), Number(e))
  );

  const s = summary.data;
  const topicCount = new Set((produce.data ?? []).map((p) => p.topic)).size;
  const brokerCount = new Set((brokers.data ?? []).map((b) => b.broker)).size;

  return (
    <PageShell>
      <PageHeader
        title="Kafka"
        subtitle="Cluster-level produce/consume rate, end-to-end latency, and broker connections."
        icon={<Waves size={24} />}
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <SaturationStatTile
          label="Publish rate"
          value={`${formatNumber(s?.publish_rate_per_sec ?? 0)}/s`}
          meta="Across all topics"
          icon={<Activity size={16} />}
        />
        <SaturationStatTile
          label="Receive rate"
          value={`${formatNumber(s?.receive_rate_per_sec ?? 0)}/s`}
          meta="Across all groups"
          icon={<Activity size={16} />}
        />
        <SaturationStatTile
          label="Max lag"
          value={formatNumber(s?.max_lag ?? 0)}
          meta="Worst consumer-group lag"
          icon={<Activity size={16} />}
        />
        <SaturationStatTile
          label="Publish p95"
          value={fmtMs(s?.publish_p95_ms ?? 0)}
          meta="Producer-side latency"
          icon={<Activity size={16} />}
        />
        <SaturationStatTile
          label="Receive p95"
          value={fmtMs(s?.receive_p95_ms ?? 0)}
          meta="Consumer-side latency"
          icon={<Activity size={16} />}
        />
      </div>

      <PageSurface padding="lg">
        <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
          Topology
        </div>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <div>
            <div className="font-semibold text-[24px] text-[var(--text-primary)]">
              {formatNumber(topicCount)}
            </div>
            <div className="text-[12px] text-[var(--text-secondary)]">Active topics</div>
          </div>
          <div>
            <div className="font-semibold text-[24px] text-[var(--text-primary)]">
              {formatNumber(brokerCount)}
            </div>
            <div className="text-[12px] text-[var(--text-secondary)]">Brokers</div>
          </div>
        </div>
      </PageSurface>

      <PageSurface padding="lg">
        <div className="mb-2 text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
          End-to-end latency (p95) by topic
        </div>
        {e2e.isPending ? (
          <div className="px-3 py-4 text-[12px] text-[var(--text-muted)]">Loading…</div>
        ) : (e2e.data ?? []).length === 0 ? (
          <div className="px-3 py-4 text-[12px] text-[var(--text-muted)]">
            No e2e latency data in this window.
          </div>
        ) : (
          <pre className="max-h-[260px] overflow-auto whitespace-pre-wrap text-[11px] text-[var(--text-secondary)]">
            {JSON.stringify(e2e.data?.slice(0, 8), null, 2)}
          </pre>
        )}
        <div className="mt-2 text-[11px] text-[var(--text-muted)]">
          Phase 2 will replace this raw view with a UPlotChart per-topic series. The data is
          live; only the visualization is pending.
        </div>
      </PageSurface>

      <PageSurface padding="lg">
        <div className="mb-2 text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
          Publish latency (p50/p95/p99) by topic — sample
        </div>
        {publishLatency.isPending ? (
          <div className="px-3 py-4 text-[12px] text-[var(--text-muted)]">Loading…</div>
        ) : (publishLatency.data ?? []).length === 0 ? (
          <div className="px-3 py-4 text-[12px] text-[var(--text-muted)]">
            No publish-latency data.
          </div>
        ) : (
          <pre className="max-h-[260px] overflow-auto whitespace-pre-wrap text-[11px] text-[var(--text-secondary)]">
            {JSON.stringify(publishLatency.data?.slice(0, 8), null, 2)}
          </pre>
        )}
      </PageSurface>
    </PageShell>
  );
}
