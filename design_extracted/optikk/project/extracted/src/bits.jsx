/* global React, Icon, PageHeader, Tabs, MiniSpark, AreaSpark, seededWave, KPI, fmtReq, fmtLat, PAGE_URL */
/* =================================================================
   BITS — natural-language search and action layer, native to Optikk.
   Same shell, same tokens, same components as the rest of the app.
   ================================================================= */
const { useState: useStateH, useMemo: useMemoH, useEffect: useEffectH, useRef: useRefH } = React;

/* MCP tools the assistant fans out to — each one wraps an Optikk
   product surface, so cards in the answer can deep-link back to
   the actual page (Services / Monitors / Logs / Traces / etc.). */
const BITS_TOOLS = [
  { id: "monitors",  label: "Monitors",   tool: "optikk.list_monitors",        href: PAGE_URL.monitors,       icon: "bell",     color: "var(--err)" },
  { id: "services",  label: "Services",   tool: "optikk.get_service",          href: PAGE_URL.services,       icon: "service",  color: "var(--brand)" },
  { id: "metrics",   label: "Metrics",    tool: "optikk.query_metric",         href: PAGE_URL.metrics,        icon: "metrics",  color: "var(--chart-2)" },
  { id: "traces",    label: "Traces",     tool: "optikk.get_trace",            href: PAGE_URL.traceList,      icon: "trace",    color: "var(--accent-violet)" },
  { id: "logs",      label: "Logs",       tool: "optikk.search_logs",          href: PAGE_URL.logs,           icon: "logs",     color: "var(--ok)" },
  { id: "infra",     label: "Infra",      tool: "optikk.get_host",             href: PAGE_URL.infrastructure, icon: "infra",    color: "var(--chart-3)" },
  { id: "saturation",label: "Saturation", tool: "optikk.get_saturation",       href: PAGE_URL.saturation,     icon: "saturation",color: "var(--orange)" },
  { id: "llmobs",    label: "LLM Obs",    tool: "optikk.llm_app_health",       href: PAGE_URL.llmobs,         icon: "ai",       color: "var(--accent-violet)" },
];
const BITS_TOOL_BY_ID = Object.fromEntries(BITS_TOOLS.map(t => [t.id, t]));

/* ---- Demo investigation: a payment-svc latency incident ---- */
const BITS_RUN = {
  query: "why is payment-svc slow in us-east-1 right now?",
  meta: { sources: 5, tokens: "3.2k", latency: "1.84s" },
  fan: {
    monitors:   { lat: 142, count: 2 },
    services:   {  lat: 84, count: 1 },
    metrics:    { lat: 218, count: 3 },
    traces:     { lat: 312, count: 1 },
    logs:       { lat: 412, count: 18420 },
    infra:      {  lat: 94, count: 3 },
    saturation: {  lat: 64, count: 1 },
    ai:         {  lat:  0, count: 0 },
    mcp:        {  lat:  0, count: 0 },
  },
  /* Tokens in the synthesized answer */
  answer: [
    { t: "payment-svc", code: true },
    { t: " p95 latency in " },
    { t: "us-east-1", code: true },
    { t: " is " },
    { t: "+218% above its 7-day baseline", b: true },
    { t: " (1.84s vs 580ms) " },
    { cite: 1 },
    { t: ". The slow span is " },
    { t: "POST /v2/charge → stripe-gateway", code: true },
    { t: " " },
    { cite: 2 },
    { t: ", which started timing out after a deploy of " },
    { t: "stripe-gateway@a4f12c1", code: true },
    { t: " at " },
    { t: "13:58 UTC", b: true },
    { t: " " },
    { cite: 4 },
    { t: ". Two monitors are firing " },
    { cite: 3 },
    { t: " and database saturation on " },
    { t: "orders-db-primary", code: true },
    { t: " is at " },
    { t: "92% conn pool", b: true },
    { t: " " },
    { cite: 5 },
    { t: "." },
  ],
  /* Citation number → card id */
  citeMap: { 1: "m1", 2: "t1", 3: "mon1", 4: "svc1", 5: "sat1" },
};

const BITS_STEPS = [
  { id: "monitors",  thinking: "checking active alerts for payment-svc…",                result: "2 alerts" },
  { id: "services",  thinking: "fetching service definition + recent deploys…",          result: "owner + 3 deploys" },
  { id: "metrics",   thinking: "querying p95 latency by host for last 1h…",              result: "+218% vs 7d baseline" },
  { id: "traces",    thinking: "pulling slowest trace for payment-svc in us-east-1…",    result: "trace_id=4f12c1" },
  { id: "logs",      thinking: "scanning ERROR/WARN logs for payment-svc + dependencies…",result: "18.4k matches" },
  { id: "saturation",thinking: "checking DB + queue saturation…",                         result: "orders-db 92% pool" },
];

const BITS_SUGGESTED = [
  { q: "what changed for payment-svc in the last 24h?",        tools: ["services","metrics","traces"] },
  { q: "show open SEV-1 and SEV-2 monitors",                   tools: ["monitors"] },
  { q: "spike in 5XX on api-gateway — which dep is the cause?",tools: ["services","traces","logs"] },
  { q: "kafka lag for checkout.events right now",              tools: ["saturation","metrics"] },
  { q: "which AI app burned the most tokens today?",           tools: ["ai","mcp"] },
];

const BITS_HISTORY = [
  { q: "why is payment-svc slow in us-east-1 right now?", when: "now",        sources: 5 },
  { q: "incidents in the last 24h",                       when: "12m ago",     sources: 3 },
  { q: "cost spike for opensearch on Tuesday",            when: "yesterday",   sources: 4 },
  { q: "kafka consumer lag for analytics-3",              when: "3d ago",      sources: 2 },
];

/* =================================================================
   Tool pill — driven by step state (idle / pending / done)
   ================================================================= */
function BitsToolPill({ tool, state, lat, count }) {
  const idle = state === "idle";
  const pending = state === "pending";
  const done = state === "done";
  const empty = done && count === 0;

  let badgeNode;
  if (pending) {
    badgeNode = (
      <span className="row" style={{ gap: 3 }}>
        <span className="bits-dot"/><span className="bits-dot" style={{ animationDelay: "0.12s" }}/><span className="bits-dot" style={{ animationDelay: "0.24s" }}/>
      </span>
    );
  } else if (done && !empty) {
    badgeNode = (
      <span className="row" style={{ gap: 6 }}>
        <span className="mono" style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-0)" }}>{count >= 1000 ? (count/1000).toFixed(1)+"k" : count}</span>
        <span className="mono" style={{ fontSize: 10.5, color: "var(--fg-mute)" }}>{lat}ms</span>
      </span>
    );
  } else if (empty) {
    badgeNode = <span className="mono" style={{ fontSize: 10.5, color: "var(--fg-mute)" }}>0</span>;
  } else {
    badgeNode = <span style={{ fontSize: 10.5, color: "var(--fg-mute)" }}>idle</span>;
  }

  return (
    <a
      href={done && !empty ? tool.href : undefined}
      className="row"
      style={{
        gap: 8, padding: "5px 11px 5px 6px",
        background: "var(--bg-card)",
        border: "1px solid " + (pending ? "var(--brand)" : "var(--line)"),
        borderRadius: 999,
        boxShadow: pending ? "0 0 0 3px var(--brand-soft)" : "none",
        opacity: idle ? 0.55 : 1,
        transition: "opacity 200ms, border-color 200ms, box-shadow 200ms",
        cursor: done && !empty ? "pointer" : "default",
        textDecoration: "none",
      }}
      title={tool.tool}
    >
      <span style={{
        width: 22, height: 22, borderRadius: "50%",
        background: "color-mix(in oklab, " + tool.color + " 14%, transparent)",
        color: tool.color,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon name={tool.icon} size={12}/>
      </span>
      <span style={{ fontSize: 12, color: "var(--fg-1)", fontWeight: 500 }}>{tool.label}</span>
      <span style={{ paddingLeft: 6, marginLeft: -2, borderLeft: "1px solid var(--line)", display: "inline-flex" }}>
        {badgeNode}
      </span>
    </a>
  );
}

/* =================================================================
   Streaming step list (one row per tool call, with thinking text)
   ================================================================= */
function BitsStream({ steps, phase }) {
  return (
    <div className="card" style={{ padding: 0 }}>
      <div className="row" style={{ padding: "10px 16px", borderBottom: "1px solid var(--line-2)" }}>
        <span style={{ width: 22, height: 22, borderRadius: 5, background: "var(--accent-violet-soft)", color: "var(--accent-violet)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="sparkle" size={12}/>
        </span>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--accent-violet)" }}>
          {phase === "answering" ? "Synthesizing answer" : "Investigating"}
        </span>
        <span className="spacer"/>
        <span className="mono" style={{ fontSize: 11, color: "var(--fg-mute)" }}>via MCP · {steps.length} tools</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", padding: "6px 8px" }}>
        {steps.map((s, i) => {
          const tool = BITS_TOOL_BY_ID[s.id];
          const active = s.state === "pending";
          const done = s.state === "done";
          return (
            <div key={s.id} className="row" style={{
              padding: "6px 10px",
              borderRadius: 5,
              opacity: s.state === "idle" ? 0.4 : 1,
              background: active ? "var(--brand-tint)" : "transparent",
              gap: 10, fontSize: 12,
            }}>
              <span className="mono" style={{ width: 18, color: "var(--fg-mute)", fontSize: 11 }}>{(i+1).toString().padStart(2, "0")}</span>
              <span style={{ width: 20, height: 20, borderRadius: 4, background: "color-mix(in oklab, " + tool.color + " 14%, transparent)", color: tool.color, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name={tool.icon} size={11}/>
              </span>
              <span className="mono" style={{ color: "var(--fg-0)", fontWeight: 500, fontSize: 11.5 }}>{tool.tool}</span>
              <span style={{ color: "var(--fg-3)", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.thinking}</span>
              {active && (
                <span className="row" style={{ gap: 3 }}>
                  <span className="bits-dot"/><span className="bits-dot" style={{ animationDelay: "0.12s" }}/><span className="bits-dot" style={{ animationDelay: "0.24s" }}/>
                </span>
              )}
              {done && (
                <span className="badge ok" style={{ height: 18, fontSize: 10 }}>{s.result}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =================================================================
   Answer card — uses brand color + inline citation chips
   ================================================================= */
function BitsAnswer({ run, onCite }) {
  return (
    <div className="card" style={{
      padding: "18px 22px",
      background: "linear-gradient(180deg, var(--brand-tint) 0%, transparent 100%), var(--bg-card)",
      borderColor: "color-mix(in oklab, var(--brand) 22%, var(--line))",
    }}>
      <div className="row" style={{ marginBottom: 10 }}>
        <span style={{ width: 26, height: 26, borderRadius: 6, background: "var(--brand-soft)", color: "var(--brand-deep)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="sparkle" size={14}/>
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--brand-deep)" }}>Bits answer</span>
        <span className="spacer"/>
        <span className="mono" style={{ fontSize: 11, color: "var(--fg-mute)" }}>{run.meta.sources} sources · {run.meta.tokens} tokens · {run.meta.latency}</span>
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.7, color: "var(--fg-0)", textWrap: "pretty" }}>
        {run.answer.map((t, i) => {
          if (t.cite != null) {
            return (
              <button key={i} onClick={() => onCite(t.cite)} style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                minWidth: 16, height: 16, padding: "0 4px",
                background: "var(--brand)", color: "white",
                borderRadius: 3,
                fontSize: 10, fontWeight: 700,
                fontFamily: "var(--font-mono)",
                margin: "0 2px",
                cursor: "pointer", border: 0,
                verticalAlign: "1.5px",
              }}>{t.cite}</button>
            );
          }
          if (t.code) return <code key={i} className="mono" style={{ padding: "1px 6px", borderRadius: 4, background: "var(--bg-inset)", color: "var(--fg-0)", border: "1px solid var(--line-2)", fontSize: 12.5 }}>{t.t}</code>;
          if (t.b) return <strong key={i} style={{ color: "var(--fg-0)", fontWeight: 600 }}>{t.t}</strong>;
          return <span key={i}>{t.t}</span>;
        })}
      </div>
    </div>
  );
}

/* =================================================================
   Result cards — each one is a tiny Optikk artifact:
   Monitor / Timeseries / Trace / Service / Saturation
   ================================================================= */

function MonitorCardH({ cid, focused }) {
  const spark = useMemoH(() => seededWave(31, 30, 0.3, 0.08, 0.4).map((v, i) => i < 22 ? v : Math.min(1, v * 3.4)), []);
  const w = 280, h = 36;
  const max = Math.max(...spark);
  return (
    <div className="card" data-cid={cid} style={{ borderColor: focused ? "var(--brand)" : "var(--line)", boxShadow: focused ? "0 0 0 3px var(--brand-soft)" : "none" }}>
      <div className="row" style={{ marginBottom: 10 }}>
        <span className="badge err"><span className="b-dot"/>ALERT</span>
        <div>
          <div className="card-title">payment-svc p95 latency</div>
          <div className="card-sub mono" style={{ marginTop: 2 }}>service:payment-svc · region:us-east-1 · env:prod</div>
        </div>
        <span className="spacer"/>
        <a className="btn btn-ghost" href={PAGE_URL.monitors} style={{ height: 24, fontSize: 11.5 }}>Open monitor<Icon name="chevron-right" size={12}/></a>
      </div>
      <div className="row" style={{ gap: 24, alignItems: "center" }}>
        <div>
          <div className="stat-label">Current</div>
          <div className="stat-value">1.84s</div>
        </div>
        <div>
          <div className="stat-label">Threshold</div>
          <div className="mono" style={{ fontSize: 13, color: "var(--fg-1)" }}>&gt; 800ms</div>
        </div>
        <div>
          <div className="stat-label">Triggered</div>
          <div className="mono" style={{ fontSize: 13, color: "var(--fg-1)" }}>14:04 UTC · 38m ago</div>
        </div>
        <span className="spacer"/>
        <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{ display: "block" }}>
          <line x1="0" x2={w} y1={h - h * 0.42} y2={h - h * 0.42} stroke="var(--err)" strokeDasharray="3 3" strokeWidth="1" opacity="0.4"/>
          <path d={"M " + spark.map((v, i) => `${(i / (spark.length-1)) * w},${h - (v / max) * (h - 4) - 2}`).join(" L ") + ` L ${w},${h} L 0,${h} Z`} fill="var(--err)" opacity="0.1"/>
          <path d={"M " + spark.map((v, i) => `${(i / (spark.length-1)) * w},${h - (v / max) * (h - 4) - 2}`).join(" L ")} fill="none" stroke="var(--err)" strokeWidth="1.6" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}

function TimeseriesCardH({ cid, focused }) {
  const w = 880, h = 110;
  const padL = 36, padR = 12, padT = 6, padB = 18;
  const N = 50;
  const baseline = 0.22;

  const series = useMemoH(() => ([
    { label: "i-0a4f12 (us-east-1a)",  color: "var(--err)",     data: seededWave(11, N, 0.22, 0.04, 0.5).map((v, i) => i < 32 ? v : Math.min(0.95, v * 3.6)) },
    { label: "i-0b7e44 (us-east-1c)",  color: "var(--orange)",  data: seededWave(13, N, 0.22, 0.04, 0.5).map((v, i) => i < 36 ? v : Math.min(0.85, v * 3.0)) },
    { label: "i-0d3a21 (us-east-1d)",  color: "var(--ok)",      data: seededWave(17, N, 0.22, 0.04, 0.5) },
  ]), []);

  const xx = (i) => padL + (i / (N - 1)) * (w - padL - padR);
  const yy = (v) => padT + (1 - Math.min(v, 1)) * (h - padT - padB);

  return (
    <div className="card" data-cid={cid} style={{ borderColor: focused ? "var(--brand)" : "var(--line)", boxShadow: focused ? "0 0 0 3px var(--brand-soft)" : "none" }}>
      <div className="row" style={{ marginBottom: 8 }}>
        <span style={{ width: 22, height: 22, borderRadius: 5, background: "var(--brand-soft)", color: "var(--brand-deep)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="metrics" size={12}/>
        </span>
        <div>
          <div className="card-title mono">trace.http.request.duration{`{service:payment-svc}`} by host</div>
          <div className="card-sub" style={{ marginTop: 2 }}>p95 · grouped by host · last 1 hour</div>
        </div>
        <span className="spacer"/>
        <span className="delta down" style={{ fontSize: 13 }}>+218% vs 7d baseline</span>
        <a className="btn btn-ghost" href={PAGE_URL.metrics} style={{ height: 24, fontSize: 11.5 }}>Open in Metrics<Icon name="chevron-right" size={12}/></a>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} style={{ display: "block" }}>
        {[0.25, 0.5, 0.75, 1].map((g, i) => <line key={i} x1={padL} x2={w-padR} y1={padT + (1-g)*(h-padT-padB)} y2={padT + (1-g)*(h-padT-padB)} stroke="var(--line-2)"/>)}
        <line x1={padL} x2={w-padR} y1={yy(baseline)} y2={yy(baseline)} stroke="var(--fg-mute)" strokeDasharray="3 3" opacity="0.55"/>
        <text x={padL-6} y={yy(baseline)+3} textAnchor="end" fontSize="10" fill="var(--fg-mute)" fontFamily="var(--font-mono)">580ms baseline</text>
        {["0","800ms","1.6s","2.4s"].map((l, i) => (
          <text key={i} x={padL-6} y={padT + (1-i/3)*(h-padT-padB) + 3} textAnchor="end" fontSize="10" fill="var(--fg-mute)" fontFamily="var(--font-mono)">{l}</text>
        ))}
        {series.map((s, k) => (
          <path key={k} d={"M " + s.data.map((v, i) => `${xx(i).toFixed(1)},${yy(v).toFixed(1)}`).join(" L ")}
            fill="none" stroke={s.color} strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round"/>
        ))}
      </svg>
      <div className="row" style={{ gap: 18, paddingTop: 8, flexWrap: "wrap" }}>
        {series.map(s => (
          <span key={s.label} className="row" style={{ gap: 6, fontSize: 11.5, color: "var(--fg-2)" }}>
            <span style={{ width: 12, height: 2, background: s.color }}/>
            <span className="mono">{s.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function TraceCardH({ cid, focused }) {
  const spans = [
    { name: "POST /checkout",                svc: "web-store",      pct: 100, off: 0,   lat: "1.84s",                 sev: "warn", color: "var(--brand)" },
    { name: "validate_cart",                  svc: "payment-svc",    pct: 6,   off: 0,   lat: "108ms",                 sev: "ok",   color: "var(--ok)" },
    { name: "lookup_pricing",                 svc: "pricing-svc",    pct: 12,  off: 6,   lat: "224ms",                 sev: "ok",   color: "var(--chart-2)" },
    { name: "create_order",                   svc: "orders-svc",     pct: 7,   off: 18,  lat: "128ms",                 sev: "ok",   color: "var(--chart-3)" },
    { name: "POST /v2/charge → stripe-gateway",svc: "stripe-gateway", pct: 71,  off: 25,  lat: "1.32s · 3× retry",      sev: "err",  color: "var(--err)", flame: true },
    { name: "publish order.placed",           svc: "kafka",          pct: 4,   off: 96,  lat: "78ms",                  sev: "ok",   color: "var(--orange)" },
  ];
  return (
    <div className="card" data-cid={cid} style={{ borderColor: focused ? "var(--brand)" : "var(--line)", boxShadow: focused ? "0 0 0 3px var(--brand-soft)" : "none" }}>
      <div className="row" style={{ marginBottom: 8 }}>
        <span style={{ width: 22, height: 22, borderRadius: 5, background: "var(--accent-violet-soft)", color: "var(--accent-violet)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="trace" size={12}/>
        </span>
        <div>
          <div className="card-title mono">trace · POST /checkout · 1.84s</div>
          <div className="card-sub mono" style={{ marginTop: 2 }}>trace_id=4f12c1… · 6 spans · slowest: stripe-gateway</div>
        </div>
        <span className="spacer"/>
        <a className="btn btn-ghost" href={PAGE_URL.trace} style={{ height: 24, fontSize: 11.5 }}>Open trace<Icon name="chevron-right" size={12}/></a>
      </div>
      <div style={{ display: "flex", flexDirection: "column", paddingTop: 4 }}>
        {spans.map((sp, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "300px 1fr 110px", gap: 14, alignItems: "center", padding: "4px 0", borderBottom: i < spans.length - 1 ? "1px solid var(--line-2)" : 0 }}>
            <div className="row" style={{ gap: 7, minWidth: 0 }}>
              <span style={{ width: 6, height: 6, borderRadius: 1.5, background: sp.color, flexShrink: 0 }}/>
              <span className="mono" style={{ fontSize: 12, color: "var(--fg-0)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sp.name}</span>
              <span className="mono" style={{ fontSize: 10.5, color: "var(--fg-mute)" }}>· {sp.svc}</span>
            </div>
            <div style={{ position: "relative", height: 18, background: "var(--bg-inset)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{
                position: "absolute", top: 0, height: 18,
                left: sp.off + "%", width: sp.pct + "%",
                background: sp.color,
                opacity: sp.flame ? 1 : 0.85,
                backgroundImage: sp.flame ? "repeating-linear-gradient(135deg, transparent 0 4px, rgba(255,255,255,0.25) 4px 8px)" : "none",
                borderRadius: 3,
              }}/>
            </div>
            <div className="mono" style={{ fontSize: 11, color: sp.sev === "err" ? "var(--err)" : sp.sev === "warn" ? "var(--warn-fg)" : "var(--fg-2)", textAlign: "right" }}>{sp.lat}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ServiceCardH({ cid, focused }) {
  const deploys = [
    { t: "13:58", who: "lin",  what: "stripe-gateway@a4f12c1 — \"bump stripe sdk to 14.x\"", hot: true },
    { t: "11:42", who: "mira", what: "payment-svc@9b21de4 — \"add idempotency keys\"" },
    { t: "Mon",  who: "jay",  what: "pricing-svc@7c0a — \"discount rules v2\"" },
  ];
  return (
    <div className="card" data-cid={cid} style={{ borderColor: focused ? "var(--brand)" : "var(--line)", boxShadow: focused ? "0 0 0 3px var(--brand-soft)" : "none" }}>
      <div className="row" style={{ marginBottom: 12 }}>
        <span style={{ width: 22, height: 22, borderRadius: 5, background: "var(--brand-soft)", color: "var(--brand-deep)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="service" size={12}/>
        </span>
        <div>
          <div className="card-title mono">payment-svc</div>
          <div className="card-sub" style={{ marginTop: 2 }}>Platform · Payments · Tier 1 · 12 instances · us-east-1, us-west-2</div>
        </div>
        <span className="spacer"/>
        <a className="btn btn-ghost" href={PAGE_URL.serviceDetail + "?id=payment-svc"} style={{ height: 24, fontSize: 11.5 }}>Open service<Icon name="chevron-right" size={12}/></a>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <div>
          <div className="stat-label">Owner</div>
          <div style={{ fontSize: 13, color: "var(--fg-0)", marginTop: 4, fontWeight: 500 }}>Platform · Payments</div>
        </div>
        <div>
          <div className="stat-label">On-call</div>
          <div style={{ fontSize: 13, color: "var(--fg-0)", marginTop: 4, fontWeight: 500 }}>Mira Singh (through Fri)</div>
        </div>
        <div>
          <div className="stat-label">Tier</div>
          <div style={{ fontSize: 13, color: "var(--fg-0)", marginTop: 4, fontWeight: 500 }}>Tier 1 · revenue-critical</div>
        </div>
        <div>
          <div className="stat-label">Dependencies</div>
          <div style={{ marginTop: 4 }}>
            <span className="badge neutral mono" style={{ height: 18, fontSize: 10 }}>5 services</span>
          </div>
        </div>
      </div>
      <div className="hairline" style={{ margin: "14px 0 10px" }}/>
      <div className="stat-label" style={{ marginBottom: 8 }}>Recent deploys</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {deploys.map((d, i) => (
          <div key={i} className="row" style={{
            gap: 14, padding: "6px 8px",
            borderRadius: 5,
            background: d.hot ? "var(--err-soft)" : "transparent",
            fontSize: 12.5,
          }}>
            <span className="mono" style={{ fontSize: 11, color: "var(--fg-mute)", width: 48 }}>{d.t}</span>
            <span className="mono" style={{ fontSize: 11, color: "var(--fg-3)", width: 36 }}>@{d.who}</span>
            <span style={{ color: "var(--fg-1)", flex: 1 }}>{d.what}</span>
            {d.hot && <span className="badge err" style={{ height: 18 }}><span className="b-dot"/>likely cause</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function SaturationCardH({ cid, focused }) {
  const rings = [
    { label: "Connection pool",      val: 92, max: 100, unit: "%",   color: "var(--err)" },
    { label: "Active queries",        val: 218, max: 256, unit: "",    color: "var(--warn)" },
    { label: "Replication lag",       val: 4.2, max: 8,   unit: "s",   color: "var(--warn)" },
    { label: "Disk IO util",          val: 78, max: 100, unit: "%",   color: "var(--warn)" },
  ];
  return (
    <div className="card" data-cid={cid} style={{ borderColor: focused ? "var(--brand)" : "var(--line)", boxShadow: focused ? "0 0 0 3px var(--brand-soft)" : "none" }}>
      <div className="row" style={{ marginBottom: 12 }}>
        <span style={{ width: 22, height: 22, borderRadius: 5, background: "color-mix(in oklab, var(--orange) 16%, transparent)", color: "var(--orange)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="saturation" size={12}/>
        </span>
        <div>
          <div className="card-title mono">orders-db-primary</div>
          <div className="card-sub" style={{ marginTop: 2 }}>Postgres 15.4 · r6g.4xlarge · us-east-1a · serves payment-svc, orders-svc</div>
        </div>
        <span className="spacer"/>
        <a className="btn btn-ghost" href={PAGE_URL.database} style={{ height: 24, fontSize: 11.5 }}>Open database<Icon name="chevron-right" size={12}/></a>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {rings.map(r => {
          const pct = Math.min(100, (r.val / r.max) * 100);
          return (
            <div key={r.label}>
              <div className="stat-label">{r.label}</div>
              <div className="row" style={{ alignItems: "baseline", gap: 6, marginTop: 4 }}>
                <span className="mono" style={{ fontSize: 20, fontWeight: 700, color: "var(--fg-0)", letterSpacing: "-0.01em" }}>{r.val}{r.unit}</span>
                <span className="mono" style={{ fontSize: 11, color: "var(--fg-mute)" }}>/ {r.max}{r.unit}</span>
              </div>
              <div style={{ height: 5, borderRadius: 3, background: "var(--bg-inset)", overflow: "hidden", marginTop: 6 }}>
                <div style={{ height: "100%", width: pct + "%", background: r.color }}/>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* Tiny log preview, used in compact contexts */
function LogStripH() {
  const rows = [
    { t: "14:42:18", lvl: "error", svc: "stripe-gateway", msg: "connect ETIMEDOUT 13.224.5.18:443 after 8000ms" },
    { t: "14:42:18", lvl: "warn",  svc: "payment-svc",    msg: "downstream stripe-gateway 504 in 3211ms · retry 1/3" },
    { t: "14:42:17", lvl: "error", svc: "payment-svc",    msg: "POST /v2/charge failed after 3 retries · order=ord_8a4f" },
    { t: "14:42:14", lvl: "warn",  svc: "stripe-gateway", msg: "connection pool exhausted: 32/32 in use · waiting" },
    { t: "14:42:14", lvl: "error", svc: "payment-svc",    msg: "POST /v2/charge failed after 3 retries · order=ord_8a4d" },
  ];
  return (
    <div className="card" style={{ padding: 0 }}>
      <div className="row" style={{ padding: "10px 16px", borderBottom: "1px solid var(--line-2)" }}>
        <span style={{ width: 22, height: 22, borderRadius: 5, background: "var(--ok-soft)", color: "var(--ok)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="logs" size={12}/>
        </span>
        <div>
          <div className="card-title">Log preview · 18,420 matches</div>
          <div className="card-sub mono" style={{ marginTop: 2 }}>service:(payment-svc OR stripe-gateway) status:(error OR warn)</div>
        </div>
        <span className="spacer"/>
        <a className="btn btn-ghost" href={PAGE_URL.logs} style={{ height: 24, fontSize: 11.5 }}>Open in Logs<Icon name="chevron-right" size={12}/></a>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {rows.map((r, i) => (
          <div key={i} className="row" style={{ padding: "7px 16px", borderBottom: i < rows.length - 1 ? "1px solid var(--line-2)" : 0, gap: 10, fontSize: 12 }}>
            <span className={"sev-gutter " + r.lvl}/>
            <span className="mono" style={{ fontSize: 11, color: "var(--fg-3)", width: 60 }}>{r.t}</span>
            <span className={"sev-chip " + r.lvl}>{r.lvl.toUpperCase()}</span>
            <span className="mono" style={{ fontSize: 11.5, color: "var(--brand-deep)", width: 130 }}>{r.svc}</span>
            <span style={{ color: "var(--fg-1)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CardRouterH({ cid, focused }) {
  switch (cid) {
    case "m1":   return <TimeseriesCardH cid={cid} focused={focused}/>;
    case "t1":   return <TraceCardH cid={cid} focused={focused}/>;
    case "mon1": return <MonitorCardH cid={cid} focused={focused}/>;
    case "svc1": return <ServiceCardH cid={cid} focused={focused}/>;
    case "sat1": return <SaturationCardH cid={cid} focused={focused}/>;
    default: return null;
  }
}

/* =================================================================
   The main screen
   ================================================================= */
function BitsScreen({ go }) {
  const [q, setQ] = useStateH(BITS_RUN.query);
  const [phase, setPhase] = useStateH("idle");  // idle | streaming | answering | done
  const [stepIdx, setStepIdx] = useStateH(-1);
  const [focusedCite, setFocusedCite] = useStateH(null);
  const resultsRef = useRefH();

  const start = (qq) => {
    setQ(qq);
    setStepIdx(-1);
    setPhase("streaming");
  };

  /* Auto-play the demo investigation on mount */
  useEffectH(() => { start(BITS_RUN.query); /* eslint-disable-next-line */ }, []);

  /* Step through tool calls */
  useEffectH(() => {
    if (phase !== "streaming") return;
    if (stepIdx >= BITS_STEPS.length - 1) {
      const tm = setTimeout(() => setPhase("answering"), 320);
      return () => clearTimeout(tm);
    }
    const tm = setTimeout(() => setStepIdx(i => i + 1), 340);
    return () => clearTimeout(tm);
  }, [phase, stepIdx]);

  useEffectH(() => {
    if (phase !== "answering") return;
    const tm = setTimeout(() => setPhase("done"), 480);
    return () => clearTimeout(tm);
  }, [phase]);

  const orderedSteps = BITS_STEPS.map((s, i) => ({
    ...s,
    state: phase === "done" || phase === "answering"
      ? "done"
      : (i < stepIdx ? "done" : i === stepIdx ? "pending" : "idle"),
  }));

  const onCite = (n) => {
    const cid = BITS_RUN.citeMap[n];
    setFocusedCite(cid);
    const el = resultsRef.current && resultsRef.current.querySelector(`[data-cid="${cid}"]`);
    if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
  };

  /* Counts */
  const stats = {
    sessions: 184,
    mcpTools: BITS_TOOLS.length,
    avgLat:   "1.6s",
    actionsTaken: 28,
  };

  return (
    <div className="page">
      <style>{`
        .bits-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--brand); animation: bits-blink 0.95s infinite; display: inline-block; }
        @keyframes bits-blink {
          0%, 100% { opacity: 0.25; transform: scale(0.8); }
          40%      { opacity: 1;    transform: scale(1); }
        }
        .bits-input-input::placeholder { color: var(--fg-mute); }
      `}</style>

      <PageHeader
        icon="sparkle"
        iconColor="var(--brand-deep)"
        iconBg="var(--brand-soft)"
        title="Bits"
        subtitle={`Natural-language search and action across Optikk · ${BITS_TOOLS.length} MCP tools connected · ${stats.sessions} sessions today`}
        statusBadge={<span className="badge info"><span className="b-dot"/>ready</span>}
        actions={
          <div className="row" style={{ gap: 6 }}>
            <button className="btn"><Icon name="clock" size={13}/>History</button>
            <button className="btn"><Icon name="bookmark" size={13}/>Saved</button>
            <button className="btn"><Icon name="more" size={13}/></button>
            <button className="btn btn-primary"><Icon name="plus" size={13}/>New session</button>
          </div>
        }
      />

      {/* Big input — Optikk card with brand-tinted shadow */}
      <div className="card card-pad-lg" style={{
        boxShadow: "0 12px 28px -14px color-mix(in oklab, var(--brand) 28%, transparent), var(--shadow-sm)",
      }}>
        <div className="row" style={{ gap: 12 }}>
          <span style={{
            width: 36, height: 36, borderRadius: 8,
            background: "var(--brand-soft)", color: "var(--brand-deep)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <Icon name="sparkle" size={17}/>
          </span>
          <input
            className="bits-input-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") start(q); }}
            placeholder="Ask Bits about a service, incident, metric, log pattern…"
            style={{
              flex: 1, border: 0, outline: 0, background: "transparent",
              fontSize: 16, fontWeight: 500, color: "var(--fg-0)",
              letterSpacing: "-0.005em",
            }}
          />
          <span className="row" style={{ gap: 4, color: "var(--fg-mute)", fontSize: 11 }}><span className="kbd">↵</span> ask</span>
          <button className="btn btn-primary" style={{ height: 34 }} onClick={() => start(q)}>
            <Icon name="send" size={13}/>Ask
          </button>
        </div>
        <div className="row" style={{ gap: 6, marginTop: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: "var(--fg-mute)" }}>TRY</span>
          {BITS_SUGGESTED.slice(0, 4).map(s => (
            <button key={s.q}
              onClick={() => start(s.q)}
              className="row"
              style={{
                padding: "4px 10px",
                background: "var(--bg-inset)",
                border: "1px solid transparent",
                color: "var(--fg-2)",
                borderRadius: 999,
                fontSize: 11.5,
                cursor: "pointer",
              }}>
              {s.q}
            </button>
          ))}
        </div>
      </div>

      {/* MCP tool fan-out */}
      <div className="card" style={{ padding: "14px 18px" }}>
        <div className="row" style={{ marginBottom: 10 }}>
          <span className="stat-label">MCP fan-out</span>
          <span className="spacer"/>
          <span style={{ fontSize: 12, color: "var(--fg-3)" }}>
            {phase === "idle"      && <>{BITS_TOOLS.length} tools available · core toolset</>}
            {phase === "streaming" && <span className="row" style={{ gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--brand)", animation: "bits-blink 1s infinite" }}/>Calling {orderedSteps.filter(s => s.state !== "idle").length} tools…</span>}
            {phase === "answering" && <>Synthesizing answer…</>}
            {phase === "done"      && <span className="row" style={{ gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--ok)", boxShadow: "0 0 0 3px var(--ok-soft)" }}/>Aggregated <b style={{ color: "var(--fg-0)" }}>{BITS_RUN.meta.sources}</b> sources in <b style={{ color: "var(--fg-0)" }}>{BITS_RUN.meta.latency}</b></span>}
          </span>
        </div>
        <div className="row" style={{ flexWrap: "wrap", gap: 6 }}>
          {BITS_TOOLS.map(tool => {
            const fan = BITS_RUN.fan[tool.id] || { count: 0, lat: 0 };
            let state = "idle";
            if (phase === "streaming") {
              const idx = BITS_STEPS.findIndex(s => s.id === tool.id);
              if (idx !== -1) {
                if (idx < stepIdx) state = "done";
                else if (idx === stepIdx) state = "pending";
              }
            } else if (phase === "answering" || phase === "done") {
              state = "done";
            }
            return <BitsToolPill key={tool.id} tool={tool} state={state} lat={fan.lat} count={fan.count}/>;
          })}
        </div>
      </div>

      {/* Streaming progress (collapses into static "done" list when finished) */}
      {phase !== "idle" && <BitsStream steps={orderedSteps} phase={phase}/>}

      {/* Answer */}
      {phase === "done" && <BitsAnswer run={BITS_RUN} onCite={onCite}/>}

      {/* Result cards (sources) */}
      {phase === "done" && (
        <div ref={resultsRef} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="row">
            <span className="stat-label">Sources</span>
            <span className="spacer"/>
            <span className="mono" style={{ fontSize: 11, color: "var(--fg-mute)" }}>cite [1]–[5] · click numbers in answer to jump</span>
          </div>
          <CardRouterH cid="m1"   focused={focusedCite === "m1"}/>
          <CardRouterH cid="t1"   focused={focusedCite === "t1"}/>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <CardRouterH cid="mon1" focused={focusedCite === "mon1"}/>
            <CardRouterH cid="sat1" focused={focusedCite === "sat1"}/>
          </div>
          <CardRouterH cid="svc1" focused={focusedCite === "svc1"}/>
          <LogStripH/>
        </div>
      )}

      {/* Agentic actions */}
      {phase === "done" && (
        <div className="card" style={{ padding: "14px 18px", borderStyle: "dashed" }}>
          <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
            <span className="stat-label" style={{ marginRight: 6 }}>Take action</span>
            <button className="btn btn-primary"><Icon name="alert" size={13}/>Declare incident · SEV-2</button>
            <button className="btn"><Icon name="bookmark" size={13}/>Open notebook</button>
            <button className="btn"><Icon name="bell" size={13}/>Mute monitor 1h</button>
            <button className="btn"><Icon name="back" size={13}/>Rollback stripe-gateway</button>
          </div>
        </div>
      )}

      {/* Follow-up suggestions */}
      {phase === "done" && (
        <div className="row" style={{ flexWrap: "wrap", gap: 6 }}>
          <span style={{ fontSize: 11, color: "var(--fg-mute)" }}>FOLLOW UP</span>
          {[
            "What's in stripe-gateway@a4f12c1?",
            "Compare to same time last week",
            "Build a dashboard from these signals",
            "Who else was paged?",
          ].map(qq => (
            <button key={qq} onClick={() => start(qq)} className="row"
              style={{
                padding: "4px 10px",
                background: "var(--bg-card)",
                border: "1px solid var(--line)",
                color: "var(--fg-2)",
                borderRadius: 999, fontSize: 11.5, cursor: "pointer",
              }}>{qq}</button>
          ))}
        </div>
      )}

      {/* Two-col: stats + recent sessions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 8 }}>
        <div className="card card-pad-lg">
          <div className="card-title">Today on Bits</div>
          <div className="card-sub" style={{ marginTop: 2, marginBottom: 14 }}>Org-wide usage of the Bits assistant</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            <div>
              <div className="stat-label">Sessions</div>
              <div className="row" style={{ alignItems: "baseline", gap: 4, marginTop: 4 }}>
                <span className="stat-value" style={{ fontSize: 22 }}>184</span>
                <span className="delta up">+24</span>
              </div>
            </div>
            <div>
              <div className="stat-label">Tools called</div>
              <div className="row" style={{ alignItems: "baseline", gap: 4, marginTop: 4 }}>
                <span className="stat-value" style={{ fontSize: 22 }}>1.4k</span>
                <span className="delta up">+18%</span>
              </div>
            </div>
            <div>
              <div className="stat-label">Median answer</div>
              <div className="row" style={{ alignItems: "baseline", gap: 4, marginTop: 4 }}>
                <span className="stat-value" style={{ fontSize: 22 }}>1.6</span>
                <span className="stat-unit">s</span>
              </div>
            </div>
            <div>
              <div className="stat-label">Actions taken</div>
              <div className="row" style={{ alignItems: "baseline", gap: 4, marginTop: 4 }}>
                <span className="stat-value" style={{ fontSize: 22 }}>28</span>
                <span className="delta warn">3 reverted</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div className="row" style={{ padding: "12px 18px", borderBottom: "1px solid var(--line-2)" }}>
            <div>
              <div className="card-title">Recent sessions</div>
              <div className="card-sub" style={{ marginTop: 2 }}>Shared across your team</div>
            </div>
            <span className="spacer"/>
            <button className="btn btn-ghost" style={{ height: 24, fontSize: 11.5 }}>All<Icon name="chevron-right" size={12}/></button>
          </div>
          <div>
            {BITS_HISTORY.map((h, i) => (
              <div key={i} className="row" style={{
                padding: "10px 18px",
                borderBottom: i < BITS_HISTORY.length - 1 ? "1px solid var(--line-2)" : 0,
                gap: 12, cursor: "pointer",
              }}>
                <Icon name="sparkle" size={12} className="muted"/>
                <span style={{ flex: 1, fontSize: 13, color: "var(--fg-0)" }}>{h.q}</span>
                <span className="mono" style={{ fontSize: 11, color: "var(--fg-mute)" }}>{h.sources} sources</span>
                <span className="mono" style={{ fontSize: 11, color: "var(--fg-mute)" }}>{h.when}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { BitsScreen });
