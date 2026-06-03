import {
  Activity,
  Bot,
  Database,
  GitBranch,
  Github,
  Layers,
  LineChart,
  Network,
  ScrollText,
  Shield,
  Star,
  Workflow,
} from "lucide-react";

import { OSS, formatStars } from "../../constants";
import { useGitHubStars } from "../../hooks/useGitHubStars";

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
import { Screenshot } from "../../visuals/Screenshot";

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
    title: "Unified storage, three signals",
    body: "Logs, metrics, and traces all land in the same high-performance columnar database. One query language, one cache, one place to look.",
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
    title: "Flexible Deployments",
    body: "Run in your private cloud, VPC, or fully air-gapped. Select the blast radius you can defend, with complete code parity.",
    link: { label: "Deployment options", path: "/self-host" },
    variant: "grad" as const,
  },
  {
    icon: Github,
    title: "Open source at the core",
    body: "Engine, scheduler, and frontend dashboard are Apache 2.0. Self-host the whole stack from public repos with a single helm command.",
    link: { label: "View on GitHub", path: OSS.org },
  },
];

const COMPARE_ROWS = [
  {
    label: "Open source (Apache 2.0)",
    cells: [false, true, "partial", "partial"] as const,
  },
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
    label: "Free tag cardinality",
    cells: [false, true, "partial", "partial"] as const,
  },
];

export default function HomePage() {
  const { stars, totalStars } = useGitHubStars();
  return (
    <>
      <Hero
        eyebrow="Now in public beta"
        title={
          <>
            Observability the way <GradientText>developers actually use it.</GradientText>
          </>
        }
        subtitle="Unified logs, metrics, and traces with native OpenTelemetry. Instant live tail, intelligent context graphs, and AI SRE on top. Run fully self-hosted in your VPC or private cloud."
        primaryCta={{ label: "Self-host now", path: "/self-host", variant: "grad" }}
        secondaryCta={{ label: "Read the docs", path: "/opentelemetry", variant: "secondary" }}
        meta={["Apache 2.0 licensed", "Kubernetes native", "5-minute setup"]}
        visual={
          <Screenshot
            name="overview"
            alt="Optikk saturation overview showing Kafka, Database, Redis, and Queues subsystems with a fleet hex-map"
            eager
            fallback={<ProductMock />}
          />
        }
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
              { value: 100, suffix: "%", label: "open source" },
              { value: 200, prefix: "<", suffix: "ms", label: "p99 query latency" },
              { value: 15, suffix: "×", label: "telemetry compression" },
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
            lede="Optikk is six tools shaped like one: ingest, store, query, alert, explain, and act — unified in a single, high-performance telemetry pipeline."
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
            body="Every line lands in our unified database with the full attribute map indexed. 30 days of hot data, columnar scans under 200ms, no log-vs-trace tradeoff."
            list={[
              {
                title: "Sub-second query on 30 days hot",
                body: "Partitions by day and service, with built-in projection indexes optimized for queries observability tools actually run.",
              },
              {
                title: "Instant live tail streaming",
                body: "A million concurrent filtered tails fan out from the cache without touching the analytical store.",
              },
              {
                title: "Pattern detection without rules",
                body: "Auto-cluster log lines into templates. Spot the outlier in 2 billion lines in one click.",
              },
            ]}
            link={{ label: "Explore logs", path: "/features#logs" }}
            visual={
              <Screenshot
                name="logs"
                alt="Optikk logs explorer with severity facets and timeline histogram"
                bare
                fallback={<DashboardMock type="logs" />}
              />
            }
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
            visual={
              <Screenshot
                name="trace"
                alt="Optikk trace waterfall for POST /api/v2/checkout with span detail panel"
                bare
                fallback={<DashboardMock type="traces" />}
              />
            }
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
                title: "Unlimited cardinality, no tag tax",
                body: "Tags are free. Stop dropping labels just to keep your dashboards fast.",
              },
              {
                title: "Recording rules + AI baselines",
                body: "Optikk learns your seasonality. Alert on actual anomalies, not 2σ spikes at 9am on Mondays.",
              },
            ]}
            link={{ label: "Metrics deep-dive", path: "/features#metrics" }}
            visual={
              <Screenshot
                name="service-detail"
                alt="Optikk service detail for payment-svc with golden signals and top endpoints"
                bare
                fallback={<DashboardMock type="metrics" />}
              />
            }
          />
        </div>
      </section>

      <section className="m-section m-section--ink" id="open-source">
        <div className="m-container">
          <SectionHeader
            eyebrow="Open source"
            title={
              <span style={{ color: "#fff" }}>
                Apache 2.0, <GradientText>top to bottom.</GradientText>
              </span>
            }
            lede={
              <span style={{ color: "#c0cee0" }}>
                The engine, the OTel collector build, the language SDKs, and the Helm chart all live
                on GitHub. Self-host runs the same binaries Cloud does — no proprietary fork, no
                closed core.
              </span>
            }
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 18,
              marginTop: 36,
            }}
          >
            <a
              className="is-ink m-bento-card"
              href={OSS.frontend}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: "none" }}
            >
              <span className="m-bento-icon">
                <Github size={20} />
              </span>
              <h3 className="m-h4">optikk-frontend</h3>
              <p className="m-body-sm">
                Frontend UI dashboard of Observability. Built with React 19, Vite, and TypeScript.
              </p>
              <div className="m-bento-link">
                <Star size={13} strokeWidth={2.4} /> {formatStars(stars["optikk-frontend"] || 0)} ·
                Apache 2.0
              </div>
            </a>
            <a
              className="is-ink m-bento-card"
              href={OSS.backend}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: "none" }}
            >
              <span className="m-bento-icon">
                <Github size={20} />
              </span>
              <h3 className="m-h4">optikk-backend</h3>
              <p className="m-body-sm">
                Go core backend engine. Handles high-throughput ingestion, storage, and AI-assisted
                query resolution.
              </p>
              <div className="m-bento-link">
                <Star size={13} strokeWidth={2.4} /> {formatStars(stars["optikk-backend"] || 0)} ·
                Apache 2.0
              </div>
            </a>
            <a
              className="is-ink m-bento-card"
              href={OSS.scheduler}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: "none" }}
            >
              <span className="m-bento-icon">
                <Github size={20} />
              </span>
              <h3 className="m-h4">scheduler</h3>
              <p className="m-body-sm">
                Distributed Go scheduling engine for alerting pipelines and tasks orchestration.
              </p>
              <div className="m-bento-link">
                <Star size={13} strokeWidth={2.4} /> {formatStars(stars.scheduler || 0)} · Apache
                2.0
              </div>
            </a>
            <a
              className="is-ink m-bento-card"
              href={OSS.otelDemo}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: "none" }}
            >
              <span className="m-bento-icon">
                <Github size={20} />
              </span>
              <h3 className="m-h4">opentelemetry-demo</h3>
              <p className="m-body-sm">
                Astronomy Shop microservices demonstration instrumented with OpenTelemetry.
              </p>
              <div className="m-bento-link">
                <Star size={13} strokeWidth={2.4} /> {formatStars(stars["opentelemetry-demo"] || 0)}{" "}
                · Apache 2.0
              </div>
            </a>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              marginTop: 28,
              justifyContent: "center",
            }}
          >
            <a
              className="m-btn m-btn-primary"
              href={OSS.frontend}
              target="_blank"
              rel="noreferrer"
              style={{ background: "#fff", color: "var(--m-ink)", borderColor: "#fff" }}
            >
              <Star size={16} strokeWidth={2.4} />
              Star on GitHub · {formatStars(totalStars)}
            </a>
            <a
              className="m-btn m-btn-secondary"
              href={OSS.org}
              target="_blank"
              rel="noreferrer"
              style={{
                background: "transparent",
                color: "#fff",
                borderColor: "rgba(255,255,255,0.3)",
              }}
            >
              All repos
            </a>
          </div>
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
            lede="Datadog and New Relic ship great UIs on proprietary, black-box systems. Optikk gives you a unified, open-source platform that you can run in your own VPC or private cloud, with zero vendor lock-in."
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
        subtitle="Optikk is fully open source under the Apache 2.0 license. Bring your OTel collector. Bring your team. Ship faster on Monday."
        primary={{ label: "Self-host now", path: "/self-host" }}
        secondary={{ label: "Read the docs", path: "/opentelemetry", variant: "secondary" }}
      />
    </>
  );
}
