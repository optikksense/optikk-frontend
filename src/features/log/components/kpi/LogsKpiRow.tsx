import { AlertCircle, Server } from 'lucide-react';

import KpiCard from '@features/log/components/log/KpiCard';

import { formatNumber } from '@utils/formatters';

interface LogsKpiRowProps {
  errorCount: number;
  warnCount: number;
  serviceCount: number;
  totalCount: number;
}

/**
 *
 * @param root0
 * @param root0.errorCount
 * @param root0.warnCount
 * @param root0.serviceCount
 * @param root0.totalCount
 */
export default function LogsKpiRow({
  errorCount,
  warnCount,
  serviceCount,
  totalCount,
}: LogsKpiRowProps) {
  return (
    <div className="logs-kpi-row">
      <KpiCard
        title="Errors & Fatals"
        value={formatNumber(errorCount)}
        icon={AlertCircle}
        accentColor={errorCount > 0 ? '#F04438' : '#73C991'}
        accentBg={errorCount > 0 ? 'rgba(240,68,56,0.12)' : 'rgba(115,201,145,0.12)'}
        subtitle={errorCount > 0 ? 'Needs attention' : 'All clear'}
        trend={0}
      />
      <KpiCard
        title="Warnings"
        value={formatNumber(warnCount)}
        icon={AlertCircle}
        accentColor={warnCount > 0 ? '#F79009' : '#73C991'}
        accentBg={warnCount > 0 ? 'rgba(247,144,9,0.12)' : 'rgba(115,201,145,0.12)'}
        trend={0}
      />
      <KpiCard
        title="Services"
        value={formatNumber(serviceCount)}
        icon={Server}
        accentColor="#06AED5"
        accentBg="rgba(6,174,213,0.12)"
        subtitle={totalCount > 0 ? `${formatNumber(totalCount)} total logs` : undefined}
        trend={0}
      />
    </div>
  );
}
