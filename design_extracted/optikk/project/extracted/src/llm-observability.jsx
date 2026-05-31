/* global React, Icon, AreaSpark, MiniSpark, Bars, seededWave, PageHeader, Tabs */
const { useState: useStateE, useMemo: useMemoE } = React;

/* =================================================================
   LLM OBSERVABILITY
   ----------------------------------------------------------------
   Observability for services that use AI at the backend.
   Modeled on Datadog LLM Observability: every request to an ML app
   is a trace, traces contain mixed spans (LLM call, tool call,
   embedding, retrieval, agent/workflow step). Tabs cover the full
   operate / evaluate / secure / cost surface, plus a Patterns view
   for prompt clustering.
   ================================================================= */

const VENDOR_COLORS = {
  openai:    "#10a37f",
  anthropic: "#d4a373",
  google:    "#4285f4",
  bedrock:   "#ff9900",
  selfhost:  "#94a3b8",
};
const VENDOR_LABEL = {
  openai: "OpenAI", anthropic: "Anthropic", google: "Vertex AI",
  bedrock: "Bedrock", selfhost: "Self-hosted",
};

/* The catalog of services running in production that use AI on
   the backend. Each row is one DD_LLMOBS_ML_APP. */
const ML_APPS = [
  { id: "support-chatbot",      team: "cx",        kind: "agent",    primary: "gpt-4o",            vendor: "openai",    spans: { llm: 84200, tool: 28420, ret: 18420, emb:   4280, agent: 12420 }, p95: 1.84, err: 0.42, halluc: 1.20, quality: 94, cost: 312, status: "ok",   trend: 41, sdk: "python · 2.18.0", apm: "support-bot-svc" },
  { id: "code-assist",          team: "platform",  kind: "agent",    primary: "claude-sonnet-4.5", vendor: "anthropic", spans: { llm: 14220, tool: 38_240, ret:  8420, emb:  1240,  agent:  4280 }, p95: 3.18, err: 0.18, halluc: 0.40, quality: 96, cost: 284, status: "ok",   trend: 42, sdk: "node · 6.40.1",   apm: "ide-assist-svc" },
  { id: "doc-search-rag",       team: "knowledge", kind: "rag",      primary: "gpt-4o-mini",       vendor: "openai",    spans: { llm: 96480, tool:   240, ret: 96480, emb: 18420,  agent:     0 }, p95: 0.94, err: 0.06, halluc: 0.80, quality: 89, cost:  42, status: "ok",   trend: 43, sdk: "python · 2.18.0", apm: "knowledge-api" },
  { id: "intent-classifier",    team: "cx",        kind: "workflow", primary: "fine-tuned-bert",   vendor: "selfhost",  spans: { llm: 184000,tool:     0, ret:     0, emb:     0,  agent:     0 }, p95: 0.12, err: 0.04, halluc: 0.00, quality: 91, cost:  18, status: "ok",   trend: 44, sdk: "python · 2.18.0", apm: "intent-svc" },
  { id: "email-summarizer",     team: "growth",    kind: "workflow", primary: "gemini-1.5-pro",    vendor: "google",    spans: { llm:  8420, tool:   840, ret:  4280, emb:  1240,  agent:     0 }, p95: 4.10, err: 0.84, halluc: 2.40, quality: 84, cost: 208, status: "warn", trend: 45, sdk: "python · 2.18.0", apm: "growth-emails" },
  { id: "onboarding-agent",     team: "growth",    kind: "agent",    primary: "claude-sonnet-4.5", vendor: "anthropic", spans: { llm:  4280, tool: 12840, ret:  2840, emb:   840,  agent:  8420 }, p95: 8.40, err: 1.42, halluc: 3.10, quality: 88, cost: 412, status: "warn", trend: 46, sdk: "node · 6.40.1",   apm: "onboarding-svc" },
  { id: "pricing-advisor",      team: "sales",     kind: "agent",    primary: "gpt-4o",            vendor: "openai",    spans: { llm: 12080, tool:  4280, ret:  6420, emb:  1240,  agent:  3210 }, p95: 2.60, err: 2.18, halluc: 8.20, quality: 76, cost: 184, status: "err",  trend: 47, sdk: "python · 2.18.0", apm: "pricing-svc" },
  { id: "voice-transcribe",     team: "cx",        kind: "workflow", primary: "whisper-large-v3",  vendor: "selfhost",  spans: { llm: 18420, tool:     0, ret:     0, emb:     0,  agent:     0 }, p95: 1.20, err: 0.32, halluc: 0.00, quality: 92, cost:  64, status: "ok",   trend: 48, sdk: "python · 2.18.0", apm: "ivr-svc" },
  { id: "image-describe",       team: "catalog",   kind: "workflow", primary: "claude-sonnet-4.5", vendor: "anthropic", spans: { llm:  3210, tool:     0, ret:     0, emb:     0,  agent:     0 }, p95: 3.80, err: 0.42, halluc: 1.40, quality: 87, cost: 142, status: "ok",   trend: 49, sdk: "python · 2.18.0", apm: "catalog-svc" },
  { id: "moderation-guard",     team: "trust",     kind: "workflow", primary: "moderation-omni",   vendor: "openai",    spans: { llm: 412000,tool:     0, ret:     0, emb:     0,  agent:     0 }, p95: 0.06, err: 0.01, halluc: 0.00, quality: null, cost: 12, status: "ok",  trend: 50, sdk: "node · 6.40.1",   apm: "edge-mod-svc" },
  { id: "semantic-search",      team: "knowledge", kind: "workflow", primary: "text-embed-3-large",vendor: "openai",    spans: { llm:     0, tool:     0, ret:     0, emb: 642000, agent:     0 }, p95: 0.02, err: 0.02, halluc: 0.00, quality: null, cost:  8, status: "ok",  trend: 51, sdk: "python · 2.18.0", apm: "search-svc" },
  { id: "onboarding-flow-v2",   team: "growth",    kind: "agent",    primary: "gpt-4o-mini",       vendor: "openai",    spans: { llm:  1240, tool:   840, ret:   240, emb:     0,  agent:   420 }, p95: 0.84, err: 0.12, halluc: 0.60, quality: 90, cost:   4, status: "ok",   trend: 52, sdk: "python · 2.18.0", apm: "onboarding-svc" },
];

/* A single deep trace, shown in the Trace tab and inline elsewhere */
const DEMO_TRACE = {
  id: "4f12c1aa9c81d2e0",
  app: "support-chatbot",
  user: "alex@acme.co",
  prompt: "I was charged twice for my May subscription — can you refund the duplicate?",
  output: "I see two charges on May 24 (inv_3O5x and inv_3O5y) for $49.00. I've issued a refund for the duplicate (inv_3O5y) — you'll see it in 3–5 business days. Anything else?",
  status: "ok",
  totalLat: 2.42,
  totalCost: 0.024,
  totalTokIn: 1840,
  totalTokOut: 412,
  spans: [
    { kind: "agent",     name: "support_agent.run",            svc: "support-bot",   off:  0,  pct: 100, lat: "2.42s", model: null,             tok: null,            note: "user → assistant" },
    { kind: "llm",       name: "openai.chat.completions",      svc: "support-bot",   off:  0,  pct:  18, lat: "412ms", model: "gpt-4o",         tok: "1.2k in / 184 out", note: "plan(): pick tools" },
    { kind: "tool",      name: "stripe.list_charges",          svc: "stripe-mcp",    off: 18,  pct:   6, lat: "142ms", model: null,             tok: null,            note: "customer=cus_abc" },
    { kind: "tool",      name: "postgres.query",               svc: "postgres-mcp",  off: 24,  pct:   4, lat: "84ms",  model: null,             tok: null,            note: "orders WHERE …" },
    { kind: "retrieval", name: "vector.semantic_search",       svc: "kb-search",     off: 28,  pct:   3, lat: "82ms",  model: null,             tok: "8 chunks · 1.8k", note: "refund policy" },
    { kind: "embedding", name: "openai.embed",                 svc: "kb-search",     off: 28,  pct:   2, lat: "42ms",  model: "text-embed-3",   tok: "in 84",         note: "single query" },
    { kind: "llm",       name: "openai.chat.completions",      svc: "support-bot",   off: 32,  pct:  46, lat: "1.12s", model: "gpt-4o",         tok: "640 in / 228 out", note: "synthesize answer + side-effects" },
    { kind: "tool",      name: "stripe.create_refund",         svc: "stripe-mcp",    off: 78,  pct:   8, lat: "184ms", model: null,             tok: null,            note: "charge=ch_3O5y amt=4900",  audited: true },
    { kind: "llm",       name: "anthropic.eval_factuality",    svc: "evals-runner",  off: 86,  pct:   6, lat: "142ms", model: "claude-haiku",   tok: "240 in / 12 out",note: "score 0.98", evaluator: true },
    { kind: "llm",       name: "anthropic.eval_refusal",       svc: "evals-runner",  off: 92,  pct:   4, lat: "94ms",  model: "claude-haiku",   tok: "180 in / 8 out", note: "score 0.0",  evaluator: true },
  ],
};
const SPAN_META = {
  llm:       { label: "LLM",       color: "#10a37f", icon: "ai",       billed: true },
  tool:      { label: "Tool",      color: "var(--brand)",  icon: "tool",      billed: false },
  embedding: { label: "Embedding", color: "var(--chart-4)",icon: "metrics",   billed: false },
  retrieval: { label: "Retrieval", color: "var(--orange)", icon: "resource",  billed: false },
  agent:     { label: "Agent",     color: "var(--accent-violet)", icon: "topology",  billed: false },
  workflow:  { label: "Workflow",  color: "var(--fg-2)",   icon: "list",      billed: false },
};

/* Recent traces stream (used on Apps + Traces tab) */
const RECENT_TRACES = [
  { t: "12:42:18.421", app: "support-chatbot",     model: "gpt-4o",            vendor: "openai",    tokIn: 1840, tokOut: 412, lat: 2.42, cost: 0.024, status: "ok",   note: "ticket lookup → refund" },
  { t: "12:42:18.012", app: "doc-search-rag",      model: "gpt-4o-mini",       vendor: "openai",    tokIn:  420, tokOut:  82, lat: 0.62, cost: 0.001, status: "ok",   note: "retrieved 5 chunks · cited 3" },
  { t: "12:42:17.804", app: "pricing-advisor",     model: "gpt-4o",            vendor: "openai",    tokIn:  920, tokOut: 184, lat: 2.84, cost: 0.018, status: "err",  note: "halluc: cited SKU not in catalog" },
  { t: "12:42:17.612", app: "code-assist",         model: "claude-sonnet-4.5", vendor: "anthropic", tokIn: 3840, tokOut: 1840,lat: 3.18, cost: 0.046, status: "ok",   note: "edit suggested · 8 file reads" },
  { t: "12:42:17.401", app: "onboarding-agent",    model: "claude-sonnet-4.5", vendor: "anthropic", tokIn: 6420, tokOut: 2840,lat: 8.40, cost: 0.082, status: "warn", note: "tool retry · jira-mcp timeout" },
  { t: "12:42:17.184", app: "intent-classifier",   model: "fine-tuned-bert",   vendor: "selfhost",  tokIn:  120, tokOut:  12, lat: 0.10, cost: 0.0001,status: "ok",   note: "intent: refund_request (0.97)" },
  { t: "12:42:17.020", app: "email-summarizer",    model: "gemini-1.5-pro",    vendor: "google",    tokIn: 8420, tokOut:  642,lat: 4.18, cost: 0.038, status: "warn", note: "PII auto-redacted (3 spans)" },
  { t: "12:42:16.881", app: "moderation-guard",    model: "moderation-omni",   vendor: "openai",    tokIn:  240, tokOut:   0, lat: 0.06, cost: 0.0001,status: "ok",   note: "score: 0.04 (low risk)" },
  { t: "12:42:16.642", app: "support-chatbot",     model: "gpt-4o",            vendor: "openai",    tokIn: 2240, tokOut: 612, lat: 2.14, cost: 0.028, status: "ok",   note: "answer + follow-up" },
  { t: "12:42:16.401", app: "pricing-advisor",     model: "gpt-4o",            vendor: "openai",    tokIn:  840, tokOut: 142, lat: 2.84, cost: 0.016, status: "err",  note: "halluc: invented discount tier" },
  { t: "12:42:16.184", app: "code-assist",         model: "claude-sonnet-4.5", vendor: "anthropic", tokIn:  920, tokOut: 184, lat: 1.42, cost: 0.014, status: "ok",   note: "inline completion" },
  { t: "12:42:15.984", app: "doc-search-rag",      model: "gpt-4o-mini",       vendor: "openai",    tokIn:  640, tokOut: 124, lat: 0.84, cost: 0.001, status: "ok",   note: "no matching chunks · refusal" },
];

/* Evaluations (functional quality) */
const EVAL_SUITES = [
  { id: "factuality",     label: "Factuality",      score: 92.4, change: "−1.2pp", changeKind: "down warn", runs: 12420, failed: 248, color: "var(--brand)" },
  { id: "refusal",        label: "Refusal correctness", score: 96.2, change: "+0.4pp", changeKind: "up",     runs:  8420, failed: 184, color: "var(--accent-violet)" },
  { id: "tone",           label: "Tone / Brand",    score: 88.6, change: "−0.6pp", changeKind: "down warn", runs:  6420, failed: 124, color: "var(--orange)" },
  { id: "answer_relevance", label: "Answer relevance", score: 94.1, change: "+1.4pp", changeKind: "up",      runs: 18420, failed: 420, color: "var(--chart-3)" },
  { id: "tool_correctness", label: "Tool correctness", score: 84.0, change: "−2.8pp", changeKind: "down warn", runs:  3210, failed: 412, color: "var(--err)" },
  { id: "toxicity",       label: "Toxicity (lower=better)", score: 0.4, change: "0",     changeKind: "",       runs:  4280, failed:   4, color: "var(--fg-3)", inverted: true },
];
const QUALITY_ISSUES = [
  { id: "Q-2418", kind: "Hallucination",     app: "pricing-advisor",  count: 84, change: "+62%", last: "1m",  evaluator: "factuality",        eg: "Cites SKU SK-9921 — not in catalog" },
  { id: "Q-2417", kind: "Tool-call failure", app: "onboarding-agent", count: 32, change: "+18%", last: "3m",  evaluator: "tool_correctness",  eg: "jira.update_issue retried 4× then gave up" },
  { id: "Q-2412", kind: "Refusal (false)",   app: "support-chatbot",  count: 28, change: "+4%",  last: "6m",  evaluator: "refusal",           eg: "Declined a benign account-status question" },
  { id: "Q-2406", kind: "Prompt injection",  app: "doc-search-rag",   count: 18, change: "−12%", last: "12m", evaluator: "security",          eg: "Indirect injection from a wiki page" },
  { id: "Q-2401", kind: "PII leak (caught)", app: "email-summarizer", count: 12, change: "+8%",  last: "18m", evaluator: "sensitive_data",    eg: "Body contained partial SSN" },
  { id: "Q-2398", kind: "Off-tone reply",    app: "support-chatbot",  count:  9, change: "+2%",  last: "22m", evaluator: "tone",              eg: "Casual register on enterprise account" },
];

/* Security events (Sensitive Data Scanner + injection detector) */
const SEC_EVENTS = [
  { t: "12:41:48", sev: "high",   kind: "prompt_injection",   app: "doc-search-rag",   model: "gpt-4o-mini",    detail: "Indirect injection in retrieved wiki page · ignored",  action: "blocked"  },
  { t: "12:41:24", sev: "high",   kind: "prompt_injection",   app: "code-assist",      model: "claude-sonnet-4.5", detail: "Suspicious instruction in repo README · sandboxed",  action: "sanitized" },
  { t: "12:40:18", sev: "medium", kind: "pii_in_prompt",      app: "email-summarizer", model: "gemini-1.5-pro", detail: "User pasted SSN-like value · redacted before LLM",     action: "redacted" },
  { t: "12:38:12", sev: "medium", kind: "pii_in_response",    app: "support-chatbot",  model: "gpt-4o",         detail: "Model echoed a customer email address",                 action: "redacted" },
  { t: "12:34:02", sev: "low",    kind: "jailbreak_attempt",  app: "moderation-guard", model: "moderation-omni",detail: "Known DAN-style prefix detected · scored low",          action: "logged"   },
  { t: "12:28:42", sev: "low",    kind: "off_topic",          app: "onboarding-agent", model: "claude-sonnet-4.5", detail: "Off-topic request outside agent scope",              action: "refused"  },
  { t: "12:18:04", sev: "medium", kind: "tool_abuse",         app: "onboarding-agent", model: "claude-sonnet-4.5", detail: "Tried stripe.create_refund · not in allow-list",      action: "blocked"  },
];

/* Patterns — auto-clustered user prompts (Datadog "Patterns" feature) */
const PROMPT_CLUSTERS = [
  { id: "C-01", label: "Refund or chargeback questions",            apps: ["support-chatbot","pricing-advisor"],          count: 6240, share: 18, lat: 2.18, halluc: 1.2, color: "var(--brand)" },
  { id: "C-02", label: "Reset password / 2FA / SSO",                apps: ["support-chatbot"],                            count: 4820, share: 14, lat: 1.42, halluc: 0.6, color: "var(--accent-violet)" },
  { id: "C-03", label: "Find a doc / how do I …",                    apps: ["doc-search-rag"],                             count: 4180, share: 12, lat: 0.84, halluc: 0.4, color: "var(--chart-3)" },
  { id: "C-04", label: "Code review / explain a diff",               apps: ["code-assist"],                                count: 3640, share: 11, lat: 3.84, halluc: 0.2, color: "var(--orange)" },
  { id: "C-05", label: "Cancel my subscription",                     apps: ["support-chatbot"],                            count: 2840, share:  8, lat: 1.84, halluc: 0.8, color: "var(--chart-4)" },
  { id: "C-06", label: "Plan pricing / discount questions",          apps: ["pricing-advisor","support-chatbot"],          count: 2420, share:  7, lat: 2.62, halluc: 4.2, color: "var(--err)" },
  { id: "C-07", label: "Set up the integration / API key",            apps: ["doc-search-rag","support-chatbot"],          count: 1840, share:  5, lat: 0.94, halluc: 0.0, color: "var(--ok)" },
];

/* =========================================================
   HELPERS
   ========================================================= */
function fmtTok(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + "k";
  return String(n);
}
function fmtReq(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + "k";
  return String(n);
}
function fmtCost(n) { return "$" + n.toLocaleString(); }
function fmtLat(s) {
  if (s < 1) return Math.round(s * 1000) + "ms";
  return s.toFixed(2) + "s";
}

function VendorChip({ vendor }) {
  return (
    <span className="row" style={{ gap: 4, padding: "2px 7px 2px 5px", borderRadius: 4, background: "var(--bg-inset)", border: "1px solid var(--line-2)", fontSize: 10.5 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: VENDOR_COLORS[vendor] || "var(--fg-mute)" }}/>
      <span className="mono" style={{ color: "var(--fg-2)", fontWeight: 500 }}>{VENDOR_LABEL[vendor] || vendor}</span>
    </span>
  );
}
function SpanChip({ kind }) {
  const m = SPAN_META[kind] || SPAN_META.workflow;
  return (
    <span className="row mono" style={{
      gap: 4, padding: "1px 6px", borderRadius: 3,
      background: "color-mix(in oklab, " + m.color + " 14%, transparent)",
      color: m.color,
      fontSize: 10, fontWeight: 700, letterSpacing: 0.04, textTransform: "uppercase",
    }}>{m.label}</span>
  );
}
function KindChip({ kind }) {
  const map = { agent: "var(--accent-violet)", rag: "var(--chart-3)", workflow: "var(--fg-2)" };
  return (
    <span className="mono" style={{
      fontSize: 10, padding: "1px 6px", borderRadius: 3, fontWeight: 700,
      background: "var(--bg-inset)", color: map[kind] || "var(--fg-2)",
      border: "1px solid var(--line-2)", letterSpacing: 0.04, textTransform: "uppercase",
    }}>{kind}</span>
  );
}
function KPI({ label, value, unit, delta, deltaKind, sub, spark, sparkColor, sparkSoft }) {
  return (
    <div className="card" style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 6, minHeight: 110 }}>
      <div className="stat-label">{label}</div>
      <div className="row" style={{ alignItems: "baseline", gap: 6 }}>
        <div className="mono" style={{ fontSize: 24, fontWeight: 700, color: "var(--fg-0)", letterSpacing: "-0.02em" }}>{value}</div>
        {unit && <span className="stat-unit">{unit}</span>}
        {delta && <span className={"delta " + (deltaKind || "")} style={{ marginLeft: 4 }}>{delta}</span>}
      </div>
      {sub && <div className="muted" style={{ fontSize: 11.5 }}>{sub}</div>}
      {spark && (
        <div style={{ marginTop: "auto" }}>
          <AreaSpark seed={spark} color={sparkColor || "var(--chart-1)"} soft={sparkSoft || "var(--chart-1-soft)"} height={36} n={32} amp={0.18}/>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   CHART: tokens by vendor (line per vendor)
   ========================================================= */
function TokenByVendorChart({ height = 220 }) {
  const w = 1200, h = height;
  const padL = 56, padR = 18, padT = 14, padB = 28;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const N = 60;
  const xLabels = ["−60m","−45m","−30m","−15m","now"];

  const series = useMemoE(() => ([
    { id: "openai",    label: "OpenAI",        color: VENDOR_COLORS.openai,    data: seededWave(31, N, 0.62, 0.14, 0.55) },
    { id: "anthropic", label: "Anthropic",     color: VENDOR_COLORS.anthropic, data: seededWave(47, N, 0.46, 0.12, 0.45) },
    { id: "selfhost",  label: "Self-hosted",   color: VENDOR_COLORS.selfhost,  data: seededWave(67, N, 0.32, 0.10, 0.7) },
    { id: "google",    label: "Vertex AI",     color: VENDOR_COLORS.google,    data: seededWave(53, N, 0.18, 0.08, 0.6) },
  ]), []);
  const xx = (i) => padL + (i / (N - 1)) * innerW;
  const yy = (v) => padT + (1 - Math.min(v, 1)) * innerH;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} style={{ display: "block" }}>
      {Array.from({ length: 5 }).map((_, i) => {
        const y = padT + (i / 4) * innerH;
        return <line key={i} x1={padL} x2={w-padR} y1={y} y2={y} stroke="var(--line-2)"/>;
      })}
      {["2.4M","1.8M","1.2M","600k","0"].map((l, i) => (
        <text key={i} x={padL - 8} y={padT + (i / 4) * innerH + 4} textAnchor="end" fontSize="10.5" fill="var(--fg-mute)" fontFamily="var(--font-mono)">{l}</text>
      ))}
      {series.map(s => {
        const path = "M " + s.data.map((v, i) => `${xx(i).toFixed(1)},${yy(v).toFixed(1)}`).join(" L ");
        return <path key={s.id} d={path} fill="none" stroke={s.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>;
      })}
      {xLabels.map((l, i) => {
        const x = padL + (i / (xLabels.length - 1)) * innerW;
        return <text key={i} x={x} y={h - 8} textAnchor="middle" fontSize="10.5" fill="var(--fg-mute)">{l}</text>;
      })}
    </svg>
  );
}

/* CHART: latency percentiles */
function LatencyChart({ height = 220 }) {
  const w = 1200, h = height;
  const padL = 56, padR = 18, padT = 14, padB = 28;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const N = 60;
  const xLabels = ["−60m","−45m","−30m","−15m","now"];
  const series = useMemoE(() => ([
    { id: "p50", color: "var(--chart-3)",       data: seededWave(13, N, 0.18, 0.04, 0.4) },
    { id: "p95", color: "var(--chart-1)",       data: seededWave(19, N, 0.42, 0.08, 0.45) },
    { id: "p99", color: "var(--accent-violet)", data: seededWave(23, N, 0.62, 0.14, 0.55) },
  ]), []);
  const xx = (i) => padL + (i / (N - 1)) * innerW;
  const yy = (v) => padT + (1 - Math.min(v, 1)) * innerH;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} style={{ display: "block" }}>
      {Array.from({ length: 5 }).map((_, i) => {
        const y = padT + (i / 4) * innerH;
        return <line key={i} x1={padL} x2={w-padR} y1={y} y2={y} stroke="var(--line-2)"/>;
      })}
      {["10s","5s","2s","800ms","0"].map((l, i) => (
        <text key={i} x={padL - 8} y={padT + (i / 4) * innerH + 4} textAnchor="end" fontSize="10.5" fill="var(--fg-mute)" fontFamily="var(--font-mono)">{l}</text>
      ))}
      <rect x={padL} y={yy(0.5)} width={innerW} height={yy(0.0) - yy(0.5)} fill="var(--ok)" opacity="0.04"/>
      <line x1={padL} x2={w-padR} y1={yy(0.5)} y2={yy(0.5)} stroke="var(--ok)" strokeDasharray="4 4" opacity="0.5"/>
      {series.map(s => {
        const path = "M " + s.data.map((v, i) => `${xx(i).toFixed(1)},${yy(v).toFixed(1)}`).join(" L ");
        return <path key={s.id} d={path} fill="none" stroke={s.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>;
      })}
      {xLabels.map((l, i) => {
        const x = padL + (i / (xLabels.length - 1)) * innerW;
        return <text key={i} x={x} y={h - 8} textAnchor="middle" fontSize="10.5" fill="var(--fg-mute)">{l}</text>;
      })}
    </svg>
  );
}

/* =========================================================
   MAIN SCREEN
   ========================================================= */
function LLMObsScreen({ go }) {
  const [tab, setTab] = useStateE("apps");
  const totals = useMemoE(() => ML_APPS.reduce((a, m) => ({
    llm: a.llm + m.spans.llm, tool: a.tool + m.spans.tool, ret: a.ret + m.spans.ret,
    emb: a.emb + m.spans.emb, agent: a.agent + m.spans.agent, cost: a.cost + m.cost,
  }), { llm: 0, tool: 0, ret: 0, emb: 0, agent: 0, cost: 0 }), []);

  return (
    <div className="page">
      <PageHeader
        icon="ai"
        iconColor="var(--accent-violet)"
        iconBg="var(--accent-violet-soft)"
        title="LLM Observability"
        subtitle={`Observability for services that use AI · ${ML_APPS.length} ML apps · ${fmtReq(totals.llm)} LLM spans · ${fmtReq(totals.tool)} tool calls · ${fmtCost(totals.cost)} / hour`}
        statusBadge={<span className="badge ok"><span className="b-dot"/>healthy</span>}
        actions={
          <div className="row" style={{ gap: 6 }}>
            <button className="btn"><Icon name="filter" size={13}/>Environment · prod</button>
            <button className="btn"><Icon name="link-ext" size={13}/>SDK setup</button>
            <button className="btn"><Icon name="export" size={13}/>Export</button>
            <button className="btn btn-primary"><Icon name="plus" size={13}/>Create monitor</button>
          </div>
        }
      />
      <Tabs
        tabs={[
          { id: "apps",    label: "Applications", badge: ML_APPS.length, badgeKind: "info" },
          { id: "traces",  label: "Traces",       badge: "live",         badgeKind: "ok" },
          { id: "evals",   label: "Evaluations",  badge: 6,              badgeKind: "warn" },
          { id: "patterns",label: "Patterns",     badge: PROMPT_CLUSTERS.length, badgeKind: "neutral" },
          { id: "security",label: "Security",     badge: SEC_EVENTS.length, badgeKind: "err" },
          { id: "cost",    label: "Cost",         badge: fmtCost(totals.cost), badgeKind: "neutral" },
        ]}
        active={tab} setActive={setTab}
      />
      {tab === "apps"     && <AppsTab go={go} totals={totals}/>}
      {tab === "traces"   && <TracesTab go={go}/>}
      {tab === "evals"    && <EvalsTab/>}
      {tab === "patterns" && <PatternsTab/>}
      {tab === "security" && <SecurityTab/>}
      {tab === "cost"     && <CostTab/>}
    </div>
  );
}

/* =========================================================
   TAB 1 — APPLICATIONS
   ========================================================= */
function AppsTab({ go, totals }) {
  const [q, setQ] = useStateE("");
  const [statusFilter, setStatusFilter] = useStateE("all");
  const filtered = ML_APPS.filter(a => {
    if (q && !a.id.includes(q)) return false;
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    return true;
  });
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
        <KPI label="ML applications" value={ML_APPS.length}      delta="+2 this week" deltaKind="up" sub="6 agents · 5 workflows · 1 RAG"   spark={101} sparkColor="var(--brand)" sparkSoft="var(--brand-soft)"/>
        <KPI label="LLM spans (1h)"   value={fmtReq(totals.llm)}  delta="+18.4%"      deltaKind="up" sub="Billed · tools / agents are free" spark={102} sparkColor="var(--accent-violet)" sparkSoft="var(--accent-violet-soft)"/>
        <KPI label="Tool spans (1h)"  value={fmtReq(totals.tool)} delta="+8.2%"       deltaKind="up" sub="MCP-routed · 12 connected servers" spark={103} sparkColor="var(--chart-1)" sparkSoft="var(--chart-1-soft)"/>
        <KPI label="p95 latency"      value="2.4"   unit="s"       delta="−180ms"    deltaKind="up" sub="p50 420ms · p99 5.8s"     spark={104} sparkColor="var(--chart-3)" sparkSoft="var(--chart-3-soft)"/>ok-soft)"/>
        <KPI label="Quality score"    value="92.4"  unit="%"       delta="−1.2pp"    deltaKind="down warn" sub="6 eval suites · 248 failures" spark={105} sparkColor="var(--err)" sparkSoft="var(--err-soft)"/>
        <KPI label="Hour spend"       value={fmtCost(totals.cost)} delta="+$18"      deltaKind="warn" sub="$23.4k of $30k budget · 78%"     spark={106} sparkColor="var(--orange)" sparkSoft="#fed7aa"/>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card card-pad-lg">
          <div className="row" style={{ marginBottom: 12 }}>
            <div>
              <div className="card-title">Tokens by vendor</div>
              <div className="card-sub" style={{ marginTop: 2 }}>Lines per provider · tokens / min · last 60 minutes</div>
            </div>
            <div className="spacer"/>
            <div className="row" style={{ gap: 12, flexWrap: "wrap" }}>
              {Object.entries(VENDOR_LABEL).filter(([k]) => k !== "bedrock").map(([k, l]) => (
                <div key={k} className="row" style={{ gap: 5 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 2, background: VENDOR_COLORS[k] }}/>
                  <span className="muted" style={{ fontSize: 11 }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
          <TokenByVendorChart/>
        </div>
        <div className="card card-pad-lg">
          <div className="row" style={{ marginBottom: 12 }}>
            <div>
              <div className="card-title">End-to-end latency</div>
              <div className="card-sub" style={{ marginTop: 2 }}>p50 · p95 · p99 across all ML apps</div>
            </div>
            <div className="spacer"/>
            <div className="seg">
              <div className="seg-opt active">All</div>
              <div className="seg-opt">By app</div>
              <div className="seg-opt">By model</div>
            </div>
          </div>
          <LatencyChart/>
        </div>
      </div>

      {/* Apps table + right rail */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16, alignItems: "start" }}>
        <div className="card card-pad-lg">
          <div className="row" style={{ marginBottom: 14 }}>
            <div>
              <div className="card-title">ML applications</div>
              <div className="card-sub" style={{ marginTop: 2 }}>{filtered.length} of {ML_APPS.length} apps · sorted by traffic · last 1h</div>
            </div>
            <div className="spacer"/>
            <div className="search" style={{ width: 240 }}>
              <Icon name="search" size={13} className="muted"/>
              <input placeholder="Filter apps, teams…" value={q} onChange={e => setQ(e.target.value)}/>
            </div>
            <div className="seg">
              {["all", "ok", "warn", "err"].map(s => (
                <div key={s} className={"seg-opt" + (statusFilter === s ? " active" : "")} onClick={() => setStatusFilter(s)}>
                  {s === "all" ? "All" : s === "ok" ? "Healthy" : s === "warn" ? "Degraded" : "Failing"}
                </div>
              ))}
            </div>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ paddingLeft: 0 }}>App</th>
                <th>Kind</th>
                <th>Primary model</th>
                <th style={{ textAlign: "right" }}>LLM</th>
                <th style={{ textAlign: "right" }}>Tool</th>
                <th style={{ textAlign: "right" }}>Retr.</th>
                <th style={{ textAlign: "right" }}>Emb.</th>
                <th style={{ textAlign: "right" }}>p95</th>
                <th style={{ textAlign: "right" }}>Err</th>
                <th style={{ textAlign: "right" }}>Halluc</th>
                <th style={{ textAlign: "right" }}>Quality</th>
                <th style={{ textAlign: "right" }}>Cost</th>
                <th>Trend</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => {
                const dotColor = a.status === "err" ? "var(--err)" : a.status === "warn" ? "var(--warn)" : "var(--ok)";
                return (
                  <tr key={a.id} style={{ cursor: "pointer" }}>
                    <td style={{ paddingLeft: 0 }}>
                      <div className="row">
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: dotColor, flexShrink: 0 }}/>
                        <div>
                          <div style={{ fontWeight: 600, color: "var(--fg-0)" }}>{a.id}</div>
                          <div className="row" style={{ gap: 6, marginTop: 2 }}>
                            <span className="muted mono" style={{ fontSize: 10.5 }}>{a.team} · {a.sdk}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td><KindChip kind={a.kind}/></td>
                    <td>
                      <div className="row" style={{ gap: 6 }}>
                        <VendorChip vendor={a.vendor}/>
                        <span className="mono" style={{ fontSize: 11.5, color: "var(--fg-1)" }}>{a.primary}</span>
                      </div>
                    </td>
                    <td className="mono" style={{ textAlign: "right", color: "var(--fg-0)", fontWeight: 600 }}>{fmtReq(a.spans.llm)}</td>
                    <td className="mono" style={{ textAlign: "right", color: "var(--fg-2)" }}>{a.spans.tool ? fmtReq(a.spans.tool) : "—"}</td>
                    <td className="mono" style={{ textAlign: "right", color: "var(--fg-2)" }}>{a.spans.ret  ? fmtReq(a.spans.ret)  : "—"}</td>
                    <td className="mono" style={{ textAlign: "right", color: "var(--fg-2)" }}>{a.spans.emb  ? fmtReq(a.spans.emb)  : "—"}</td>
                    <td className="mono" style={{ textAlign: "right", color: a.p95 > 4 ? "var(--warn-fg)" : "var(--fg-1)" }}>{fmtLat(a.p95)}</td>
                    <td className="mono" style={{ textAlign: "right", color: a.err > 1 ? "var(--err)" : a.err > 0.5 ? "var(--warn-fg)" : "var(--fg-1)" }}>{a.err.toFixed(2)}%</td>
                    <td className="mono" style={{ textAlign: "right", color: a.halluc > 3 ? "var(--err)" : a.halluc > 1 ? "var(--warn-fg)" : "var(--fg-1)" }}>{a.halluc.toFixed(1)}%</td>
                    <td className="mono" style={{ textAlign: "right", color: a.quality === null ? "var(--fg-mute)" : a.quality < 80 ? "var(--err)" : a.quality < 90 ? "var(--warn-fg)" : "var(--ok)", fontWeight: 600 }}>
                      {a.quality === null ? "—" : a.quality + "%"}
                    </td>
                    <td className="mono" style={{ textAlign: "right", color: "var(--fg-0)", fontWeight: 600 }}>${a.cost}</td>
                    <td style={{ width: 80 }}><MiniSpark seed={a.trend} width={70} height={20} color={dotColor === "var(--ok)" ? "var(--chart-1)" : dotColor}/></td>
                    <td style={{ width: 18, textAlign: "right" }}><Icon name="chevron-right" size={13} className="muted"/></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="col" style={{ gap: 14 }}>
          {/* Span breakdown — which work the apps are actually doing */}
          <div className="card card-pad-lg">
            <div className="row" style={{ marginBottom: 12 }}>
              <div>
                <div className="card-title">Span breakdown · 1h</div>
                <div className="card-sub" style={{ marginTop: 2 }}>What each request actually does</div>
              </div>
              <div className="spacer"/>
              <span className="badge neutral mono" style={{ height: 18, fontSize: 10 }}>billed: LLM only</span>
            </div>
            {[
              { k: "llm",       v: totals.llm },
              { k: "tool",      v: totals.tool },
              { k: "retrieval", v: totals.ret },
              { k: "embedding", v: totals.emb },
              { k: "agent",     v: totals.agent },
            ].map(s => {
              const max = Math.max(totals.llm, totals.tool, totals.ret, totals.emb, totals.agent);
              const pct = (s.v / max) * 100;
              const m = SPAN_META[s.k];
              return (
                <div key={s.k} style={{ marginBottom: 10 }}>
                  <div className="row" style={{ marginBottom: 4 }}>
                    <SpanChip kind={s.k}/>
                    <span className="muted" style={{ fontSize: 11 }}>{m.billed ? "billed" : "free"}</span>
                    <span className="spacer"/>
                    <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: "var(--fg-0)" }}>{fmtReq(s.v)}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: "var(--bg-inset)", overflow: "hidden" }}>
                    <div style={{ width: pct + "%", height: "100%", background: m.color }}/>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Open quality issues */}
          <div className="card card-pad-lg">
            <div className="row" style={{ marginBottom: 12 }}>
              <div>
                <div className="card-title">Open quality issues</div>
                <div className="card-sub" style={{ marginTop: 2 }}>From online evaluators · 1h</div>
              </div>
              <div className="spacer"/>
              <span className="badge err"><span className="b-dot"/>{QUALITY_ISSUES.length}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {QUALITY_ISSUES.slice(0, 5).map(iss => (
                <div key={iss.id} className="row" style={{ gap: 10, padding: "6px 0", borderBottom: "1px solid var(--line-2)" }}>
                  <span style={{ width: 6, height: 32, borderRadius: 2, background: iss.kind === "Hallucination" || iss.kind === "PII leak (caught)" ? "var(--err)" : iss.kind === "Refusal (false)" ? "var(--warn)" : "var(--accent-violet)", flexShrink: 0 }}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="row" style={{ gap: 6 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--fg-0)" }}>{iss.kind}</span>
                      <span className="muted mono" style={{ fontSize: 10.5 }}>{iss.app}</span>
                    </div>
                    <div className="muted" style={{ fontSize: 11, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{iss.eg}</div>
                  </div>
                  <span className="mono" style={{ fontSize: 12.5, color: "var(--err)", fontWeight: 700 }}>{iss.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live trace stream */}
      <LiveTraceStream go={go}/>
    </>
  );
}

/* Shared live-trace stream component */
function LiveTraceStream({ go }) {
  return (
    <div className="card" style={{ padding: 0 }}>
      <div className="row" style={{ padding: "12px 18px", borderBottom: "1px solid var(--line-2)" }}>
        <div className="page-icon" style={{ width: 28, height: 28, background: "var(--brand-soft)", color: "var(--brand-deep)" }}>
          <Icon name="trace" size={14}/>
        </div>
        <div>
          <div className="card-title">Live LLM traces</div>
          <div className="card-sub" style={{ marginTop: 2 }}>Each row = one request to an ML app · click to see the full chain</div>
        </div>
        <div className="spacer"/>
        <div className="seg">
          <div className="seg-opt active">All</div>
          <div className="seg-opt">Errors</div>
          <div className="seg-opt">Slow (&gt;3s)</div>
          <div className="seg-opt">Eval failed</div>
        </div>
        <div className="live-pill" style={{ height: 24, fontSize: 11 }}><span className="dot"/><span>LIVE</span></div>
      </div>
      <table className="tbl">
        <thead>
          <tr>
            <th style={{ paddingLeft: 18 }}>Time</th>
            <th>ML app</th>
            <th>Model</th>
            <th style={{ textAlign: "right" }}>Tokens (in / out)</th>
            <th style={{ textAlign: "right" }}>Latency</th>
            <th style={{ textAlign: "right" }}>Cost</th>
            <th>Status</th>
            <th>Note</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {RECENT_TRACES.map((r, i) => (
            <tr key={i} style={{ cursor: "pointer" }} onClick={() => go && go("trace")}>
              <td style={{ paddingLeft: 18 }} className="mono muted">{r.t}</td>
              <td><span className="mono" style={{ color: "var(--fg-0)", fontWeight: 500 }}>{r.app}</span></td>
              <td>
                <div className="row" style={{ gap: 6 }}>
                  <VendorChip vendor={r.vendor}/>
                  <span className="mono" style={{ fontSize: 11.5, color: "var(--fg-1)" }}>{r.model}</span>
                </div>
              </td>
              <td className="mono" style={{ textAlign: "right", color: "var(--fg-2)" }}>{r.tokIn.toLocaleString()} <span className="muted">/</span> {r.tokOut.toLocaleString()}</td>
              <td className="mono" style={{ textAlign: "right", color: r.lat > 4 ? "var(--warn-fg)" : "var(--fg-1)" }}>{fmtLat(r.lat)}</td>
              <td className="mono" style={{ textAlign: "right", color: "var(--fg-1)" }}>${r.cost.toFixed(4)}</td>
              <td>
                <span className={"badge " + (r.status === "ok" ? "ok" : r.status === "warn" ? "warn" : "err")}><span className="b-dot"/>{r.status}</span>
              </td>
              <td className="muted" style={{ fontSize: 11.5, maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.note}</td>
              <td style={{ paddingRight: 18 }}><Icon name="chevron-right" size={12} className="muted"/></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* =========================================================
   TAB 2 — TRACES (with deep-dive single trace view)
   ========================================================= */
function TracesTab({ go }) {
  const trace = DEMO_TRACE;
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <KPI label="Traces (1h)"       value="1.86k" delta="+12.4%" deltaKind="up" sub="324 / minute · 12 ML apps"      spark={111} sparkColor="var(--brand)" sparkSoft="var(--brand-soft)"/>
        <KPI label="Spans per trace"   value="6.4"   delta="+0.4"   deltaKind="warn" sub="median · agents skew higher" spark={112} sparkColor="var(--accent-violet)" sparkSoft="var(--accent-violet-soft)"/>
        <KPI label="LLM error rate"    value="0.42"  unit="%" delta="+0.18pp" deltaKind="down warn" sub="84 timeouts · 412 rate-limited" spark={113} sparkColor="var(--err)" sparkSoft="var(--err-soft)"/>
        <KPI label="APM correlated"    value="100"   unit="%" sub="every trace has an upstream span"     spark={114} sparkColor="var(--chart-3)" sparkSoft="var(--ok-soft)"/>
      </div>

      {/* Single-trace inspector */}
      <div className="card" style={{ padding: 0 }}>
        <div className="row" style={{ padding: "14px 18px", borderBottom: "1px solid var(--line-2)" }}>
          <div className="page-icon" style={{ width: 28, height: 28, background: "var(--accent-violet-soft)", color: "var(--accent-violet)" }}>
            <Icon name="trace" size={14}/>
          </div>
          <div>
            <div className="card-title mono">trace · {trace.id}</div>
            <div className="card-sub" style={{ marginTop: 2 }}>{trace.app} · user {trace.user} · {trace.spans.length} spans · {fmtLat(trace.totalLat)} · ${trace.totalCost.toFixed(4)}</div>
          </div>
          <div className="spacer"/>
          <span className="badge ok"><span className="b-dot"/>ok</span>
          <button className="btn"><Icon name="link-ext" size={13}/>Linked APM span</button>
        </div>

        {/* Prompt + response */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "var(--line-2)" }}>
          <div style={{ padding: "14px 18px", background: "var(--bg-card)" }}>
            <div className="stat-label" style={{ marginBottom: 6 }}>User prompt</div>
            <div style={{ fontSize: 13, color: "var(--fg-1)", lineHeight: 1.5 }}>{trace.prompt}</div>
          </div>
          <div style={{ padding: "14px 18px", background: "var(--bg-card)" }}>
            <div className="row" style={{ marginBottom: 6 }}>
              <span className="stat-label">Model output</span>
              <div className="spacer"/>
              <span className="badge ok" style={{ height: 18, fontSize: 10 }}>factuality 0.98</span>
              <span className="badge ok" style={{ height: 18, fontSize: 10 }}>refusal 0.0</span>
            </div>
            <div style={{ fontSize: 13, color: "var(--fg-1)", lineHeight: 1.5 }}>{trace.output}</div>
          </div>
        </div>

        {/* Span waterfall */}
        <div style={{ padding: "14px 0" }}>
          {trace.spans.map((sp, i) => {
            const m = SPAN_META[sp.kind];
            return (
              <div key={i} className="span-row">
                <SpanChip kind={sp.kind}/>
                <div style={{ minWidth: 0 }}>
                  <div className="row" style={{ gap: 7 }}>
                    <span className="mono" style={{ fontSize: 12, color: "var(--fg-0)", fontWeight: 500 }}>{sp.name}</span>
                    {sp.evaluator && <span className="badge neutral mono" style={{ height: 16, fontSize: 9 }}>EVAL</span>}
                    {sp.audited && <span className="badge warn" style={{ height: 16, fontSize: 9 }}>AUDITED</span>}
                  </div>
                  <div className="row muted" style={{ fontSize: 11, gap: 8, marginTop: 2 }}>
                    <span className="mono">{sp.svc}</span>
                    {sp.model && <span className="mono">· {sp.model}</span>}
                    {sp.tok && <span className="mono">· {sp.tok}</span>}
                    {sp.note && <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220 }}>· {sp.note}</span>}
                  </div>
                </div>
                <span className="mono" style={{ fontSize: 11.5, color: "var(--fg-1)" }}>{sp.lat}</span>
                <div className="span-bar">
                  <div className="bar" style={{ left: sp.off + "%", width: sp.pct + "%", background: m.color, opacity: 0.85 }}/>
                </div>
                <Icon name="chevron-right" size={12} className="muted"/>
              </div>
            );
          })}
        </div>
      </div>

      <LiveTraceStream go={go}/>
    </>
  );
}

/* =========================================================
   TAB 3 — EVALUATIONS
   ========================================================= */
function EvalsTab() {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <KPI label="Online evaluations" value="52.8k" delta="+12%" deltaKind="up" sub="across 6 suites · 12 ML apps"           spark={121} sparkColor="var(--accent-violet)" sparkSoft="var(--accent-violet-soft)"/>
        <KPI label="Quality (weighted)" value="92.4" unit="%" delta="−1.2pp" deltaKind="down warn" sub="dragged by factuality / tool" spark={122} sparkColor="var(--brand)" sparkSoft="var(--brand-soft)"/>
        <KPI label="Failures (1h)"      value="1.39k" delta="+248" deltaKind="warn" sub="84% caught at proxy"                  spark={123} sparkColor="var(--err)" sparkSoft="var(--err-soft)"/>
        <KPI label="Experiments running" value="3"   sub="A/B vs gpt-4o-mini · 4.2k samples"                                  spark={124} sparkColor="var(--chart-3)" sparkSoft="var(--ok-soft)"/>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card card-pad-lg">
          <div className="row" style={{ marginBottom: 12 }}>
            <div>
              <div className="card-title">Eval suite scores</div>
              <div className="card-sub" style={{ marginTop: 2 }}>Average across all ML apps · last 1h</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {EVAL_SUITES.map(e => {
              const score = e.inverted ? Math.max(0, 100 - e.score * 100) : e.score;
              const label = e.inverted ? e.score.toFixed(2) : e.score.toFixed(1) + "%";
              return (
                <div key={e.id}>
                  <div className="row" style={{ marginBottom: 4 }}>
                    <span className="mono" style={{ fontSize: 12, color: "var(--fg-0)", fontWeight: 500 }}>{e.label}</span>
                    <span className="spacer"/>
                    <span className="mono" style={{ fontSize: 12, color: "var(--fg-0)", fontWeight: 600 }}>{label}</span>
                    <span className={"delta " + e.changeKind} style={{ marginLeft: 6 }}>{e.change}</span>
                  </div>
                  <div style={{ height: 7, borderRadius: 4, background: "var(--bg-inset)", overflow: "hidden" }}>
                    <div style={{ width: score + "%", height: "100%", background: e.color }}/>
                  </div>
                  <div className="muted mono" style={{ fontSize: 10.5, marginTop: 3 }}>{e.runs.toLocaleString()} runs · {e.failed} failed</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div className="row" style={{ padding: "12px 18px", borderBottom: "1px solid var(--line-2)" }}>
            <div className="card-title">Top open issues</div>
            <div className="spacer"/>
            <span className="badge err"><span className="b-dot"/>{QUALITY_ISSUES.length} open</span>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ paddingLeft: 18 }}>Kind</th>
                <th>App</th>
                <th>Evaluator</th>
                <th style={{ textAlign: "right" }}>Count</th>
                <th style={{ textAlign: "right" }}>Change</th>
                <th>Example</th>
                <th style={{ paddingRight: 18 }}>Last</th>
              </tr>
            </thead>
            <tbody>
              {QUALITY_ISSUES.map(iss => (
                <tr key={iss.id} style={{ cursor: "pointer" }}>
                  <td style={{ paddingLeft: 18 }}>
                    <div className="row" style={{ gap: 7 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background:
                        iss.kind === "Hallucination" || iss.kind === "PII leak (caught)" ? "var(--err)" :
                        iss.kind === "Refusal (false)" || iss.kind === "Off-tone reply" ? "var(--warn)" :
                        "var(--accent-violet)", flexShrink: 0 }}/>
                      <span style={{ fontWeight: 600, fontSize: 12.5 }}>{iss.kind}</span>
                    </div>
                  </td>
                  <td className="mono muted">{iss.app}</td>
                  <td className="mono" style={{ color: "var(--brand-deep)" }}>{iss.evaluator}</td>
                  <td className="mono" style={{ textAlign: "right", color: "var(--fg-0)", fontWeight: 600 }}>{iss.count}</td>
                  <td className="mono" style={{ textAlign: "right", color: iss.change.startsWith("+") ? "var(--err)" : iss.change.startsWith("−") ? "var(--ok)" : "var(--fg-3)" }}>{iss.change}</td>
                  <td className="muted" style={{ fontSize: 11.5, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{iss.eg}</td>
                  <td style={{ paddingRight: 18 }} className="muted mono">{iss.last}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   TAB 4 — PATTERNS (auto prompt clustering)
   ========================================================= */
function PatternsTab() {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <KPI label="Prompt clusters"      value={PROMPT_CLUSTERS.length} delta="+2 new" deltaKind="up" sub="hierarchical · auto-named" spark={131} sparkColor="var(--brand)" sparkSoft="var(--brand-soft)"/>
        <KPI label="Coverage"             value="86" unit="%" delta="+4pp" deltaKind="up" sub="of traffic falls into a named cluster" spark={132} sparkColor="var(--ok)" sparkSoft="var(--ok-soft)"/>
        <KPI label="Highest hallucination" value="4.2" unit="%" delta="pricing cluster" deltaKind="warn" sub="C-06 plan pricing / discount" spark={133} sparkColor="var(--err)" sparkSoft="var(--err-soft)"/>
        <KPI label="Drift detected"       value="1"  sub="C-01 refund — phrasing shift Mon" spark={134} sparkColor="var(--accent-violet)" sparkSoft="var(--accent-violet-soft)"/>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <div className="row" style={{ padding: "12px 18px", borderBottom: "1px solid var(--line-2)" }}>
          <div className="page-icon" style={{ width: 28, height: 28, background: "var(--accent-violet-soft)", color: "var(--accent-violet)" }}>
            <Icon name="topology" size={14}/>
          </div>
          <div>
            <div className="card-title">Prompt patterns</div>
            <div className="card-sub" style={{ marginTop: 2 }}>What users actually ask · 35.2k prompts grouped into {PROMPT_CLUSTERS.length} clusters</div>
          </div>
          <div className="spacer"/>
          <button className="btn btn-ghost" style={{ height: 28 }}>View cluster map<Icon name="chevron-right" size={12}/></button>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ paddingLeft: 18 }}>Cluster</th>
              <th>Topic</th>
              <th>Apps</th>
              <th style={{ textAlign: "right" }}>Volume</th>
              <th>Share</th>
              <th style={{ textAlign: "right" }}>p95</th>
              <th style={{ textAlign: "right" }}>Hallucination</th>
              <th style={{ paddingRight: 18 }}></th>
            </tr>
          </thead>
          <tbody>
            {PROMPT_CLUSTERS.map(c => (
              <tr key={c.id} style={{ cursor: "pointer" }}>
                <td style={{ paddingLeft: 18 }} className="mono muted">{c.id}</td>
                <td>
                  <div className="row" style={{ gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: c.color }}/>
                    <span style={{ color: "var(--fg-0)", fontWeight: 500, fontSize: 13 }}>{c.label}</span>
                  </div>
                </td>
                <td>
                  <div className="row" style={{ gap: 4, flexWrap: "wrap" }}>
                    {c.apps.map(a => <span key={a} className="mono" style={{ fontSize: 10.5, padding: "1px 6px", borderRadius: 3, background: "var(--bg-inset)", color: "var(--fg-2)" }}>{a}</span>)}
                  </div>
                </td>
                <td className="mono" style={{ textAlign: "right", color: "var(--fg-0)", fontWeight: 600 }}>{fmtReq(c.count)}</td>
                <td>
                  <div className="row" style={{ gap: 8 }}>
                    <div style={{ width: 80, height: 6, borderRadius: 3, background: "var(--bg-inset)", overflow: "hidden" }}>
                      <div style={{ width: (c.share / 18) * 100 + "%", height: "100%", background: c.color }}/>
                    </div>
                    <span className="mono" style={{ fontSize: 11, color: "var(--fg-1)" }}>{c.share}%</span>
                  </div>
                </td>
                <td className="mono" style={{ textAlign: "right", color: c.lat > 3 ? "var(--warn-fg)" : "var(--fg-1)" }}>{fmtLat(c.lat)}</td>
                <td className="mono" style={{ textAlign: "right", color: c.halluc > 3 ? "var(--err)" : c.halluc > 1 ? "var(--warn-fg)" : "var(--fg-1)" }}>{c.halluc.toFixed(1)}%</td>
                <td style={{ paddingRight: 18 }}><Icon name="chevron-right" size={12} className="muted"/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* =========================================================
   TAB 5 — SECURITY
   ========================================================= */
function SecurityTab() {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <KPI label="Security events (1h)" value="22"  delta="+6"  deltaKind="down warn" sub="2 high · 8 medium · 12 low" spark={141} sparkColor="var(--err)" sparkSoft="var(--err-soft)"/>
        <KPI label="Prompt injections"    value="4"   delta="all blocked" deltaKind="up" sub="2 indirect · 2 direct"     spark={142} sparkColor="var(--accent-violet)" sparkSoft="var(--accent-violet-soft)"/>
        <KPI label="PII redactions"       value="124" delta="+18" deltaKind="warn" sub="98 prompt / 26 response"          spark={143} sparkColor="var(--orange)" sparkSoft="#fed7aa"/>
        <KPI label="Toxicity flags"       value="3"   delta="−2"  deltaKind="up"   sub="moderation-guard"                 spark={144} sparkColor="var(--fg-3)" sparkSoft="var(--bg-inset)"/>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16, alignItems: "start" }}>
        <div className="card" style={{ padding: 0 }}>
          <div className="row" style={{ padding: "12px 18px", borderBottom: "1px solid var(--line-2)" }}>
            <div className="page-icon" style={{ width: 28, height: 28, background: "var(--err-soft)", color: "var(--err)" }}>
              <Icon name="shield" size={14}/>
            </div>
            <div>
              <div className="card-title">Security events</div>
              <div className="card-sub" style={{ marginTop: 2 }}>Live feed from Sensitive Data Scanner + prompt-injection detector</div>
            </div>
            <div className="spacer"/>
            <div className="seg">
              <div className="seg-opt active">All</div>
              <div className="seg-opt">High</div>
              <div className="seg-opt">Medium</div>
              <div className="seg-opt">Low</div>
            </div>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ paddingLeft: 18 }}>Time</th>
                <th>Severity</th>
                <th>Kind</th>
                <th>App</th>
                <th>Model</th>
                <th>Detail</th>
                <th style={{ paddingRight: 18 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {SEC_EVENTS.map((e, i) => {
                const sev = e.sev === "high" ? "err" : e.sev === "medium" ? "warn" : "neutral";
                return (
                  <tr key={i} style={{ cursor: "pointer" }}>
                    <td style={{ paddingLeft: 18 }} className="mono muted">{e.t}</td>
                    <td><span className={"badge " + sev} style={{ textTransform: "uppercase" }}>{e.sev !== "low" && <span className="b-dot"/>}{e.sev}</span></td>
                    <td className="mono" style={{ color: "var(--fg-0)", fontWeight: 600 }}>{e.kind}</td>
                    <td className="mono">{e.app}</td>
                    <td className="mono muted">{e.model}</td>
                    <td className="muted" style={{ fontSize: 12, maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.detail}</td>
                    <td style={{ paddingRight: 18 }}>
                      <span className="badge neutral" style={{ height: 18, fontSize: 10 }}>{e.action}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="card card-pad-lg">
          <div className="card-title" style={{ marginBottom: 12 }}>Defense posture</div>
          {[
            { l: "Prompt-injection scrubber", on: true,  d: "Direct + indirect detection · all chains" },
            { l: "Sensitive Data Scanner",   on: true,  d: "PII / financial / health · in & out" },
            { l: "Tool allow-list",          on: true,  d: "188 tools · 49 require approval" },
            { l: "Output moderation",        on: true,  d: "openai.moderation on every response" },
            { l: "Egress policy",            on: true,  d: "tool calls restricted by net policy" },
            { l: "Hallucination evaluator",  on: true,  d: "claude-haiku, sampled at 100%" },
            { l: "Jailbreak detector",       on: false, d: "preview · enable for ChatGPT-like apps" },
          ].map(p => (
            <div key={p.l} className="row" style={{ padding: "8px 0", borderBottom: "1px solid var(--line-2)" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.on ? "var(--ok)" : "var(--warn)", flexShrink: 0 }}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, color: "var(--fg-0)", fontWeight: 500 }}>{p.l}</div>
                <div className="muted" style={{ fontSize: 11 }}>{p.d}</div>
              </div>
              <span className="mono" style={{ fontSize: 10.5, color: p.on ? "var(--ok)" : "var(--warn-fg)", fontWeight: 700 }}>{p.on ? "ON" : "OFF"}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* =========================================================
   TAB 6 — COST
   ========================================================= */
function CostTab() {
  const sorted = ML_APPS.slice().sort((a, b) => b.cost - a.cost);
  const total  = sorted.reduce((a, m) => a + m.cost, 0);
  const byVendor = ML_APPS.reduce((a, m) => ({ ...a, [m.vendor]: (a[m.vendor] || 0) + m.cost }), {});
  const vendors = Object.entries(byVendor).sort((a, b) => b[1] - a[1]);
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <KPI label="Spend (1h)"          value={fmtCost(total)} delta="+$18" deltaKind="warn" sub={`$${(total * 24).toLocaleString()} / day projected`} spark={151} sparkColor="var(--orange)" sparkSoft="#fed7aa"/>
        <KPI label="Tokens (1h)"         value="222.1M"          delta="+18%" deltaKind="up" sub="78% input · 22% output"           spark={152} sparkColor="var(--brand)" sparkSoft="var(--brand-soft)"/>
        <KPI label="$/1k LLM spans"      value="$2.40"           delta="−$0.12" deltaKind="up" sub="moving to gpt-4o-mini for RAG" spark={153} sparkColor="var(--ok)" sparkSoft="var(--ok-soft)"/>
        <KPI label="Budget remaining"    value="$6.6k"           delta="22% left" deltaKind="warn" sub="$23.4k of $30k · day 18/31" spark={154} sparkColor="var(--warn)" sparkSoft="var(--warn-soft)"/>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16, alignItems: "start" }}>
        <div className="card card-pad-lg">
          <div className="row" style={{ marginBottom: 12 }}>
            <div>
              <div className="card-title">Spend by ML app</div>
              <div className="card-sub" style={{ marginTop: 2 }}>{ML_APPS.length} apps · sorted by hourly cost · click to see model split</div>
            </div>
            <div className="spacer"/>
            <div className="seg">
              <div className="seg-opt active">1h</div>
              <div className="seg-opt">24h</div>
              <div className="seg-opt">30d</div>
            </div>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ paddingLeft: 0 }}>App</th>
                <th>Primary model</th>
                <th style={{ textAlign: "right" }}>Tokens in</th>
                <th style={{ textAlign: "right" }}>Tokens out</th>
                <th style={{ textAlign: "right" }}>$/1k calls</th>
                <th style={{ textAlign: "right" }}>Hour cost</th>
                <th>Share</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(a => {
                const tokIn = a.spans.llm * (a.kind === "rag" ? 80 : 200);
                const tokOut = a.spans.llm * (a.kind === "rag" ? 20 : 60);
                const per1k = (a.cost / (a.spans.llm || 1)) * 1000;
                const pct = (a.cost / total) * 100;
                return (
                  <tr key={a.id} style={{ cursor: "pointer" }}>
                    <td style={{ paddingLeft: 0 }}>
                      <div className="row">
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: VENDOR_COLORS[a.vendor], flexShrink: 0 }}/>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg-0)" }}>{a.id}</div>
                          <div className="muted" style={{ fontSize: 11 }}>{a.team}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="row" style={{ gap: 6 }}>
                        <VendorChip vendor={a.vendor}/>
                        <span className="mono" style={{ fontSize: 11.5, color: "var(--fg-1)" }}>{a.primary}</span>
                      </div>
                    </td>
                    <td className="mono" style={{ textAlign: "right", color: "var(--fg-1)" }}>{fmtTok(tokIn)}</td>
                    <td className="mono" style={{ textAlign: "right", color: "var(--fg-1)" }}>{fmtTok(tokOut)}</td>
                    <td className="mono" style={{ textAlign: "right", color: "var(--fg-2)" }}>${per1k.toFixed(2)}</td>
                    <td className="mono" style={{ textAlign: "right", color: "var(--fg-0)", fontWeight: 700 }}>${a.cost}</td>
                    <td>
                      <div className="row" style={{ gap: 8 }}>
                        <div style={{ width: 90, height: 5, borderRadius: 3, background: "var(--bg-inset)", overflow: "hidden" }}>
                          <div style={{ width: pct + "%", height: "100%", background: VENDOR_COLORS[a.vendor] }}/>
                        </div>
                        <span className="mono" style={{ fontSize: 11, color: "var(--fg-2)", minWidth: 32 }}>{pct.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td><Icon name="chevron-right" size={12} className="muted"/></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="col" style={{ gap: 14 }}>
          <div className="card card-pad-lg">
            <div className="card-title" style={{ marginBottom: 4 }}>By vendor</div>
            <div className="card-sub" style={{ marginBottom: 14 }}>Hour spend · {fmtCost(total)} total</div>
            <div style={{ display: "flex", height: 12, borderRadius: 6, overflow: "hidden", marginBottom: 14, background: "var(--bg-inset)" }}>
              {vendors.map(([v, c]) => (
                <div key={v} style={{ width: (c / total * 100) + "%", background: VENDOR_COLORS[v] }} title={v}/>
              ))}
            </div>
            {vendors.map(([v, c]) => (
              <div key={v} className="row" style={{ padding: "6px 0", borderBottom: "1px solid var(--line-2)" }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: VENDOR_COLORS[v] }}/>
                <span style={{ fontSize: 12.5, color: "var(--fg-0)" }}>{VENDOR_LABEL[v]}</span>
                <span className="spacer"/>
                <span className="mono" style={{ fontSize: 12, color: "var(--fg-0)", fontWeight: 600 }}>${c}</span>
                <span className="mono muted" style={{ fontSize: 11, marginLeft: 6, minWidth: 36, textAlign: "right" }}>{(c / total * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>

          <div className="card card-pad-lg">
            <div className="row" style={{ marginBottom: 10 }}>
              <span style={{ width: 22, height: 22, borderRadius: 5, background: "var(--accent-violet-soft)", color: "var(--accent-violet)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icon name="sparkle" size={12}/></span>
              <div className="card-title" style={{ fontSize: 13 }}>Cost optimizations</div>
            </div>
            {[
              { save: "$184/mo", title: "Switch doc-search-rag to gpt-4o-mini", sub: "Quality drop projected: −0.4pp" },
              { save: "$96/mo",  title: "Cache stable prompts for support-chatbot", sub: "42% of prompts repeat verbatim within 24h" },
              { save: "$42/mo",  title: "Trim system prompt for code-assist", sub: "Currently 1.8k tokens · could be ~600" },
              { save: "$28/mo",  title: "Batch embeddings for semantic-search", sub: "32 embeddings/sec → batch of 64" },
            ].map((s, i) => (
              <div key={i} className="row" style={{ padding: "8px 0", borderBottom: "1px solid var(--line-2)", alignItems: "flex-start" }}>
                <span className="mono" style={{ fontSize: 11, color: "var(--ok)", fontWeight: 700, width: 60, paddingTop: 1 }}>{s.save}</span>
                <div>
                  <div style={{ fontSize: 12.5, color: "var(--fg-0)", fontWeight: 500 }}>{s.title}</div>
                  <div className="muted" style={{ fontSize: 11, marginTop: 1 }}>{s.sub}</div>
                </div>
                <span className="spacer"/>
                <Icon name="chevron-right" size={12} className="muted"/>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

Object.assign(window, {
  LLMObsScreen, KPI, VendorChip, SpanChip, KindChip,
  fmtTok, fmtReq, fmtCost, fmtLat,
  ML_APPS, VENDOR_COLORS, VENDOR_LABEL,
});
