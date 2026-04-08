import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Box,
  Brain,
  Bug,
  CheckCircle2,
  Circle,
  Clock,
  Cpu,
  Crosshair,
  Database,
  FileText,
  Flame,
  FolderOpen,
  Gauge,
  GitBranch,
  GitPullRequest,
  HardDrive,
  Layers,
  LayoutDashboard,
  List,
  type LucideIcon,
  Network,
  Radio,
  RefreshCw,
  Server,
  Share2,
  ShieldCheck,
  Target,
  TrendingDown,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react";

import type { DashboardPanelSpec } from "@/types/dashboardConfig";

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
export function getDashboardIcon(name: string, size = 16) {
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
