import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";

const CAPABILITIES = [
  {
    title: "Unified query model",
    body: "Jump from a spike in RED metrics to the exact trace, then open correlated logs with one click. Context is preserved across tabs and deep links you can share with teammates.",
  },
  {
    title: "High-cardinality metrics",
    body: "Store labels that actually describe your architecture — service, deployment, region, tenant — without paying per-metric surcharges. Aggregation happens in the columnar store, not in your bill.",
  },
  {
    title: "Trace accuracy",
    body: "W3C trace context, probabilistic and head-based sampling hooks, and exemplars that bridge histograms to traces for latency outliers.",
  },
  {
    title: "Log pipelines",
    body: "OTLP logs, JSON bodies, and optional syslog receivers. Retention tiers let you keep hot data for investigations and colder tiers for compliance.",
  },
  {
    title: "Real user monitoring hooks",
    body: "Bring browser and mobile spans through the same collectors. Correlate front-end latency with backend saturation automatically.",
  },
  {
    title: "Operational guardrails",
    body: "Quota-aware ingestion, per-service rate cards, and drop rules you can version in Git — so prod stays stable when a logger goes rogue.",
  },
];

export default function FeaturesPage() {
  const navigate = useNavigate();

  return (
    <div className="mkt-page-wrap">
      <header className="mkt-page-hero">
        <div className="mkt-page-kicker">Platform</div>
        <h1 className="mkt-page-title">Everything you expect from a modern observability stack</h1>
        <p className="mkt-page-lead">
          Optikk is opinionated about standards (OpenTelemetry, Prometheus, ClickHouse) and flexible
          about how you run them. The feature set below ships for every customer — cloud or
          self-hosted — because we monetize durable ingest, not UI toggles.
        </p>
      </header>

      <div className="mkt-shot-grid" style={{ marginBottom: 64 }}>
        <figure className="mkt-shot mkt-shot--wide" style={{ margin: 0 }}>
          <img src="/marketing/shot-03.png" alt="Metrics and charts in Optikk" loading="lazy" />
        </figure>
        <figure className="mkt-shot" style={{ margin: 0 }}>
          <img src="/marketing/shot-02.png" alt="Trace explorer" loading="lazy" />
        </figure>
        <figure className="mkt-shot" style={{ margin: 0 }}>
          <img src="/marketing/shot-04.png" alt="Log explorer" loading="lazy" />
        </figure>
      </div>

      <div className="mkt-feature-rows">
        {CAPABILITIES.map((c, i) => (
          <motion.div
            key={c.title}
            className="mkt-feature-row"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.04 }}
          >
            <h3>{c.title}</h3>
            <p>{c.body}</p>
          </motion.div>
        ))}
      </div>

      <section
        style={{
          marginTop: 72,
          padding: 36,
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(37,99,235,0.06)",
        }}
      >
        <h2 className="section-title" style={{ fontSize: 28, marginBottom: 16 }}>
          Included with every deployment
        </h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
          {[
            "Service map & dependency graph",
            "SLOs with multi-burn-rate alerts",
            "Kubernetes + host inventory",
            "Kafka topic & consumer lag",
            "Database saturation (MySQL, Postgres, Redis, …)",
            "LLM traces, eval hooks, prompt/version tagging",
            "Custom dashboards & annotations",
            "API & Terraform for configuration",
          ].map((item) => (
            <li
              key={item}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                color: "#cbd5e1",
                fontSize: 15,
              }}
            >
              <Check size={18} className="text-cyan" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="btn-primary"
          style={{ marginTop: 28 }}
          onClick={() => navigate({ to: "/pricing" })}
        >
          View ingest pricing <ArrowRight size={16} style={{ marginLeft: 6 }} />
        </button>
      </section>
    </div>
  );
}
