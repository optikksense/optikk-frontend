import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AlertCircle } from 'lucide-react';
import { Spin } from 'antd';

import { APP_COLORS } from '@config/colorLiterals';

import type { LogAggregateRow } from '../../types';

const SERVICE_COLORS = [
  APP_COLORS.hex_f04438,
  APP_COLORS.hex_f79009,
  APP_COLORS.hex_5e60ce,
  APP_COLORS.hex_06aed5,
  APP_COLORS.hex_d92d20,
  APP_COLORS.hex_98a2b3,
];

interface LogsErrorRateChartProps {
  rows: LogAggregateRow[];
  isLoading: boolean;
}

export default function LogsErrorRateChart({ rows, isLoading }: LogsErrorRateChartProps) {
  // Pivot: [{time_bucket, service1: rate, service2: rate, ...}]
  const { chartData, services } = useMemo(() => {
    const bucketMap = new Map<string, Record<string, number>>();
    const serviceSet = new Set<string>();

    for (const row of rows) {
      const bucket = row.time_bucket;
      if (!bucketMap.has(bucket)) bucketMap.set(bucket, {});
      bucketMap.get(bucket)![row.group_value] = row.error_rate ?? 0;
      serviceSet.add(row.group_value);
    }

    const sortedBuckets = Array.from(bucketMap.keys()).sort();
    const chartData = sortedBuckets.map(bucket => ({ bucket, ...bucketMap.get(bucket) }));
    const services = Array.from(serviceSet);

    return { chartData, services };
  }, [rows]);

  if (isLoading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120 }}><Spin size="small" /></div>;
  }

  if (!rows.length) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, color: 'var(--text-secondary)', fontSize: 12 }}>No error rate data</div>;
  }

  return (
    <div className="logs-chart-card logs-chart-card--wide">
      <div className="logs-chart-card-header">
        <span className="logs-chart-card-title"><AlertCircle size={15} />Error Rate by Service (%)</span>
      </div>
      <div className="logs-chart-card-body" style={{ height: 140 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <XAxis dataKey="bucket" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} unit="%" width={36} />
            <Tooltip
              contentStyle={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 8, fontSize: 11 }}
              formatter={(value: number | undefined) => [`${(value ?? 0).toFixed(1)}%`]}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {services.map((svc, i) => (
              <Area
                key={svc}
                type="monotone"
                dataKey={svc}
                stroke={SERVICE_COLORS[i % SERVICE_COLORS.length]}
                fill={SERVICE_COLORS[i % SERVICE_COLORS.length] + '22'}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
