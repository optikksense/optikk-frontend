/* global React, Icon, AreaSpark, MiniSpark, Bars, PageHeader, Tabs */
const { useState: useStateC, useMemo: useMemoC } = React;

/* =========================================================
   MONITORS — Datadog-style alert monitor list
   ========================================================= */
function MonitorsScreen({ go }) {
  const [tab, setTab] = useStateC("triggered");
  const [q, setQ] = useStateC("");

  const monitors = [
    { id: "m-4218", name: "Error rate spike · payment-svc",          type: "metric",    scope: "service:payment-svc env:prod",     status: "alert",  value: "0.42%",  threshold: ">0.05%",    last: "12m ago",   eval: "5m",  team: "payments",  muted: false, channels: ["#oncall-payments", "PagerDuty"], priority: "P1" },
    { id: "m-4217", name: "Stripe upstream timeouts",                 type: "log",       scope: "source:payment-svc",               status: "alert",  value: "184/5m", threshold: ">50/5m",    last: "8m ago",    eval: "5m",  team: "payments",  muted: false, channels: ["#oncall-payments", "PagerDuty"], priority: "P1" },
    { id: "m-4216", name: "p99 latency drift · payment.charge",       type: "apm",       scope: "service:payment-svc resource:charge",status: "alert",  value: "184ms",  threshold: ">142ms",    last: "4m ago",    eval: "5m",  team: "payments",  muted: false, channels: ["#oncall-payments"], priority: "P2" },
    { id: "m-4215", name: "Search latency regression",                 type: "apm",       scope: "service:search env:prod",          status: "alert",  value: "318ms",  threshold: ">200ms",    last: "42m ago",   eval: "10m", team: "discovery", muted: false, channels: ["#oncall-discovery", "PagerDuty"], priority: "P1" },
    { id: "m-4214", name: "Replica lag · pg-replica-3",                type: "metric",    scope: "host:pg-replica-3",                status: "warn",   value: "0.14s",  threshold: ">0.10s",    last: "18m ago",   eval: "1m",  team: "platform",  muted: false, channels: ["#oncall-platform"], priority: "P3" },
    { id: "m-4213", name: "Kafka under-replicated partitions",        type: "metric",    scope: "service:kafka",                    status: "warn",   value: "12",     threshold: ">8",        last: "32m ago",   eval: "5m",  team: "platform",  muted: false, channels: ["#oncall-platform"], priority: "P2" },
    { id: "m-4212", name: "Queue depth · checkout.events.v3",         type: "metric",    scope: "service:kafka topic:checkout.events.v3", status: "warn",   value: "184k",   threshold: ">100k",     last: "1h ago",    eval: "5m",  team: "platform",  muted: false, channels: ["#oncall-platform"], priority: "P2" },
    { id: "m-4211", name: "Pod OOMKill rate · fraud-detect",          type: "metric",    scope: "k8s_namespace:trust-prod",         status: "warn",   value: "18/hr",  threshold: ">10/hr",    last: "14h ago",   eval: "10m", team: "trust",     muted: false, channels: ["#oncall-trust"], priority: "P3" },
    { id: "m-4210", name: "Disk usage · es-cluster",                  type: "metric",    scope: "host:elasticsearch",               status: "warn",   value: "82%",    threshold: ">80%",      last: "2h ago",    eval: "5m",  team: "platform",  muted: false, channels: ["#oncall-platform"], priority: "P3" },
    { id: "m-4209", name: "Synthetic · checkout flow",                 type: "synthetic", scope: "test:checkout-e2e",                status: "ok",     value: "passing",threshold: "5xx, > 5s", last: "1m ago",    eval: "5m",  team: "payments",  muted: false, channels: ["#oncall-payments"], priority: "P2" },
    { id: "m-4207", name: "Auth service · 5xx rate",                   type: "metric",    scope: "service:user-profile",             status: "ok",     value: "0.06%",  threshold: ">0.5%",     last: "8d ago",    eval: "5m",  team: "identity",  muted: false, channels: ["#oncall-identity"], priority: "P2" },
    { id: "m-4206", name: "Sidekiq DLQ growth",                        type: "metric",    scope: "service:sidekiq",                  status: "no-data",value: "—",      threshold: ">100",      last: "32d ago",   eval: "10m", team: "messaging", muted: false, channels: ["#oncall-messaging"], priority: "P3" },
    { id: "m-4205", name: "Build flakiness · CI runners",              type: "log",       scope: "source:ci-runner",                 status: "muted",  value: "—",      threshold: ">10%",      last: "muted 2d ago", eval: "1h", team: "platform", muted: true, channels: ["#ci"], priority: "P3" },
    { id: "m-4204", name: "Cost anomaly · S3 egress",                  type: "metric",    scope: "account:prod aws_service:s3",      status: "muted",  value: "—",      threshold: ">$1k/d",    last: "muted 5d ago", eval: "1h", team: "platform", muted: true, channels: ["#finops"], priority: "P3" },
  ];

  const counts = monitors.reduce((a, m) => { a[m.status] = (a[m.status] || 0) + 1; return a; }, {});
  const filtered = monitors.filter(m =>
    (tab === "all" || (tab === "triggered" && (m.status === "alert" || m.status === "warn")) || (tab === "muted" && m.muted) || tab === m.status) &&
    (!q || m.name.toLowerCase().includes(q.toLowerCase()) || m.scope.toLowerCase().includes(q.toLowerCase()))
  );

  const statusBadge   = { alert: "err", warn: "warn", ok: "ok", "no-data": "neutral", muted: "neutral" };
  const statusLabel   = { alert: "Alert", warn: "Warn", ok: "OK", "no-data": "No data", muted: "Muted" };
  const typeColor     = { metric: "var(--brand)", apm: "var(--accent-violet)", log: "var(--warn-fg)", synthetic: "var(--ok)", anomaly: "var(--err)" };
  const priorityColor = { P1: "var(--err)", P2: "var(--warn-fg)", P3: "var(--fg-3)" };

  return (
    <div className="page">
      {/* Title */}
      <div className="row" style={{ alignItems: "flex-end" }}>
        <div>
          <div className="row" style={{ alignItems: "baseline", gap: 12 }}>
            <div className="page-title">Monitors</div>
            <span className="badge err"><span className="b-dot"/>{counts.alert || 0} alerting</span>
            <span className="badge warn"><span className="b-dot"/>{counts.warn || 0} warn</span>
          </div>
          <div className="page-sub" style={{ marginTop: 4 }}>{monitors.length} monitors · {(counts.muted || 0)} muted · {(counts["no-data"] || 0)} no data · evaluated every minute</div>
        </div>
        <div className="spacer"/>
        <div className="row">
          <button className="btn" onClick={() => go("notifications")}><Icon name="filter" size={14}/>Manage notifications</button>
          <button className="btn btn-primary" onClick={() => go("newMonitor")}><Icon name="plus" size={14}/>New monitor</button>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
        {[
          { l: "Alerting",  v: counts.alert || 0,    color: "var(--err)",      sub: "needs response" },
          { l: "Warn",      v: counts.warn || 0,     color: "var(--warn-fg)",  sub: "approaching threshold" },
          { l: "OK",        v: counts.ok || 0,       color: "var(--ok)",       sub: "within bounds" },
          { l: "No data",   v: counts["no-data"]||0, color: "var(--fg-3)",     sub: "stopped reporting" },
          { l: "Muted",     v: counts.muted || 0,    color: "var(--fg-3)",     sub: "alerts suppressed" },
        ].map(k => (
          <div key={k.l} className="card" style={{ padding: 14 }}>
            <div className="card-sub" style={{ fontSize: 11.5 }}>{k.l}</div>
            <div className="stat-value" style={{ fontSize: 28, color: k.color, marginTop: 4 }}>{k.v}</div>
            <div className="muted" style={{ fontSize: 10.5, marginTop: 2 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: "triggered", label: "Triggered", badge: (counts.alert||0) + (counts.warn||0), badgeKind: "err" },
          { id: "all",       label: "All",       badge: monitors.length },
          { id: "muted",     label: "Muted",     badge: counts.muted || 0 },
          { id: "no-data",   label: "No data",   badge: counts["no-data"] || 0 },
        ]}
        active={tab} setActive={setTab}
      />

      {/* Filter bar */}
      <div className="card card-pad-lg" style={{ padding: 14 }}>
        <div className="row" style={{ gap: 10, justifyContent: "space-between" }}>
          <div className="row" style={{ gap: 10, flex: 1 }}>
            <div className="search" style={{ width: 320 }}>
              <Icon name="search" size={14} className="muted"/>
              <input placeholder="Search monitors by name, scope, tag…" value={q} onChange={e=>setQ(e.target.value)}/>
            </div>
            <button className="btn"><Icon name="filter" size={14}/>type: all</button>
            <button className="btn"><Icon name="filter" size={14}/>team: all</button>
            <button className="btn"><Icon name="filter" size={14}/>priority: all</button>
          </div>
          <div className="row" style={{ gap: 6 }}>
            <button className="btn btn-ghost" style={{ height: 30 }}>Sort · status</button>
            <button className="btn btn-ghost" style={{ height: 30 }}><Icon name="export" size={13}/>Export</button>
          </div>
        </div>
      </div>

      {/* Monitors table */}
      <div className="card card-pad-lg" style={{ padding: 0, overflow: "hidden" }}>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ paddingLeft: 18, width: 110 }}>Status</th>
              <th>Monitor</th>
              <th style={{ width: 80 }}>Type</th>
              <th style={{ width: 70 }}>Priority</th>
              <th>Scope</th>
              <th style={{ textAlign: "right" }}>Current</th>
              <th>Threshold</th>
              <th>Last triggered</th>
              <th style={{ width: 100 }}>Channels</th>
              <th style={{ width: 18 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id} onClick={() => go("monitorDetail", { id: m.id })} style={{ cursor: "pointer", opacity: m.muted ? 0.7 : 1 }}>
                <td style={{ paddingLeft: 18 }}>
                  <span className={"badge " + statusBadge[m.status]}><span className="b-dot"/>{statusLabel[m.status]}</span>
                </td>
                <td>
                  <div style={{ fontSize: 12.5, color: "var(--fg-0)", fontWeight: 500 }}>{m.name}</div>
                  <div className="muted mono" style={{ fontSize: 10.5 }}>{m.id} · team {m.team}</div>
                </td>
                <td>
                  <span className="mono" style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 3, background: typeColor[m.type] + "20", color: typeColor[m.type], textTransform: "uppercase" }}>{m.type}</span>
                </td>
                <td>
                  <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: priorityColor[m.priority] }}>{m.priority}</span>
                </td>
                <td className="mono muted" style={{ fontSize: 11 }}>{m.scope}</td>
                <td style={{ textAlign: "right" }}>
                  <span className="mono" style={{ fontSize: 12.5, fontWeight: 600, color: m.status === "alert" ? "var(--err)" : m.status === "warn" ? "var(--warn-fg)" : "var(--fg-1)" }}>{m.value}</span>
                </td>
                <td className="mono muted" style={{ fontSize: 11 }}>{m.threshold}</td>
                <td className="muted mono" style={{ fontSize: 11 }}>{m.last}</td>
                <td>
                  <div className="row" style={{ gap: 4 }}>
                    {m.channels.slice(0, 2).map((ch, i) => (
                      <span key={i} className="badge neutral" style={{ height: 17, padding: "0 6px", fontSize: 10, maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ch}</span>
                    ))}
                    {m.channels.length > 2 && <span className="muted" style={{ fontSize: 10 }}>+{m.channels.length - 2}</span>}
                  </div>
                </td>
                <td><Icon name="chevron-right" size={13} className="muted"/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer: timeline strip + recent activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }}>
        <div className="card card-pad-lg">
          <div className="card-title">Alert volume · last 24 hours</div>
          <div className="card-sub" style={{ marginTop: 2 }}>triggers per hour · color shows worst severity in window</div>
          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(24, 1fr)", gap: 2, height: 70, alignItems: "end" }}>
            {Array.from({ length: 24 }).map((_, i) => {
              const seed = (i * 17 + 3) % 12;
              const value = Math.max(2, seed);
              const isPeak = i === 18 || i === 19;
              const isWarn = i === 12 || i === 13 || i === 22;
              const color = isPeak ? "var(--err)" : isWarn ? "var(--warn)" : value > 4 ? "var(--brand)" : "var(--bg-inset)";
              return <div key={i} style={{ background: color, height: Math.max(4, value * 5) + "px", borderRadius: 2, opacity: i < 18 ? 0.7 : 1 }} title={`${value} triggers`}/>;
            })}
          </div>
          <div className="row" style={{ marginTop: 6, justifyContent: "space-between" }}>
            <div className="muted mono" style={{ fontSize: 10.5 }}>24h ago</div>
            <div className="muted mono" style={{ fontSize: 10.5 }}>12h ago</div>
            <div className="muted mono" style={{ fontSize: 10.5 }}>now</div>
          </div>
        </div>

        <div className="card card-pad-lg">
          <div className="card-title">Recent activity</div>
          <div className="card-sub" style={{ marginTop: 2 }}>last 1 hour</div>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { t: "ago", time: "4m",  sev: "err",  msg: "p99 latency drift · payment.charge · triggered", who: "" },
              { t: "ago", time: "8m",  sev: "err",  msg: "Stripe upstream timeouts · triggered",            who: "" },
              { t: "ago", time: "12m", sev: "err",  msg: "Error rate spike · payment-svc · triggered", who: "" },
              { t: "ago", time: "14m", sev: "warn", msg: "Acked by jay.vasquez",                          who: "JV" },
              { t: "ago", time: "32m", sev: "warn", msg: "Kafka under-replicated partitions · warn → alert", who: "" },
              { t: "ago", time: "1h",  sev: "ok",   msg: "Service availability · recovered",          who: "" },
            ].map((a, i) => (
              <div key={i} className="row" style={{ gap: 8, alignItems: "flex-start" }}>
                <span className={"badge " + a.sev} style={{ width: 7, height: 7, padding: 0, borderRadius: "50%", marginTop: 6, flexShrink: 0 }}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: "var(--fg-0)" }}>{a.msg}</div>
                  <div className="muted" style={{ fontSize: 10.5, marginTop: 2 }}>{a.time} {a.t}</div>
                </div>
                {a.who && (
                  <span style={{ width: 18, height: 18, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#3b82f6)", color: "white", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{a.who}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MONITOR DETAIL — single alert/monitor deep dive
   ========================================================= */
function MonitorDetailScreen({ go, params }) {
  const id = (params && params.id) || "m-4218";

  const monitors = {
    "m-4218": { name: "Error rate spike · payment-svc", type: "metric", scope: "service:payment-svc env:prod", status: "alert", value: 0.42, unit: "%", thresholdAlert: 0.05, thresholdWarn: 0.02, query: "avg(last_5m):sum:trace.errors{service:payment-svc,env:prod}.as_rate() / sum:trace.requests{service:payment-svc,env:prod}.as_rate() * 100 > 0.05", evalEvery: "5m", priority: "P1", team: "payments", muted: false, since: "10:30:18", duration: "12m", channels: ["#oncall-payments", "PagerDuty: Payments primary", "jay.vasquez@my-org"], runbook: "payments-runbook.md#error-rate-spike" },
  };
  const m = monitors[id] || monitors["m-4218"];

  const statusBadge = { alert: "err", warn: "warn", ok: "ok", "no-data": "neutral", muted: "neutral" };
  const statusLabel = { alert: "Alerting", warn: "Warn", ok: "OK", "no-data": "No data", muted: "Muted" };

  return (
    <div className="page">
      {/* Breadcrumb */}
      <div className="row">
        <button className="btn btn-ghost" onClick={() => go("monitors")}><Icon name="back" size={14}/>Monitors</button>
        <span className="muted">/</span>
        <span className="mono" style={{ fontSize: 13, color: "var(--fg-0)", fontWeight: 600 }}>{id}</span>
      </div>

      {/* Header */}
      <div className="row" style={{ alignItems: "flex-start", gap: 16 }}>
        <div style={{ width: 56, height: 56, borderRadius: 12, background: "color-mix(in oklab, var(--err) 10%, var(--bg-card))", color: "var(--err)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="alert" size={26}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row" style={{ alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
            <div className="page-title">{m.name}</div>
            <span className={"badge " + statusBadge[m.status]}><span className="b-dot"/>{statusLabel[m.status]}</span>
            <span className="badge neutral mono">{m.priority}</span>
            <span className="badge neutral mono" style={{ textTransform: "uppercase", fontSize: 10 }}>{m.type}</span>
          </div>
          <div className="row" style={{ marginTop: 6, gap: 20, flexWrap: "wrap" }}>
            <div className="row" style={{ gap: 6 }}>
              <span className="muted" style={{ fontSize: 11.5 }}>Scope</span>
              <span className="mono" style={{ fontSize: 12 }}>{m.scope}</span>
            </div>
            <div className="row" style={{ gap: 6 }}>
              <span className="muted" style={{ fontSize: 11.5 }}>Triggered</span>
              <span className="mono" style={{ fontSize: 12, color: "var(--err)" }}>{m.since}</span>
              <span className="muted" style={{ fontSize: 11.5 }}>· duration {m.duration}</span>
            </div>
            <div className="row" style={{ gap: 6 }}>
              <span className="muted" style={{ fontSize: 11.5 }}>Eval</span>
              <span className="mono" style={{ fontSize: 12 }}>every {m.evalEvery}</span>
            </div>
            <div className="row" style={{ gap: 6 }}>
              <span className="muted" style={{ fontSize: 11.5 }}>Team</span>
              <span style={{ fontSize: 12 }}>{m.team}</span>
            </div>
          </div>
        </div>
        <div className="row" style={{ flexShrink: 0 }}>
          <button className="btn"><Icon name="check" size={14}/>Acknowledge</button>
          <button className="btn"><Icon name="pause" size={14}/>Mute · 1h</button>
          <button className="btn btn-icon"><Icon name="more" size={14}/></button>
        </div>
      </div>

      {/* Current status + threshold gauge */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: 16 }}>
        <div className="card card-pad-lg">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div>
              <div className="card-title">Evaluation · last 1 hour</div>
              <div className="card-sub" style={{ marginTop: 2 }}>line is monitor value · bands show thresholds</div>
            </div>
            <div className="row">
              <div className="row" style={{ gap: 6 }}><span style={{ width: 10, height: 2, background: "var(--err)" }}/><span className="muted" style={{ fontSize: 11 }}>value</span></div>
              <div className="row" style={{ gap: 6 }}><span style={{ width: 10, height: 2, background: "var(--warn)", borderTop: "1px dashed var(--warn)" }}/><span className="muted" style={{ fontSize: 11 }}>warn ≥ {m.thresholdWarn}%</span></div>
              <div className="row" style={{ gap: 6 }}><span style={{ width: 10, height: 2, background: "var(--err)", borderTop: "1px dashed var(--err)" }}/><span className="muted" style={{ fontSize: 11 }}>alert ≥ {m.thresholdAlert}%</span></div>
            </div>
          </div>
          <div style={{ position: "relative", marginTop: 14, height: 180 }}>
            <AreaSpark seed={161} color="var(--err)" soft="var(--err-soft)" height={180} base={0.55} amp={0.3}/>
            {/* threshold lines */}
            <svg style={{ position: "absolute", inset: 0, pointerEvents: "none" }} width="100%" height="180" viewBox="0 0 100 180" preserveAspectRatio="none">
              <line x1="0" y1="100" x2="100" y2="100" stroke="var(--err)" strokeWidth="0.5" strokeDasharray="2 2" strokeOpacity="0.8"/>
              <line x1="0" y1="130" x2="100" y2="130" stroke="var(--warn)" strokeWidth="0.5" strokeDasharray="2 2" strokeOpacity="0.8"/>
            </svg>
            <div style={{ position: "absolute", top: 6, right: 8, background: "var(--bg-card)", padding: "2px 6px", borderRadius: 3, border: "1px solid var(--err-soft)", fontSize: 11, color: "var(--err)", fontWeight: 600 }} className="mono">
              now {m.value}{m.unit}
            </div>
          </div>
        </div>

        <div className="card card-pad-lg">
          <div className="card-title">Current value</div>
          <div className="card-sub" style={{ marginTop: 2 }}>vs alert threshold</div>
          <div className="row" style={{ alignItems: "baseline", marginTop: 18, gap: 8 }}>
            <div className="stat-value" style={{ fontSize: 44, color: "var(--err)" }}>{m.value}<span style={{ fontSize: 20, marginLeft: 2 }}>{m.unit}</span></div>
          </div>
          <div className="muted" style={{ fontSize: 11.5, marginTop: 4 }}>{(m.value / m.thresholdAlert).toFixed(1)}× over alert threshold ({m.thresholdAlert}{m.unit})</div>
          <div style={{ marginTop: 14, height: 8, background: "var(--bg-inset)", borderRadius: 4, overflow: "hidden", position: "relative" }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: Math.min(100, (m.value / (m.thresholdAlert * 2)) * 100) + "%", background: "var(--err)" }}/>
            {/* warn marker */}
            <div style={{ position: "absolute", left: (m.thresholdWarn / (m.thresholdAlert*2)) * 100 + "%", top: -2, bottom: -2, width: 2, background: "var(--warn)" }}/>
            {/* alert marker */}
            <div style={{ position: "absolute", left: 50 + "%", top: -2, bottom: -2, width: 2, background: "var(--err)" }}/>
          </div>
          <div className="row" style={{ justifyContent: "space-between", marginTop: 4 }}>
            <span className="muted mono" style={{ fontSize: 10.5 }}>0{m.unit}</span>
            <span className="muted mono" style={{ fontSize: 10.5 }}>warn</span>
            <span className="muted mono" style={{ fontSize: 10.5 }}>alert</span>
            <span className="muted mono" style={{ fontSize: 10.5 }}>{(m.thresholdAlert*2).toFixed(2)}{m.unit}</span>
          </div>
        </div>

        <div className="card card-pad-lg">
          <div className="card-title">Status timeline · 24h</div>
          <div className="card-sub" style={{ marginTop: 2 }}>green ok · yellow warn · red alert</div>
          <div style={{ marginTop: 16, display: "flex", height: 14, borderRadius: 3, overflow: "hidden" }}>
            {/* Procedurally generated status bands */}
            {[
              { w: 20, c: "var(--ok)" },
              { w: 4,  c: "var(--warn)" },
              { w: 6,  c: "var(--ok)" },
              { w: 2,  c: "var(--err)" },
              { w: 12, c: "var(--ok)" },
              { w: 8,  c: "var(--warn)" },
              { w: 24, c: "var(--ok)" },
              { w: 4,  c: "var(--warn)" },
              { w: 20, c: "var(--err)" },
            ].map((b, i) => (
              <div key={i} style={{ width: b.w + "%", background: b.c }}/>
            ))}
          </div>
          <div className="row" style={{ justifyContent: "space-between", marginTop: 5 }}>
            <span className="muted mono" style={{ fontSize: 10.5 }}>24h ago</span>
            <span className="muted mono" style={{ fontSize: 10.5 }}>now</span>
          </div>
          <div className="row" style={{ marginTop: 14, justifyContent: "space-between" }}>
            <div>
              <div className="muted" style={{ fontSize: 11 }}>Triggered</div>
              <div className="mono" style={{ fontSize: 16, fontWeight: 600 }}>4</div>
            </div>
            <div>
              <div className="muted" style={{ fontSize: 11 }}>Time alerting</div>
              <div className="mono" style={{ fontSize: 16, fontWeight: 600, color: "var(--err)" }}>32m</div>
            </div>
            <div>
              <div className="muted" style={{ fontSize: 11 }}>MTTR</div>
              <div className="mono" style={{ fontSize: 16, fontWeight: 600 }}>8m</div>
            </div>
          </div>
        </div>
      </div>

      {/* Query + Notifications + History */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        <div className="col" style={{ gap: 16 }}>
          {/* Query */}
          <div className="card card-pad-lg">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div className="card-title">Query</div>
              <button className="btn btn-ghost" style={{ height: 26 }}><Icon name="link-ext" size={12}/>Edit</button>
            </div>
            <div style={{ marginTop: 10, padding: 12, background: "var(--bg-inset)", borderRadius: 6, border: "1px solid var(--line-2)" }}>
              <div className="mono" style={{ fontSize: 12, color: "var(--fg-0)", lineHeight: 1.5, wordBreak: "break-word" }}>{m.query}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 10 }}>
              <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
                <div className="muted" style={{ fontSize: 10.5 }}>Aggregation</div>
                <div className="mono" style={{ fontSize: 12, marginTop: 2 }}>avg over 5m</div>
              </div>
              <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
                <div className="muted" style={{ fontSize: 10.5 }}>Recovery</div>
                <div className="mono" style={{ fontSize: 12, marginTop: 2 }}>&lt; 0.03% for 10m</div>
              </div>
              <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
                <div className="muted" style={{ fontSize: 10.5 }}>No-data after</div>
                <div className="mono" style={{ fontSize: 12, marginTop: 2 }}>30m</div>
              </div>
            </div>
          </div>

          {/* Trigger history */}
          <div className="card card-pad-lg">
            <div className="card-title">Recent triggers</div>
            <div className="card-sub" style={{ marginTop: 2 }}>last 4 events</div>
            <table className="tbl" style={{ marginTop: 8 }}>
              <thead>
                <tr><th style={{ paddingLeft: 0 }}>When</th><th>Duration</th><th>Peak value</th><th>Resolved by</th><th>Incident</th></tr>
              </thead>
              <tbody>
                {[
                  { when: "10:30 — ongoing", dur: "12m+", peak: "0.42%", by: "—", inc: "INC-4218", lvl: "err" },
                  { when: "Yesterday 14:18", dur: "18m",  peak: "0.18%", by: "rita.chen",   inc: "INC-4201", lvl: "ok" },
                  { when: "Mon 09:42",       dur: "32m",  peak: "0.62%", by: "jay.vasquez", inc: "INC-4184", lvl: "ok" },
                  { when: "Fri 22:14",       dur: "8m",   peak: "0.08%", by: "auto-recover",inc: "—",         lvl: "ok" },
                ].map((t, i) => (
                  <tr key={i}>
                    <td style={{ paddingLeft: 0 }}>
                      <div className="row" style={{ gap: 6 }}>
                        <span className={"badge " + t.lvl} style={{ width: 7, height: 7, padding: 0, borderRadius: "50%" }}/>
                        <span className="mono" style={{ fontSize: 11.5, color: "var(--fg-0)" }}>{t.when}</span>
                      </div>
                    </td>
                    <td className="mono" style={{ fontSize: 11.5 }}>{t.dur}</td>
                    <td className="mono" style={{ fontSize: 11.5, color: "var(--err)" }}>{t.peak}</td>
                    <td className="muted" style={{ fontSize: 11.5 }}>{t.by}</td>
                    <td><a className="mono" style={{ fontSize: 11.5, color: t.inc !== "—" ? "var(--brand-deep)" : "var(--fg-3)" }}>{t.inc}</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col" style={{ gap: 16 }}>
          {/* Notifications */}
          <div className="card card-pad-lg">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div>
                <div className="card-title">Notifications</div>
                <div className="card-sub" style={{ marginTop: 2 }}>{m.channels.length} channels · escalation in 15m</div>
              </div>
              <button className="btn btn-ghost" style={{ height: 26 }}><Icon name="link-ext" size={12}/>Edit</button>
            </div>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              {m.channels.map((ch, i) => (
                <div key={i} className="row" style={{ padding: "8px 10px", borderRadius: 6, background: "var(--bg-inset)", justifyContent: "space-between" }}>
                  <div className="row" style={{ gap: 8 }}>
                    <Icon name={ch.startsWith("#") ? "send" : ch.includes("@") ? "user" : "bell"} size={14} className="muted"/>
                    <span className="mono" style={{ fontSize: 12 }}>{ch}</span>
                  </div>
                  <span className="badge ok" style={{ height: 16, padding: "0 6px", fontSize: 10 }}>delivered</span>
                </div>
              ))}
            </div>
          </div>

          {/* Runbook + Notes */}
          <div className="card card-pad-lg">
            <div className="card-title">Runbook & context</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 10, lineHeight: 1.6 }}>
              When error rate exceeds <span className="mono" style={{ color: "var(--err)" }}>0.05%</span> for 5 minutes, customer-impacting failures are likely. First check the payment-svc dashboard for recent deploys; then inspect the Logs explorer for ConnectionResetErrors.
            </div>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { label: "Open runbook",                href: "payments-runbook.md#error-rate-spike" },
                { label: "payment-svc service dashboard", onClick: () => go("serviceDetail", { id: "payment-svc" }) },
                { label: "Recent traces · error",         onClick: () => go("traceList") },
                { label: "Recent logs · ERROR",           onClick: () => go("logs") },
              ].map((l, i) => (
                <a key={i} onClick={l.onClick} style={{ padding: "7px 10px", borderRadius: 6, background: "var(--bg-inset)", color: "var(--brand-deep)", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon name="link-ext" size={12}/>
                  <span>{l.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   NEW MONITOR — wizard for creating an alert monitor
   ========================================================= */
function NewMonitorScreen({ go }) {
  const [type, setType] = useStateC("metric");
  const [metric, setMetric] = useStateC("trace.errors.payment_svc");
  const [from, setFrom] = useStateC("service:payment-svc,env:prod");
  const [agg, setAgg] = useStateC("avg");
  const [window, setWindow] = useStateC("last_5m");
  // APM
  const [apmService, setApmService] = useStateC("payment-svc");
  const [apmResource, setApmResource] = useStateC("POST /v1/charges");
  const [apmTrack, setApmTrack] = useStateC("errors");
  // Log
  const [logQuery, setLogQuery] = useStateC("@level:error service:payment-svc");
  const [logGroupBy, setLogGroupBy] = useStateC("service");
  // Anomaly
  const [algo, setAlgo] = useStateC("basic");
  const [deviations, setDeviations] = useStateC("3");
  const [direction, setDirection] = useStateC("above");
  const [seasonality, setSeasonality] = useStateC("auto");
  const [alertThr, setAlertThr] = useStateC("0.05");
  const [warnThr, setWarnThr] = useStateC("0.02");
  const [recoverThr, setRecoverThr] = useStateC("0.03");
  const [noDataAfter, setNoDataAfter] = useStateC("30m");
  const [notify, setNotify] = useStateC(["@slack-oncall-payments", "@pagerduty-Payments-primary"]);
  const [priority, setPriority] = useStateC("P1");
  const [name, setName] = useStateC("Error rate spike · payment-svc");
  const [tags, setTags] = useStateC(["team:payments", "tier:0", "owner:jay.vasquez"]);
  const [message, setMessage] = useStateC("Error rate {{value}}% exceeds threshold ({{threshold}}%) for {{service.name}} {{#is_alert}}@slack-oncall-payments @pagerduty-Payments-primary{{/is_alert}}");

  const types = [
    { id: "metric",     label: "Metric Alert",  desc: "Alert on metric value or rate change",        icon: "metrics",    color: "var(--brand)" },
    { id: "apm",        label: "APM",           desc: "Service errors, latency, throughput",          icon: "trace",      color: "var(--accent-violet)" },
    { id: "log",        label: "Log",           desc: "Match against log content or count by query",   icon: "logs",       color: "var(--warn-fg)" },
    { id: "anomaly",    label: "Anomaly",       desc: "Watchdog detects deviation from baseline",      icon: "zap",        color: "var(--err)" },
  ];

  const Step = ({ n, title, sub, children }) => (
    <div className="card card-pad-lg">
      <div className="row" style={{ alignItems: "center", gap: 12 }}>
        <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--brand)", color: "white", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{n}</div>
        <div>
          <div className="card-title">{title}</div>
          <div className="card-sub" style={{ marginTop: 2 }}>{sub}</div>
        </div>
      </div>
      <div style={{ marginTop: 16 }}>{children}</div>
    </div>
  );

  const FieldRow = ({ label, children }) => (
    <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: 16, padding: "10px 0", borderBottom: "1px solid var(--line-2)", alignItems: "center" }}>
      <div className="muted" style={{ fontSize: 12 }}>{label}</div>
      <div>{children}</div>
    </div>
  );

  const InputBox = ({ value, onChange, ph, style, mono }) => (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={ph}
      className={mono ? "mono" : ""}
      style={{
        border: "1px solid var(--line)", borderRadius: 6, padding: "7px 10px",
        fontSize: 12.5, background: "var(--bg-card)", color: "var(--fg-0)",
        outline: 0, width: "100%", ...style
      }}/>
  );

  return (
    <div className="page" style={{ paddingBottom: 100 }}>
      <div className="row">
        <button className="btn btn-ghost" onClick={() => go("monitors")}><Icon name="back" size={14}/>Monitors</button>
        <span className="muted">/</span>
        <span style={{ fontSize: 13, color: "var(--fg-0)", fontWeight: 600 }}>New monitor</span>
      </div>

      <div className="row" style={{ alignItems: "flex-end" }}>
        <div>
          <div className="page-title">New monitor</div>
          <div className="page-sub" style={{ marginTop: 4 }}>Create an alert rule · saved monitors are evaluated continuously and notify configured channels</div>
        </div>
        <div className="spacer"/>
        <button className="btn btn-ghost">Documentation</button>
      </div>

      {/* Step 1: Type */}
      <Step n="1" title="Choose a type" sub="What signal triggers this monitor?">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {types.map(t => (
            <div key={t.id} onClick={() => setType(t.id)} style={{
              padding: 14, border: "2px solid " + (type === t.id ? t.color : "var(--line)"),
              borderRadius: 8, cursor: "pointer",
              background: type === t.id ? "color-mix(in oklab, " + t.color + " 6%, var(--bg-card))" : "var(--bg-card)",
              transition: "all 120ms"
            }}>
              <div className="row" style={{ gap: 8, marginBottom: 6 }}>
                <div style={{ width: 24, height: 24, borderRadius: 5, background: t.color + "20", color: t.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name={t.icon} size={13}/>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: type === t.id ? t.color : "var(--fg-0)" }}>{t.label}</span>
              </div>
              <div className="muted" style={{ fontSize: 11, lineHeight: 1.4 }}>{t.desc}</div>
            </div>
          ))}
        </div>
      </Step>

      {/* Step 2: Query — type-aware */}
      <Step n="2"
        title={type === "metric" ? "Pick the metric" : type === "apm" ? "Pick a service & resource" : type === "log" ? "Define a log query" : "Pick a baseline"}
        sub={type === "metric" ? "Define what you want to evaluate"
            : type === "apm"  ? "Choose the service and which signal to watch"
            : type === "log"  ? "Match logs with a search query and group them"
            : "Watchdog learns the normal range automatically — you choose sensitivity"}
      >
        {type === "metric" && (
          <>
            <FieldRow label="Metric">
              <div className="row" style={{ gap: 6 }}>
                <InputBox value={metric} onChange={setMetric} mono style={{ flex: 1 }}/>
                <button className="btn"><Icon name="search" size={13}/>Browse</button>
              </div>
            </FieldRow>
            <FieldRow label="From">
              <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
                {from.split(",").map((tag, i) => (
                  <span key={i} className="mono" style={{ padding: "3px 8px", background: "var(--bg-inset)", borderRadius: 4, fontSize: 12, color: "var(--fg-1)", border: "1px solid var(--line-2)" }}>{tag} <Icon name="x" size={10} className="muted"/></span>
                ))}
                <span className="muted" style={{ fontSize: 12, padding: "3px 8px", cursor: "pointer", border: "1px dashed var(--line)", borderRadius: 4 }}>+ tag</span>
              </div>
            </FieldRow>
            <FieldRow label="Aggregation">
              <div className="row" style={{ gap: 8 }}>
                <div className="seg">
                  {["avg","sum","min","max","p50","p95","p99"].map(a => (
                    <div key={a} className={"seg-opt" + (agg === a ? " active" : "")} onClick={() => setAgg(a)}>{a}</div>
                  ))}
                </div>
                <span className="muted" style={{ fontSize: 12 }}>over</span>
                <div className="seg">
                  {["last_1m","last_5m","last_15m","last_1h"].map(w => (
                    <div key={w} className={"seg-opt" + (window === w ? " active" : "")} onClick={() => setWindow(w)}>{w.replace("_"," ").replace("last ","")}</div>
                  ))}
                </div>
                <span className="muted" style={{ fontSize: 12 }}>· group by</span>
                <span className="mono" style={{ padding: "3px 8px", background: "var(--bg-inset)", borderRadius: 4, fontSize: 12 }}>everything</span>
              </div>
            </FieldRow>
            <FieldRow label="Query preview">
              <div style={{ padding: 12, background: "var(--bg-inset)", borderRadius: 6, border: "1px solid var(--line-2)" }}>
                <div className="mono" style={{ fontSize: 12, color: "var(--fg-0)", lineHeight: 1.5 }}>
                  {agg}({window}):{metric}{"{"}{from}{"}"}.as_rate()
                </div>
              </div>
            </FieldRow>
          </>
        )}

        {type === "apm" && (
          <>
            <FieldRow label="Service">
              <div className="row" style={{ gap: 6 }}>
                <InputBox value={apmService} onChange={setApmService} mono style={{ width: 280 }}/>
                <button className="btn"><Icon name="search" size={13}/>Browse</button>
                <span className="muted" style={{ fontSize: 11.5 }}>15 services available</span>
              </div>
            </FieldRow>
            <FieldRow label="Resource">
              <div className="row" style={{ gap: 6 }}>
                <InputBox value={apmResource} onChange={setApmResource} mono style={{ flex: 1 }} ph="(any resource)"/>
                <button className="btn btn-ghost" style={{ fontSize: 11.5 }}>any</button>
              </div>
            </FieldRow>
            <FieldRow label="Track">
              <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
                {[
                  { id: "errors",  label: "Error rate",  unit: "%",   desc: "5xx + exception spans" },
                  { id: "hits",    label: "Throughput",  unit: "rps", desc: "request count per second" },
                  { id: "latency", label: "Latency",     unit: "ms",  desc: "p50 / p95 / p99 percentiles" },
                  { id: "apdex",   label: "Apdex",       unit: "0–1", desc: "satisfaction score" },
                ].map(o => (
                  <div key={o.id} onClick={() => setApmTrack(o.id)} style={{
                    padding: "8px 12px", borderRadius: 6, cursor: "pointer", minWidth: 150,
                    border: "1px solid " + (apmTrack === o.id ? "var(--accent-violet)" : "var(--line)"),
                    background: apmTrack === o.id ? "color-mix(in oklab, var(--accent-violet) 6%, var(--bg-card))" : "var(--bg-card)",
                  }}>
                    <div className="row" style={{ justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: apmTrack === o.id ? "var(--accent-violet)" : "var(--fg-0)" }}>{o.label}</span>
                      <span className="mono muted" style={{ fontSize: 10.5 }}>{o.unit}</span>
                    </div>
                    <div className="muted" style={{ fontSize: 10.5, marginTop: 3 }}>{o.desc}</div>
                  </div>
                ))}
              </div>
            </FieldRow>
            <FieldRow label="Evaluation window">
              <div className="seg">
                {["last_1m","last_5m","last_15m","last_1h"].map(w => (
                  <div key={w} className={"seg-opt" + (window === w ? " active" : "")} onClick={() => setWindow(w)}>{w.replace("_"," ").replace("last ","")}</div>
                ))}
              </div>
            </FieldRow>
            <FieldRow label="Query preview">
              <div style={{ padding: 12, background: "var(--bg-inset)", borderRadius: 6, border: "1px solid var(--line-2)" }}>
                <div className="mono" style={{ fontSize: 12, color: "var(--fg-0)", lineHeight: 1.5 }}>
                  apm({window}):{apmTrack === "latency" ? "p99" : "sum"}:trace.{apmService}.{apmTrack}{"{service:" + apmService + ",resource:" + apmResource + ",env:prod}"}
                </div>
              </div>
            </FieldRow>
          </>
        )}

        {type === "log" && (
          <>
            <FieldRow label="Log query">
              <textarea value={logQuery} onChange={e => setLogQuery(e.target.value)} rows={2} className="mono"
                style={{ width: "100%", border: "1px solid var(--line)", borderRadius: 6, padding: "8px 10px", fontSize: 12.5, fontFamily: "var(--font-mono)", background: "var(--bg-card)", color: "var(--fg-0)", outline: 0, resize: "vertical" }}/>
              <div className="row" style={{ marginTop: 6, gap: 6, flexWrap: "wrap" }}>
                <span className="muted" style={{ fontSize: 10.5 }}>helpers:</span>
                {["@level:error","@status:5*","service:payment-svc","env:prod","\"timeout\""].map(h => (
                  <span key={h} className="mono" style={{ padding: "1px 6px", background: "var(--bg-inset)", borderRadius: 3, fontSize: 10.5, color: "var(--brand-deep)", cursor: "pointer" }}>{h}</span>
                ))}
              </div>
            </FieldRow>
            <FieldRow label="Match logs">
              <div className="row" style={{ alignItems: "baseline", gap: 8 }}>
                <span className="mono" style={{ fontSize: 22, fontWeight: 700, color: "var(--err)" }}>184</span>
                <span className="muted" style={{ fontSize: 11.5 }}>matched in the last 5 minutes · across all sources</span>
              </div>
            </FieldRow>
            <FieldRow label="Group by">
              <div className="seg">
                {["service","host","status","none"].map(g => (
                  <div key={g} className={"seg-opt" + (logGroupBy === g ? " active" : "")} onClick={() => setLogGroupBy(g)}>{g}</div>
                ))}
              </div>
            </FieldRow>
            <FieldRow label="Aggregate">
              <div className="row" style={{ gap: 8 }}>
                <span style={{ fontSize: 12.5 }}>count over</span>
                <div className="seg">
                  {["last_5m","last_15m","last_1h"].map(w => (
                    <div key={w} className={"seg-opt" + (window === w ? " active" : "")} onClick={() => setWindow(w)}>{w.replace("_"," ").replace("last ","")}</div>
                  ))}
                </div>
              </div>
            </FieldRow>
            <FieldRow label="Query preview">
              <div style={{ padding: 12, background: "var(--bg-inset)", borderRadius: 6, border: "1px solid var(--line-2)" }}>
                <div className="mono" style={{ fontSize: 12, color: "var(--fg-0)", lineHeight: 1.5 }}>
                  logs("{logQuery}"){logGroupBy !== "none" ? `.rollup("count", "${window}").by("${logGroupBy}")` : `.rollup("count", "${window}")`}
                </div>
              </div>
            </FieldRow>
          </>
        )}

        {type === "anomaly" && (
          <>
            <FieldRow label="Metric">
              <div className="row" style={{ gap: 6 }}>
                <InputBox value={metric} onChange={setMetric} mono style={{ flex: 1 }}/>
                <button className="btn"><Icon name="search" size={13}/>Browse</button>
              </div>
            </FieldRow>
            <FieldRow label="From">
              <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
                {from.split(",").map((tag, i) => (
                  <span key={i} className="mono" style={{ padding: "3px 8px", background: "var(--bg-inset)", borderRadius: 4, fontSize: 12, color: "var(--fg-1)", border: "1px solid var(--line-2)" }}>{tag} <Icon name="x" size={10} className="muted"/></span>
                ))}
                <span className="muted" style={{ fontSize: 12, padding: "3px 8px", cursor: "pointer", border: "1px dashed var(--line)", borderRadius: 4 }}>+ tag</span>
              </div>
            </FieldRow>
            <FieldRow label="Algorithm">
              <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
                {[
                  { id: "basic",  label: "Basic",  desc: "rolling baseline · fast, lightweight" },
                  { id: "agile",  label: "Agile",  desc: "adapts to level shifts and recent deploys" },
                  { id: "robust", label: "Robust", desc: "ignores outliers · best for noisy series" },
                ].map(o => (
                  <div key={o.id} onClick={() => setAlgo(o.id)} style={{
                    padding: "8px 12px", borderRadius: 6, cursor: "pointer", minWidth: 180,
                    border: "1px solid " + (algo === o.id ? "var(--err)" : "var(--line)"),
                    background: algo === o.id ? "color-mix(in oklab, var(--err) 6%, var(--bg-card))" : "var(--bg-card)",
                  }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: algo === o.id ? "var(--err)" : "var(--fg-0)" }}>{o.label}</div>
                    <div className="muted" style={{ fontSize: 10.5, marginTop: 3 }}>{o.desc}</div>
                  </div>
                ))}
              </div>
            </FieldRow>
            <FieldRow label="Bounds">
              <div className="row" style={{ gap: 8 }}>
                <div className="seg">
                  {["2","3","4"].map(d => (
                    <div key={d} className={"seg-opt" + (deviations === d ? " active" : "")} onClick={() => setDeviations(d)}>{d}σ</div>
                  ))}
                </div>
                <span className="muted" style={{ fontSize: 12 }}>· direction</span>
                <div className="seg">
                  {["above","below","both"].map(d => (
                    <div key={d} className={"seg-opt" + (direction === d ? " active" : "")} onClick={() => setDirection(d)}>{d}</div>
                  ))}
                </div>
              </div>
            </FieldRow>
            <FieldRow label="Seasonality">
              <div className="row" style={{ gap: 6 }}>
                <div className="seg">
                  {["auto","hourly","daily","weekly"].map(s => (
                    <div key={s} className={"seg-opt" + (seasonality === s ? " active" : "")} onClick={() => setSeasonality(s)}>{s}</div>
                  ))}
                </div>
                <span className="muted" style={{ fontSize: 11.5 }}>· {seasonality === "auto" ? "Watchdog picks the strongest cycle" : "fixed cycle"}</span>
              </div>
            </FieldRow>
            <FieldRow label="Query preview">
              <div style={{ padding: 12, background: "var(--bg-inset)", borderRadius: 6, border: "1px solid var(--line-2)" }}>
                <div className="mono" style={{ fontSize: 12, color: "var(--fg-0)", lineHeight: 1.5 }}>
                  anomalies(avg({window}):{metric}{"{"}{from}{"}"}, '{algo}', {deviations}, direction='{direction}', seasonality='{seasonality}')
                </div>
              </div>
            </FieldRow>
          </>
        )}

        {/* Preview chart — shared across types */}
        <FieldRow label="Preview · last 1 hour">
          <div style={{ position: "relative", marginTop: 4 }}>
            <AreaSpark seed={type === "log" ? 224 : type === "apm" ? 223 : type === "anomaly" ? 222 : 221} color={type === "anomaly" ? "var(--err)" : type === "apm" ? "var(--accent-violet)" : type === "log" ? "var(--warn)" : "var(--err)"} soft={type === "anomaly" ? "var(--err-soft)" : type === "apm" ? "rgba(99,102,241,0.18)" : type === "log" ? "var(--warn-soft)" : "var(--err-soft)"} height={110} base={0.55} amp={0.3}/>
            {/* threshold lines for non-anomaly */}
            {type !== "anomaly" && (
              <svg style={{ position: "absolute", inset: 0, pointerEvents: "none" }} width="100%" height="110" viewBox="0 0 100 110" preserveAspectRatio="none">
                <line x1="0" y1="56" x2="100" y2="56" stroke="var(--err)" strokeWidth="0.5" strokeDasharray="2 2" strokeOpacity="0.7"/>
                <line x1="0" y1="74" x2="100" y2="74" stroke="var(--warn)" strokeWidth="0.5" strokeDasharray="2 2" strokeOpacity="0.7"/>
              </svg>
            )}
            {/* anomaly band */}
            {type === "anomaly" && (
              <svg style={{ position: "absolute", inset: 0, pointerEvents: "none" }} width="100%" height="110" viewBox="0 0 100 110" preserveAspectRatio="none">
                <rect x="0" y="42" width="100" height="32" fill="var(--ok)" fillOpacity="0.08" stroke="var(--ok)" strokeOpacity="0.4" strokeDasharray="2 2" strokeWidth="0.4"/>
              </svg>
            )}
            <span className="muted mono" style={{ position: "absolute", right: 8, top: 6, background: "var(--bg-card)", padding: "1px 5px", fontSize: 10.5, border: "1px solid var(--err-soft)", color: "var(--err)", borderRadius: 3 }}>
              {type === "metric" ? "now 0.42%" : type === "apm" ? (apmTrack === "latency" ? "p99 184ms" : apmTrack === "errors" ? "0.42% errors" : apmTrack === "hits" ? "14.8k rps" : "apdex 0.84") : type === "log" ? "184 / 5m" : "anomalous"}
            </span>
          </div>
        </FieldRow>
      </Step>

      {/* Step 3: Conditions — type-aware */}
      <Step n="3" title="Set alert conditions" sub={type === "anomaly" ? "How far from normal counts as anomalous?" : "When should this monitor fire?"}>
        {type === "metric" && (
          <>
            <FieldRow label="Trigger when">
              <div className="row" style={{ gap: 8 }}>
                <span style={{ fontSize: 12.5 }}>value is</span>
                <div className="seg">
                  <div className="seg-opt active">above</div>
                  <div className="seg-opt">below</div>
                  <div className="seg-opt">equal to</div>
                </div>
                <span style={{ fontSize: 12.5 }}>the threshold</span>
              </div>
            </FieldRow>
            <FieldRow label="Alert threshold">
              <div className="row" style={{ gap: 8 }}>
                <InputBox value={alertThr} onChange={setAlertThr} mono style={{ width: 100 }}/>
                <span className="muted" style={{ fontSize: 12 }}>%</span>
                <span className="badge err" style={{ height: 18 }}><span className="b-dot"/>critical</span>
              </div>
            </FieldRow>
            <FieldRow label="Warn threshold">
              <div className="row" style={{ gap: 8 }}>
                <InputBox value={warnThr} onChange={setWarnThr} mono style={{ width: 100 }}/>
                <span className="muted" style={{ fontSize: 12 }}>%</span>
                <span className="badge warn" style={{ height: 18 }}><span className="b-dot"/>warn</span>
              </div>
            </FieldRow>
            <FieldRow label="Recovery threshold">
              <div className="row" style={{ gap: 8 }}>
                <InputBox value={recoverThr} onChange={setRecoverThr} mono style={{ width: 100 }}/>
                <span className="muted" style={{ fontSize: 12 }}>% · monitor recovers when value falls below</span>
              </div>
            </FieldRow>
          </>
        )}

        {type === "apm" && (
          <>
            <FieldRow label="Trigger when">
              <div className="row" style={{ gap: 8 }}>
                <span className="mono" style={{ fontSize: 12.5, color: "var(--accent-violet)" }}>{apmTrack === "latency" ? "p99 latency" : apmTrack === "errors" ? "error rate" : apmTrack === "hits" ? "throughput" : "apdex"}</span>
                <span style={{ fontSize: 12.5 }}>is</span>
                <div className="seg">
                  <div className="seg-opt active">{apmTrack === "apdex" || apmTrack === "hits" ? "below" : "above"}</div>
                  <div className="seg-opt">the threshold</div>
                </div>
              </div>
            </FieldRow>
            <FieldRow label="Alert threshold">
              <div className="row" style={{ gap: 8 }}>
                <InputBox value={apmTrack === "latency" ? "500" : apmTrack === "errors" ? "0.05" : apmTrack === "apdex" ? "0.80" : "10"} onChange={()=>{}} mono style={{ width: 100 }}/>
                <span className="muted" style={{ fontSize: 12 }}>{apmTrack === "latency" ? "ms" : apmTrack === "errors" ? "%" : apmTrack === "apdex" ? "(0–1)" : "rps"}</span>
                <span className="badge err" style={{ height: 18 }}><span className="b-dot"/>critical</span>
              </div>
            </FieldRow>
            <FieldRow label="Warn threshold">
              <div className="row" style={{ gap: 8 }}>
                <InputBox value={apmTrack === "latency" ? "300" : apmTrack === "errors" ? "0.02" : apmTrack === "apdex" ? "0.90" : "50"} onChange={()=>{}} mono style={{ width: 100 }}/>
                <span className="muted" style={{ fontSize: 12 }}>{apmTrack === "latency" ? "ms" : apmTrack === "errors" ? "%" : apmTrack === "apdex" ? "(0–1)" : "rps"}</span>
                <span className="badge warn" style={{ height: 18 }}><span className="b-dot"/>warn</span>
              </div>
            </FieldRow>
            <FieldRow label="Min sample size">
              <div className="row" style={{ gap: 8 }}>
                <InputBox value="100" onChange={()=>{}} mono style={{ width: 100 }}/>
                <span className="muted" style={{ fontSize: 12 }}>traces · skip evaluation if fewer (prevents false alerts on low traffic)</span>
              </div>
            </FieldRow>
          </>
        )}

        {type === "log" && (
          <>
            <FieldRow label="Trigger when">
              <div className="row" style={{ gap: 8 }}>
                <span style={{ fontSize: 12.5 }}>matched log count is</span>
                <div className="seg">
                  <div className="seg-opt active">above</div>
                  <div className="seg-opt">below</div>
                  <div className="seg-opt">% change</div>
                </div>
              </div>
            </FieldRow>
            <FieldRow label="Alert threshold">
              <div className="row" style={{ gap: 8 }}>
                <InputBox value="100" onChange={()=>{}} mono style={{ width: 100 }}/>
                <span className="muted" style={{ fontSize: 12 }}>events in {window.replace("last_","")}</span>
                <span className="badge err" style={{ height: 18 }}><span className="b-dot"/>critical</span>
              </div>
            </FieldRow>
            <FieldRow label="Warn threshold">
              <div className="row" style={{ gap: 8 }}>
                <InputBox value="50" onChange={()=>{}} mono style={{ width: 100 }}/>
                <span className="muted" style={{ fontSize: 12 }}>events in {window.replace("last_","")}</span>
                <span className="badge warn" style={{ height: 18 }}><span className="b-dot"/>warn</span>
              </div>
            </FieldRow>
            <FieldRow label="Recovery">
              <div className="row" style={{ gap: 8 }}>
                <span style={{ fontSize: 12.5 }}>recover after</span>
                <div className="seg">
                  {["1m","5m","15m","30m"].map(d => (
                    <div key={d} className={"seg-opt" + (d === "5m" ? " active" : "")}>{d}</div>
                  ))}
                </div>
                <span className="muted" style={{ fontSize: 12 }}>· of count below warn</span>
              </div>
            </FieldRow>
          </>
        )}

        {type === "anomaly" && (
          <>
            <FieldRow label="Trigger when">
              <div className="row" style={{ gap: 8 }}>
                <span style={{ fontSize: 12.5 }}>value is</span>
                <span className="mono" style={{ fontSize: 12.5, color: "var(--err)", fontWeight: 600 }}>anomalous</span>
                <span style={{ fontSize: 12.5 }}>· bounds</span>
                <span className="mono" style={{ fontSize: 12.5, padding: "2px 6px", background: "var(--bg-inset)", borderRadius: 3 }}>{deviations}σ · {direction}</span>
              </div>
            </FieldRow>
            <FieldRow label="Persist for">
              <div className="row" style={{ gap: 8 }}>
                <span style={{ fontSize: 12.5 }}>alert after</span>
                <div className="seg">
                  {["1m","5m","10m","15m"].map(d => (
                    <div key={d} className={"seg-opt" + (d === "5m" ? " active" : "")}>{d}</div>
                  ))}
                </div>
                <span className="muted" style={{ fontSize: 12 }}>· avoids brief spikes</span>
              </div>
            </FieldRow>
            <FieldRow label="Recover after">
              <div className="row" style={{ gap: 8 }}>
                <div className="seg">
                  {["5m","10m","15m","30m"].map(d => (
                    <div key={d} className={"seg-opt" + (d === "10m" ? " active" : "")}>{d}</div>
                  ))}
                </div>
                <span className="muted" style={{ fontSize: 12 }}>· back inside bounds</span>
              </div>
            </FieldRow>
            <FieldRow label="Sensitivity">
              <div className="row" style={{ gap: 8 }}>
                <input type="range" min="1" max="10" defaultValue="5" style={{ width: 200, accentColor: "var(--err)" }}/>
                <span className="muted" style={{ fontSize: 11.5 }}>balance: more <span className="mono" style={{ color: "var(--err)" }}>noisy</span> ←→ <span className="mono" style={{ color: "var(--ok)" }}>quiet</span></span>
              </div>
            </FieldRow>
          </>
        )}

        <FieldRow label="No-data after">
          <div className="row" style={{ gap: 8 }}>
            <div className="seg">
              {["10m","30m","1h","6h"].map(d => (
                <div key={d} className={"seg-opt" + (noDataAfter === d ? " active" : "")} onClick={() => setNoDataAfter(d)}>{d}</div>
              ))}
            </div>
            <span className="muted" style={{ fontSize: 12 }}>· treat as</span>
            <div className="seg">
              <div className="seg-opt active">no-data</div>
              <div className="seg-opt">alert</div>
              <div className="seg-opt">ok</div>
            </div>
          </div>
        </FieldRow>
      </Step>

      {/* Step 4: Notifications */}
      <Step n="4" title="Configure notifications" sub="Who should be alerted, and how?">
        <FieldRow label="Send to">
          <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
            {notify.map((n, i) => (
              <span key={i} className="mono" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 8px", background: n.startsWith("@pagerduty") ? "color-mix(in oklab, var(--err) 12%, var(--bg-card))" : n.startsWith("@slack") ? "color-mix(in oklab, var(--ok) 12%, var(--bg-card))" : "var(--bg-inset)", borderRadius: 4, fontSize: 12, color: "var(--fg-0)", border: "1px solid var(--line-2)" }}>
                <Icon name={n.startsWith("@pagerduty") ? "bell" : n.startsWith("@slack") ? "send" : "user"} size={11}/>
                {n}
                <Icon name="x" size={10} className="muted"/>
              </span>
            ))}
            <button className="btn btn-ghost" style={{ height: 26, fontSize: 11.5 }}><Icon name="plus" size={11}/>Add channel</button>
            <a className="muted" style={{ fontSize: 11, cursor: "pointer", color: "var(--brand-deep)" }} onClick={() => go("notifications")}>manage channels →</a>
          </div>
        </FieldRow>
        <FieldRow label="Message template">
          <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5}
            style={{ width: "100%", border: "1px solid var(--line)", borderRadius: 6, padding: 10, fontSize: 12, fontFamily: "var(--font-mono)", background: "var(--bg-card)", color: "var(--fg-0)", outline: 0, resize: "vertical" }}/>
          <div className="row" style={{ marginTop: 6, gap: 6, flexWrap: "wrap" }}>
            <span className="muted" style={{ fontSize: 11 }}>Variables:</span>
            {["{{value}}","{{threshold}}","{{service.name}}","{{host.name}}","{{#is_alert}}…{{/is_alert}}","{{#is_warning}}…{{/is_warning}}","{{#is_recovery}}…{{/is_recovery}}"].map(v => (
              <span key={v} className="mono" style={{ padding: "1px 5px", background: "var(--bg-inset)", borderRadius: 3, fontSize: 10.5, color: "var(--brand-deep)", cursor: "pointer" }}>{v}</span>
            ))}
          </div>
        </FieldRow>
        <FieldRow label="Renotify if not resolved">
          <div className="row" style={{ gap: 8 }}>
            <span style={{ fontSize: 12.5 }}>every</span>
            <div className="seg">
              <div className="seg-opt">15m</div>
              <div className="seg-opt active">30m</div>
              <div className="seg-opt">1h</div>
              <div className="seg-opt">2h</div>
              <div className="seg-opt">never</div>
            </div>
          </div>
        </FieldRow>
      </Step>

      {/* Step 5: Define */}
      <Step n="5" title="Name & tag" sub="Make it easy to find and route">
        <FieldRow label="Monitor name">
          <InputBox value={name} onChange={setName}/>
        </FieldRow>
        <FieldRow label="Priority">
          <div className="row" style={{ gap: 6 }}>
            {[
              { id: "P1", label: "P1 · page", color: "var(--err)" },
              { id: "P2", label: "P2 · ticket", color: "var(--warn-fg)" },
              { id: "P3", label: "P3 · notify", color: "var(--fg-3)" },
              { id: "P4", label: "P4 · info", color: "var(--fg-3)" },
            ].map(p => (
              <div key={p.id} onClick={() => setPriority(p.id)} style={{
                padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
                background: priority === p.id ? "color-mix(in oklab, " + p.color + " 12%, var(--bg-card))" : "var(--bg-card)",
                border: "1px solid " + (priority === p.id ? p.color : "var(--line)"),
                color: priority === p.id ? p.color : "var(--fg-2)"
              }}>{p.label}</div>
            ))}
          </div>
        </FieldRow>
        <FieldRow label="Tags">
          <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
            {tags.map((t, i) => (
              <span key={i} className="mono" style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", background: "var(--bg-inset)", borderRadius: 4, fontSize: 12, color: "var(--fg-2)", border: "1px solid var(--line-2)" }}>{t} <Icon name="x" size={10} className="muted"/></span>
            ))}
            <span className="muted" style={{ fontSize: 12, padding: "3px 8px", cursor: "pointer", border: "1px dashed var(--line)", borderRadius: 4 }}>+ add</span>
          </div>
        </FieldRow>
      </Step>

      {/* Sticky save bar */}
      <div style={{ position: "sticky", bottom: 0, left: 0, right: 0, background: "var(--bg-card)", borderTop: "1px solid var(--line)", padding: "12px 18px", marginInline: -30, marginBottom: -40, boxShadow: "0 -10px 20px rgba(15,23,42,0.06)", display: "flex", alignItems: "center", gap: 12 }}>
        <div className="muted" style={{ fontSize: 11.5 }}>Monitor will be evaluated every <span className="mono" style={{ color: "var(--fg-0)" }}>{window.replace("last_","")}</span> · live preview shows it would currently <span style={{ color: "var(--err)", fontWeight: 600 }}>trigger ALERT</span></div>
        <div className="spacer"/>
        <button className="btn btn-ghost" onClick={() => go("monitors")}>Cancel</button>
        <button className="btn btn-ghost"><Icon name="play" size={13}/>Test on existing data</button>
        <button className="btn btn-primary" onClick={() => go("monitors")}><Icon name="check" size={13}/>Save monitor</button>
      </div>
    </div>
  );
}

/* =========================================================
   NOTIFICATIONS — manage channels, integrations, templates, policies
   ========================================================= */
function NotificationsScreen({ go }) {
  const [tab, setTab] = useStateC("channels");

  const channels = [
    { name: "#oncall-payments",          type: "slack",     used: 8, last: "8m ago",  status: "ok",   detail: "Workspace · my-org · 184 members" },
    { name: "#oncall-discovery",          type: "slack",     used: 4, last: "42m ago", status: "ok",   detail: "Workspace · my-org · 64 members"  },
    { name: "#oncall-platform",           type: "slack",     used: 6, last: "18m ago", status: "ok",   detail: "Workspace · my-org · 12 members"  },
    { name: "#finops",                     type: "slack",     used: 3, last: "5d ago",  status: "ok",   detail: "Workspace · my-org · 8 members"   },
    { name: "Payments primary",            type: "pagerduty", used: 3, last: "8m ago",  status: "ok",   detail: "Service P3KX42N · escalation 15m" },
    { name: "Discovery primary",           type: "pagerduty", used: 2, last: "42m ago", status: "ok",   detail: "Service P4DK21M · escalation 15m" },
    { name: "Platform primary",            type: "pagerduty", used: 4, last: "32m ago", status: "ok",   detail: "Service P2YN91P · escalation 30m" },
    { name: "jay.vasquez@my-org.com",     type: "email",     used: 1, last: "—",       status: "ok",   detail: "" },
    { name: "Webhook · datadog → asana",   type: "webhook",   used: 2, last: "1h ago",  status: "warn", detail: "POST hooks.asana.com/… · last err 1h ago" },
    { name: "Webhook · pages.local/incidents", type: "webhook",used: 1, last: "—",     status: "muted",detail: "Disabled by maya.s 2d ago" },
  ];

  const integrations = [
    { id: "slack",     name: "Slack",       desc: "Send rich messages to channels", status: "connected", count: 4, color: "#611f69" },
    { id: "pagerduty", name: "PagerDuty",   desc: "Page on-call responders",        status: "connected", count: 3, color: "#06ac38" },
    { id: "opsgenie",  name: "Opsgenie",    desc: "Atlassian incident alerts",      status: "not-connected", count: 0, color: "#172b4d" },
    { id: "email",     name: "Email",       desc: "Send via SMTP relay",            status: "connected", count: 1, color: "var(--fg-2)" },
    { id: "webhook",   name: "Webhook",     desc: "POST to any URL with custom body",status: "connected", count: 2, color: "var(--accent-violet)" },
    { id: "teams",     name: "MS Teams",    desc: "Post to a Teams channel",        status: "not-connected", count: 0, color: "#4b53bc" },
    { id: "twilio",    name: "Twilio SMS",  desc: "Send SMS alerts to phone numbers",status: "not-connected", count: 0, color: "#f22f46" },
    { id: "jira",      name: "Jira",         desc: "Auto-create tickets on trigger", status: "connected", count: 1, color: "#2563eb" },
  ];

  const policies = [
    { name: "Production · P1 → page",         match: "priority:P1 AND env:prod",          actions: ["@pagerduty-by-team", "@slack-oncall"], hits: 18, lastUsed: "8m ago",  on: true },
    { name: "Payments team → #oncall-payments", match: "team:payments",                   actions: ["@slack-oncall-payments"],               hits: 142, lastUsed: "4m ago", on: true },
    { name: "Off-hours suppress P3",            match: "priority:P3 AND time:weekend",     actions: ["mute · 12h"],                            hits: 24, lastUsed: "1d ago",  on: true },
    { name: "Cost anomalies → #finops",          match: "type:anomaly AND tags:cost",       actions: ["@slack-finops"],                          hits: 6,  lastUsed: "5d ago",  on: true },
    { name: "CI flakiness → noop",                match: "team:ci",                          actions: ["muted"],                                  hits: 0,  lastUsed: "never",   on: false },
  ];

  const templates = [
    { name: "Default · concise",     desc: "Single line summary + link to monitor",            used: 9 },
    { name: "Payments · runbook",    desc: "Includes Payments-runbook link + on-call rotation", used: 4 },
    { name: "Cost anomaly",          desc: "Shows expected vs actual + savings tip",            used: 2 },
    { name: "Synthetic failure",     desc: "Includes screenshot + last passing version",        used: 1 },
  ];

  const typeIcon = { slack: "send", pagerduty: "bell", email: "user", webhook: "link-ext" };
  const typeColor = { slack: "#611f69", pagerduty: "#06ac38", email: "var(--fg-2)", webhook: "var(--accent-violet)" };

  return (
    <div className="page">
      {/* Title */}
      <div className="row">
        <button className="btn btn-ghost" onClick={() => go("monitors")}><Icon name="back" size={14}/>Monitors</button>
        <span className="muted">/</span>
        <span style={{ fontSize: 13, color: "var(--fg-0)", fontWeight: 600 }}>Notifications</span>
      </div>

      <div className="row" style={{ alignItems: "flex-end" }}>
        <div>
          <div className="page-title">Notifications</div>
          <div className="page-sub" style={{ marginTop: 4 }}>Manage channels, integrations, message templates, and routing policies</div>
        </div>
        <div className="spacer"/>
        <button className="btn"><Icon name="play" size={14}/>Test delivery</button>
        <button className="btn btn-primary"><Icon name="plus" size={14}/>New channel</button>
      </div>

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
        {[
          { l: "Channels",       v: channels.length, sub: "configured" },
          { l: "Integrations",   v: integrations.filter(i => i.status === "connected").length, sub: "connected" },
          { l: "Routing policies", v: policies.filter(p => p.on).length, sub: "active" },
          { l: "Deliveries (24h)", v: "284", sub: "+18 vs avg" },
          { l: "Failed deliveries", v: "2",  sub: "1 webhook timeout · 1 PagerDuty 429", color: "var(--warn-fg)" },
        ].map(k => (
          <div key={k.l} className="card" style={{ padding: 14 }}>
            <div className="card-sub" style={{ fontSize: 11.5 }}>{k.l}</div>
            <div className="stat-value" style={{ fontSize: 26, marginTop: 4, color: k.color || "var(--fg-0)" }}>{k.v}</div>
            <div className="muted" style={{ fontSize: 10.5, marginTop: 2 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <Tabs
        tabs={[
          { id: "channels",     label: "Channels",     badge: channels.length },
          { id: "integrations", label: "Integrations", badge: integrations.filter(i => i.status === "connected").length },
          { id: "policies",     label: "Routing policies", badge: policies.length },
          { id: "templates",    label: "Templates",    badge: templates.length },
        ]}
        active={tab} setActive={setTab}
      />

      {tab === "channels" && (
        <div className="card card-pad-lg" style={{ padding: 0, overflow: "hidden" }}>
          <div className="row" style={{ padding: "12px 18px", borderBottom: "1px solid var(--line-2)", justifyContent: "space-between" }}>
            <div className="search" style={{ width: 320, height: 30 }}>
              <Icon name="search" size={13} className="muted"/>
              <input placeholder="Search channels…"/>
            </div>
            <div className="row" style={{ gap: 6 }}>
              <button className="btn"><Icon name="filter" size={13}/>type: all</button>
              <button className="btn"><Icon name="filter" size={13}/>status: all</button>
            </div>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ paddingLeft: 18, width: 280 }}>Channel</th>
                <th>Type</th>
                <th>Detail</th>
                <th style={{ textAlign: "right" }}>Used by</th>
                <th>Last delivery</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {channels.map(c => (
                <tr key={c.name}>
                  <td style={{ paddingLeft: 18 }}>
                    <div className="row" style={{ gap: 8 }}>
                      <div style={{ width: 22, height: 22, borderRadius: 4, background: typeColor[c.type] + "22", color: typeColor[c.type], display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon name={typeIcon[c.type]} size={12}/>
                      </div>
                      <div>
                        <div className="mono" style={{ fontSize: 12.5, color: "var(--fg-0)", fontWeight: 500 }}>{c.name}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="mono" style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 3, background: typeColor[c.type] + "22", color: typeColor[c.type], textTransform: "uppercase" }}>{c.type}</span>
                  </td>
                  <td className="muted" style={{ fontSize: 11.5 }}>{c.detail}</td>
                  <td style={{ textAlign: "right" }}>
                    <span className="mono" style={{ fontVariantNumeric: "tabular-nums", color: "var(--fg-0)" }}>{c.used}</span>
                    <span className="muted" style={{ fontSize: 11 }}> monitors</span>
                  </td>
                  <td className="muted mono" style={{ fontSize: 11 }}>{c.last}</td>
                  <td style={{ textAlign: "right" }}>
                    <div className="row" style={{ gap: 4, justifyContent: "flex-end" }}>
                      <button className="btn btn-ghost" style={{ height: 24, padding: "0 8px", fontSize: 11 }}>Test</button>
                      <button className="btn btn-ghost" style={{ height: 24, padding: "0 8px", fontSize: 11 }}>Edit</button>
                      <Icon name="more" size={13} className="muted"/>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "integrations" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {integrations.map(it => (
            <div key={it.id} className="card card-pad-lg">
              <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                <div className="row" style={{ gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: it.color, color: "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14, fontWeight: 700 }}>{it.name[0]}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--fg-0)" }}>{it.name}</div>
                    <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{it.desc}</div>
                  </div>
                </div>
                {it.status === "connected"
                  ? <span className="badge ok"><span className="b-dot"/>connected</span>
                  : <span className="badge neutral">install</span>}
              </div>
              <div className="row" style={{ marginTop: 14, justifyContent: "space-between" }}>
                <div className="muted" style={{ fontSize: 11.5 }}>{it.count} channel{it.count !== 1 ? "s" : ""}</div>
                <button className={"btn " + (it.status === "connected" ? "btn-ghost" : "btn-primary")} style={{ height: 26 }}>
                  {it.status === "connected" ? "Configure" : "Install"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "policies" && (
        <div className="card card-pad-lg" style={{ padding: 0, overflow: "hidden" }}>
          <div className="row" style={{ padding: "12px 18px", borderBottom: "1px solid var(--line-2)", justifyContent: "space-between" }}>
            <div>
              <div className="card-title">Routing policies</div>
              <div className="card-sub" style={{ marginTop: 2 }}>Rules evaluated top-down · first match wins</div>
            </div>
            <button className="btn"><Icon name="plus" size={13}/>New policy</button>
          </div>
          <table className="tbl">
            <thead>
              <tr><th style={{ paddingLeft: 18 }}>Policy</th><th>Match</th><th>Action</th><th style={{ textAlign: "right" }}>Hits 30d</th><th>Last used</th><th>Enabled</th></tr>
            </thead>
            <tbody>
              {policies.map((p, i) => (
                <tr key={i} style={{ opacity: p.on ? 1 : 0.55 }}>
                  <td style={{ paddingLeft: 18 }}>
                    <div className="row" style={{ gap: 8 }}>
                      <span className="mono muted" style={{ fontSize: 11 }}>{(i+1).toString().padStart(2,"0")}</span>
                      <span style={{ fontSize: 12.5, color: "var(--fg-0)", fontWeight: 500 }}>{p.name}</span>
                    </div>
                  </td>
                  <td className="mono" style={{ fontSize: 11.5, color: "var(--fg-1)" }}>{p.match}</td>
                  <td>
                    <div className="row" style={{ gap: 4, flexWrap: "wrap" }}>
                      {p.actions.map((a, j) => (
                        <span key={j} className="mono" style={{ padding: "1px 7px", background: a.includes("mute") ? "var(--bg-inset)" : "var(--brand-tint)", color: a.includes("mute") ? "var(--fg-2)" : "var(--brand-deep)", borderRadius: 3, fontSize: 11 }}>{a}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }} className="mono">{p.hits}</td>
                  <td className="muted mono" style={{ fontSize: 11 }}>{p.lastUsed}</td>
                  <td>
                    <div style={{ display: "inline-flex", width: 30, height: 18, borderRadius: 10, background: p.on ? "var(--brand)" : "var(--bg-inset)", position: "relative", cursor: "pointer", transition: "background 120ms" }}>
                      <div style={{ position: "absolute", top: 2, left: p.on ? 14 : 2, width: 14, height: 14, borderRadius: "50%", background: "white", transition: "left 120ms", boxShadow: "0 1px 2px rgba(0,0,0,0.2)" }}/>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "templates" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {templates.map(t => (
            <div key={t.name} className="card card-pad-lg">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div className="card-title">{t.name}</div>
                <span className="muted mono" style={{ fontSize: 11 }}>{t.used} in use</span>
              </div>
              <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{t.desc}</div>
              <div style={{ marginTop: 12, padding: 12, background: "var(--bg-inset)", borderRadius: 6, border: "1px solid var(--line-2)" }}>
                <div className="mono" style={{ fontSize: 11.5, color: "var(--fg-1)", lineHeight: 1.5 }}>
                  {"{{#is_alert}}🚨 ALERT {{/is_alert}}{{#is_warning}}⚠️ WARN {{/is_warning}}"}<br/>
                  {"{{value}}{{units}} > {{threshold}}{{units}} for {{service.name}}"}<br/>
                  {"{{#is_alert}}@slack-oncall @pagerduty{{/is_alert}}"}
                </div>
              </div>
              <div className="row" style={{ marginTop: 12, justifyContent: "flex-end", gap: 6 }}>
                <button className="btn btn-ghost" style={{ height: 26 }}>Preview</button>
                <button className="btn btn-ghost" style={{ height: 26 }}>Edit</button>
              </div>
            </div>
          ))}
          <div className="card card-pad-lg" style={{ display: "flex", alignItems: "center", justifyContent: "center", border: "2px dashed var(--line)", background: "transparent", cursor: "pointer" }}>
            <div style={{ textAlign: "center" }}>
              <Icon name="plus" size={20} className="muted"/>
              <div style={{ fontSize: 13, fontWeight: 500, marginTop: 4 }}>New template</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   TRACE LIST — Datadog-style trace explorer (list + filters + histogram)
   ========================================================= */
function TraceListScreen({ go }) {
  const [tab, setTab] = useStateC("traces");
  const [selected, setSelected] = useStateC(null);
  const [filters, setFilters] = useStateC([
    { attr: "env",            op: ":", val: "prod",                     color: "var(--brand-deep)" },
    { attr: "service",        op: ":", val: "payment-svc",              color: "var(--err)" },
    { attr: "operation_name", op: ":", val: "POST /api/v2/checkout",    color: "var(--fg-2)" },
    { attr: "status",         op: ":", val: "error",                    color: "var(--err)" },
  ]);
  const [filtersOpen, setFiltersOpen] = useStateC(false);

  const tracesSchema = {
    quick: [
      { attr: "status",      op: ":", val: "error", icon: "alert", color: "var(--err)",     tint: "var(--err-soft)" },
      { attr: "duration",    op: ">", val: "1s",    icon: "clock", color: "var(--warn-fg)", tint: "var(--warn-soft)" },
      { attr: "duration",    op: ">", val: "5s",    icon: "clock", color: "var(--err)",     tint: "var(--err-soft)" },
      { attr: "service",     op: ":", val: "payment-svc", icon: "service" },
      { attr: "is_root_span",op: ":", val: "true",  icon: "trace" },
    ],
    groups: [
      { id: "common",  label: "Common",          icon: "filter",  desc: "Most used",         attrs: ["service", "operation_name", "status", "duration", "env"] },
      { id: "service", label: "Service",         icon: "service", attrs: ["service", "service.version", "operation_name", "resource"] },
      { id: "http",    label: "HTTP",            icon: "code",    attrs: ["http.method", "http.status_code", "http.route"] },
      { id: "infra",   label: "Infrastructure",  icon: "infra",   attrs: ["host", "host.az", "k8s.namespace", "k8s.pod.name"] },
      { id: "trace",   label: "Trace shape",     icon: "trace",   attrs: ["trace.id", "is_root_span", "span_count", "error_count"] },
      { id: "user",    label: "User & session",  icon: "user",    attrs: ["user.id", "user.tier", "session.id"] },
    ],
    attrs: {
      service:         { label: "service",          icon: "service", desc: "Service emitting the root span", values: [
        { v: "checkout-bff", c: 6420, color: "var(--brand-deep)" }, { v: "payment-svc", c: 1184, color: "var(--err)" }, { v: "search", c: 842 }, { v: "cart", c: 412 }, { v: "inventory", c: 218 },
      ]},
      "service.version":{ label: "service.version", icon: "tag",     values: [{ v: "8.12.0", c: 14228 }, { v: "8.11.4", c: 4218 }, { v: "canary", c: 218 }] },
      operation_name:  { label: "operation_name",   icon: "trace",   freeform: true, values: [
        { v: "POST /api/v2/checkout", c: 8421 }, { v: "GET /api/v2/orders/:id", c: 2410 }, { v: "POST /api/v2/payments", c: 1184 }, { v: "GET /api/v2/search", c: 842 }, { v: "GET /api/v2/cart", c: 612 },
      ]},
      resource:        { label: "resource",         icon: "tag",     freeform: true, values: [{ v: "/api/v2/checkout", c: 8421 }, { v: "/v1/charges", c: 1184 }, { v: "/api/v2/search", c: 842 }] },
      status:          { label: "status",           icon: "alert",   values: [
        { v: "ok",    c: 13728, color: "var(--ok)" }, { v: "warn",  c: 84,    color: "var(--warn-fg)" }, { v: "error", c: 412,   color: "var(--err)" },
      ]},
      duration:        { label: "duration",         icon: "clock",   desc: "Total trace duration", values: [
        { v: "< 100ms",     c: 8420 }, { v: "100ms – 1s",  c: 4214 }, { v: "1s – 5s",     c: 1208, color: "var(--warn-fg)" }, { v: "> 5s",        c: 158,  color: "var(--err)" },
      ]},
      env:             { label: "env",              icon: "globe",   values: [{ v: "prod", c: 14228, color: "var(--brand-deep)" }, { v: "staging", c: 1820 }, { v: "dev", c: 412 }] },
      "http.method":   { label: "http.method",      icon: "code",    values: [{ v: "GET", c: 8421 }, { v: "POST", c: 5418 }, { v: "DELETE", c: 18 }] },
      "http.status_code":{label: "http.status_code",icon: "code",    values: [{ v: "200", c: 13728, color: "var(--ok)" }, { v: "404", c: 218 }, { v: "408", c: 84, color: "var(--warn-fg)" }, { v: "500", c: 84, color: "var(--err)" }, { v: "504", c: 244, color: "var(--err)" }] },
      "http.route":    { label: "http.route",       icon: "code",    freeform: true, values: [{ v: "/api/v2/checkout", c: 8421 }, { v: "/api/v2/payments", c: 1184 }, { v: "/api/v2/orders/:id", c: 2410 }] },
      host:            { label: "host",             icon: "infra",   freeform: true, values: [{ v: "i-0a1b2c3d", c: 4218 }, { v: "i-0e4f5g6h", c: 6420 }, { v: "i-0a1b2c4d", c: 1184 }, { v: "i-0c8d9e0f", c: 842 }] },
      "host.az":       { label: "host.az",          icon: "infra",   values: [{ v: "us-east-1a", c: 9420 }, { v: "us-east-1b", c: 3420 }, { v: "us-east-1c", c: 1388 }] },
      "k8s.namespace": { label: "k8s.namespace",    icon: "infra",   values: [{ v: "checkout", c: 8421 }, { v: "platform", c: 4218 }, { v: "ingest", c: 1820 }] },
      "k8s.pod.name":  { label: "k8s.pod.name",     icon: "infra",   freeform: true, values: [{ v: "payment-svc-7d8c9-jvxk2", c: 84 }, { v: "checkout-bff-4f8a-2lk9q", c: 142 }] },
      "trace.id":      { label: "trace.id",         icon: "trace",   freeform: true, placeholder: "Paste a 16-char trace id", values: [{ v: "7b3f8a2e9c14d5b0", c: 1 }, { v: "9a14c2b8e7f10d3a", c: 1 }] },
      is_root_span:    { label: "is_root_span",     icon: "trace",   values: [{ v: "true", c: 14228 }, { v: "false", c: 0 }] },
      span_count:      { label: "span_count",       icon: "trace",   values: [{ v: "1 – 5",   c: 1820 }, { v: "5 – 10",  c: 6420 }, { v: "10 – 20", c: 4218 }, { v: "> 20",    c: 218 }] },
      error_count:     { label: "error_count",      icon: "alert",   values: [{ v: "0", c: 13728 }, { v: "1", c: 318, color: "var(--warn-fg)" }, { v: "≥ 2", c: 184, color: "var(--err)" }] },
      "user.id":       { label: "user.id",          icon: "user",    freeform: true, placeholder: "u_842919", values: [{ v: "u_842919", c: 14 }, { v: "u_842920", c: 8 }] },
      "user.tier":     { label: "user.tier",        icon: "user",    values: [{ v: "free", c: 8421 }, { v: "plus", c: 4218 }, { v: "enterprise", c: 412 }] },
      "session.id":    { label: "session.id",       icon: "user",    freeform: true, values: [] },
    },
  };

  const savedViews = [
    { label: "Payment 5xx — last hour",    count: "412 traces", apply: () => setFilters([{ attr: "service", op: ":", val: "payment-svc", color: "var(--err)" }, { attr: "status", op: ":", val: "error", color: "var(--err)" }]) },
    { label: "Slow checkout > 1s",          count: "1.2k traces", apply: () => setFilters([{ attr: "operation_name", op: ":", val: "POST /api/v2/checkout", color: "var(--fg-2)" }, { attr: "duration", op: ":", val: "1s – 5s", color: "var(--warn-fg)" }]) },
    { label: "Search 5xx",                  count: "84 traces",  apply: () => setFilters([{ attr: "service", op: ":", val: "search" }, { attr: "status", op: ":", val: "error", color: "var(--err)" }]) },
  ];
  const recents = [
    { attr: "service",        op: ":", val: "checkout-bff",        color: "var(--brand-deep)" },
    { attr: "duration",       op: ">", val: "1s",                  color: "var(--warn-fg)" },
    { attr: "http.status_code", op: ":", val: "504",               color: "var(--err)" },
  ];
  const presets = [
    { label: "Errors only",          filters: [{ attr: "status", op: ":", val: "error", color: "var(--err)" }] },
    { label: "Tail of the latency",  filters: [{ attr: "duration", op: ":", val: "> 5s", color: "var(--err)" }] },
    { label: "Payment timeouts",     filters: [{ attr: "service", op: ":", val: "payment-svc", color: "var(--err)" }, { attr: "http.status_code", op: ":", val: "504", color: "var(--err)" }] },
    { label: "Root spans only",      filters: [{ attr: "is_root_span", op: ":", val: "true", color: "var(--brand-deep)" }] },
  ];

  // Sample traces. Duration percent fills a row's duration bar.
  const traces = [
    { tid: "7b3f8a2e9c14d5b0", op: "POST /api/v2/checkout", svc: "checkout-bff", res: "/api/v2/checkout", status: "error", code: 504, dur: 4218, spans: 14, errors: 2, started: "10:42:18.421", host: "i-0a1b2c3d", user: "u_842919", color: "var(--err)" },
    { tid: "9a14c2b8e7f10d3a", op: "POST /api/v2/checkout", svc: "checkout-bff", res: "/api/v2/checkout", status: "ok",    code: 200, dur: 184,  spans: 11, errors: 0, started: "10:42:18.116", host: "i-0e4f5g6h", user: "u_842920", color: "var(--chart-1)" },
    { tid: "ab2f7e94d3c815a0", op: "POST /api/v2/checkout", svc: "checkout-bff", res: "/api/v2/checkout", status: "error", code: 504, dur: 4042, spans: 13, errors: 2, started: "10:42:17.218", host: "i-0a1b2c4d", user: "u_842921", color: "var(--err)" },
    { tid: "4f29ab57c8d3e190", op: "GET /api/v2/orders/:id", svc: "checkout-bff", res: "/api/v2/orders/:id", status: "ok",  code: 200, dur: 92,   spans: 8,  errors: 0, started: "10:42:17.011", host: "i-0e4f5g6h", user: "u_842918", color: "var(--chart-1)" },
    { tid: "1d8e3f9b4a7c20e5", op: "POST /api/v2/payments", svc: "payment-svc",  res: "/v1/charges",        status: "warn", code: 408, dur: 1208, spans: 9,  errors: 1, started: "10:42:16.802", host: "i-0a1b2c3d", user: "u_842917", color: "var(--warn)" },
    { tid: "8c2f1e974b3a06d2", op: "POST /api/v2/checkout", svc: "checkout-bff", res: "/api/v2/checkout", status: "ok",    code: 200, dur: 218,  spans: 11, errors: 0, started: "10:42:16.012", host: "i-0e4f5g6h", user: "u_842922", color: "var(--chart-1)" },
    { tid: "2e9a5fdc3b170e84", op: "GET /api/v2/search",    svc: "search",       res: "/api/v2/search",    status: "error",code: 500, dur: 3184, spans: 7,  errors: 1, started: "10:42:15.418", host: "i-0c8d9e0f", user: "u_842923", color: "var(--err)" },
    { tid: "5a8b3e2f9c1d4708", op: "POST /api/v2/checkout", svc: "checkout-bff", res: "/api/v2/checkout", status: "ok",    code: 200, dur: 412,  spans: 12, errors: 0, started: "10:42:14.918", host: "i-0e4f5g6h", user: "u_842924", color: "var(--chart-1)" },
    { tid: "f3a2c1b8e094d57e", op: "POST /api/v2/payments", svc: "payment-svc",  res: "/v1/charges",        status: "ok",   code: 200, dur: 142,  spans: 6,  errors: 0, started: "10:42:14.421", host: "i-0a1b2c3d", user: "u_842919", color: "var(--chart-1)" },
    { tid: "3c4e8a2b1f590d7c", op: "POST /api/v2/checkout", svc: "checkout-bff", res: "/api/v2/checkout", status: "error", code: 504, dur: 4096, spans: 14, errors: 3, started: "10:42:13.802", host: "i-0a1b2c4d", user: "u_842918", color: "var(--err)" },
    { tid: "7f8e1d2c9a3b5604", op: "GET /api/v2/cart",      svc: "cart",         res: "/api/v2/cart",      status: "ok",   code: 200, dur: 64,   spans: 5,  errors: 0, started: "10:42:13.418", host: "i-0d1e2f34", user: "u_842920", color: "var(--chart-1)" },
    { tid: "9b1f2e3d4c5a6708", op: "POST /api/v2/checkout", svc: "checkout-bff", res: "/api/v2/checkout", status: "warn", code: 408, dur: 1842, spans: 12, errors: 1, started: "10:42:12.918", host: "i-0e4f5g6h", user: "u_842925", color: "var(--warn)" },
  ];

  const maxDur = Math.max(...traces.map(t => t.dur));

  return (
    <div className="page" style={{ padding: 0, gap: 0, height: "calc(100vh - var(--header-h))" }}>
      {/* search bar */}
      <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--line)" }}>
        <div className="row" style={{ gap: 10 }}>
          <FilterSearchBar
            kind="traces"
            schema={tracesSchema}
            filters={filters}
            onAddFilter={(f) => setFilters(prev => [...prev, f])}
            onRemoveFilter={(i) => setFilters(prev => prev.filter((_, j) => j !== i))}
            onClearAll={() => setFilters([])}
            onOpenFiltersPage={() => setFiltersOpen(true)}
            savedViews={savedViews}
            recents={recents}
          />
          <button className="btn" onClick={() => setFiltersOpen(true)}>
            <Icon name="filter" size={14}/>All filters
            {filters.length > 0 && <span className="badge info" style={{ height: 16, padding: "0 6px", fontSize: 10, marginLeft: 2 }}>{filters.length}</span>}
          </button>
          <button className="btn"><Icon name="bookmark" size={14}/>Views</button>
          <button className="btn"><Icon name="share" size={14}/>Share</button>
          <button className="btn"><Icon name="export" size={14}/>Export</button>
        </div>
      </div>

      <FiltersPage
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        kind="traces"
        filters={filters}
        onApply={setFilters}
        schema={tracesSchema}
        presets={presets}
      />

      {/* trend strip */}
      <div style={{ padding: "14px 24px", borderBottom: "1px solid var(--line)", background: "var(--bg-inset)" }}>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
          <div className="row" style={{ gap: 18 }}>
            <div>
              <div className="stat-value" style={{ fontSize: 26 }}>14.2k</div>
              <div className="muted" style={{ fontSize: 11 }}>traces</div>
            </div>
            <div>
              <div className="stat-value" style={{ fontSize: 22, color: "var(--err)" }}>412</div>
              <div className="muted" style={{ fontSize: 11 }}>errors (2.9%)</div>
            </div>
            <div>
              <div className="stat-value" style={{ fontSize: 22 }}>184<span style={{ fontSize: 13, color: "var(--fg-3)", fontWeight: 500 }}> ms</span></div>
              <div className="muted" style={{ fontSize: 11 }}>p50</div>
            </div>
            <div>
              <div className="stat-value" style={{ fontSize: 22, color: "var(--warn-fg)" }}>1.2<span style={{ fontSize: 13, color: "var(--fg-3)", fontWeight: 500 }}> s</span></div>
              <div className="muted" style={{ fontSize: 11 }}>p95</div>
            </div>
            <div>
              <div className="stat-value" style={{ fontSize: 22, color: "var(--err)" }}>4.2<span style={{ fontSize: 13, color: "var(--fg-3)", fontWeight: 500 }}> s</span></div>
              <div className="muted" style={{ fontSize: 11 }}>p99</div>
            </div>
          </div>
          <div className="row">
            <span className="muted" style={{ fontSize: 11 }}>brushed: 10:30 — 10:42</span>
            <div className="seg">
              <div className="seg-opt active">5m</div>
              <div className="seg-opt">1h</div>
              <div className="seg-opt">2d</div>
            </div>
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <Bars seed={71} h={56} w={1200} n={48} color="var(--chart-1)" base={0.34} amp={0.36}/>
          {/* error overlay sparkline */}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <Bars seed={73} h={56} w={1200} n={48} color="var(--err)" base={0.08} amp={0.06}/>
          </div>
          <div style={{ position: "absolute", left: "62%", top: 0, bottom: 0, width: "8%", background: "rgba(59,130,246,0.12)", border: "1px solid var(--brand-2)", borderRadius: 3, pointerEvents: "none" }}/>
        </div>
      </div>

      {/* main split */}
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 360px", flex: 1, minHeight: 0 }}>
        {/* facets */}
        <div style={{ borderRight: "1px solid var(--line)", padding: "16px 16px", overflowY: "auto" }}>
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 6 }}>
            <div className="label-up">Facets</div>
            <Icon name="plus" size={12} className="muted"/>
          </div>
          {[
            { name: "Service", items: [["checkout-bff", 6420, true], ["payment-svc", 1184, true], ["search", 842, false], ["cart", 412, false], ["inventory", 218, false]] },
            { name: "Status", items: [["ok", 13728, true], ["warn", 84, false], ["error", 412, true]] },
            { name: "Resource", items: [["POST /api/v2/checkout", 8421, true], ["GET /api/v2/orders/:id", 2410, false], ["POST /api/v2/payments", 1184, false], ["GET /api/v2/search", 842, false], ["GET /api/v2/cart", 612, false]] },
            { name: "Duration", items: [["< 100ms", 8420, false], ["100ms – 1s", 4214, true], ["1s – 5s", 1208, true], ["> 5s", 158, true]] },
            { name: "HTTP code", items: [["200", 13728, true], ["408", 84, false], ["500", 84, true], ["504", 244, true]] },
          ].map(g => (
            <div key={g.name} style={{ marginTop: 16 }}>
              <div className="row" style={{ justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--fg-0)" }}>{g.name}</div>
                <Icon name="chevron-down" size={12} className="muted"/>
              </div>
              {g.items.map(([n, c, on]) => (
                <div key={n} className="row" style={{ justifyContent: "space-between", padding: "4px 0", fontSize: 11.5 }}>
                  <div className="row" style={{ gap: 6, flex: 1, minWidth: 0 }}>
                    <input type="checkbox" defaultChecked={on} style={{ accentColor: "var(--brand)" }}/>
                    <span className="mono" style={{ color: "var(--fg-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n}</span>
                  </div>
                  <span className="muted mono" style={{ fontSize: 10.5 }}>{c.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* table */}
        <div style={{ overflowY: "auto" }}>
          <div className="row" style={{ padding: "8px 18px", borderBottom: "1px solid var(--line-2)", justifyContent: "space-between", background: "var(--bg-canvas)", position: "sticky", top: 0, zIndex: 1 }}>
            <div className="muted" style={{ fontSize: 11 }}>Showing 12 of 14,228 traces · live tail paused</div>
            <div className="row" style={{ gap: 6 }}>
              <button className="btn btn-ghost" style={{ height: 26 }}>Sort · duration</button>
              <button className="btn btn-ghost" style={{ height: 26 }}>Columns</button>
            </div>
          </div>
          <table className="tbl" style={{ tableLayout: "fixed" }}>
            <thead>
              <tr>
                <th style={{ width: 110, paddingLeft: 18 }}>Time</th>
                <th>Operation</th>
                <th style={{ width: 90, textAlign: "right" }}>Duration</th>
                <th style={{ width: "26%" }}>Latency bar</th>
                <th style={{ width: 80 }}>Status</th>
                <th style={{ width: 56, textAlign: "right" }}>Spans</th>
                <th style={{ width: 18 }}></th>
              </tr>
            </thead>
            <tbody>
              {traces.map((t, i) => {
                const pct = (t.dur / maxDur) * 100;
                return (
                  <tr key={t.tid} onClick={() => go("trace", { id: t.tid })} style={{ cursor: "pointer", background: selected === t.tid ? "var(--brand-tint)" : "transparent" }}
                      onMouseEnter={() => setSelected(t.tid)}>
                    <td style={{ paddingLeft: 18 }}>
                      <div className="mono" style={{ fontSize: 11.5, color: "var(--fg-1)" }}>{t.started}</div>
                      <div className="mono muted" style={{ fontSize: 10.5 }}>{t.tid.slice(0,10)}…</div>
                    </td>
                    <td>
                      <div className="row" style={{ gap: 8 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: t.color, flexShrink: 0 }}/>
                        <div style={{ minWidth: 0 }}>
                          <div className="mono" style={{ color: "var(--fg-0)", fontSize: 12.5, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.op}</div>
                          <div className="muted mono" style={{ fontSize: 11 }}>{t.svc} · {t.user}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span className="mono" style={{ fontVariantNumeric: "tabular-nums", color: t.dur > 1000 ? "var(--err)" : t.dur > 500 ? "var(--warn-fg)" : "var(--fg-1)", fontWeight: 600, fontSize: 12.5 }}>
                        {t.dur >= 1000 ? (t.dur/1000).toFixed(2) + " s" : t.dur + " ms"}
                      </span>
                    </td>
                    <td>
                      <div style={{ height: 8, borderRadius: 3, background: "var(--bg-inset)", overflow: "hidden" }}>
                        <div style={{ width: pct + "%", height: "100%", background: t.color, opacity: 0.85 }}/>
                      </div>
                    </td>
                    <td>
                      <span className={"badge " + (t.status === "error" ? "err" : t.status === "warn" ? "warn" : "ok")}>
                        <span className="b-dot"/>{t.code}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span className="mono" style={{ fontSize: 12 }}>{t.spans}</span>
                      {t.errors > 0 && <span className="sev-chip error" style={{ marginLeft: 4, minWidth: 0, padding: "1px 4px", fontSize: 9.5 }}>{t.errors}</span>}
                    </td>
                    <td><Icon name="chevron-right" size={13} className="muted"/></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* preview / quick-look */}
        <div style={{ borderLeft: "1px solid var(--line)", padding: 18, overflowY: "auto" }}>
          {(() => {
            const t = traces.find(x => x.tid === selected) || traces[0];
            return (
              <>
                <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
                  <div className="row">
                    <span className={"badge " + (t.status === "error" ? "err" : t.status === "warn" ? "warn" : "ok")}><span className="b-dot"/>{t.code}</span>
                    <span className="mono muted" style={{ fontSize: 11 }}>{t.tid.slice(0,12)}…</span>
                  </div>
                  <button className="btn" onClick={() => go("trace", { id: t.tid })}><Icon name="link-ext" size={13}/>Open trace</button>
                </div>
                <div className="mono" style={{ fontSize: 15, fontWeight: 600, color: "var(--fg-0)" }}>{t.op}</div>
                <div className="muted" style={{ fontSize: 12, marginTop: 3 }}>{t.svc} · {t.host}</div>

                <div className="hairline" style={{ margin: "14px -2px" }}/>

                <div className="label-up" style={{ marginBottom: 8 }}>Timing</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
                    <div className="muted" style={{ fontSize: 10.5 }}>Duration</div>
                    <div className="mono" style={{ fontSize: 16, fontWeight: 700, color: t.dur > 1000 ? "var(--err)" : "var(--fg-0)" }}>{t.dur >= 1000 ? (t.dur/1000).toFixed(2) + " s" : t.dur + " ms"}</div>
                  </div>
                  <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
                    <div className="muted" style={{ fontSize: 10.5 }}>Spans · errors</div>
                    <div className="mono" style={{ fontSize: 16, fontWeight: 700, color: "var(--fg-0)" }}>{t.spans} · <span style={{ color: t.errors > 0 ? "var(--err)" : "var(--ok)" }}>{t.errors}</span></div>
                  </div>
                </div>

                <div className="label-up" style={{ marginTop: 16, marginBottom: 8 }}>Attributes</div>
                <div style={{ borderRadius: 6, border: "1px solid var(--line-2)" }}>
                  {[
                    ["service",         t.svc],
                    ["resource",        t.res],
                    ["http.status",     String(t.code)],
                    ["http.method",     t.op.split(" ")[0]],
                    ["host",            t.host],
                    ["user.id",         t.user],
                    ["env",             "prod"],
                    ["az",              "us-east-1a"],
                  ].map(([k, v], i, arr) => (
                    <div key={k} className="row" style={{ padding: "6px 10px", borderBottom: i < arr.length-1 ? "1px solid var(--line-2)" : 0, fontSize: 11.5 }}>
                      <span className="muted mono" style={{ minWidth: 110 }}>{k}</span>
                      <span className="mono" style={{ color: "var(--fg-0)" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   TRACE WATERFALL
   ========================================================= */
function TraceScreen({ go }) {
  const [selectedSpan, setSelectedSpan] = useStateC(7);
  const [vizTab, setVizTab] = useStateC("waterfall");

  // span tree (flattened with depth)
  const spans = [
    { id: 0, d: 0,  name: "POST /api/v2/checkout",     svc: "checkout-bff", kind: "server",  dur: 4218, off: 0,    err: false, color: "var(--chart-1)" },
    { id: 1, d: 1,  name: "auth.validateSession",      svc: "user-profile", kind: "client",  dur: 12,   off: 4,    err: false, color: "var(--chart-2)" },
    { id: 2, d: 1,  name: "cart.load",                 svc: "cart",         kind: "client",  dur: 18,   off: 22,   err: false, color: "var(--chart-3)" },
    { id: 3, d: 2,  name: "redis.GET cart:u_842919",   svc: "cart",         kind: "client",  dur: 4,    off: 28,   err: false, color: "var(--err)",   sub: "redis" },
    { id: 4, d: 2,  name: "SELECT cart_items WHERE user_id=$1", svc: "cart",kind: "client",  dur: 8,    off: 32,   err: false, color: "var(--chart-1)", sub: "postgres" },
    { id: 5, d: 1,  name: "inventory.reserve",         svc: "inventory",    kind: "client",  dur: 32,   off: 44,   err: false, color: "var(--chart-4)" },
    { id: 6, d: 1,  name: "tax.calculate",             svc: "tax-calc",     kind: "client",  dur: 142,  off: 82,   err: false, color: "var(--chart-5)" },
    { id: 7, d: 1,  name: "payments.charge",           svc: "payment-svc",  kind: "client",  dur: 3998, off: 220,  err: true,  color: "var(--err)" },
    { id: 8, d: 2,  name: "stripe.charges.create",     svc: "payment-svc",  kind: "client",  dur: 3984, off: 222,  err: true,  color: "var(--err)",   sub: "http" },
    { id: 9, d: 3,  name: "tcp.connect api.stripe.com",svc: "payment-svc",  kind: "internal",dur: 18,   off: 224,  err: false, color: "var(--fg-mute)" },
    { id: 10,d: 3,  name: "tls.handshake",             svc: "payment-svc",  kind: "internal",dur: 42,   off: 244,  err: false, color: "var(--fg-mute)" },
    { id: 11,d: 3,  name: "http.send /v1/charges",     svc: "payment-svc",  kind: "internal",dur: 3920, off: 286,  err: true,  color: "var(--err)" },
    { id: 12,d: 1,  name: "audit.log",                 svc: "audit",        kind: "producer",dur: 8,    off: 4210, err: false, color: "var(--chart-2)" },
  ];
  const totalDur = 4218;

  // Service color map
  const svcs = ["checkout-bff","user-profile","cart","inventory","tax-calc","payment-svc","audit"];
  const svcColor = { "checkout-bff":"var(--chart-1)","user-profile":"var(--chart-2)","cart":"var(--chart-3)","inventory":"var(--chart-4)","tax-calc":"var(--accent-violet-2)","payment-svc":"var(--err)","audit":"var(--chart-2)" };

  // Service time breakdown (% of total trace time spent in each service, ordered)
  const svcBreakdown = [
    { svc: "payment-svc",   ms: 3920, pct: 92.9 },
    { svc: "tax-calc",       ms: 142,  pct: 3.4 },
    { svc: "inventory",      ms: 32,   pct: 0.8 },
    { svc: "cart",           ms: 18,   pct: 0.4 },
    { svc: "user-profile",   ms: 12,   pct: 0.3 },
    { svc: "checkout-bff",   ms: 94,   pct: 2.2 },
  ];

  // Phase breakdown (where time was spent)
  const phaseBreakdown = [
    { name: "wait (network)", ms: 3920, pct: 92.9, color: "var(--err)" },
    { name: "db",              ms: 142,  pct: 3.4,  color: "var(--chart-1)" },
    { name: "cpu",             ms: 84,   pct: 2.0,  color: "var(--accent-violet)" },
    { name: "cache",           ms: 32,   pct: 0.8,  color: "var(--ok)" },
    { name: "other",           ms: 40,   pct: 0.9,  color: "var(--fg-mute)" },
  ];

  const criticalPathIds = new Set([0, 7, 8, 11]);
  const [showCriticalOnly, setShowCriticalOnly] = useStateC(false);
  const [spanFilter, setSpanFilter] = useStateC("");

  const visibleSpans = spans.filter(s =>
    (!showCriticalOnly || criticalPathIds.has(s.id)) &&
    (!spanFilter || s.name.toLowerCase().includes(spanFilter.toLowerCase()) || s.svc.toLowerCase().includes(spanFilter.toLowerCase()))
  );

  const sel = spans[selectedSpan];

  return (
    <div className="page" style={{ padding: 0, gap: 0, height: "calc(100vh - var(--header-h))", display: "grid", gridTemplateColumns: "1fr 460px", gridTemplateRows: "auto auto 1fr" }}>
      {/* Trace header */}
      <div style={{ gridColumn: "1 / -1", padding: "16px 24px", borderBottom: "1px solid var(--line)" }}>
        <div className="row" style={{ gap: 12, alignItems: "center" }}>
          <button className="btn btn-ghost" onClick={() => go("traceList")}><Icon name="back" size={14}/>Traces</button>
          <div>
            <div className="row" style={{ alignItems: "baseline", gap: 10 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: "var(--fg-0)" }}>POST  /api/v2/checkout</span>
              <span className="badge err"><span className="b-dot"/>error</span>
              <span className="badge neutral">prod</span>
              <span className="badge neutral">us-east-1</span>
            </div>
            <div className="row" style={{ gap: 14, marginTop: 4 }}>
              <span className="mono muted" style={{ fontSize: 12 }}>7b3f8a2e9c14d5b0…</span>
              <span className="muted" style={{ fontSize: 12 }}>·  4.218 s  ·  14 spans  ·  7 services  ·  2 errors</span>
            </div>
          </div>
          <div className="spacer"/>
          <button className="btn"><Icon name="more" size={14}/></button>
          <button className="btn"><Icon name="share" size={14}/>Share</button>
          <button className="btn btn-icon"><Icon name="link-ext" size={14}/></button>
        </div>
      </div>

      {/* Trace summary strip: service breakdown + phase breakdown */}
      <div style={{ gridColumn: "1 / -1", padding: "14px 24px", borderBottom: "1px solid var(--line)", background: "var(--bg-inset)", display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr", gap: 28 }}>
        <div>
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
            <span className="label-up">Service time · stacked</span>
            <span className="muted" style={{ fontSize: 11 }}>where the time went</span>
          </div>
          <div style={{ display: "flex", height: 14, borderRadius: 4, overflow: "hidden", background: "var(--bg-card)" }}>
            {svcBreakdown.map(s => (
              <div key={s.svc} style={{ width: s.pct + "%", background: svcColor[s.svc] || "var(--fg-mute)" }} title={`${s.svc} · ${s.ms} ms (${s.pct}%)`}/>
            ))}
          </div>
          <div className="row" style={{ flexWrap: "wrap", gap: 10, marginTop: 8 }}>
            {svcBreakdown.slice(0, 4).map(s => (
              <div key={s.svc} className="row" style={{ gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: svcColor[s.svc] }}/>
                <span className="mono" style={{ fontSize: 11, color: "var(--fg-1)" }}>{s.svc}</span>
                <span className="muted mono" style={{ fontSize: 11 }}>{s.pct.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
            <span className="label-up">Phase</span>
            <span className="muted" style={{ fontSize: 11 }}>request shape</span>
          </div>
          <div style={{ display: "flex", height: 14, borderRadius: 4, overflow: "hidden", background: "var(--bg-card)" }}>
            {phaseBreakdown.map((p, i) => (
              <div key={i} style={{ width: p.pct + "%", background: p.color }} title={`${p.name} · ${p.ms} ms`}/>
            ))}
          </div>
          <div className="row" style={{ flexWrap: "wrap", gap: 10, marginTop: 8 }}>
            {phaseBreakdown.slice(0, 3).map((p, i) => (
              <div key={i} className="row" style={{ gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color }}/>
                <span style={{ fontSize: 11, color: "var(--fg-1)" }}>{p.name}</span>
                <span className="muted mono" style={{ fontSize: 11 }}>{p.pct.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
            <span className="label-up">Hot spans · top 3</span>
            <span className="muted" style={{ fontSize: 11 }}>by self time</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {[
              { name: "http.send /v1/charges", svc: "payment-svc", ms: 3920, color: "var(--err)" },
              { name: "tax.calculate",          svc: "tax-calc",    ms: 142,  color: "var(--accent-violet-2)" },
              { name: "stripe.tls.handshake",   svc: "payment-svc", ms: 42,   color: "var(--err)" },
            ].map((h, i) => (
              <div key={i} className="row" style={{ gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: h.color, flexShrink: 0 }}/>
                <span className="mono" style={{ fontSize: 11, color: "var(--fg-0)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.name}</span>
                <span className="muted mono" style={{ fontSize: 10.5, marginLeft: "auto" }}>{h.ms >= 1000 ? (h.ms/1000).toFixed(2)+"s" : h.ms+"ms"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Waterfall side */}
      <div style={{ overflowY: "auto", borderRight: "1px solid var(--line)" }}>
        <div className="row" style={{ padding: "10px 18px", borderBottom: "1px solid var(--line)", justifyContent: "space-between" }}>
          <div className="row">
            <span className="muted" style={{ fontSize: 12 }}>{visibleSpans.length} of 14 spans</span>
            <div className="search" style={{ height: 26, width: 240 }}>
              <Icon name="search" size={12} className="muted"/>
              <input placeholder="Filter spans…" value={spanFilter} onChange={e=>setSpanFilter(e.target.value)} style={{ fontSize: 12 }}/>
            </div>
          </div>
          <div className="row" style={{ gap: 4 }}>
            <button className={"btn" + (showCriticalOnly ? "" : " btn-ghost")} style={{ height: 26 }} onClick={() => setShowCriticalOnly(v => !v)}>
              <Icon name="zap" size={12}/>Critical path
            </button>
            <button className="btn btn-ghost" style={{ height: 26 }}>Group · service</button>
          </div>
        </div>

        {/* time ruler */}
        <div style={{ display: "grid", gridTemplateColumns: "28px minmax(260px, 1fr) 70px 1fr 90px", padding: "8px 18px", gap: 12, alignItems: "center", borderBottom: "1px solid var(--line-2)", fontSize: 10.5, color: "var(--fg-mute)", letterSpacing: "0.08em", fontWeight: 600, textTransform: "uppercase" }}>
          <div></div>
          <div>Span</div>
          <div style={{ textAlign: "right" }}>Duration</div>
          <div style={{ position: "relative" }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <span>0 ms</span><span>1.0 s</span><span>2.0 s</span><span>3.0 s</span><span>4.2 s</span>
            </div>
          </div>
          <div></div>
        </div>

        {/* spans */}
        {visibleSpans.map(s => {
          const left = (s.off / totalDur) * 100;
          const width = Math.max(0.4, (s.dur / totalDur) * 100);
          const indent = s.d * 14;
          const onCritical = criticalPathIds.has(s.id);
          return (
            <div key={s.id} className={"span-row" + (selectedSpan === s.id ? " selected" : "")} onClick={() => setSelectedSpan(s.id)}
                 style={{ background: selectedSpan === s.id ? "var(--brand-tint)" : (onCritical ? "color-mix(in oklab, var(--err) 3%, transparent)" : "transparent") }}>
              <div className="row" style={{ paddingLeft: indent, gap: 4 }}>
                {s.d > 0 && <span className="muted" style={{ fontSize: 9 }}>{"┗".repeat(1)}</span>}
                <span className="b-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: svcColor[s.svc] || s.color }}/>
              </div>
              <div style={{ minWidth: 0, paddingLeft: indent }}>
                <div className="row" style={{ gap: 6 }}>
                  <span className="mono" style={{ color: "var(--fg-0)", fontSize: 12, fontWeight: s.err ? 600 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</span>
                  {s.err && <span className="sev-chip error" style={{ minWidth: 0, padding: "1px 5px" }}>ERR</span>}
                  {onCritical && !s.err && <span className="badge info" style={{ height: 14, padding: "0 5px", fontSize: 9.5 }}>critical</span>}
                </div>
                <div className="muted mono" style={{ fontSize: 10.5, marginTop: 1 }}>{s.svc}{s.sub ? " · " + s.sub : ""}{s.kind ? " · " + s.kind : ""}</div>
              </div>
              <div className="mono" style={{ textAlign: "right", fontSize: 11.5, fontVariantNumeric: "tabular-nums", color: s.err ? "var(--err)" : "var(--fg-1)" }}>
                {s.dur >= 1000 ? (s.dur/1000).toFixed(2) + " s" : s.dur + " ms"}
              </div>
              <div className="span-bar">
                <div className="bar" style={{ left: left + "%", width: width + "%", background: s.color, opacity: s.err ? 1 : 0.85 }}/>
                {s.err && (
                  <div style={{ position: "absolute", left: `calc(${left + width - 0.5}% - 6px)`, top: -2, width: 12, height: 12, borderRadius: "50%", background: "var(--err)", border: "2px solid var(--bg-card)" }}/>
                )}
              </div>
              <div style={{ fontSize: 10.5, color: "var(--fg-3)", textAlign: "right" }}>
                {s.d === 0 ? "root" : "child"}
              </div>
            </div>
          );
        })}

        {/* services row */}
        <div style={{ padding: "16px 18px", borderTop: "1px solid var(--line)" }}>
          <div className="label-up" style={{ marginBottom: 8 }}>Services in this trace</div>
          <div className="row" style={{ flexWrap: "wrap", gap: 6 }}>
            {svcs.map(s => (
              <span key={s} className="row" style={{ gap: 6, padding: "4px 10px", border: "1px solid var(--line)", borderRadius: 14, background: "var(--bg-card)", fontSize: 11.5 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: svcColor[s] }}/>
                <span className="mono">{s}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right pane: span detail */}
      <div style={{ overflowY: "auto", padding: 20, background: "var(--bg-canvas)" }}>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div className="row" style={{ gap: 6 }}>
              {sel.err && <span className="sev-chip error">ERROR</span>}
              {!sel.err && <span className="sev-chip info">SPAN</span>}
              <span className="mono" style={{ fontSize: 11.5, color: "var(--fg-2)" }}>span {sel.id}</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 8, color: "var(--fg-0)" }} className="mono">{sel.name}</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 3 }}>{sel.svc} · {sel.kind}{sel.sub ? " · " + sel.sub : ""}</div>
          </div>
          <button className="btn btn-icon"><Icon name="x" size={14}/></button>
        </div>

        <div className="tab-bar" style={{ marginBottom: 14 }}>
          <div className="tab active">Info</div>
          <div className="tab">Logs <span className="badge neutral" style={{ height: 16, fontSize: 10, padding: "0 5px" }}>3</span></div>
        </div>

        {/* Where this happens */}
        <div className="label-up" style={{ marginBottom: 6 }}>Where this happens</div>
        <div style={{ background: "var(--bg-inset)", borderRadius: 8, padding: "10px 12px", marginBottom: 16 }}>
          {[
            { name: "POST /api/v2/checkout", svc: "checkout-bff", curr: false },
            { name: "payments.charge", svc: "payment-svc", curr: false },
            { name: "stripe.charges.create", svc: "payment-svc", curr: false },
            { name: "http.send /v1/charges", svc: "payment-svc", curr: true },
          ].map((a, i) => (
            <div key={i} className="row" style={{ gap: 8, padding: "4px 0" }}>
              <span className="muted mono" style={{ fontSize: 10, minWidth: 16 }}>{"└".repeat(i)}</span>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: svcColor[a.svc] || "var(--fg-mute)" }}/>
              <span className="mono" style={{ fontSize: 12, color: a.curr ? "var(--brand-deep)" : "var(--fg-0)", fontWeight: a.curr ? 600 : 400 }}>{a.name}</span>
              <span className="muted mono" style={{ fontSize: 10.5 }}>· {a.svc}</span>
            </div>
          ))}
        </div>

        {/* Timing */}
        <div className="label-up" style={{ marginBottom: 6 }}>Timing</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
          {[
            ["Duration", sel.dur >= 1000 ? (sel.dur/1000).toFixed(3) + " s" : sel.dur + " ms"],
            ["Start offset", sel.off + " ms"],
            ["Self time", sel.id === 7 ? "3.92 s" : (sel.dur - 4) + " ms"],
            ["Child time", sel.id === 7 ? "60 ms" : "0 ms"],
          ].map(([k, v]) => (
            <div key={k} style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
              <div className="muted" style={{ fontSize: 11 }}>{k}</div>
              <div className="mono" style={{ fontSize: 14, fontWeight: 600, color: "var(--fg-0)", marginTop: 2 }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Self-vs-child bar */}
        <div className="muted" style={{ fontSize: 11, marginBottom: 6 }}>Self vs child</div>
        <div style={{ display: "flex", height: 8, borderRadius: 3, overflow: "hidden", marginBottom: 16, background: "var(--bg-inset)" }}>
          <div style={{ width: "98.5%", background: sel.err ? "var(--err)" : "var(--chart-1)" }}/>
          <div style={{ width: "1.5%", background: "var(--fg-mute)" }}/>
        </div>

        {/* Error */}
        {sel.err && (
          <>
            <div className="label-up" style={{ marginBottom: 6, color: "var(--err)" }}>Error</div>
            <div style={{ background: "color-mix(in oklab, var(--err) 6%, var(--bg-card))", border: "1px solid color-mix(in oklab, var(--err) 30%, var(--line))", padding: 12, borderRadius: 8, marginBottom: 16 }}>
              <div className="mono" style={{ fontSize: 12.5, color: "var(--err-fg)", fontWeight: 600 }}>ConnectionResetError</div>
              <div className="mono" style={{ fontSize: 12, color: "var(--fg-1)", marginTop: 6, lineHeight: 1.5 }}>
                stripe API socket closed unexpectedly during /v1/charges (request_id=7b3f8a)
              </div>
              <div className="mono" style={{ fontSize: 11.5, color: "var(--fg-3)", marginTop: 8, lineHeight: 1.6 }}>
                at HttpClient.send (lib/http_client.rb:142)<br/>
                at Stripe::Charge.create (vendor/stripe/charge.rb:38)<br/>
                at PaymentsController#charge (app/controllers/payments_controller.rb:84)
              </div>
            </div>
          </>
        )}

        {/* Attributes */}
        <div className="label-up" style={{ marginBottom: 6 }}>Attributes</div>
        <div style={{ borderRadius: 6, border: "1px solid var(--line-2)", marginBottom: 16 }}>
          {[
            ["http.url", "https://api.stripe.com/v1/charges"],
            ["http.method", "POST"],
            ["http.status_code", "—"],
            ["http.response_content_length", "0 B"],
            ["net.peer.name", "api.stripe.com"],
            ["net.peer.port", "443"],
            ["retry.count", "3"],
            ["timeout.ms", "3000"],
          ].map(([k, v], i, arr) => (
            <div key={k} className="row" style={{ padding: "7px 10px", borderBottom: i < arr.length-1 ? "1px solid var(--line-2)" : 0, fontSize: 11.5 }}>
              <span className="muted mono" style={{ minWidth: 170 }}>{k}</span>
              <span className="mono" style={{ color: "var(--fg-0)" }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Logs in this span */}
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 6 }}>
          <span className="label-up">Logs in this span <span className="badge neutral" style={{ height: 14, padding: "0 5px", fontSize: 9.5 }}>3</span></span>
          <a className="muted" style={{ fontSize: 11, cursor: "pointer", color: "var(--brand-deep)" }} onClick={() => go("logs")}>open in logs →</a>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            { sev: "ERROR", ts: "10:42:18.388", msg: "ConnectionResetError: stripe API socket closed unexpectedly during /v1/charges" },
            { sev: "WARN",  ts: "10:42:17.842", msg: "Circuit breaker for stripe.charges entering half-open state (cooldown 12s)" },
            { sev: "INFO",  ts: "10:42:14.421", msg: "charging $184.20 via stripe.charges.create idempotency_key=ik_7b3f8a…" },
          ].map((l, i) => (
            <div key={i} className="row" style={{ alignItems: "flex-start", gap: 8, padding: "6px 8px", borderRadius: 4, background: "var(--bg-inset)" }}>
              <div className={"sev-gutter " + l.sev.toLowerCase()} style={{ minHeight: 30 }}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="row" style={{ gap: 6, marginBottom: 2 }}>
                  <span className={"sev-chip " + l.sev.toLowerCase()}>{l.sev}</span>
                  <span className="mono muted" style={{ fontSize: 10.5 }}>{l.ts}</span>
                </div>
                <div className="mono" style={{ fontSize: 11.5, color: "var(--fg-0)", lineHeight: 1.4 }}>{l.msg}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MonitorsScreen, MonitorDetailScreen, NewMonitorScreen, NotificationsScreen, TraceListScreen, TraceScreen });
