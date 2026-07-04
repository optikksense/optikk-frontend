import { Bot, LineChart, ScrollText, Sparkles, Workflow } from "lucide-react";

import { GradientText } from "../../motion/GradientText";
import { CTA } from "../../sections/CTA";
import { CodeBlock } from "../../sections/CodeBlock";
import { Hero } from "../../sections/Hero";
import { SectionHeader } from "../../sections/SectionHeader";
import { Split } from "../../sections/Split";
import { DashboardMock } from "../../visuals/DashboardMock";;
import { Screenshot } from "../../visuals/Screenshot";

const ANCHORS = [
  { label: "Logs", id: "logs" },
  { label: "Traces", id: "traces" },
  { label: "Metrics", id: "metrics" },
  { label: "AI SRE", id: "ai-sre" },
  { label: "LLM Obs", id: "llm" },
];

export default function FeaturesPage() {
  return (
    <>
      <Hero
        eyebrow="The platform"
        title={
          <>
            Every signal, <GradientText>one query language, one database.</GradientText>
          </>
        }
        subtitle="Logs, traces, metrics, profiles, RUM, and LLM spans land in the same ClickHouse lake. Optikk lets you cross-reference them at warehouse speed."
        primaryCta={{ label: "Self-host now", path: "/self-host", variant: "grad" }}
        secondaryCta={{ label: "Read the docs", path: "/opentelemetry", variant: "secondary" }}
      />

      <div className="m-container" style={{ position: "relative" }}>
        <nav className="m-anchor-nav" aria-label="Platform sections">
          {ANCHORS.map((a) => (
            <a key={a.id} href={`#${a.id}`}>
              {a.label}
            </a>
          ))}
        </nav>
      </div>

      <section className="m-section m-section--tight">
        <div className="m-container">
          <Split
            id="logs"
            eyebrow="Logs"
            title={
              <>
                Stream a billion lines. <GradientText>Find one in 200ms.</GradientText>
              </>
            }
            body="A high-performance vectorized database means every field is indexable, every facet is countable, and every query stays under a second. Tag cardinality never costs you."
            list={[
              {
                title: "Full-text + structured in one query",
                body: 'level=ERROR service="checkout" AND msg ~ "timeout" — works the way you\'d type it in your head.',
              },
              {
                title: "Patterns auto-clustered",
                body: "We learn the templates your services emit. Find the one anomalous line in 4 billion.",
              },
              {
                title: "Live tail w/ DSL filters",
                body: "Stream millions of events/sec to your terminal, narrowed by the same DSL you use for search.",
              },
              {
                title: "Per-source quotas",
                body: "Cap noisy services without dropping them. Routing rules are first-class, not buried in YAML.",
              },
            ]}
            visual={
              <Screenshot
                name="logs"
                alt="Optikk logs explorer"
                bare
                fallback={<DashboardMock type="logs" />}
              />
            }
          />
        </div>
      </section>

      <section className="m-section m-section--warm">
        <div className="m-container">
          <Split
            id="traces"
            reverse
            eyebrow="Distributed tracing"
            title={
              <>
                Datadog-parity span explorer.{" "}
                <GradientText>Without the vendor lock-in.</GradientText>
              </>
            }
            body="Flame graphs, span diff, latency heatmaps, service maps, and a 10-tab span drawer (overview, children, logs, code, profile, AI explanation, related deploys, errors, queries, tags)."
            list={[
              {
                title: "Compare any two traces",
                body: "Pin baseline, compare regression. Diff attributes, durations, and span trees side by side.",
              },
              {
                title: "Cardinality without throttling",
                body: "Group by user, tenant, region, query, plan_id — anything. Tags are stored, not aggregated away.",
              },
              {
                title: "OTLP native, schema-as-you-emit",
                body: "Send any OpenTelemetry SDK. Your span attributes show up exactly as your code wrote them.",
              },
            ]}
            visual={
              <Screenshot
                name="trace"
                alt="Optikk trace waterfall"
                bare
                fallback={<DashboardMock type="traces" />}
              />
            }
          />
        </div>
      </section>

      <section className="m-section">
        <div className="m-container">
          <Split
            id="metrics"
            eyebrow="Metrics"
            title={
              <>
                PromQL native. <GradientText>Warehouse-scale time series.</GradientText>
              </>
            }
            body="Ingest OTLP + Prometheus + StatsD side by side. Run PromQL queries on a year of data, including high-cardinality labels."
            list={[
              {
                title: "Unlimited cardinality, no tag tax",
                body: "Tags are free. Stop dropping labels just to keep your dashboards fast.",
              },
              {
                title: "Recording rules and SLOs in YAML",
                body: "GitOps-friendly definitions, applied via API or CLI. Versioned alongside your code.",
              },
              {
                title: "AI baselines + seasonal alerts",
                body: "Skip the static-threshold tuning. Optikk learns the rhythm of your services.",
              },
            ]}
            visual={
              <Screenshot
                name="service-detail"
                alt="Optikk service detail with metrics and endpoint table"
                bare
                fallback={<DashboardMock type="metrics" />}
              />
            }
          />
        </div>
      </section>

      <section className="m-section m-section--ink">
        <div className="m-container">
          <SectionHeader
            eyebrow="AI SRE · preview"
            title={
              <span style={{ color: "#fff" }}>
                An on-call engineer that already <GradientText>read your runbook.</GradientText>
              </span>
            }
            lede={
              <span style={{ color: "#c0cee0" }}>
                The AI SRE reads the same telemetry graph your humans do — logs, traces, metrics,
                deploys, dependencies — and writes the verdict in the language your tenant uses in
                Slack.
              </span>
            }
          />
          <div id="ai-sre" style={{ marginTop: 32 }}>
            <CodeBlock
              tabs={[
                {
                  label: "Optikk AI · Slack",
                  content: "@optikk what broke checkout p99 in the last 30m?",
                  render: (
                    <>
                      <span className="tok-p">@optikk</span> what broke checkout p99 in the last
                      30m?{"\n\n"}
                      <span className="tok-c">
                        {"// AI SRE · grounded on 3.4M spans, 88k logs, 12 deploys"}
                      </span>
                      {"\n"}
                      <span className="tok-k">Cause:</span>
                      {"  "}
                      <span className="tok-s">"db.pool.exhausted"</span> on{" "}
                      <span className="tok-n">checkout-api</span> after deploy{" "}
                      <span className="tok-n">abc12d</span>
                      {"\n"}
                      <span className="tok-k">Window:</span> 14:02 → now (1.8% 5xx, p99 2.1s){"\n"}
                      <span className="tok-k">Impact:</span> ~12k orders queued, 0 lost{"\n"}
                      <span className="tok-k">Evidence:</span>{" "}
                      <span className="tok-n">trace:4af09c</span>,{" "}
                      <span className="tok-n">log:db_pool_wait</span>,{" "}
                      <span className="tok-n">deploy:abc12d</span>
                      {"\n"}
                      <span className="tok-k">Suggested fix:</span> revert{" "}
                      <span className="tok-n">abc12d</span> <span className="tok-c">{"// or"}</span>{" "}
                      bump pool 32 → 64 in <span className="tok-s">"checkout-api.yaml"</span>
                      {"\n"}
                      <span className="tok-k">Confidence:</span> <span className="tok-s">high</span>
                    </>
                  ),
                },
                {
                  label: "Optikk AI · runbook",
                  content: "POST /v1/ai/sre/runbook ...",
                  render: (
                    <>
                      <span className="tok-k">POST</span>{" "}
                      <span className="tok-s">/v1/ai/sre/runbook</span>
                      {"\n"}
                      <span className="tok-p">{"{"}</span>
                      {"\n"}
                      {"  "}
                      <span className="tok-n">alert_id</span>:{" "}
                      <span className="tok-s">"db-pool-saturation"</span>,{"\n"}
                      {"  "}
                      <span className="tok-n">scope</span>: <span className="tok-p">{"{"}</span>{" "}
                      service: <span className="tok-s">"checkout-api"</span>, env:{" "}
                      <span className="tok-s">"prod"</span> <span className="tok-p">{"}"}</span>,
                      {"\n"}
                      {"  "}
                      <span className="tok-n">depth</span>: <span className="tok-s">"full"</span>
                      {"\n"}
                      <span className="tok-p">{"}"}</span>
                      {"\n\n"}
                      <span className="tok-c">
                        {
                          "// → returns: timeline, evidence graph, ranked hypotheses, code-ready fix"
                        }
                      </span>
                    </>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="m-section">
        <div className="m-container">
          <Split
            id="llm"
            eyebrow="LLM observability"
            title={
              <>
                Trace every prompt. <GradientText>See tokens the way you see latency.</GradientText>
              </>
            }
            body="Optikk treats LLM calls as spans: prompts, tool calls, function results, and final completions. Tokens, latency, and grading are first-class attributes."
            list={[
              {
                title: "Prompt → tool → answer waterfall",
                body: "See the full agent chain in the same trace UI as your services. No separate vendor required.",
              },
              {
                title: "Eval scores attached to spans",
                body: "Wire your judges in once. Every production call is graded; every regression is bisectable.",
              },
              {
                title: "Token volume by user, tenant, feature",
                body: "Group by any attribute. Find the 0.1% of users driving 40% of OpenAI token usage.",
              },
            ]}
            visual={
              <CodeBlock
                tabs={[
                  {
                    label: "LLM span",
                    content: "trace.start_span ...",
                    render: (
                      <>
                        <span className="tok-k">from</span> optikk{" "}
                        <span className="tok-k">import</span> trace{"\n\n"}
                        <span className="tok-k">with</span> trace.start_span(
                        <span className="tok-s">"llm.completion"</span>){" "}
                        <span className="tok-k">as</span> sp:{"\n"}
                        {"    "}sp.set(<span className="tok-s">"model"</span>,{" "}
                        <span className="tok-s">"claude-opus-4-7"</span>){"\n"}
                        {"    "}sp.set(<span className="tok-s">"tenant"</span>, user.tenant){"\n"}
                        {"    "}sp.set(<span className="tok-s">"feature"</span>,{" "}
                        <span className="tok-s">"chat.assist"</span>){"\n"}
                        {"    "}out = client.messages.create(...){"\n"}
                        {"    "}sp.set(<span className="tok-s">"tokens.in"</span>,
                        out.usage.input_tokens){"\n"}
                        {"    "}sp.set(<span className="tok-s">"tokens.out"</span>,
                        out.usage.output_tokens){"\n"}
                        {"    "}sp.set(<span className="tok-s">"cost.usd"</span>,
                        optikk.price(out.usage))
                      </>
                    ),
                  },
                ]}
              />
            }
          />
        </div>
      </section>

      <section className="m-section m-section--warm">
        <div className="m-container">
          <SectionHeader
            eyebrow="More signals"
            title="Same lake, more depth."
            lede="Every product line shares the same query engine. Adding a new signal is a routing rule, not a separate tool."
            align="center"
          />
          <div className="m-bento">
            {[
              {
                icon: Sparkles,
                title: "Real user monitoring",
                body: "Browser + mobile spans, Core Web Vitals, session replay links.",
              },
              {
                icon: Workflow,
                title: "Profiles + flamegraphs",
                body: "Continuous profiling tied to trace IDs. Click a span → see its flamegraph.",
              },
              {
                icon: LineChart,
                title: "SLOs and burn rates",
                body: "Define SLOs in code, auto-generated dashboards, paged only when budget burns.",
              },
              {
                icon: ScrollText,
                title: "Audit + access logs",
                body: "Compliance-grade retention path with WORM-compatible storage tier.",
              },
              {
                icon: Bot,
                title: "Synthetics",
                body: "Probe APIs and browser flows from 12 regions; results land as spans.",
              },
              {
                icon: Sparkles,
                title: "Custom signals",
                body: "Define new entity types and event streams via the typed schema API.",
              },
            ].map((item) => (
              <article key={item.title.toString()} className="m-bento-card">
                <span className="m-bento-icon">
                  <item.icon size={20} />
                </span>
                <h3 className="m-h3">{item.title}</h3>
                <p className="m-body">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CTA
        title={
          <>
            See it on your own telemetry.{" "}
            <span style={{ color: "#fdba74" }}>100% open source, no demo required.</span>
          </>
        }
        subtitle="Fully self-hostable in under 5 minutes with our Helm chart."
        primary={{ label: "Self-host now", path: "/self-host" }}
        secondary={{ label: "Read architecture", path: "/architecture", variant: "secondary" }}
      />
    </>
  );
}
