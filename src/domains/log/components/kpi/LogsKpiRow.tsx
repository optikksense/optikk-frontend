import { APP_COLORS } from '@config/colorLiterals';
import { AlertCircle, Server } from 'lucide-react';

import KpiCard from '../log/KpiCard';

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
        accentColor={errorCount > 0 ? APP_COLORS.hex_f04438 : APP_COLORS.hex_73c991}
        accentBg={errorCount > 0 ? APP_COLORS.rgba_240_68_56_0p12_2 : APP_COLORS.rgba_115_201_145_0p12_2}
        subtitle={errorCount > 0 ? 'Needs attention' : 'All clear'}
        trend={0}
      />
      <KpiCard
        title="Warnings"
        value={formatNumber(warnCount)}
        icon={AlertCircle}
        accentColor={warnCount > 0 ? APP_COLORS.hex_f79009 : APP_COLORS.hex_73c991}
        accentBg={warnCount > 0 ? APP_COLORS.rgba_247_144_9_0p12_2 : APP_COLORS.rgba_115_201_145_0p12_2}
        trend={0}
      />
      <KpiCard
        title="Services"
        value={formatNumber(serviceCount)}
        icon={Server}
        accentColor={APP_COLORS.hex_06aed5}
        accentBg={APP_COLORS.rgba_6_174_213_0p12_2}
        subtitle={totalCount > 0 ? `${formatNumber(totalCount)} total logs` : undefined}
        trend={0}
      />
    </div>
  );
}
