import React from 'react';
import { Activity, AlertCircle, Zap, Hash } from 'lucide-react';
import TracesKpiCard from '@/features/traces/components/kpi/TracesKpiCard';
import { APP_COLORS } from '@config/colorLiterals';
import { formatNumber, formatDuration } from '@shared/utils/formatters';

import type { LLMRunSummary } from '../../types';

interface AiRunsKpiRowProps {
  summary?: LLMRunSummary;
  isLoading?: boolean;
  hasError?: boolean;
}

function formatKpiValue(summary: LLMRunSummary | undefined, selector: (value: LLMRunSummary) => string): string {
  return summary ? selector(summary) : 'Unavailable';
}

export const AiRunsKpiRow: React.FC<AiRunsKpiRowProps> = ({ summary, isLoading = false, hasError = false }) => {
  const errorRate = summary?.errorRate ?? 0;
  const displayErrorRate = isLoading
    ? 'Loading...'
    : formatKpiValue(summary, (value) => `${value.errorRate.toFixed(2)}%`);

  return (
    <div className="traces-kpi-row">
      <TracesKpiCard
        title="Total Runs"
        value={isLoading ? 'Loading...' : formatKpiValue(summary, (value) => formatNumber(value.totalRuns))}
        icon={Activity}
        accentColor={APP_COLORS.hex_5e60ce}
        accentBg={APP_COLORS.rgba_94_96_206_0p12_2}
      />
      <TracesKpiCard
        title="Error Rate"
        value={displayErrorRate}
        icon={AlertCircle}
        accentColor={hasError ? APP_COLORS.hex_f04438 : errorRate > 5 ? APP_COLORS.hex_f04438 : APP_COLORS.hex_73c991}
        accentBg={hasError ? APP_COLORS.rgba_240_68_56_0p12_2 : errorRate > 5 ? APP_COLORS.rgba_240_68_56_0p12_2 : APP_COLORS.rgba_115_201_145_0p12_2}
      />
      <TracesKpiCard
        title="P95 Latency"
        value={isLoading ? 'Loading...' : formatKpiValue(summary, (value) => formatDuration(value.p95LatencyMs))}
        icon={Zap}
        accentColor={APP_COLORS.hex_10b981}
        accentBg={APP_COLORS.rgba_16_185_129_0p12}
      />
      <TracesKpiCard
        title="Total Tokens"
        value={isLoading ? 'Loading...' : formatKpiValue(summary, (value) => formatNumber(value.totalTokens))}
        icon={Hash}
        accentColor={APP_COLORS.hex_f59e0b}
        accentBg={APP_COLORS.rgba_245_158_11_0p12}
      />
    </div>
  );
};
