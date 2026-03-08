import {
  Activity, AlertCircle, Clock, Zap, Network, Layers,
  ArrowUpRight, ArrowDownRight, AlertTriangle, Database,
  HardDrive, Cpu, Radio, Gauge, GitPullRequest, Target,
  BarChart3, Server, ShieldCheck, TrendingDown, Box,
  CheckCircle2, Circle, FolderOpen, RefreshCw, XCircle,
  Brain, FileText, LayoutDashboard, GitBranch,
} from 'lucide-react';

import type { DashboardComponentSpec } from '@/types/dashboardConfig';

import { createLineDataset, getChartColor } from '@shared/utils/chartHelpers';

import { APP_COLORS } from '@config/colorLiterals';

const ICONS: Record<string, any> = {
  Activity, AlertCircle, Clock, Zap, Network, Layers,
  ArrowUpRight, ArrowDownRight, AlertTriangle, Database,
  HardDrive, Cpu, Radio, Gauge, GitPullRequest, Target,
  BarChart3, Server, ShieldCheck, TrendingDown, Box,
  CheckCircle2, Circle, FolderOpen, RefreshCw, XCircle,
  Brain, FileText, LayoutDashboard, GitBranch,
};

/**
 *
 */
export function getDashboardIcon(name: string, size: number = 16) {
  const IconComponent = ICONS[name];
  if (!IconComponent) return null;
  return <IconComponent size={size} />;
}

/**
 *
 */
export function resolveDataSourceId(chartConfig: DashboardComponentSpec): string {
  return String(chartConfig.dataSource || chartConfig.id);
}

/**
 *
 */
export function buildAiTimeseries(rows: any[], metricKey: string, groupKey: string = 'model_name', filterValue: string | null = null) {
  const arr = Array.isArray(rows) ? rows : [];
  const filtered = filterValue ? arr.filter((row) => row[groupKey] === filterValue) : arr;
  const tsSet = new Set<string>();
  const groupSet = new Set<string>();
  for (const row of filtered) {
    if (row[metricKey] != null && row[metricKey] !== '' && row[metricKey] !== 0) {
      tsSet.add(row.timestamp);
      groupSet.add(row[groupKey] || 'unknown');
    }
  }
  const timestamps = Array.from(tsSet).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  const groups = Array.from(groupSet);
  const lookup: Record<string, Record<string, number | null>> = {};
  for (const row of filtered) {
    const group = row[groupKey] || 'unknown';
    if (!lookup[group]) lookup[group] = {};
    const value = Number(row[metricKey]);
    lookup[group][row.timestamp] = Number.isNaN(value) ? null : Math.round(value * 100000) / 100000;
  }
  const labels = timestamps.map((ts) => {
    const date = new Date(ts);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  });
  const datasets = groups.map((group, index) =>
    createLineDataset(group, timestamps.map((timestamp) => lookup[group]?.[timestamp] ?? null), getChartColor(index), false),
  );
  return { labels, datasets, hasData: datasets.length > 0 };
}
