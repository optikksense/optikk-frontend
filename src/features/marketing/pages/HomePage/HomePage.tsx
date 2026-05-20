import {
  Activity,
  Bot,
  Database,
  GitBranch,
  Layers,
  LineChart,
  Network,
  ScrollText,
  Shield,
  Workflow,
} from "lucide-react";

import { GradientText } from "../../motion/GradientText";
import { CTA } from "../../sections/CTA";
import { ComparisonTable } from "../../sections/ComparisonTable";
import { FeatureGrid } from "../../sections/FeatureGrid";
import { Hero } from "../../sections/Hero";
import { LogoStrip } from "../../sections/LogoStrip";
import { MetricsStrip } from "../../sections/MetricsStrip";
import { SectionHeader } from "../../sections/SectionHeader";
import { Split } from "../../sections/Split";
import { DashboardMock, ProductMock } from "../../visuals/ProductMock";

const STACK_LOGOS = [
  { name: "OpenTelemetry" },
  { name: "Kafka" },
  { name: "ClickHouse" },
  { name: "MySQL" },
  { name: "Redis" },
  { name: "Kubernetes" },
  { name: "Prometheus" },
  { name: "AWS" },
  { name: "GCP" },
  { name: "Azure" },
];

const PILLARS = [
  {
    icon: Workflow,
    title: "One columnar store, three signals",
    body: "Logs, metrics, and traces all land in the same ClickHouse cluster. One query language, one cache, one place to look.",
    link: { label: "See architecture", path: "/architecture" },
    variant: "wide" as const,
  },
  {
    icon: Bot,
    title: "AI SRE on call",
    body: "Ask what changed, which deploy broke prod, where the latency leaked. Answers grounded in your telemetry graph.",
    link: { label: "Meet the AI SRE", path: "/features#ai-sre" },
    variant: "ink" as const,
  },
  {
    icon: Network,
    title: "Context Graph",
    body: "Services, deploys, hosts, pods, queries, and users are first-class entities — not strings to grep.",
    link: { label: "How it works", path: "/architecture" },
  },
  {
    icon: Layers,
    title: "OpenTelemetry-native",
    body: "Point your OTLP collector at us. Keep the schema you already have, drop the agent fleet you don't want.",
    link: { label: "OTel quickstart", path: "/opentelemetry" },
  },
  {
    icon: Shield,
    title: "Self-host or SaaS",
    body: "Run in our cloud, your VPC, or fully air-gapped. Same product, same pricing model, your choice of blast radius.",
    link: { label: "Deployment options", path: "/self-host" },
    variant: "grad" as const,
  },
  {
    icon: Database,
    title: "Pay for ingest, not seats",
    body: "Per-GiB or per-DPM, capped automatically. No tier walls, no surprise overage invoices.",
    link: { label: "See pricing", path: "/pricing" },
  },
];

const COMPARE_ROWS = [
  {
    label: "Built on off-the-shelf primitives",
    cells: [false, true, "partial", "partial"] as const,
  },
  {
    label: "OTLP-native ingest",
    cells: [true, true, "partial", true] as const,
  },
  {
    label: "Logs · metrics · traces unified",
    cells: [true, true, true, true] as const,
  },
  {
    label: "AI investigations grounded in graph",
    cells: [false, true, false, "partial"] as const,
  },
  {
    label: "Self-host (full feature parity)",
    cells: [false, true, false, "partial"] as const,
  },
  {
    label: "Predictable per-GiB pricing",
    cells: [false, true, false, false] as const,
  },
  {
    label: "Free tag cardinality",
    cells: [false, true, "partial", "partial"] as const,
  },
];

export default function HomePage() {
  return (
    <>
      <Hero
        eyebrow="Now in public beta"
        title={
          <>
            Observability the way <GradientText>developers actually use it.</GradientText>
          </>
        }
        subtitle="OpenTelemetry into Kafka, then ClickHouse. Live tail on Redis, Context Graph on MySQL, AI SRE on top. Self-hostable in your VPC, priced per GiB ingested."
        primaryCta={{ label: "Start free", path: "/login", variant: "grad" }}
        secondaryCta={{ label: "Read the docs", path: "/opentelemetry", variant: "secondary" }}
        meta={["No credit card", "5-minute setup", "Open source SDKs"]}
        visual={<ProductMock />}
      />

      <LogoStrip
        label="Built on / integrates with the stack your platform team already runs"
        items={STACK_LOGOS}
      />

      <section className="m-section m-section--tight">
        <div className="m-container">
          <MetricsStrip
            metrics={[
              { value: 10, suffix: "M", label: "spans / second", grad: true },
              { value: 0.45, decimals: 2, prefix: "$", suffix: " / GiB", label: "log ingest" },
              { value: 200, prefix: "<", suffix: "ms", label: "p99 query latency" },
              { value: 4, suffix: "× cheaper", label: "than Datadog at scale" },
            ]}
          />
        </div>
      </section>

      <section className="m-section">
        <div className="m-container">
          <SectionHeader
            eyebrow="The platform"
            title={
              <>
                Everything in one place, <GradientText>nothing forced into a box.</GradientText>
              </>
            }
            lede="Optikk is six tools shaped like one: ingest, store, query, alert, explain, and act — all on top of a Kafka → ClickHouse → Redis pipeline you can read and operate."
          />
          <FeatureGrid items={PILLARS} />
        </div>
      </section>

      <section className="m-section m-section--warm">
        <div className="m-container">
          <Split
            id="logs"
            eyebrow="Logs"
            title="The full stream, not just samples."
            body="Every line lands in ClickHouse with the full attribute map indexed. 30 days of hot data, columnar scans under 200ms, no log-vs-trace tradeoff."
            list={[
              {
                title: "Sub-second query on 30 days hot",
                body: "ClickHouse MergeTree partitions by day + service. Projection indexes for the queries observability tools actually run.",
              },
              {
                title: "Live tail via Redis pub/sub",
                body: "A million concurrent filtered tails fan out from Redis without touching the analytical store.",
              },
              {
                title: "Pattern detection without rules",
                body: "Auto-cluster log lines into templates. Spot the outlier in 2 billion lines in one click.",
              },
            ]}
            link={{ label: "Explore logs", path: "/features#logs" }}
            visual={<DashboardMock type="logs" />}
          />
        </div>
      </section>

      <section className="m-section">
        <div className="m-container">
          <Split
            id="traces"
            reverse
            eyebrow="Traces"
            title="Datadog-parity tracing. Open-format storage."
            body="Drag-to-zoom flame graphs, span-level diff, latency heatmaps, and a 10-tab span drawer with code, logs, profile, and AI explanation."
            list={[
              {
                title: "Compare any two traces",
                body: "Side-by-side spans, attribute diff, p99 delta. The fastest way to prove a deploy regressed.",
              },
              {
                title: "Cardinality without panic",
                body: "Group by user, tenant, region, query plan. We were built assuming you'd actually use the tags.",
              },
              {
                title: "Native OTLP, no proprietary SDK",
                body: "Point your existing OpenTelemetry collector at us. Your traces, your schema, our query engine.",
              },
            ]}
            link={{ label: "See trace explorer", path: "/features#traces" }}
            visual={<DashboardMock type="traces" />}
          />
        </div>
      </section>

      <section className="m-section m-section--warm">
        <div className="m-container">
          <Split
            id="metrics"
            eyebrow="Metrics"
            title="Prometheus-compatible. Time-series at warehouse scale."
            body="Ingest OTLP and Prometheus side by side. Run PromQL on a year of metrics without pre-aggregation hell."
            list={[
              {
                title: "PromQL native",
                body: "Drop-in for Prometheus queries, alerts, and Grafana dashboards. Migrate at your own pace.",
              },
              {
                title: "Per-DPM pricing, no cardinality tax",
                body: "Tags are free. Stop dropping labels just to keep the bill manageable.",
              },
              {
                title: "Recording rules + AI baselines",
                body: "Optikk learns your seasonality. Alert on actual anomalies, not 2σ spikes at 9am on Mondays.",
              },
            ]}
            link={{ label: "Metrics deep-dive", path: "/features#metrics" }}
            visual={<DashboardMock type="metrics" />}
          />
        </div>
      </section>

      <section className="m-section">
        <div className="m-container">
          <SectionHeader
            eyebrow="The honest comparison"
            title={
              <>
                Same telemetry. <GradientText>Less lock-in.</GradientText>
              </>
            }
            lede="Datadog and New Relic ship great UIs on proprietary stores you can't operate. Optikk ships the same UI on Kafka + ClickHouse + MySQL + Redis — a stack your platform team already runs."
            align="center"
          />
          <ComparisonTable
            columns={["", "Datadog", "Optikk", "Grafana Cloud", "Elastic"]}
            rows={COMPARE_ROWS}
            highlightColumn={2}
          />
        </div>
      </section>

      <section className="m-section m-section--warm">
        <div className="m-container">
          <SectionHeader
            eyebrow="What teams build with Optikk"
            title={
              <>
                From hobby project to <GradientText>10 million spans / second.</GradientText>
              </>
            }
            align="center"
          />
          <FeatureGrid
            items={[
              {
                icon: ScrollText,
                title: "Incident response loops",
                body: "Alert fires → Optikk drafts root cause from logs+traces+deploys → engineer pastes verdict in Slack in under 60 seconds.",
              },
              {
                icon: LineChart,
                title: "SLO programs at series-A scale",
                body: "Define burn rates, get auto-generated dashboards, and let Optikk page only when the budget actually erodes.",
              },
              {
                icon: GitBranch,
                title: "Deploy-aware rollouts",
                body: "Every deploy is annotated across every signal. Bisect a regression to a commit in two clicks.",
              },
              {
                icon: Activity,
                title: "LLM observability",
                body: "Trace prompt → model → tool calls → response. See cost, latency, and quality the same way you see HTTP.",
              },
            ]}
          />
        </div>
      </section>

      <CTA
        eyebrow="Get started"
        title={
          <>
            Wire OpenTelemetry once.{" "}
            <span style={{ color: "#fdba74" }}>Never re-do observability again.</span>
          </>
        }
        subtitle="Optikk is free up to 5 GiB/day of logs and 50M DPM. Bring your OTel collector. Bring your team. Ship faster on Monday."
        primary={{ label: "Start free", path: "/login" }}
        secondary={{ label: "Talk to engineering", path: "/self-host", variant: "secondary" }}
      />
    </>
  );
}
