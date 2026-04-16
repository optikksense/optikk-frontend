import { Activity, Cable, Database, Gauge, TimerReset, Waves } from "lucide-react";
import { memo } from "react";

import {
  formatBytes,
  formatDuration,
  formatNumber,
  formatPercentage,
} from "@shared/utils/formatters";

import { SaturationStatTile } from "../../../components/SaturationStatTile";

import { SECTION_DATASTORES } from "../constants";
import { formatBytesPerSecond } from "../formatUtils";

type DatastoreSummary = {
  total_systems?: number;
  database_systems?: number;
  redis_systems?: number;
  query_count?: number;
  p95_latency_ms?: number;
  error_rate?: number;
  active_connections?: number;
};

type KafkaSummary = {
  topic_count?: number;
  group_count?: number;
  bytes_per_sec?: number;
  assigned_partitions?: number;
};

type Props = {
  activeSection: string;
  datastoreSummary: DatastoreSummary | undefined;
  kafkaSummary: KafkaSummary | undefined;
};

function SaturationStatTilesGridComponent({
  activeSection,
  datastoreSummary,
  kafkaSummary,
}: Props) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {activeSection === SECTION_DATASTORES ? (
        <>
          <SaturationStatTile
            label="Systems"
            value={formatNumber(datastoreSummary?.total_systems ?? 0)}
            meta={`${formatNumber(datastoreSummary?.database_systems ?? 0)} databases • ${formatNumber(datastoreSummary?.redis_systems ?? 0)} redis`}
            icon={<Database size={16} />}
          />
          <SaturationStatTile
            label="Queries"
            value={formatNumber(datastoreSummary?.query_count ?? 0)}
            meta="Telemetry-backed DB and Redis operations in range"
            icon={<Activity size={16} />}
          />
          <SaturationStatTile
            label="P95 Latency"
            value={formatDuration(datastoreSummary?.p95_latency_ms ?? 0)}
            meta={`${formatPercentage(datastoreSummary?.error_rate ?? 0)} error rate`}
            icon={<TimerReset size={16} />}
          />
          <SaturationStatTile
            label="Active Conns"
            value={formatNumber(datastoreSummary?.active_connections ?? 0)}
            meta="Connection pools currently observed"
            icon={<Cable size={16} />}
          />
        </>
      ) : (
        <>
          <SaturationStatTile
            label="Topics"
            value={formatNumber(kafkaSummary?.topic_count ?? 0)}
            meta={`${formatNumber(kafkaSummary?.group_count ?? 0)} consumer groups observed`}
            icon={<Waves size={16} />}
          />
          <SaturationStatTile
            label="Consumer Groups"
            value={formatNumber(kafkaSummary?.group_count ?? 0)}
            meta="Raw Kafka client-id values surfaced as consumer groups"
            icon={<Activity size={16} />}
          />
          <SaturationStatTile
            label="Bytes/s"
            value={formatBytesPerSecond(kafkaSummary?.bytes_per_sec ?? 0)}
            meta="Topic traffic from Kafka consumer metrics"
            icon={<Gauge size={16} />}
          />
          <SaturationStatTile
            label="Assigned Partitions"
            value={formatNumber(kafkaSummary?.assigned_partitions ?? 0)}
            meta="Current partition ownership across observed consumer groups"
            icon={<TimerReset size={16} />}
          />
        </>
      )}
    </div>
  );
}

export const SaturationStatTilesGrid = memo(SaturationStatTilesGridComponent);
