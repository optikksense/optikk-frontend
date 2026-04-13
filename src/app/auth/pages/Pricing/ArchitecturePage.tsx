import { useNavigate } from "@tanstack/react-router";

const INGEST_DIAGRAM = `Clients & Collectors          Optikk Ingest Tier              Storage & Query
─────────────────────        ─────────────────────        ───────────────────
OTLP gRPC/HTTP  ───────►       Kafka (ordered topics)  ──►   ClickHouse merge tree
Prom remote write ─────►       Stream processors       ──►   + object storage tiers
Syslog/HTTP logs ──────►       Schema enforcement      ──►   + columnar projections`;

export default function ArchitecturePage() {
  const navigate = useNavigate();

  return (
    <div className="mkt-page-wrap">
      <header className="mkt-page-hero">
        <div className="mkt-page-kicker">Deep dive</div>
        <h1 className="mkt-page-title">
          Architecture built for cheap gigabytes, not expensive seats
        </h1>
        <p className="mkt-page-lead">
          Optikk pairs commodity object storage economics with a columnar OLAP engine and a
          horizontally scalable ingest plane. This page explains how we keep $0.05/GB sustainable
          and how we absorb massive OTLP floods without dropping your SLIs.
        </p>
      </header>

      <article className="mkt-article">
        <h2>What makes Optikk this inexpensive?</h2>
        <p>
          Traditional APM bundles monetize UI seats, host counts, and indexed spans. Optikk charges
          for durable bytes because that mirrors our real marginal cost. ClickHouse compression +
          tiered storage keeps cold telemetry roughly an order of magnitude cheaper than row-store
          SaaS, and we pass that through instead of marking it up for sales commissions.
        </p>
        <ul>
          <li>
            <strong style={{ color: "#e2e8f0" }}>Columnar storage:</strong> metrics and spans land
            in wide tables with ZSTD compression — you pay for logical gigabytes, not inflated index
            overhead.
          </li>
          <li>
            <strong style={{ color: "#e2e8f0" }}>Shared multitenant cells:</strong> cloud regions
            pack multiple customers on isolated logical namespaces, amortizing ops while enforcing
            strict quotas.
          </li>
          <li>
            <strong style={{ color: "#e2e8f0" }}>No proprietary agents:</strong> support load stays
            lower when customers bring standard OTel — fewer bespoke binaries to certify.
          </li>
        </ul>

        <h2>Ingestion at scale</h2>
        <p>
          OTLP payloads hit stateless receivers that only authenticate, normalize, and publish to
          Kafka. Partition keys follow `service.namespace` + `tenant` to avoid hot shards. Consumer
          groups batch spans and metrics into columnar inserts using deterministic schemas so merges
          stay predictable even during spikes.
        </p>
        <div className="mkt-diagram" role="img" aria-label="Ingest architecture diagram">
          {INGEST_DIAGRAM}
        </div>
        <h3>Backpressure & fairness</h3>
        <p>
          Each tenant carries token buckets for bytes/sec and rows/sec. When limits approach, we
          shed lowest-priority namespaces (usually verbose debug logs) while preserving traces tied
          to error spans. Producers receive OTLP `RESOURCE_EXHAUSTED` hints so Collectors can
          downsample without crashing your services.
        </p>

        <h2>Query latency vs. cost</h2>
        <p>
          The UI issues SQL against materialized views that pre-aggregate RED metrics and service
          graphs. Ad-hoc investigations hit the raw tables but stay bounded by time-range partitions
          and `PREWHERE` filters on service name. That pattern keeps p95 interactive queries under a
          second for multi-terabyte datasets without a separate “metrics warehouse” tax.
        </p>

        <h2>Reliability model</h2>
        <p>
          Kafka gives us replay: if a consumer version ships with a bug, we rewind the offset after
          deploy and rebuild projections idempotently. ClickHouse replicas use multi-attach mounts;
          in cloud cells we additionally snapshot parts to object storage for cross-AZ durability.
        </p>

        <h2>Open questions?</h2>
        <p>
          This is a living document — the implementation evolves, but the contract stays:
          OpenTelemetry in, SQL + portable files out, no hidden agents.
        </p>
        <button
          type="button"
          className="btn-primary"
          style={{ marginTop: 12 }}
          onClick={() => navigate({ to: "/pricing" })}
        >
          See pricing assumptions
        </button>
      </article>
    </div>
  );
}
