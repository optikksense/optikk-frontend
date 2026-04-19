import { Activity, AlertTriangle, CheckCircle2, Clock, Gauge, TrendingUp } from "lucide-react";

import { StatCard } from "@shared/components/ui/cards";

import {
  DEMO_ERROR_SPARK,
  DEMO_KPIS,
  DEMO_P95_SPARK,
  DEMO_REQUEST_SPARK,
} from "./fixtures";

interface DemoKpiStripProps {
  readonly variant?: "full" | "compact";
}

const ACCENTS = {
  req: "#8B7FFF",
  err: "#EF6F98",
  ok: "#66C2A5",
  lat: "#6BB6FF",
} as const;

function latencyFormatter(value: string | number): string {
  return `${value}`;
}

function percentFormatter(value: string | number): string {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n.toFixed(2) : String(value);
}

function compactFormatter(value: string | number): string {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return String(value);
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toFixed(0);
}

export default function DemoKpiStrip({ variant = "full" }: DemoKpiStripProps) {
  const isCompact = variant === "compact";

  const cards = [
    {
      metric: { title: "Requests / min", value: DEMO_KPIS.requestsPerMin, formatter: compactFormatter },
      trend: { value: 4.2 },
      visuals: {
        icon: <Activity size={18} />,
        iconColor: ACCENTS.req,
        sparklineData: DEMO_REQUEST_SPARK,
        sparklineColor: ACCENTS.req,
      },
    },
    {
      metric: { title: "Errors / min", value: DEMO_KPIS.errorsPerMin, formatter: compactFormatter },
      trend: { value: -1.8, inverted: true },
      visuals: {
        icon: <AlertTriangle size={18} />,
        iconColor: ACCENTS.err,
        sparklineData: DEMO_ERROR_SPARK,
        sparklineColor: ACCENTS.err,
      },
    },
    {
      metric: {
        title: "Error rate",
        value: DEMO_KPIS.errorRate,
        formatter: percentFormatter,
        suffix: "%",
      },
      trend: { value: -0.6, inverted: true },
      visuals: { icon: <TrendingUp size={18} />, iconColor: ACCENTS.err },
    },
    {
      metric: { title: "P95 latency", value: DEMO_KPIS.p95Ms, formatter: latencyFormatter, suffix: "ms" },
      trend: { value: 2.1, inverted: true },
      visuals: {
        icon: <Gauge size={18} />,
        iconColor: ACCENTS.lat,
        sparklineData: DEMO_P95_SPARK,
        sparklineColor: ACCENTS.lat,
      },
    },
    {
      metric: { title: "P99 latency", value: DEMO_KPIS.p99Ms, formatter: latencyFormatter, suffix: "ms" },
      visuals: { icon: <Clock size={18} />, iconColor: ACCENTS.lat },
    },
    {
      metric: {
        title: "Services up",
        value: `${DEMO_KPIS.servicesHealthy} / ${DEMO_KPIS.servicesTotal}`,
      },
      visuals: { icon: <CheckCircle2 size={18} />, iconColor: ACCENTS.ok },
    },
  ];

  const visible = isCompact ? cards.slice(0, 3) : cards;
  const cols = isCompact ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6";

  return (
    <div className={`grid gap-3 ${cols}`}>
      {visible.map((card, i) => (
        <StatCard key={i} metric={card.metric} trend={card.trend} visuals={card.visuals} />
      ))}
    </div>
  );
}
