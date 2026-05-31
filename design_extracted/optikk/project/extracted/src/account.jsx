/* global React, Icon, AreaSpark, MiniSpark, Bars, PageHeader, Tabs, seededWave */
const { useState: useStateAcc, useMemo: useMemoAcc } = React;

/* =========================================================
   ACCOUNT — profile · usage · API keys · sessions · prefs
   ========================================================= */

const ACCT = {
  name: "Jay Vasquez",
  handle: "jay.vasquez",
  email: "jay.vasquez@my-organization.com",
  initials: "JV",
  title: "Site Reliability Engineer",
  team: "Platform / SRE",
  role: "Admin",
  org: "My-Organization",
  joined: "Aug 14, 2023",
  manager: "Priya Anand",
  phone: "+1 415 555 0142",
  timezone: "America/Los_Angeles",
  locale: "en-US",
  workspace: "My-Organization / Platform",
  mfa: "Authenticator app",
  sso: "Okta SAML · my-organization.okta.com",
  lastLogin: "Today, 09:14 PT · 73.45.···.18 · San Francisco, CA",
};

/* ---------- USAGE ----------
   "Usage type" reflects each ingest product the platform meters.
   Numbers are illustrative and intentionally consistent inside the prototype. */
const USAGE_TYPES = [
  {
    id: "hosts", label: "Infrastructure Hosts", unit: "hosts",
    icon: "infra", color: "var(--chart-1)", soft: "var(--chart-1-soft)",
    used: 184, included: 200, projected: 198, price: "$15 / host / mo",
    note: "Avg over last 30d · billed by hourly peak",
    seed: 11,
  },
  {
    id: "containers", label: "Containers", unit: "containers",
    icon: "service", color: "var(--accent-violet)", soft: "var(--accent-violet-soft)",
    used: 4180, included: 5000, projected: 4860, price: "$0.002 / container / hr",
    note: "Includes Kubernetes pods and ECS tasks",
    seed: 12,
  },
  {
    id: "logs", label: "Log Ingest", unit: "GB",
    icon: "logs", color: "var(--chart-4)", soft: "var(--warn-soft)",
    used: 8420, included: 10000, projected: 9740, price: "$0.10 / GB ingested",
    note: "Retention: 15d standard · 1y archive",
    seed: 13, warn: true,
  },
  {
    id: "traces", label: "APM Spans", unit: "M spans",
    icon: "trace", color: "var(--chart-3)", soft: "var(--ok-soft)",
    used: 142.6, included: 200, projected: 168, price: "$0.40 / M spans indexed",
    note: "Sampling: 8% head + tail-based errors",
    seed: 14,
  },
  {
    id: "metrics", label: "Custom Metrics", unit: "K series",
    icon: "metrics", color: "var(--chart-2)", soft: "rgba(167,139,250,0.18)",
    used: 412, included: 500, projected: 478, price: "$0.05 / 1k series",
    note: "Cardinality budget enforced per metric",
    seed: 15,
  },
  {
    id: "llm", label: "LLM Observability", unit: "M tokens",
    icon: "ai", color: "var(--chart-6)", soft: "rgba(251,146,60,0.18)",
    used: 38.4, included: 50, projected: 46.2, price: "$0.0012 / 1k tokens traced",
    note: "All providers · prompt+completion",
    seed: 16,
  },
  {
    id: "synthetics", label: "Synthetic Tests", unit: "K runs",
    icon: "zap", color: "var(--chart-5)", soft: "var(--err-soft)",
    used: 218, included: 300, projected: 268, price: "$5 / 10k runs",
    note: "Browser + API checks · 12 locations",
    seed: 17,
  },
  {
    id: "rum", label: "Real-User Sessions", unit: "K sessions",
    icon: "globe", color: "#22d3ee", soft: "rgba(34,211,238,0.18)",
    used: 624, included: 1000, projected: 884, price: "$1.50 / 1k sessions",
    note: "Web + mobile · 30d session replay",
    seed: 18,
  },
];

const API_KEYS = [
  { name: "ci-pipeline-prod",      prefix: "opk_live_8a2f", scopes: ["metrics:write", "events:write"],                    lastUsed: "23s ago",  createdBy: "Jay Vasquez",  created: "Mar 12, 2026", state: "active" },
  { name: "terraform-platform",    prefix: "opk_live_4d91", scopes: ["monitors:rw", "dashboards:rw", "infra:read"],       lastUsed: "8m ago",   createdBy: "Priya Anand",  created: "Jan 04, 2026", state: "active" },
  { name: "datalake-export",       prefix: "opk_live_e07c", scopes: ["logs:read", "metrics:read"],                        lastUsed: "1h ago",   createdBy: "Jay Vasquez",  created: "Nov 21, 2025", state: "active" },
  { name: "intern-laptop",         prefix: "opk_live_2b14", scopes: ["logs:read"],                                        lastUsed: "11d ago",  createdBy: "Jay Vasquez",  created: "May 02, 2026", state: "warn" },
  { name: "legacy-pagerduty",      prefix: "opk_live_77ae", scopes: ["events:write"],                                     lastUsed: "—",        createdBy: "Sam Okafor",   created: "Jul 18, 2024", state: "stale" },
  { name: "rotated-2024-q4",       prefix: "opk_live_91ff", scopes: ["—"],                                                lastUsed: "—",        createdBy: "Priya Anand",  created: "Oct 10, 2024", state: "revoked" },
];

const SESSIONS = [
  { device: "Chrome 137 · macOS 15.5",      where: "San Francisco, CA",  ip: "73.45.···.18",  last: "Active now",     current: true,  icon: "service" },
  { device: "Optikk CLI · v3.42",           where: "ci-runner-04 / us-east-1", ip: "10.4.···.12",  last: "14 min ago", current: false, icon: "code" },
  { device: "Optikk iOS · v1.8.2",          where: "Oakland, CA",        ip: "100.64.···.7", last: "2h ago",         current: false, icon: "user" },
  { device: "Firefox 128 · Linux",          where: "London, UK",         ip: "82.12.···.40",  last: "Yesterday, 22:08", current: false, icon: "globe" },
  { device: "Safari 17 · iPadOS 17",        where: "San Francisco, CA",  ip: "73.45.···.18",  last: "3 days ago",     current: false, icon: "service" },
];

const NOTIF_EVENTS = [
  { id: "monitor_alert", label: "Monitor triggered", desc: "Any monitor crosses into ALERT state",          email: true,  slack: true,  pd: true,  app: true  },
  { id: "monitor_warn",  label: "Monitor warning",   desc: "A monitor enters WARN, including auto-resolves", email: true,  slack: true,  pd: false, app: true  },
  { id: "monitor_recovery", label: "Monitor recovered", desc: "A previously alerting monitor returns to OK", email: false, slack: true,  pd: false, app: true  },
  { id: "incident_assigned", label: "Incident assigned to me", desc: "You are paged or owner of an incident", email: true,  slack: true,  pd: true,  app: true  },
  { id: "deploy_marker", label: "Deploy markers",    desc: "New deploys in services you watch",              email: false, slack: false, pd: false, app: true  },
  { id: "usage_thresh",  label: "Usage threshold",   desc: "A usage type crosses 80% / 100% of monthly cap", email: true,  slack: true,  pd: false, app: true  },
  { id: "billing",       label: "Billing & invoices", desc: "Statements, plan changes, payment receipts",    email: true,  slack: false, pd: false, app: false },
  { id: "security",      label: "Security activity", desc: "New session, API key created, MFA changes",      email: true,  slack: false, pd: false, app: true  },
  { id: "digest",        label: "Weekly platform digest", desc: "Mondays · usage trends + top noisy monitors", email: true, slack: false, pd: false, app: false },
];

/* =================================================================
   USAGE WIDGETS
   ================================================================= */
function pctOf(used, included) {
  return Math.max(0, Math.min(120, (used / included) * 100));
}

function UsageBar({ pct, color, projectedPct }) {
  const over = pct > 100;
  return (
    <div style={{ position: "relative", height: 8, background: "var(--bg-inset)", borderRadius: 4, overflow: "visible" }}>
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0,
        width: Math.min(pct, 100) + "%",
        background: over ? "var(--err)" : color,
        borderRadius: 4,
      }}/>
      {projectedPct != null && projectedPct > pct && (
        <div style={{
          position: "absolute", left: Math.min(pct, 100) + "%", top: 0, bottom: 0,
          width: Math.min(Math.max(projectedPct - pct, 0), 100 - Math.min(pct, 100)) + "%",
          background: `repeating-linear-gradient(45deg, ${color}55 0 4px, transparent 4px 8px)`,
          borderRadius: "0 4px 4px 0",
        }}/>
      )}
      {projectedPct != null && (
        <div style={{
          position: "absolute", left: `calc(${Math.min(projectedPct, 100)}% - 1px)`, top: -2, bottom: -2,
          width: 2, background: "var(--fg-2)", opacity: 0.55, borderRadius: 1,
        }}/>
      )}
    </div>
  );
}

function UsageCard({ u }) {
  const pct = pctOf(u.used, u.included);
  const projPct = pctOf(u.projected, u.included);
  const fmt = (v) => (typeof v === "number" && v % 1 !== 0) ? v.toFixed(1) : v.toLocaleString();
  const isOver = u.projected > u.included;
  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: 12, padding: "16px 18px" }}>
      <div className="row">
        <div style={{
          width: 30, height: 30, borderRadius: 6,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          background: u.soft, color: u.color,
        }}>
          <Icon name={u.icon} size={16}/>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg-0)" }}>{u.label}</div>
          <div className="muted" style={{ fontSize: 11 }}>{u.note}</div>
        </div>
        <div className="spacer"/>
        {u.warn || isOver ? (
          <span className={"badge " + (isOver ? "err" : "warn")} style={{ height: 18 }}>
            <span className="b-dot"/>{isOver ? "Over plan" : "Track"}
          </span>
        ) : (
          <span className="badge ok" style={{ height: 18 }}><span className="b-dot"/>Healthy</span>
        )}
      </div>

      <div className="row" style={{ alignItems: "flex-end", gap: 6 }}>
        <span style={{ fontSize: 24, fontWeight: 700, color: "var(--fg-0)", letterSpacing: "-0.02em" }}>{fmt(u.used)}</span>
        <span className="muted" style={{ fontSize: 12, marginBottom: 3 }}>/ {fmt(u.included)} {u.unit}</span>
        <div className="spacer"/>
        <span className="mono" style={{ fontSize: 11.5, color: "var(--fg-2)" }}>{pct.toFixed(0)}%</span>
      </div>

      <UsageBar pct={pct} color={u.color} projectedPct={projPct}/>

      <div className="row" style={{ fontSize: 11, color: "var(--fg-3)" }}>
        <span>Projected end of month: <span className="mono" style={{ color: isOver ? "var(--err-fg)" : "var(--fg-1)", fontWeight: 600 }}>{fmt(u.projected)}</span></span>
        <div className="spacer"/>
        <span className="mono">{u.price}</span>
      </div>

      <AreaSpark seed={u.seed} color={u.color} soft={u.soft} height={42} n={30} base={0.45} amp={0.2}/>
    </div>
  );
}

/* Stacked daily bars — last 14 days, normalized to 0–1, deterministic per usage id */
function UsageStack({ types }) {
  const W = 800, H = 180, N = 14, padL = 30, padR = 8, padT = 12, padB = 26;
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const bw = innerW / N - 6;
  const cols = types.map(t => ({ t, data: seededWave(t.seed, N, 0.6, 0.18, 0.6) }));
  // Per-day total → height
  const totals = Array.from({ length: N }, (_, i) =>
    cols.reduce((acc, c) => acc + c.data[i] * (c.t.used / c.t.included), 0)
  );
  const maxTotal = Math.max(...totals, 0.01);

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      {/* horizontal grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((g, i) => (
        <g key={i}>
          <line x1={padL} x2={W-padR} y1={padT + (1-g)*innerH} y2={padT + (1-g)*innerH} stroke="var(--line-2)" strokeWidth="1" strokeDasharray={g === 1 ? "" : "3 3"}/>
          <text x={padL - 6} y={padT + (1-g)*innerH + 3} textAnchor="end" fontSize="9" fill="var(--fg-mute)">{Math.round(g * 100)}%</text>
        </g>
      ))}
      {/* bars */}
      {Array.from({ length: N }).map((_, i) => {
        let y = padT + innerH;
        const x = padL + i * (innerW / N) + 3;
        return (
          <g key={i}>
            {cols.map((c, j) => {
              const h = (c.data[i] * (c.t.used / c.t.included) / maxTotal) * innerH;
              y -= h;
              return <rect key={j} x={x} y={y} width={bw} height={Math.max(h, 0.5)} fill={c.t.color} opacity="0.9"/>;
            })}
            <text x={x + bw/2} y={H - 10} textAnchor="middle" fontSize="9" fill="var(--fg-mute)">
              {i === 0 ? "13d ago" : i === N-1 ? "today" : (N - 1 - i)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* =================================================================
   TAB CONTENTS
   ================================================================= */
function ProfileTab() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16 }}>
      {/* Identity card */}
      <div className="card" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ position: "relative", width: 88, height: 88, alignSelf: "center" }}>
          <div style={{
            width: 88, height: 88, borderRadius: "50%",
            background: "linear-gradient(135deg,#6366f1,#3b82f6)",
            color: "white", fontWeight: 700, fontSize: 30,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{ACCT.initials}</div>
          <button className="btn btn-icon" style={{ position: "absolute", right: -2, bottom: -2, height: 28, width: 28, borderRadius: "50%", background: "var(--bg-card)" }} title="Upload avatar">
            <Icon name="plus" size={13}/>
          </button>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--fg-0)" }}>{ACCT.name}</div>
          <div className="muted mono" style={{ fontSize: 12, marginTop: 2 }}>@{ACCT.handle}</div>
        </div>

        <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
          <span className="badge info"><span className="b-dot"/>{ACCT.role}</span>
          <span className="badge neutral">{ACCT.team}</span>
        </div>

        <div style={{ height: 1, background: "var(--line-2)" }}/>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12.5 }}>
          {[
            ["Org",        ACCT.org],
            ["Manager",    ACCT.manager],
            ["Joined",     ACCT.joined],
            ["Last login", ACCT.lastLogin],
            ["MFA",        ACCT.mfa],
            ["SSO",        ACCT.sso],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "grid", gridTemplateColumns: "84px 1fr", gap: 8 }}>
              <span className="muted" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>{k}</span>
              <span style={{ color: "var(--fg-1)", fontSize: 12 }}>{v}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn" style={{ flex: 1 }}><Icon name="shield" size={13}/>Security</button>
          <button className="btn" style={{ flex: 1 }}><Icon name="export" size={13}/>Export data</button>
        </div>
      </div>

      {/* Edit form */}
      <div className="card" style={{ padding: 22 }}>
        <div className="row" style={{ marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--fg-0)" }}>Profile details</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>Visible to other members of {ACCT.org}.</div>
          </div>
          <div className="spacer"/>
          <button className="btn btn-ghost">Cancel</button>
          <button className="btn btn-primary"><Icon name="check" size={13}/>Save changes</button>
        </div>

        <Field label="Full name"     value={ACCT.name}/>
        <FieldRow>
          <Field label="Display handle" value={"@" + ACCT.handle} hint="Used in @mentions, comments and audit logs."/>
          <Field label="Work email" value={ACCT.email} hint="Verified via Okta SSO — managed by your org."/>
        </FieldRow>
        <FieldRow>
          <Field label="Job title" value={ACCT.title}/>
          <Field label="Team" value={ACCT.team}/>
        </FieldRow>
        <FieldRow>
          <Field label="Phone (paging)" value={ACCT.phone} hint="Used for on-call SMS only. Never marketing."/>
          <Field label="Default workspace" value={ACCT.workspace}/>
        </FieldRow>
        <FieldRow>
          <Field label="Timezone" value={ACCT.timezone} kind="select" hint="Affects timestamps in dashboards and reports."/>
          <Field label="Locale" value={ACCT.locale} kind="select"/>
        </FieldRow>

        <Field label="Bio"       multiline
          value={`SRE at My-Organization. Working on the platform team. Owns the checkout, payments and notifications services. Pages well-loved by PagerDuty.`}
          hint="Markdown supported. 240 chars max."
        />

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, padding: "12px 14px", border: "1px dashed var(--line)", borderRadius: 8 }}>
          <Icon name="shield" size={16} className="muted"/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--fg-0)" }}>This profile is partially managed by SSO</div>
            <div className="muted" style={{ fontSize: 11.5 }}>Name, email and job title are synced from Okta on each login. Local edits will be overwritten.</div>
          </div>
          <button className="btn btn-ghost" style={{ fontSize: 11.5 }}>Learn more <Icon name="link-ext" size={11}/></button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, hint, kind, multiline }) {
  return (
    <div style={{ flex: 1, marginBottom: 16 }}>
      <div className="label-up" style={{ marginBottom: 6 }}>{label}</div>
      {multiline ? (
        <textarea
          defaultValue={value}
          rows={3}
          style={{
            width: "100%", padding: "10px 12px",
            background: "var(--bg-card)", border: "1px solid var(--line)",
            borderRadius: 6, color: "var(--fg-0)", fontSize: 13,
            fontFamily: "inherit", resize: "vertical", outline: "none",
          }}
        />
      ) : kind === "select" ? (
        <div className="row" style={{
          padding: "0 12px", height: 34, border: "1px solid var(--line)", borderRadius: 6,
          background: "var(--bg-card)",
        }}>
          <span style={{ flex: 1, fontSize: 13, color: "var(--fg-0)" }}>{value}</span>
          <Icon name="chevron-down" size={13} className="muted"/>
        </div>
      ) : (
        <input
          defaultValue={value}
          style={{
            width: "100%", padding: "0 12px", height: 34,
            background: "var(--bg-card)", border: "1px solid var(--line)",
            borderRadius: 6, color: "var(--fg-0)", fontSize: 13, outline: "none",
          }}
        />
      )}
      {hint && <div className="muted" style={{ fontSize: 11, marginTop: 5 }}>{hint}</div>}
    </div>
  );
}
function FieldRow({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>{children}</div>;
}

/* ---------- USAGE TAB ---------- */
function UsageTab() {
  const totalUsed     = USAGE_TYPES.filter(u => u.warn || u.projected > u.included).length;
  const trackingCount = USAGE_TYPES.filter(u => u.projected / u.included > 0.85).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Plan summary strip */}
      <div className="card" style={{ padding: 0, display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1fr", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderRight: "1px solid var(--line-2)" }}>
          <div className="label-up">Plan</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: "var(--fg-0)" }}>Pro · Annual</span>
            <span className="badge info" style={{ height: 18 }}><span className="b-dot"/>Auto-renew</span>
          </div>
          <div className="muted" style={{ fontSize: 11.5, marginTop: 4 }}>Renews Aug 14, 2026 · Owner: Priya Anand</div>
        </div>
        <SummaryCell label="Month-to-date" value="$38,420" hint="Billing day 1–26 of 31"/>
        <SummaryCell label="Projected month" value="$46,180" hint="At current ingest rate" tone="warn"/>
        <SummaryCell label="Tracking ≥85%" value={trackingCount + " / " + USAGE_TYPES.length} hint="Usage types near cap" tone={trackingCount ? "warn" : "ok"}/>
        <SummaryCell label="Over plan" value={totalUsed} hint="Will overage this month" tone={totalUsed ? "err" : "ok"}/>
      </div>

      {/* Controls */}
      <div className="row">
        <div className="seg">
          <div className="seg-opt active">Usage types</div>
          <div className="seg-opt">Cost by team</div>
          <div className="seg-opt">Cost by service</div>
          <div className="seg-opt">Forecasts</div>
        </div>
        <div className="spacer"/>
        <div className="seg">
          <div className="seg-opt">7d</div>
          <div className="seg-opt active">30d</div>
          <div className="seg-opt">90d</div>
          <div className="seg-opt">MTD</div>
        </div>
        <button className="btn"><Icon name="export" size={13}/>Export CSV</button>
      </div>

      {/* Usage cards grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {USAGE_TYPES.map(u => <UsageCard key={u.id} u={u}/>)}
      </div>

      {/* Stacked daily chart + legend */}
      <div className="card" style={{ padding: 18 }}>
        <div className="row" style={{ marginBottom: 12 }}>
          <div>
            <div className="card-title">Ingest mix · last 14 days</div>
            <div className="card-sub">Each bar normalized as % of plan; height shows total platform load.</div>
          </div>
          <div className="spacer"/>
          <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
            {USAGE_TYPES.map(u => (
              <span key={u.id} className="row" style={{ gap: 5, fontSize: 11, color: "var(--fg-2)" }}>
                <span style={{ width: 9, height: 9, borderRadius: 2, background: u.color }}/>
                {u.label}
              </span>
            ))}
          </div>
        </div>
        <UsageStack types={USAGE_TYPES}/>
      </div>

      {/* Daily ingest table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="row" style={{ padding: "14px 18px", borderBottom: "1px solid var(--line-2)" }}>
          <div className="card-title">Top spenders · last 7 days</div>
          <div className="spacer"/>
          <span className="muted" style={{ fontSize: 11 }}>Tagged by <span className="mono">team</span> + <span className="mono">env</span></span>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Team / Service</th>
              <th>Hosts</th>
              <th>Containers</th>
              <th>Logs (GB)</th>
              <th>Spans (M)</th>
              <th>Custom metrics</th>
              <th style={{ textAlign: "right" }}>Cost (7d)</th>
              <th style={{ width: 28 }}/>
            </tr>
          </thead>
          <tbody>
            {[
              { name: "payments / checkout-svc",  env: "prod", h: 28, c: 612,  l: 1840, s: 41.2, m: 84,  cost: "$1,820" },
              { name: "search / query-fanout",    env: "prod", h: 22, c: 480,  l: 1240, s: 28.4, m: 62,  cost: "$1,210" },
              { name: "fraud / scoring-pipeline", env: "prod", h: 14, c: 384,  l: 980,  s: 18.6, m: 48,  cost: "$844"  },
              { name: "platform / kafka",         env: "prod", h: 18, c: 124,  l: 1620, s: 4.2,  m: 38,  cost: "$724"  },
              { name: "growth / web-frontend",    env: "prod", h: 12, c: 286,  l: 612,  s: 12.4, m: 28,  cost: "$486"  },
              { name: "data / batch-etl",         env: "ops",  h: 36, c: 142,  l: 480,  s: 1.8,  m: 14,  cost: "$412"  },
            ].map((r, i) => (
              <tr key={i}>
                <td>
                  <div className="mono" style={{ fontSize: 12.5, color: "var(--fg-0)" }}>{r.name}</div>
                  <div className="muted" style={{ fontSize: 10.5 }}>env={r.env}</div>
                </td>
                <td className="mono">{r.h}</td>
                <td className="mono">{r.c.toLocaleString()}</td>
                <td className="mono">{r.l.toLocaleString()}</td>
                <td className="mono">{r.s}</td>
                <td className="mono">{r.m}</td>
                <td className="mono" style={{ textAlign: "right", color: "var(--fg-0)", fontWeight: 600 }}>{r.cost}</td>
                <td><Icon name="more" size={14} className="muted"/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function SummaryCell({ label, value, hint, tone }) {
  const toneFg = tone === "err" ? "var(--err-fg)" : tone === "warn" ? "var(--warn-fg)" : tone === "ok" ? "var(--ok)" : "var(--fg-0)";
  return (
    <div style={{ padding: "16px 20px", borderRight: "1px solid var(--line-2)" }}>
      <div className="label-up">{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: toneFg, marginTop: 4, letterSpacing: "-0.01em" }}>{value}</div>
      <div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>{hint}</div>
    </div>
  );
}

/* ---------- API KEYS TAB ---------- */
function ApiKeysTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
        <Icon name="key" size={18} className="muted"/>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg-0)" }}>Personal API keys</div>
          <div className="muted" style={{ fontSize: 11.5 }}>Keys are scoped to your user and inherit your permissions. Use service accounts for shared automation.</div>
        </div>
        <button className="btn"><Icon name="link-ext" size={12}/>Service accounts</button>
        <button className="btn btn-primary"><Icon name="plus" size={13}/>New key</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 28 }}/>
              <th>Name</th>
              <th>Prefix</th>
              <th>Scopes</th>
              <th>Last used</th>
              <th>Created</th>
              <th>State</th>
              <th style={{ width: 80 }}/>
            </tr>
          </thead>
          <tbody>
            {API_KEYS.map((k, i) => {
              const stateBadge = (
                k.state === "active"  ? <span className="badge ok"><span className="b-dot"/>Active</span>
                : k.state === "warn"  ? <span className="badge warn"><span className="b-dot"/>Idle 11d</span>
                : k.state === "stale" ? <span className="badge neutral"><span className="b-dot" style={{ background: "var(--fg-mute)" }}/>Stale</span>
                                       : <span className="badge err"><span className="b-dot"/>Revoked</span>
              );
              return (
                <tr key={i} style={{ opacity: k.state === "revoked" ? 0.55 : 1 }}>
                  <td><Icon name="key" size={14} className="muted"/></td>
                  <td>
                    <div style={{ color: "var(--fg-0)", fontWeight: 600, fontSize: 13 }}>{k.name}</div>
                    <div className="muted" style={{ fontSize: 10.5 }}>by {k.createdBy}</div>
                  </td>
                  <td className="mono" style={{ color: "var(--fg-2)" }}>{k.prefix}<span className="muted">····</span></td>
                  <td>
                    <div className="row" style={{ flexWrap: "wrap", gap: 4 }}>
                      {k.scopes.map((s, j) => (
                        <span key={j} className="mono" style={{
                          fontSize: 10.5, padding: "2px 7px", borderRadius: 4,
                          background: "var(--bg-inset)", color: "var(--fg-2)",
                          border: "1px solid var(--line-2)",
                        }}>{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="mono" style={{ fontSize: 12 }}>{k.lastUsed}</td>
                  <td className="mono" style={{ fontSize: 12 }}>{k.created}</td>
                  <td>{stateBadge}</td>
                  <td>
                    <div className="row" style={{ gap: 4, justifyContent: "flex-end" }}>
                      <button className="btn btn-ghost btn-icon" title="Rotate"><Icon name="refresh" size={13}/></button>
                      <button className="btn btn-ghost btn-icon" title="Revoke"><Icon name="x" size={13}/></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, background: "var(--bg-inset)" }}>
        <Icon name="alert" size={14} style={{ color: "var(--warn)" }}/>
        <div style={{ flex: 1, fontSize: 12, color: "var(--fg-1)" }}>
          One key has been idle for more than 7 days. Rotate or revoke unused keys to keep your blast radius small.
        </div>
        <button className="btn btn-ghost" style={{ fontSize: 11.5 }}>Audit keys</button>
      </div>
    </div>
  );
}

/* ---------- SESSIONS TAB ---------- */
function SessionsTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="row" style={{ gap: 10 }}>
        <div className="card" style={{ flex: 1, padding: "14px 18px" }}>
          <div className="label-up">Active sessions</div>
          <div className="stat-value" style={{ fontSize: 26 }}>{SESSIONS.length}</div>
          <div className="muted" style={{ fontSize: 11 }}>Across 4 devices · 3 locations</div>
        </div>
        <div className="card" style={{ flex: 1, padding: "14px 18px" }}>
          <div className="label-up">Session lifetime</div>
          <div className="stat-value" style={{ fontSize: 26 }}>24h</div>
          <div className="muted" style={{ fontSize: 11 }}>Idle timeout 4h · SSO enforced</div>
        </div>
        <div className="card" style={{ flex: 1, padding: "14px 18px" }}>
          <div className="label-up">MFA</div>
          <div className="stat-value" style={{ fontSize: 26 }}>Authenticator</div>
          <div className="muted" style={{ fontSize: 11 }}>2 backup codes remaining</div>
        </div>
        <div className="card" style={{ flex: 1, padding: "14px 18px" }}>
          <div className="label-up">Suspicious activity</div>
          <div className="stat-value" style={{ fontSize: 26, color: "var(--ok)" }}>None</div>
          <div className="muted" style={{ fontSize: 11 }}>Last 30 days</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="row" style={{ padding: "14px 18px", borderBottom: "1px solid var(--line-2)" }}>
          <div className="card-title">Devices &amp; sessions</div>
          <div className="spacer"/>
          <button className="btn"><Icon name="x" size={13}/>Sign out everywhere else</button>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 28 }}/>
              <th>Device</th>
              <th>Location</th>
              <th>IP</th>
              <th>Last activity</th>
              <th style={{ width: 110 }}/>
            </tr>
          </thead>
          <tbody>
            {SESSIONS.map((s, i) => (
              <tr key={i}>
                <td><Icon name={s.icon} size={14} className="muted"/></td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "var(--fg-0)", fontWeight: 600, fontSize: 13 }}>{s.device}</span>
                    {s.current && <span className="badge ok" style={{ height: 16, padding: "0 6px", fontSize: 10 }}>This device</span>}
                  </div>
                </td>
                <td>{s.where}</td>
                <td className="mono" style={{ fontSize: 12 }}>{s.ip}</td>
                <td className="mono" style={{ fontSize: 12 }}>{s.last}</td>
                <td>
                  <div className="row" style={{ justifyContent: "flex-end" }}>
                    {!s.current && (
                      <button className="btn btn-ghost" style={{ fontSize: 11.5, color: "var(--err-fg)" }}>
                        <Icon name="x" size={12}/>Revoke
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ padding: 18 }}>
        <div className="row" style={{ marginBottom: 10 }}>
          <div className="card-title">Recent security events</div>
          <div className="spacer"/>
          <button className="btn btn-ghost" style={{ fontSize: 11.5 }}>View audit log <Icon name="link-ext" size={11}/></button>
        </div>
        {[
          { t: "Today, 09:14 PT", kind: "ok",   text: "Sign-in via Okta SSO · Chrome 137 / macOS 15.5 · San Francisco, CA" },
          { t: "Today, 02:18 PT", kind: "info", text: "New API key created: ci-pipeline-prod · scopes metrics:write, events:write" },
          { t: "Yesterday",       kind: "info", text: "Authenticator backup codes regenerated (2 remaining)" },
          { t: "May 24",          kind: "warn", text: "Sign-in from new device · Firefox 128 / London, UK — confirmed" },
          { t: "May 21",          kind: "info", text: "Password manager auto-fill detected · no anomalies" },
        ].map((e, i) => (
          <div key={i} className="row" style={{ padding: "10px 0", borderBottom: i < 4 ? "1px solid var(--line-2)" : 0, gap: 12 }}>
            <span style={{
              width: 24, height: 24, borderRadius: 6,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              background: e.kind === "warn" ? "var(--warn-soft)" : e.kind === "ok" ? "var(--ok-soft)" : "var(--brand-soft)",
              color: e.kind === "warn" ? "var(--warn-fg)" : e.kind === "ok" ? "var(--ok)" : "var(--brand-deep)",
            }}>
              <Icon name={e.kind === "warn" ? "alert" : e.kind === "ok" ? "check" : "shield"} size={12}/>
            </span>
            <span className="mono muted" style={{ fontSize: 11, width: 120 }}>{e.t}</span>
            <span style={{ fontSize: 12.5, color: "var(--fg-1)", flex: 1 }}>{e.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- NOTIFICATIONS TAB ---------- */
function NotificationsTab() {
  const [rows, setRows] = useStateAcc(NOTIF_EVENTS);
  const toggle = (id, ch) => setRows(rs => rs.map(r => r.id === id ? { ...r, [ch]: !r[ch] } : r));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="card" style={{ padding: 18 }}>
        <div className="row" style={{ marginBottom: 14 }}>
          <div>
            <div className="card-title">Connected channels</div>
            <div className="card-sub">Where Optikk reaches you. Per-event routing below.</div>
          </div>
          <div className="spacer"/>
          <button className="btn"><Icon name="plus" size={13}/>Add channel</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          <ChannelCard icon="user"  title="Email"     val={ACCT.email} sub="Verified · default" state="ok"/>
          <ChannelCard icon="plug"  title="Slack"     val="my-organization · #sre-alerts" sub="Connected via OAuth" state="ok"/>
          <ChannelCard icon="bell"  title="PagerDuty" val="On-call: platform-primary" sub="Routes incidents only" state="ok"/>
          <ChannelCard icon="user"  title="Mobile push" val="Optikk iOS · v1.8.2" sub="Quiet hours 22:00 – 07:00 PT" state="warn"/>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="row" style={{ padding: "14px 18px", borderBottom: "1px solid var(--line-2)" }}>
          <div className="card-title">Event routing</div>
          <div className="spacer"/>
          <div className="seg">
            <div className="seg-opt active">All</div>
            <div className="seg-opt">Monitoring</div>
            <div className="seg-opt">Account</div>
          </div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Event</th>
              <th style={{ width: 90, textAlign: "center" }}>Email</th>
              <th style={{ width: 90, textAlign: "center" }}>Slack</th>
              <th style={{ width: 90, textAlign: "center" }}>PagerDuty</th>
              <th style={{ width: 90, textAlign: "center" }}>In-app</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>
                  <div style={{ fontWeight: 600, color: "var(--fg-0)", fontSize: 13 }}>{r.label}</div>
                  <div className="muted" style={{ fontSize: 11 }}>{r.desc}</div>
                </td>
                {["email", "slack", "pd", "app"].map(ch => (
                  <td key={ch} style={{ textAlign: "center" }}>
                    <Toggle on={r[ch]} onToggle={() => toggle(r.id, ch)}/>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ChannelCard({ icon, title, val, sub, state }) {
  const tint = state === "warn" ? "var(--warn-soft)" : state === "err" ? "var(--err-soft)" : "var(--ok-soft)";
  const fg   = state === "warn" ? "var(--warn-fg)"   : state === "err" ? "var(--err-fg)"   : "var(--ok)";
  return (
    <div style={{ border: "1px solid var(--line-2)", borderRadius: 8, padding: 14, background: "var(--bg-card)" }}>
      <div className="row" style={{ marginBottom: 8 }}>
        <span style={{ width: 26, height: 26, borderRadius: 6, background: "var(--bg-inset)", color: "var(--fg-2)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name={icon} size={14}/>
        </span>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--fg-0)" }}>{title}</span>
        <div className="spacer"/>
        <span style={{ width: 8, height: 8, borderRadius: 4, background: fg }}/>
      </div>
      <div style={{ fontSize: 12.5, color: "var(--fg-0)", fontWeight: 500 }}>{val}</div>
      <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function Toggle({ on, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: 32, height: 18, borderRadius: 10,
        background: on ? "var(--brand)" : "var(--bg-inset)",
        border: "1px solid " + (on ? "var(--brand)" : "var(--line)"),
        position: "relative", display: "inline-block",
        cursor: "pointer", transition: "background 120ms",
      }}
    >
      <span style={{
        position: "absolute", top: 1, left: on ? 15 : 1,
        width: 14, height: 14, borderRadius: 7,
        background: "white", transition: "left 120ms",
        boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
      }}/>
    </button>
  );
}

/* ---------- PREFERENCES TAB ---------- */
function PreferencesTab() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <div className="card" style={{ padding: 18 }}>
        <div className="card-title">Appearance</div>
        <div className="card-sub" style={{ marginBottom: 14 }}>Synced across devices via your Optikk account.</div>
        <PrefRow label="Theme" hint="Use the Tweaks panel to live-preview themes.">
          <div className="seg">
            <div className="seg-opt">Light</div>
            <div className="seg-opt active">Dark</div>
            <div className="seg-opt">System</div>
          </div>
        </PrefRow>
        <PrefRow label="Density" hint="Comfortable matches the rest of Optikk; Compact trims row paddings.">
          <div className="seg">
            <div className="seg-opt active">Comfortable</div>
            <div className="seg-opt">Compact</div>
          </div>
        </PrefRow>
        <PrefRow label="Reduced motion">
          <Toggle on={false}/>
        </PrefRow>
        <PrefRow label="Color-blind safe palette" hint="Replaces red/green status pairs with red/blue.">
          <Toggle on={true}/>
        </PrefRow>
      </div>

      <div className="card" style={{ padding: 18 }}>
        <div className="card-title">Time &amp; locale</div>
        <div className="card-sub" style={{ marginBottom: 14 }}>How timestamps appear across dashboards, logs and reports.</div>
        <PrefRow label="Time format">
          <div className="seg">
            <div className="seg-opt active">12h · 1:48 PM</div>
            <div className="seg-opt">24h · 13:48</div>
          </div>
        </PrefRow>
        <PrefRow label="Timezone" hint="Affects axis labels and reports. Override per-dashboard remains.">
          <SelectLike value={ACCT.timezone}/>
        </PrefRow>
        <PrefRow label="Week starts on">
          <div className="seg">
            <div className="seg-opt">Sun</div>
            <div className="seg-opt active">Mon</div>
          </div>
        </PrefRow>
        <PrefRow label="Number format">
          <SelectLike value="1,234.5 (en-US)"/>
        </PrefRow>
      </div>

      <div className="card" style={{ padding: 18 }}>
        <div className="card-title">Defaults</div>
        <div className="card-sub" style={{ marginBottom: 14 }}>Applied on every login.</div>
        <PrefRow label="Landing page">
          <SelectLike value="Overview"/>
        </PrefRow>
        <PrefRow label="Default time range">
          <SelectLike value="Last 1 hour"/>
        </PrefRow>
        <PrefRow label="Default workspace">
          <SelectLike value={ACCT.workspace}/>
        </PrefRow>
        <PrefRow label="Auto-refresh">
          <div className="seg">
            <div className="seg-opt">Off</div>
            <div className="seg-opt active">5s</div>
            <div className="seg-opt">30s</div>
            <div className="seg-opt">1m</div>
          </div>
        </PrefRow>
      </div>

      <div className="card" style={{ padding: 18 }}>
        <div className="card-title">Editor &amp; query</div>
        <div className="card-sub" style={{ marginBottom: 14 }}>Logs, traces, metrics query bars.</div>
        <PrefRow label="Query editor">
          <div className="seg">
            <div className="seg-opt active">Visual builder</div>
            <div className="seg-opt">Raw OPL</div>
          </div>
        </PrefRow>
        <PrefRow label="Show suggestions while typing">
          <Toggle on={true}/>
        </PrefRow>
        <PrefRow label="Recent queries history">
          <SelectLike value="Last 50 per workspace"/>
        </PrefRow>
        <PrefRow label="Bits AI suggestions" hint="Inline AI suggestions inside the query bar.">
          <Toggle on={true}/>
        </PrefRow>
      </div>

      <div className="card" style={{ padding: 18, gridColumn: "span 2" }}>
        <div className="row">
          <div>
            <div className="card-title" style={{ color: "var(--err-fg)" }}>Danger zone</div>
            <div className="card-sub">Irreversible account actions.</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 14 }}>
          {[
            { t: "Export account data", d: "Profile, preferences, audit history. Delivered as a zip via email." , b: "Request export" },
            { t: "Leave organization",  d: "Removes your access to My-Organization. Admins must reinvite.",     b: "Leave org" },
            { t: "Delete account",      d: "Permanently deletes your user. Workspaces and dashboards remain.",  b: "Delete account", danger: true },
          ].map((x, i) => (
            <div key={i} style={{ border: "1px solid var(--line-2)", borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--fg-0)" }}>{x.t}</div>
              <div className="muted" style={{ fontSize: 11.5, marginTop: 4, marginBottom: 10 }}>{x.d}</div>
              <button className="btn" style={{
                borderColor: x.danger ? "var(--err)" : undefined,
                color: x.danger ? "var(--err-fg)" : undefined,
              }}>{x.b}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function PrefRow({ label, hint, children }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--line-2)", gap: 14 }}>
      <div>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--fg-0)" }}>{label}</div>
        {hint && <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}
function SelectLike({ value }) {
  return (
    <div className="row" style={{ minWidth: 220, padding: "0 10px", height: 30, border: "1px solid var(--line)", borderRadius: 6, background: "var(--bg-card)" }}>
      <span style={{ flex: 1, fontSize: 12.5, color: "var(--fg-0)" }}>{value}</span>
      <Icon name="chevron-down" size={12} className="muted"/>
    </div>
  );
}

/* =================================================================
   ACCOUNT SCREEN
   ================================================================= */
function AccountScreen({ go, params }) {
  const allowed = ["profile", "usage", "keys", "sessions", "notifications", "preferences"];
  const initial = allowed.includes(params.tab) ? params.tab : "profile";
  const [tab, setTab] = useStateAcc(initial);

  const tabs = [
    { id: "profile",       label: "Profile" },
    { id: "usage",         label: "Usage",         badge: "near cap", badgeKind: "warn" },
    { id: "keys",          label: "API keys",      badge: API_KEYS.filter(k => k.state !== "revoked").length },
    { id: "sessions",      label: "Sessions",      badge: SESSIONS.length },
    { id: "notifications", label: "Notifications" },
    { id: "preferences",   label: "Preferences" },
  ];

  return (
    <div className="page">
      <PageHeader
        icon="user"
        iconColor="var(--brand-deep)"
        iconBg="var(--brand-soft)"
        title="Account"
        subtitle={`${ACCT.name} · ${ACCT.email} · ${ACCT.org}`}
        statusBadge={<span className="badge info"><span className="b-dot"/>{ACCT.role}</span>}
        actions={
          <>
            <button className="btn"><Icon name="link-ext" size={13}/>View as teammate</button>
            <button className="btn"><Icon name="shield" size={13}/>Security center</button>
          </>
        }
      />

      <Tabs tabs={tabs} active={tab} setActive={setTab}/>

      {tab === "profile"       && <ProfileTab/>}
      {tab === "usage"         && <UsageTab/>}
      {tab === "keys"          && <ApiKeysTab/>}
      {tab === "sessions"      && <SessionsTab/>}
      {tab === "notifications" && <NotificationsTab/>}
      {tab === "preferences"   && <PreferencesTab/>}
    </div>
  );
}

window.AccountScreen = AccountScreen;
