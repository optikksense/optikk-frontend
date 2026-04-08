import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronRight } from "lucide-react";
import { useState } from "react";

import "./Product.css";
import CodeTabs from "./CodeTabs";
import DashboardMockup from "./DashboardMockup";
import MarketingFooter from "./MarketingFooter";
import MarketingNav from "./MarketingNav";
import ServiceMap from "./ServiceMap";
import TraceMockup from "./TraceMockup";

const OPTIKK_TOKEN = import.meta.env.VITE_OPTIKK_TOKEN ?? "YOUR_TOKEN";

export default function ProductPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "traces" | "map">("overview");

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

  return (
    <div className="product-container">
      <div className="product-noise" />

      {/* Background Orbs */}
      <div className="hero-glow hero-glow-1" />
      <div className="hero-glow hero-glow-2" />

      <MarketingNav />

      {/* ==================== HERO SECTION ==================== */}
      <section className="hero-section">
        <div className="hero-grid">
          <div className="hero-copy">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="hero-badge"
            >
              • OPENTELEMETRY NATIVE
            </motion.div>

            <h1 className="hero-title">
              <span className="word-reveal">
                <motion.span
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.08 }}
                >
                  Observe{" "}
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.16 }}
                >
                  everything.{" "}
                </motion.span>
              </span>
              <br />
              <span className="word-reveal">
                <motion.span
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.24 }}
                >
                  Debug{" "}
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.32 }}
                  className="text-cyan"
                >
                  anything.
                </motion.span>
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="hero-subtitle"
            >
              Unified metrics, distributed traces, and structured logs — powered by OpenTelemetry.
              Built for engineers who need answers in seconds, not hours.
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
                Deploy Now
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => window.open("https://youtube.com", "_blank")}
              >
                <span className="play-icon">▶</span> Watch Demo
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="trust-pills"
            >
              <span className="trust-pill">
                <Check size={12} className="text-cyan" /> OTel Compatible
              </span>
              <span className="trust-pill">
                <Check size={12} className="text-cyan" /> Self-Hosted
              </span>
              <span className="trust-pill">
                <Check size={12} className="text-cyan" /> Real-time
              </span>
              <span className="trust-pill">
                <Check size={12} className="text-cyan" /> Multi-tenant
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

      {/* ==================== SOCIAL PROOF TICKER ==================== */}
      <section className="ticker-section">
        <div className="ticker-label">Trusted by 2,400+ engineering teams</div>
        <div className="ticker-track">
          <div className="ticker-content">
            {[
              "Stripe",
              "Vercel",
              "Notion",
              "Linear",
              "Figma",
              "Shopify",
              "Cloudflare",
              "Stripe",
              "Vercel",
              "Notion",
              "Linear",
              "Figma",
            ].map((name, i) => (
              <span key={i} className="ticker-item">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== PRODUCT TOUR ==================== */}
      <motion.section
        className="tour-section"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="section-header center">
          <h2 className="section-title">Built for how engineers actually work</h2>
          <p className="section-subtitle">
            Dense information, zero fluff. Every screen designed to answer your question in seconds.
          </p>
        </div>

        <div className="tour-tabs">
          {(["overview", "traces", "map"] as const).map((tab) => (
            <button
              type="button"
              key={tab}
              className={`tour-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {activeTab === tab && (
                <motion.div layoutId="tour-indicator" className="tour-indicator" />
              )}
              <span style={{ position: "relative", zIndex: 1, textTransform: "capitalize" }}>
                {tab === "map" ? "Service Map" : tab === "overview" ? "Overview & SLOs" : tab}
              </span>
            </button>
          ))}
        </div>

        <div className="tour-mockup-container">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.15 } }}
              transition={{ duration: 0.4 }}
              style={{ width: "100%" }}
            >
              {activeTab === "overview" && <DashboardMockup compact />}
              {activeTab === "traces" && <TraceMockup />}
              {activeTab === "map" && <ServiceMap />}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.section>

      {/* ==================== FEATURES GRID ==================== */}
      <section className="features-section">
        <div className="features-grid">
          {[
            {
              title: "Real-time Metrics",
              desc: "PromQL compatible, backend-driven dashboards, and instant service visibility.",
            },
            {
              title: "Distributed Tracing",
              desc: "OpenTelemetry native, flame graphs, trace-to-log correlation.",
            },
            {
              title: "Centralized Logs",
              desc: "Full-text search, structured + unstructured, live tail.",
            },
            {
              title: "SLOs & Reliability",
              desc: "Error budgets, burn-rate analysis, and service health tracking.",
            },
            {
              title: "Service Maps",
              desc: "Auto-discovered topology, dependency graphs, health overlays.",
            },
            {
              title: "AI Observability",
              desc: "LLM token usage, latency, hallucination rate tracking.",
            },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="feature-card component-card"
            >
              <div className="feature-icon-box">
                <Check size={18} className="text-indigo" />
              </div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
              <a href="#" className="feature-link">
                Learn more <ChevronRight size={14} />
              </a>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ==================== OPENTELEMETRY SDK ==================== */}
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
              • CLIENT SDKs
            </div>
            <h2 className="section-title">Instrument in minutes, not hours</h2>
            <p className="section-subtitle" style={{ textAlign: "left", margin: "0 0 32px 0" }}>
              Optikk is built on OpenTelemetry — the industry standard. Use the official OTel SDKs
              you already know. No proprietary agents. No vendor lock-in. Your data, your way.
            </p>
            <ul className="otel-checklist">
              <li>
                <Check size={16} className="text-cyan" />{" "}
                <span>
                  <strong>Zero-config tracing</strong> — automatic span propagation across HTTP and
                  gRPC
                </span>
              </li>
              <li>
                <Check size={16} className="text-cyan" />{" "}
                <span>
                  <strong>Structured log shipping</strong> — JSON logs with automatic trace
                  correlation
                </span>
              </li>
              <li>
                <Check size={16} className="text-cyan" />{" "}
                <span>
                  <strong>Custom metrics</strong> — counters, histograms, gauges with exemplar
                  support
                </span>
              </li>
              <li>
                <Check size={16} className="text-cyan" />{" "}
                <span>
                  <strong>OTLP native</strong> — drop-in replacement for any OTel-compatible backend
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
      headers: { 'x-optikk-token': '${OPTIKK_TOKEN}' },
  }),
})
sdk.start()`,
                },
              ]}
            />
          </div>
        </div>
      </motion.section>

      {/* ==================== SELF-HOST TEASER ==================== */}
      <motion.section
        className="selfhost-section"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="selfhost-grid">
          <div className="selfhost-copy">
            <h2 className="section-title">Optikk runs wherever Docker runs.</h2>
            <p className="selfhost-desc">
              No SaaS subscription, no per-seat pricing, no data leaving your network. Deploy the
              full stack in 5 minutes with our official docker-compose setup.
            </p>
            <div className="selfhost-ctas">
              <a
                href="https://github.com/optikk-org"
                target="_blank"
                rel="noreferrer"
                className="btn-ghost"
              >
                <svg aria-hidden="true">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57" />
                </svg>
                View on GitHub
              </a>
              <a
                href="https://docs.optikk.io"
                target="_blank"
                rel="noreferrer"
                className="text-link"
              >
                Read the Docs <ChevronRight size={14} />
              </a>
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

      <MarketingFooter />
    </div>
  );
}
