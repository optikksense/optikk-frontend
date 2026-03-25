import {
  Activity,
  AlertCircle,
  Bug,
  Clock,
  Crosshair,
  Flame,
  List,
  Zap,
  Network,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Database,
  HardDrive,
  Cpu,
  Radio,
  Gauge,
  GitPullRequest,
  Target,
  BarChart3,
  Server,
  ShieldCheck,
  TrendingDown,
  Box,
  CheckCircle2,
  Circle,
  FolderOpen,
  RefreshCw,
  XCircle,
  Brain,
  FileText,
  LayoutDashboard,
  GitBranch,
  Share2,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';

import type { DashboardPanelSpec } from '@/types/dashboardConfig';

const ICONS: Record<string, LucideIcon> = {
  Activity,
  AlertCircle,
  Bug,
  Clock,
  Crosshair,
  Flame,
  List,
  Zap,
  Network,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Database,
  HardDrive,
  Cpu,
  Radio,
  Gauge,
  GitPullRequest,
  Target,
  BarChart3,
  Server,
  ShieldCheck,
  TrendingDown,
  Box,
  CheckCircle2,
  Circle,
  FolderOpen,
  RefreshCw,
  XCircle,
  Brain,
  FileText,
  LayoutDashboard,
  GitBranch,
  Share2,
  TrendingUp,
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
export function resolveDataSourceId(chartConfig: DashboardPanelSpec): string {
  return String(chartConfig.dataSource || chartConfig.id);
}
