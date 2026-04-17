import { memo } from "react";
import { AlertCircle, Clock, GitBranch, Layers } from "lucide-react";

import { APP_COLORS } from "@config/colorLiterals";
import StatCard from "@shared/components/ui/cards/StatCard";
import { formatDuration, formatNumber } from "@shared/utils/formatters";

interface Stats {
  totalSpans: number;
  duration: number;
  services: Set<string>;
  errors: number;
}

interface Props {
  stats: Stats;
  criticalPathCount: number;
  linkedLogsCount: number;
}

function TraceDetailStatsComponent({ stats, criticalPathCount, linkedLogsCount }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <StatCard
        metric={{ title: "Total Spans", value: stats.totalSpans, formatter: formatNumber }}
        visuals={{ icon: <Layers size={20} />, iconColor: APP_COLORS.hex_5e60ce }}
      />
      <StatCard
        metric={{ title: "Duration", value: stats.duration, formatter: formatDuration }}
        visuals={{ icon: <Clock size={20} />, iconColor: APP_COLORS.hex_73c991 }}
      />
      <StatCard
        metric={{ title: "Services", value: stats.services.size, formatter: formatNumber }}
        visuals={{ icon: <GitBranch size={20} />, iconColor: APP_COLORS.hex_06aed5 }}
      />
      <StatCard
        metric={{ title: "Errors", value: stats.errors, formatter: formatNumber }}
        visuals={{
          icon: <AlertCircle size={20} />,
          iconColor: stats.errors > 0 ? APP_COLORS.hex_f04438 : APP_COLORS.hex_73c991,
        }}
      />
      <StatCard
        metric={{ title: "Critical Path", value: criticalPathCount, formatter: formatNumber }}
        visuals={{ icon: <Layers size={20} />, iconColor: APP_COLORS.hex_73c991 }}
      />
      <StatCard
        metric={{ title: "Linked Logs", value: linkedLogsCount, formatter: formatNumber }}
        visuals={{ icon: <Clock size={20} />, iconColor: APP_COLORS.hex_06aed5 }}
      />
    </div>
  );
}

export const TraceDetailStats = memo(TraceDetailStatsComponent);
