import { Activity, GitBranch, LineChart, ScrollText } from "lucide-react";
import { GradientText } from "../../motion/GradientText";
import { CTA } from "../../sections/CTA";
import { ComparisonTable } from "../../sections/ComparisonTable";
import { FeatureGrid } from "../../sections/FeatureGrid";
import { Hero } from "../../sections/Hero";
import { LogoStrip } from "../../sections/LogoStrip";
import { MetricsStrip } from "../../sections/MetricsStrip";
import { SectionHeader } from "../../sections/SectionHeader";
import { Split } from "../../sections/Split";
import { ProductMock } from "../../visuals/ProductMock";
import { DashboardMock } from "../../visuals/DashboardMock";
import { Screenshot } from "../../visuals/Screenshot";
import { OpenSourceSection } from "../../sections/OpenSourceSection";
import { STACK_LOGOS, PILLARS, COMPARE_ROWS } from "./HomePageData";

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
        label="Built on / integrates with the stack your platform tenant already runs"
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

      <OpenSourceSection />

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
            eyebrow="What tenants build with Optikk"
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
        subtitle="Optikk is fully open source under the Apache 2.0 license. Bring your OTel collector. Bring your tenant. Ship faster on Monday."
        primary={{ label: "Self-host now", path: "/self-host" }}
        secondary={{ label: "Read the docs", path: "/opentelemetry", variant: "secondary" }}
      />
    </>
  );
}
