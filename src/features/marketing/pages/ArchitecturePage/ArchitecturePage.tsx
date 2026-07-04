import { Bot, Cloud, Database, GitBranch, HardDrive, Network, Server, Zap } from "lucide-react";

import { GradientText } from "../../motion/GradientText";
import { Reveal } from "../../motion/Reveal";
import { Stagger, StaggerItem } from "../../motion/Stagger";
import { CTA } from "../../sections/CTA";
import { CodeBlock } from "../../sections/CodeBlock";
import { Hero } from "../../sections/Hero";
import { SectionHeader } from "../../sections/SectionHeader";
import { Split } from "../../sections/Split";
import { Screenshot } from "../../visuals/Screenshot";

const LAYERS = [
  {
    name: "Ingest",
    label: "Layer 01",
    icon: Cloud,
    body: "OTLP/HTTP, OTLP/gRPC, Prometheus remote-write, Fluent-bit, Vector. Stateless receivers behind a load balancer; horizontally scaled per region.",
  },
  {
    name: "Routing",
    label: "Layer 02",
    icon: GitBranch,
    body: "Per-source quotas, sampling, PII redaction, tenant fan-out. Routes are versioned, GitOps-friendly, and hot-reloadable.",
  },
  {
    name: "Stream buffer · Kafka",
    label: "Layer 03",
    icon: Zap,
    body: "Every event passes through Kafka. Decouples ingest spikes from storage writes; powers replay, multi-consumer fan-out, and disaster recovery.",
  },
  {
    name: "Columnar store · ClickHouse",
    label: "Layer 04",
    icon: Database,
    body: "Sharded ClickHouse cluster holds logs, metrics, and trace spans. Vectorized SIMD scans, projection indexes, and per-tenant tables for isolation.",
    grad: true,
  },
  {
    name: "Metadata · MySQL",
    label: "Layer 05",
    icon: HardDrive,
    body: "Workspaces, users, RBAC, dashboards, alerts, and the Context Graph live in MySQL. Strongly consistent, point-in-time recoverable.",
  },
  {
    name: "Live tail + cache · Redis",
    label: "Layer 06",
    icon: Network,
    body: "Redis powers live tail fan-out, real-time alert state, query result cache, and rate limits. Keeps the hot path off ClickHouse.",
  },
  {
    name: "AI SRE",
    label: "Layer 07",
    icon: Bot,
    body: "Reasoning runtime grounded on the Context Graph + raw telemetry. Stateless, RAG-style; never trains on customer data.",
    grad: true,
  },
  {
    name: "API + apps",
    label: "Layer 08",
    icon: Server,
    body: "GraphQL + REST + WebSocket. Web UI, terminal client, IDE plugins, Slack/Tenants bots — all on the same API.",
  },
];

export default function ArchitecturePage() {
  return (
    <>
      <Hero
        eyebrow="Architecture"
        title={
          <>
            Boring underneath. <GradientText>Fast on top.</GradientText>
          </>
        }
        subtitle="Optikk is built on the same primitives you'd reach for in any high-throughput system: Kafka for ingest, ClickHouse for columnar query, MySQL for metadata, Redis for live-tail and cache. No exotic store, no agent magic."
        primaryCta={{ label: "Read the deep dive", path: "/opentelemetry", variant: "grad" }}
        secondaryCta={{ label: "Self-host options", path: "/self-host", variant: "secondary" }}
      />

      <section className="m-section">
        <div className="m-container">
          <SectionHeader
            eyebrow="The stack"
            title={
              <>
                Eight layers, <GradientText>each independently scalable.</GradientText>
              </>
            }
            lede="Every layer is replaceable, every layer is an off-the-shelf primitive. There is no proprietary store you can't operate yourself."
          />
          <Reveal>
            <div className="m-arch">
              {LAYERS.map((layer) => (
                <div key={layer.name} className={`m-arch-node${layer.grad ? " is-grad" : ""}`}>
                  <span>{layer.label}</span>
                  <strong>
                    <layer.icon size={16} style={{ verticalAlign: -2, marginRight: 6 }} />
                    {layer.name}
                  </strong>
                  <p>{layer.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="m-section m-section--warm">
        <div className="m-container">
          <Split
            eyebrow="Storage"
            title={
              <>
                ClickHouse, <GradientText>tuned for telemetry.</GradientText>
              </>
            }
            body="A sharded ClickHouse cluster is the heart of Optikk. We pre-build projection indexes for the queries observability tools actually run — group-by service, percentile, top-k, time-bucketed — so even on weeks of data, p99 query latency stays under 200ms."
            list={[
              {
                title: "Vectorized SIMD scans",
                body: "ClickHouse's MergeTree engine reads only the columns and partitions a query touches. Tag cardinality is free.",
              },
              {
                title: "Per-tenant isolation",
                body: "Each workspace gets its own database within the cluster. Noisy neighbors don't slow your queries.",
              },
              {
                title: "Kafka-fed writes",
                body: "Every event arrives through Kafka, then materializes into ClickHouse. Replay any window if downstream needs a re-shape.",
              },
            ]}
            visual={
              <CodeBlock
                tabs={[
                  {
                    label: "ClickHouse SQL",
                    content: `SELECT service, count() AS errors, quantile(0.99)(duration_ms) AS p99
FROM otel.spans
WHERE timestamp > now() - INTERVAL 30 MINUTE
  AND status_code = 'ERROR'
GROUP BY service
ORDER BY errors DESC
LIMIT 20`,
                  },
                  {
                    label: "Schema (excerpt)",
                    content: `CREATE TABLE otel.spans (
  trace_id        FixedString(16),
  span_id         FixedString(8),
  parent_span_id  FixedString(8),
  service         LowCardinality(String),
  name            LowCardinality(String),
  timestamp       DateTime64(9, 'UTC'),
  duration_ms     UInt32,
  status_code     LowCardinality(String),
  attributes      Map(LowCardinality(String), String),
  resource        Map(LowCardinality(String), String)
) ENGINE = ReplicatedMergeTree
PARTITION BY toYYYYMMDD(timestamp)
ORDER BY (service, timestamp, trace_id)
TTL timestamp + INTERVAL 30 DAY;`,
                  },
                ]}
              />
            }
          />
        </div>
      </section>

      <section className="m-section">
        <div className="m-container">
          <Split
            reverse
            eyebrow="Context graph"
            title={
              <>
                Telemetry, <GradientText>turned into a graph in MySQL.</GradientText>
              </>
            }
            body="Every entity (service, deploy, host, pod, query plan, user) is a row. Every relationship is an edge built from spans, logs, and deploys. The graph is materialized into MySQL so AI investigations and human searches both traverse it consistently."
            list={[
              {
                title: "Materialized incrementally",
                body: "A Kafka consumer extracts entities + edges from spans in real time. The graph lags telemetry by ~3 seconds.",
              },
              {
                title: "Queryable via our DSL",
                body: "service:checkout -> depends_on -> ? returns the dependency frontier as JSON.",
              },
              {
                title: "Versioned with deploys",
                body: "Edges carry validity intervals. Time-travel a week back to see what the topology looked like before the regression.",
              },
            ]}
            visual={
              <CodeBlock
                tabs={[
                  {
                    label: "Graph DSL",
                    content: `# Find every database reachable from checkout, as of yesterday
match
  (s:Service { name: "checkout-api" })
  -[:depends_on*]->
  (d:Database)
return s, d
at "2026-05-19T14:00Z"`,
                  },
                  {
                    label: "Underlying MySQL",
                    content: `SELECT d.kind, d.identifier, e.first_seen, e.last_seen
FROM entities s
JOIN edges     e ON e.from_id = s.id AND e.type = 'depends_on'
JOIN entities d ON d.id = e.to_id
WHERE s.kind = 'service'
  AND s.identifier = 'checkout-api'
  AND e.valid_at <= '2026-05-19 14:00:00'
  AND (e.invalid_at IS NULL OR e.invalid_at > '2026-05-19 14:00:00');`,
                  },
                ]}
              />
            }
          />
        </div>
      </section>

      <section className="m-section m-section--warm">
        <div className="m-container">
          <Split
            eyebrow="Real-time path"
            title={
              <>
                Redis carries the hot path, <GradientText>not ClickHouse.</GradientText>
              </>
            }
            body="Live tail, alert state machines, query result cache, and per-tenant rate limits all live in Redis. ClickHouse is reserved for analytical workloads where columnar wins; Redis handles the millisecond stuff."
            list={[
              {
                title: "Live tail fan-out",
                body: "Every Kafka event also goes to Redis pub/sub. A million concurrent tail filters fan out without touching the columnar store.",
              },
              {
                title: "Alert evaluation cache",
                body: "Active alert state is in Redis, not re-derived on every check. Sub-second alert latency at scale.",
              },
              {
                title: "Query result memoization",
                body: "Popular dashboards hit Redis first. Cache invalidation keyed on ingest watermark, not wall-clock.",
              },
            ]}
            visual={
              <CodeBlock
                tabs={[
                  {
                    label: "Live tail wire",
                    content: `# Browser subscribes via WebSocket → API → Redis pub/sub channel
SUBSCRIBE livetail:tenant:acme:logs:service=checkout,level=ERROR

# Producer (Kafka consumer) publishes filtered events
PUBLISH livetail:tenant:acme:logs:service=checkout,level=ERROR {
  "ts": "2026-05-19T14:02:13.412Z",
  "service": "checkout-api",
  "level": "ERROR",
  "message": "db pool exhausted (32/32)"
}`,
                  },
                ]}
              />
            }
          />
        </div>
      </section>

      <section className="m-section">
        <div className="m-container">
          <SectionHeader
            eyebrow="In product"
            title={
              <>
                Operate the stack <GradientText>through the same UI your tenant uses.</GradientText>
              </>
            }
            lede="Every layer of the architecture shows up as a first-class view. No grafana sprawl, no separate Kafka UI to bookmark."
            align="center"
          />
          <Stagger className="m-bento" gap={0.12}>
            <StaggerItem as="article" className="is-wide m-bento-card">
              <h3 className="m-h3">Database saturation</h3>
              <p className="m-body-sm">
                Query throughput, percentile latency, replication lag, deadlocks — keyed to the
                ClickHouse + MySQL layers.
              </p>
              <Screenshot
                name="database"
                alt="Database saturation dashboard with QPS, p99 latency, and replication lag"
              />
            </StaggerItem>
            <StaggerItem as="article" className="is-wide m-bento-card">
              <h3 className="m-h3">Kafka broker fleet</h3>
              <p className="m-body-sm">
                Per-broker throughput, ISR shrinks, under-replicated partitions, consumer lag — the
                full Kafka SRE surface.
              </p>
              <Screenshot
                name="kafka"
                alt="Kafka cluster dashboard with broker fleet heatmap and consumer lag chart"
              />
            </StaggerItem>
            <StaggerItem as="article" className="is-wide m-bento-card">
              <h3 className="m-h3">Service catalog</h3>
              <p className="m-body-sm">
                Every service the API + apps layer exposes, with golden signals and SLO burn at a
                glance.
              </p>
              <Screenshot
                name="services"
                alt="Service catalog listing 15 services with request rate, error %, and p99 latency"
              />
            </StaggerItem>
            <StaggerItem as="article" className="is-wide m-bento-card">
              <h3 className="m-h3">Service detail</h3>
              <p className="m-body-sm">
                Drill into one service — requests, errors, latency, top endpoints, top exceptions.
                One click from any alert.
              </p>
              <Screenshot
                name="service-detail"
                alt="Service detail view for payment-svc with golden signals and top endpoints table"
              />
            </StaggerItem>
          </Stagger>
        </div>
      </section>

      <CTA
        title={
          <>
            See the engine in your own data.{" "}
            <span style={{ color: "#fdba74" }}>Bring an OTel collector.</span>
          </>
        }
        subtitle="Self-host on Kubernetes (Helm bundles Kafka, ClickHouse, MySQL, Redis) to run completely in your own infrastructure with zero vendor lock-in."
        primary={{ label: "Self-host options", path: "/self-host" }}
        secondary={{ label: "OpenTelemetry setup", path: "/opentelemetry", variant: "secondary" }}
      />
    </>
  );
}
