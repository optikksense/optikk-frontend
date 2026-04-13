import { useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";

export default function OpenTelemetryPage() {
  const navigate = useNavigate();

  return (
    <div className="mkt-page-wrap">
      <header className="mkt-page-hero">
        <div className="mkt-page-kicker">Standards</div>
        <h1 className="mkt-page-title">
          OpenTelemetry isn’t an integration — it’s the product surface
        </h1>
        <p className="mkt-page-lead">
          Optikk never asks you to install a proprietary host agent to unlock “premium” data. We
          ingest OTLP over gRPC and HTTP, accept Prometheus remote write, and complement with
          optional receivers you already run in the Collector.
        </p>
      </header>

      <article className="mkt-article">
        <h2>What ships out of the box</h2>
        <ul>
          <li>Full OTLP trace, metric, and log pipelines with backpressure-aware consumers.</li>
          <li>Semantic conventions for Kubernetes, Kafka, databases, and GenAI spans.</li>
          <li>Exemplars bridging native histograms to trace IDs for tail latency debugging.</li>
          <li>JSON logging with automatic trace/span correlation fields.</li>
        </ul>

        <h2>Why that keeps you out of lock-in</h2>
        <p>
          Your instrumentation is the portable part. If you decide to move storage or hosting, keep
          the same SDKs, the same Collector configs, and simply retarget the exporter endpoint.
          Optikk stores the wide events in open schemas so you can replay them into Parquet,
          Iceberg, or a warehouse without a rip-and-replace.
        </p>

        <h3>Recommended rollout</h3>
        <ol style={{ color: "#94a3b8", lineHeight: 1.7, paddingLeft: "1.2rem" }}>
          <li>Deploy the Optikk stack or point OTLP to the cloud endpoint.</li>
          <li>Attach the OpenTelemetry Collector as a sidecar or daemonset.</li>
          <li>Enable metrics + traces for a single service, validate cardinality.</li>
          <li>Roll logs into the same pipeline once trace IDs are stable.</li>
          <li>Layer SLOs and alerts on top of the unified dataset.</li>
        </ol>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 32 }}>
          <button type="button" className="btn-primary" onClick={() => navigate({ to: "/login" })}>
            Get OTLP endpoint
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => navigate({ to: "/architecture" })}
          >
            See ingestion path
          </button>
        </div>

        <section style={{ marginTop: 48 }}>
          <h2>Collector-friendly by design</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {[
              "Tail sampling policies respected before export",
              "Attribute processors & redaction hooks",
              "Multiple tenants on one cell with header-routed tokens",
              "gRPC keepalive tuned for edge collectors",
            ].map((t) => (
              <li key={t} style={{ display: "flex", gap: 10, marginBottom: 12, color: "#cbd5e1" }}>
                <Check className="text-cyan" size={18} aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </section>
      </article>
    </div>
  );
}
