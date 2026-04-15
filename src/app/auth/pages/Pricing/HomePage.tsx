import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Check, ChevronRight } from "lucide-react";

import CodeTabs from "./CodeTabs";
import DashboardMockup from "./DashboardMockup";

const PRODUCT_SHOTS: { src: string; alt: string; wide?: boolean }[] = [
  { src: "/marketing/shot-01.png", alt: "Optikk overview and service health", wide: true },
  { src: "/marketing/shot-02.png", alt: "Distributed traces and latency breakdown" },
  { src: "/marketing/shot-03.png", alt: "Metrics explorer" },
  { src: "/marketing/shot-04.png", alt: "Log search and live tail", wide: true },
  { src: "/marketing/shot-05.png", alt: "Infrastructure topology" },
  { src: "/marketing/shot-06.png", alt: "Service map and dependencies" },
  { src: "/marketing/shot-07.png", alt: "Saturation and datastore signals" },
  { src: "/marketing/shot-08.png", alt: "Error tracking and workflows" },
  { src: "/marketing/shot-09.png", alt: "Dashboards and SLO views" },
  { src: "/marketing/shot-10.png", alt: "LLM observability" },
  { src: "/marketing/shot-11.png", alt: "Alerting and rules" },
  { src: "/marketing/shot-12.png", alt: "Team and settings" },
  { src: "/marketing/shot-13.png", alt: "Deep dive panel" },
  { src: "/marketing/shot-14.png", alt: "Correlation across signals" },
];

const DOCKER_CMD = `services:
  optikk:
    image: ghcr.io/optikk-org/optikk:latest
    ports: ["3000:3000", "4317:4317", "4318:4318"]
    environment:
      - OPTIKK_SECRET=changeme
  clickhouse:
    image: clickhouse/clickhouse-server:latest
    volumes: [ch_data:/var/lib/clickhouse]
  mysql:
    image: mysql:8
    volumes: [mysql_data:/var/lib/mysql]
volumes:
  ch_data:
  mysql_data:`;

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <>
      <section className="hero-section">
        <div className="hero-grid">
          <div className="hero-copy">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="hero-badge"
            >
              • OPEN SOURCE · OPENTELEMETRY NATIVE
            </motion.div>

            <h1 className="hero-title">
              <span className="word-reveal">
                <motion.span
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.08 }}
                >
                  Full-stack{" "}
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.16 }}
                >
                  observability
                </motion.span>
              </span>
              <br />
              <span className="word-reveal">
                <motion.span
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.24 }}
                >
                  at{" "}
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.32 }}
                  className="text-cyan"
                >
                  $0.05/GB.
                </motion.span>
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="hero-subtitle"
            >
              Metrics, traces, logs, and LLM telemetry — all on OpenTelemetry. No proprietary
              agents, no feature gating, no vendor lock-in. The same low ingest price from your
              first gigabyte.
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.58 }}
              style={{
                fontSize: 15,
                color: "var(--muted)",
                maxWidth: 540,
                marginBottom: 28,
                lineHeight: 1.5,
              }}
            >
              MIT-licensed core. Run our managed stack or self-host the exact same binaries — your
              data stays portable with standard OTLP pipelines.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="hero-ctas"
            >
              <button
                type="button"
                className="btn-primary"
                onClick={() => navigate({ to: "/login" })}
              >
                Start in minutes
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => navigate({ to: "/pricing" })}
              >
                See pricing
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="trust-pills"
            >
              <span className="trust-pill">
                <Check size={12} className="text-cyan" /> OTLP gRPC/HTTP
              </span>
              <span className="trust-pill">
                <Check size={12} className="text-cyan" /> Self-host or cloud
              </span>
              <span className="trust-pill">
                <Check size={12} className="text-cyan" /> Sub-second query
              </span>
              <span className="trust-pill">
                <Check size={12} className="text-cyan" /> All features included
              </span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hero-mockup-wrapper"
          >
            <DashboardMockup />
          </motion.div>
        </div>
      </section>

      <section className="ticker-section">
        <div className="ticker-label">
          Built for teams that outgrow per-seat observability bills
        </div>
        <div className="ticker-track">
          <div className="ticker-content">
            {[
              "OpenTelemetry",
              "ClickHouse",
              "Kafka",
              "Prometheus",
              "Kubernetes",
              "Docker",
              "GitHub Actions",
              "Terraform",
              "OpenTelemetry",
              "ClickHouse",
              "Kafka",
              "Prometheus",
            ].map((name, i) => (
              <span key={i} className="ticker-item">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="section-header center" style={{ marginBottom: 48 }}>
          <h2 className="section-title">From the real product</h2>
          <p className="section-subtitle">
            Screens captured from Optikk — same experience in cloud or self-hosted deployments.
          </p>
        </div>
        <div className="mkt-shot-grid" style={{ maxWidth: 1200, margin: "0 auto" }}>
          {PRODUCT_SHOTS.map((shot) => (
            <figure
              key={shot.src}
              className={`mkt-shot${shot.wide ? " mkt-shot--wide" : ""}`}
              style={{ margin: 0 }}
            >
              <img src={shot.src} alt={shot.alt} loading="lazy" decoding="async" />
            </figure>
          ))}
        </div>
      </section>

      <section className="features-section">
        <div className="features-grid">
          {[
            {
              title: "Metrics & dashboards",
              desc: "Prometheus-compatible ingestion, recording rules, and dense dashboards tuned for on-call.",
            },
            {
              title: "Distributed tracing",
              desc: "OpenTelemetry-native timelines, exemplars, and trace-to-log correlation out of the box.",
            },
            {
              title: "Logs at scale",
              desc: "Structured search, live tail, and retention policies that stay economical on ClickHouse.",
            },
            {
              title: "SLOs & alerts",
              desc: "Burn rates, multi-window policies, and routing to Slack, PagerDuty, or webhooks.",
            },
            {
              title: "Service graph",
              desc: "Auto-discovered dependencies with health overlays and saturation signals.",
            },
            {
              title: "LLM observability",
              desc: "Token usage, latency, session grouping, and eval hooks for generative workloads.",
            },
            {
              title: "Infrastructure map",
              desc: "Hosts, containers, and datastores in one place with golden signals.",
            },
            {
              title: "Kafka & queues",
              desc: "Topic lag, consumer health, and broker pressure alongside application traces.",
            },
            {
              title: "Errors & regressions",
              desc: "Fingerprinted issues, deployment markers, and compare-any-two releases.",
            },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="feature-card component-card"
            >
              <div className="feature-icon-box">
                <Check size={18} className="text-indigo" />
              </div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
              <button
                type="button"
                className="feature-link"
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                onClick={() => navigate({ to: "/features" })}
              >
                Explore features <ChevronRight size={14} />
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      <motion.section
        className="otel-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="otel-grid">
          <div className="otel-copy">
            <div className="hero-badge" style={{ marginBottom: 24 }}>
              • STANDARD OTLP
            </div>
            <h2 className="section-title">Instrument once. Export anywhere.</h2>
            <p className="section-subtitle" style={{ textAlign: "left", margin: "0 0 32px 0" }}>
              Optikk speaks native OpenTelemetry. Keep your collectors, sidecars, and SDKs — swap
              the backend without retooling your services.
            </p>
            <ul className="otel-checklist">
              <li>
                <Check size={16} className="text-cyan" />{" "}
                <span>
                  <strong>Vendor-neutral pipelines</strong> — reuse OpenTelemetry Collector configs
                  and processors you already run.
                </span>
              </li>
              <li>
                <Check size={16} className="text-cyan" />{" "}
                <span>
                  <strong>Trace + log correlation</strong> — trace and span IDs indexed with logs
                  automatically.
                </span>
              </li>
              <li>
                <Check size={16} className="text-cyan" />{" "}
                <span>
                  <strong>Histograms & exemplars</strong> — Prometheus remote write and OTLP metrics
                  with native histograms.
                </span>
              </li>
              <li>
                <Check size={16} className="text-cyan" />{" "}
                <span>
                  <strong>Portable storage</strong> — MIT core you can fork, extend, and run under
                  your compliance boundary.
                </span>
              </li>
            </ul>
          </div>
          <div className="otel-code">
            <CodeTabs
              tabs={[
                {
                  id: "go",
                  label: "Go",
                  language: "go",
                  code: `import (
  "go.opentelemetry.io/otel"
  "go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
  sdktrace "go.opentelemetry.io/otel/sdk/trace"
)

func initTracer(ctx context.Context) {
  exporter, _ := otlptracegrpc.New(ctx,
    otlptracegrpc.WithEndpoint("ingest.optikk.io:4317"),
    otlptracegrpc.WithHeaders(map[string]string{
      "x-optikk-token": os.Getenv("OPTIKK_TOKEN"),
    }),
  )
  tp := sdktrace.NewTracerProvider(
    sdktrace.WithBatcher(exporter),
    sdktrace.WithResource(resource.NewWithAttributes(
      semconv.SchemaURL,
      semconv.ServiceNameKey.String("my-service"),
    )),
  )
  otel.SetTracerProvider(tp)
}`,
                },
                {
                  id: "python",
                  label: "Python",
                  language: "python",
                  code: `from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

provider = TracerProvider()
exporter = OTLPSpanExporter(
    endpoint="ingest.optikk.io:4317",
    headers=(("x-optikk-token", os.environ["OPTIKK_TOKEN"]),),
)
provider.add_span_processor(BatchSpanProcessor(exporter))
trace.set_tracer_provider(provider)
tracer = trace.get_tracer("my-service")`,
                },
                {
                  id: "java",
                  label: "Java",
                  language: "java",
                  code: `OpenTelemetrySdk.builder()
    .setTracerProvider(
        SdkTracerProvider.builder()
            .addSpanProcessor(
                BatchSpanProcessor.builder(
                    OtlpGrpcSpanExporter.builder()
                        .setEndpoint("https://ingest.optikk.io:4317")
                        .addHeader("x-optikk-token",
                            System.getenv("OPTIKK_TOKEN"))
                        .build())
                .build())
            .build())
    .buildAndRegisterGlobal();`,
                },
                {
                  id: "node",
                  label: "Node.js",
                  language: "typescript",
                  code: `import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions'

  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: 'my-service',
    }),
    traceExporter: new OTLPTraceExporter({
      url: 'https://ingest.optikk.io:4317',
      headers: { 'x-optikk-token': process.env.OPTIKK_TOKEN ?? '' },
  }),
})
sdk.start()`,
                },
              ]}
            />
          </div>
        </div>
      </motion.section>

      <motion.section
        className="selfhost-section"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="selfhost-grid">
          <div className="selfhost-copy">
            <h2 className="section-title">Same code path in your VPC or ours.</h2>
            <p className="selfhost-desc">
              Pull the official container, bring your own ClickHouse cluster, or use our managed
              stack — pricing stays tied to ingestion, not seats.
            </p>
            <div className="selfhost-ctas">
              <a
                href="https://github.com/optikk-org"
                target="_blank"
                rel="noreferrer"
                className="btn-ghost"
              >
                <svg
                  aria-hidden="true"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57" />
                </svg>
                View on GitHub
              </a>
              <button
                type="button"
                className="text-link"
                onClick={() => navigate({ to: "/self-host" })}
              >
                Self-hosting guide <ChevronRight size={14} />
              </button>
            </div>
          </div>
          <div className="selfhost-code component-card" style={{ padding: 16 }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 12, paddingLeft: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF5F57" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FEBC2E" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28C840" }} />
            </div>
            <CodeTabs
              tabs={[
                { id: "yaml", label: "docker-compose.yml", language: "yaml", code: DOCKER_CMD },
              ]}
            />
          </div>
        </div>
      </motion.section>
    </>
  );
}
