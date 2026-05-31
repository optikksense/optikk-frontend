/* global React, Icon, AreaSpark, MiniSpark, Bars, PageHeader, Tabs, seededWave */
const { useState: useStateA, useMemo: useMemoA } = React;

/* =========================================================
   OVERVIEW — Datadog-style "everything at a glance" landing page
   ========================================================= */
function OverviewScreen({ go }) {
  const services = [
    { id: "checkout-bff",  status: "ok",   rps: 26410, err: 0.04, p99: 92,  team: "payments" },
    { id: "search",        status: "err",  rps: 32140, err: 1.92, p99: 318, team: "discovery" },
    { id: "payment-svc",   status: "warn", rps: 14820, err: 0.42, p99: 184, team: "payments" },
    { id: "inventory",     status: "ok",   rps: 12080, err: 0.04, p99: 78,  team: "shopping" },
    { id: "cart",          status: "ok",   rps: 8920,  err: 0.08, p99: 142, team: "shopping" },
    { id: "user-profile",  status: "ok",   rps: 6420,  err: 0.06, p99: 88,  team: "identity" },
    { id: "tax-calc",      status: "ok",   rps: 5120,  err: 0.14, p99: 142, team: "payments" },
    { id: "shipping-rates",status: "warn", rps: 4810,  err: 0.20, p99: 218, team: "logistics" },
    { id: "notifications", status: "ok",   rps: 2120,  err: 0.12, p99: 64,  team: "messaging" },
    { id: "fraud-detect",  status: "warn", rps: 1820,  err: 0.42, p99: 412, team: "trust" },
    { id: "audit-trail",   status: "ok",   rps: 1240,  err: 0.0,  p99: 32,  team: "compliance" },
    { id: "loyalty-svc",   status: "ok",   rps: 840,   err: 0.01, p99: 48,  team: "growth" },
    { id: "geo-ip",        status: "ok",   rps: 620,   err: 0.0,  p99: 18,  team: "platform" },
    { id: "feature-flags", status: "ok",   rps: 520,   err: 0.0,  p99: 12,  team: "platform" },
    { id: "session-svc",   status: "ok",   rps: 412,   err: 0.0,  p99: 22,  team: "identity" },
  ];
  const statusColor = { ok: "var(--ok)", warn: "var(--warn)", err: "var(--err)" };

  return (
    <div className="page">
      {/* Title */}
      <div className="row" style={{ alignItems: "flex-end", gap: 16 }}>
        <div>
          <div className="row" style={{ alignItems: "baseline", gap: 12 }}>
            <div className="page-title">Overview</div>
            <span className="badge warn"><span className="b-dot"/>3 services degraded</span>
            <span className="badge err"><span className="b-dot"/>2 incidents</span>
          </div>
          <div className="page-sub" style={{ marginTop: 4 }}>My-Organization · production · 15 services · 34 hosts</div>
        </div>
        <div className="spacer"/>
      </div>

      {/* Hero KPI strip — 4 tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {[
          { label: "Requests",     value: "123.9k", unit: "rps total", delta: "+2.4%",  deltaCls: "down warn", seed: 11, color: "var(--chart-1)" },
          { label: "Error rate",   value: "0.61%",  unit: "of 123.9k rps",  delta: "+0.12%", deltaCls: "down warn", seed: 12, color: "var(--warn)" },
          { label: "Latency p99",  value: "218ms",  unit: "+24ms vs 1h",    delta: "+12.4%", deltaCls: "down",      seed: 13, color: "var(--err)" },
          { label: "Apdex",        value: "0.92",   unit: "target 0.95",    delta: "−0.03",  deltaCls: "down warn", seed: 14, color: "var(--warn)" },
        ].map(k => (
          <div key={k.label} className="card">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div className="card-sub" style={{ fontSize: 11.5 }}>{k.label}</div>
              <span className={"delta " + (k.deltaCls || "")} style={{ fontSize: 11 }}>{k.delta}</span>
            </div>
            <div className="stat-value" style={{ fontSize: 28, marginTop: 4 }}>{k.value}</div>
            <div className="muted" style={{ fontSize: 11, marginBottom: 6 }}>{k.unit}</div>
            <MiniSpark seed={k.seed} color={k.color} height={28} width={220}/>
          </div>
        ))}
      </div>

      {/* Performance area chart + Service health grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }}>
        <div className="card card-pad-lg">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div>
              <div className="card-title">System performance</div>
              <div className="card-sub" style={{ marginTop: 2 }}>requests / sec — total rate + error overlay · last 1 hour</div>
            </div>
            <div className="row">
              <div className="row" style={{ gap: 6 }}>
                <span style={{ width: 10, height: 2, background: "var(--chart-1)" }}/>
                <span className="muted" style={{ fontSize: 11 }}>requests</span>
              </div>
              <div className="row" style={{ gap: 6 }}>
                <span style={{ width: 10, height: 2, background: "var(--err)" }}/>
                <span className="muted" style={{ fontSize: 11 }}>errors</span>
              </div>
            </div>
          </div>
          <div style={{ position: "relative", marginTop: 14, height: 200 }}>
            <div style={{ position: "absolute", inset: 0 }}>
              <AreaSpark seed={31} color="var(--chart-1)" soft="var(--chart-1-soft)" height={200} base={0.5} amp={0.22}/>
            </div>
            <div style={{ position: "absolute", inset: 0, opacity: 0.85 }}>
              <AreaSpark seed={32} color="var(--err)" soft="transparent" height={200} base={0.18} amp={0.12}/>
            </div>
            {/* deploy marker */}
            <svg style={{ position: "absolute", inset: 0, pointerEvents: "none" }} width="100%" height="200" viewBox="0 0 100 200" preserveAspectRatio="none">
              <line x1="62" y1="0" x2="62" y2="200" stroke="var(--brand)" strokeWidth="1" strokeOpacity="0.55"/>
            </svg>
            <div style={{ position: "absolute", left: "62%", top: 4, fontSize: 10.5, color: "var(--brand-deep)", background: "var(--bg-card)", padding: "2px 6px", borderRadius: 3, border: "1px solid var(--brand-soft)", fontWeight: 600 }} className="mono">
              v8.12.0 · 18m ago
            </div>
          </div>
        </div>

        <div className="card card-pad-lg">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div>
              <div className="card-title">Service health</div>
              <div className="card-sub" style={{ marginTop: 2 }}>15 services · click any tile to inspect</div>
            </div>
            <div className="row" style={{ gap: 12 }}>
              <div className="row" style={{ gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--ok)" }}/><span className="muted" style={{ fontSize: 10.5 }}>10</span></div>
              <div className="row" style={{ gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--warn)" }}/><span className="muted" style={{ fontSize: 10.5 }}>3</span></div>
              <div className="row" style={{ gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--err)" }}/><span className="muted" style={{ fontSize: 10.5 }}>2</span></div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginTop: 14 }}>
            {services.map(s => (
              <div key={s.id}
                onClick={() => go("serviceDetail", { id: s.id })}
                style={{ background: statusColor[s.status], borderRadius: 4, padding: "10px 8px", color: "white", cursor: "pointer", minHeight: 70, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div className="mono" style={{ fontSize: 10.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", opacity: 0.95 }}>{s.id}</div>
                <div>
                  <div className="mono" style={{ fontSize: 13, fontWeight: 700, lineHeight: 1 }}>{(s.rps/1000).toFixed(1)}k</div>
                  <div className="mono" style={{ fontSize: 9.5, opacity: 0.85 }}>{s.err.toFixed(2)}% · {s.p99}ms</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active alerts + top errors + recent deploys */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        {/* Active incidents */}
        <div className="card card-pad-lg">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div>
              <div className="card-title">Active incidents</div>
              <div className="card-sub" style={{ marginTop: 2 }}>2 open · 5 alerts firing</div>
            </div>
            <button className="btn btn-ghost" style={{ height: 26 }}><Icon name="link-ext" size={12}/>All</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
            {[
              { sev: "err",  title: "Stripe upstream timeouts", svc: "payment-svc", dur: "18m", alerts: 3, oncall: "JV", onClick: () => go("serviceDetail", { id: "payment-svc" }) },
              { sev: "err",  title: "Search latency regression", svc: "search",     dur: "42m", alerts: 2, oncall: "RC", onClick: () => go("serviceDetail", { id: "search" }) },
              { sev: "warn", title: "Replica-3 lagging",        svc: "database",    dur: "12m", alerts: 1, oncall: "MS", onClick: () => go("database") },
            ].map((a, i) => (
              <div key={i} onClick={a.onClick} style={{
                border: "1px solid " + (a.sev === "err" ? "color-mix(in oklab, var(--err) 30%, var(--line))" : "color-mix(in oklab, var(--warn) 30%, var(--line))"),
                borderRadius: 8, padding: 10, cursor: "pointer",
                background: a.sev === "err" ? "color-mix(in oklab, var(--err) 4%, var(--bg-card))" : "color-mix(in oklab, var(--warn) 4%, var(--bg-card))",
              }}>
                <div className="row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
                  <div className="row" style={{ gap: 6 }}>
                    <span className={"badge " + a.sev}><span className="b-dot"/>{a.sev === "err" ? "critical" : "warn"}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--fg-0)" }}>{a.title}</span>
                  </div>
                  <span className="muted mono" style={{ fontSize: 10.5 }}>{a.dur}</span>
                </div>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <span className="mono muted" style={{ fontSize: 11 }}>{a.svc} · {a.alerts} alert{a.alerts > 1 ? "s" : ""} firing</span>
                  <span className="row" style={{ gap: 4 }}>
                    <span className="muted" style={{ fontSize: 10.5 }}>oncall</span>
                    <span style={{ width: 18, height: 18, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#3b82f6)", color: "white", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{a.oncall}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button className="btn btn-ghost" style={{ marginTop: 12, width: "100%", justifyContent: "center", height: 30 }}><Icon name="plus" size={13}/>Declare incident</button>
        </div>

        {/* Top errors */}
        <div className="card card-pad-lg">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div>
              <div className="card-title">Top errors</div>
              <div className="card-sub" style={{ marginTop: 2 }}>last 1 hour · across all services</div>
            </div>
            <button className="btn btn-ghost" style={{ height: 26 }} onClick={() => go("logs")}><Icon name="link-ext" size={12}/>Logs</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
            {[
              { name: "ConnectionResetError", svc: "payment-svc", cnt: 142, sev: "err",  seed: 41 },
              { name: "TimeoutError",          svc: "search",      cnt: 84,  sev: "err",  seed: 42 },
              { name: "ESShardUnavailable",    svc: "search",      cnt: 42,  sev: "warn", seed: 43 },
              { name: "FraudCheckRejected",    svc: "fraud-detect",cnt: 28,  sev: "warn", seed: 44 },
              { name: "ValidationError",       svc: "payment-svc", cnt: 18,  sev: "ok",   seed: 45 },
              { name: "RateLimitExceeded",     svc: "search",      cnt: 8,   sev: "ok",   seed: 46 },
            ].map((e, i) => (
              <div key={i} className="row" style={{ padding: "6px 10px", borderRadius: 6, background: "var(--bg-inset)", justifyContent: "space-between", cursor: "pointer" }} onClick={() => go("serviceDetail", { id: e.svc })}>
                <div className="row" style={{ gap: 8, minWidth: 0, flex: 1 }}>
                  <span className={"badge " + e.sev} style={{ width: 6, height: 6, padding: 0, borderRadius: "50%", flexShrink: 0 }}/>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="mono" style={{ fontSize: 12, color: "var(--fg-0)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</div>
                    <div className="muted mono" style={{ fontSize: 10.5 }}>{e.svc}</div>
                  </div>
                </div>
                <MiniSpark seed={e.seed} width={70} color={e.sev === "err" ? "var(--err)" : e.sev === "warn" ? "var(--warn)" : "var(--chart-1)"} height={22}/>
                <span className="mono" style={{ fontVariantNumeric: "tabular-nums", color: e.sev === "err" ? "var(--err)" : "var(--fg-1)", fontWeight: 600, fontSize: 12, minWidth: 32, textAlign: "right" }}>{e.cnt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent deploys */}
        <div className="card card-pad-lg">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div>
              <div className="card-title">Recent deploys</div>
              <div className="card-sub" style={{ marginTop: 2 }}>last 24 hours · 14 total</div>
            </div>
            <button className="btn btn-ghost" style={{ height: 26 }} onClick={() => go("services")}><Icon name="link-ext" size={12}/>All</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
            {[
              { svc: "search",        ver: "v2.7.0",  by: "rita.chen",    at: "4m ago",  st: "rolling",    note: "canary 25%" },
              { svc: "payment-svc",   ver: "v8.12.0", by: "jay.vasquez",  at: "18m ago", st: "warn",       note: "post-deploy spike" },
              { svc: "tax-calc",      ver: "v2.0.0",  by: "rita.chen",    at: "54m ago", st: "ok" },
              { svc: "search",        ver: "v2.6.4",  by: "maya.s",       at: "2h ago",  st: "rolledback", note: "p99 +180%" },
              { svc: "checkout-bff",  ver: "v3.4.1",  by: "jay.vasquez",  at: "Yesterday 16:42", st: "ok" },
              { svc: "fraud-detect",  ver: "v0.7.2",  by: "kai.olsson",   at: "Yesterday 14:11", st: "failed", note: "image pull error" },
            ].map((d, i) => (
              <div key={i} className="row" style={{ padding: "7px 10px", borderRadius: 6, background: "var(--bg-inset)", justifyContent: "space-between", cursor: "pointer" }} onClick={() => go("serviceDetail", { id: d.svc })}>
                <div className="row" style={{ gap: 8, flex: 1, minWidth: 0 }}>
                  <span className={"badge " + (d.st === "ok" ? "ok" : d.st === "failed" || d.st === "rolledback" ? "err" : d.st === "rolling" ? "info" : "warn")} style={{ width: 8, height: 8, padding: 0, borderRadius: "50%", flexShrink: 0 }}/>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="row" style={{ gap: 6 }}>
                      <span className="mono" style={{ fontSize: 12, color: "var(--fg-0)", fontWeight: 500 }}>{d.svc}</span>
                      <span className="mono muted" style={{ fontSize: 10.5 }}>{d.ver}</span>
                    </div>
                    <div className="muted" style={{ fontSize: 10.5 }}>{d.by} · {d.at}{d.note ? " · " + d.note : ""}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Infra strip */}
      <div>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
          <span className="label-up">Infrastructure</span>
          <a className="muted" style={{ fontSize: 11, cursor: "pointer", color: "var(--brand-deep)" }} onClick={() => go("saturation")}>open saturation hub →</a>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { name: "Kafka",    icon: "kafka",   stat: "84.3k",  unit: "msgs/s",  note: "1 broker hot",       sev: "warn", onClick: () => go("kafka") },
            { name: "Database", icon: "database",stat: "14.8k",  unit: "qps · p99 42.8ms", note: "replica-3 lag", sev: "warn", onClick: () => go("database") },
            { name: "Redis",    icon: "redis",   stat: "184.8k", unit: "ops/s · 97.8% hit", note: "shard-1 evict", sev: "warn" },
          ].map((s, i) => (
            <div key={i} className="card" style={{ cursor: s.onClick ? "pointer" : "default", padding: 14 }} onClick={s.onClick}>
              <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
                <div className="row" style={{ gap: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 5, background: "var(--brand-tint)", color: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon name={s.icon} size={13}/>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--fg-0)" }}>{s.name}</span>
                </div>
                <span className={"badge " + s.sev} style={{ width: 7, height: 7, padding: 0, borderRadius: "50%" }}/>
              </div>
              <div className="row" style={{ alignItems: "baseline", gap: 6 }}>
                <div className="stat-value" style={{ fontSize: 19 }}>{s.stat}</div>
              </div>
              <div className="muted" style={{ fontSize: 10.5, marginTop: 2 }}>{s.unit}</div>
              <div className={"muted"} style={{ fontSize: 10.5, marginTop: 6, color: s.sev === "err" ? "var(--err)" : s.sev === "warn" ? "var(--warn-fg)" : "var(--fg-3)" }}>· {s.note}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

/* =========================================================
   SATURATION HUB — subsystem health, fleet map, top saturated hosts
   ========================================================= */
function SaturationScreen({ go }) {
  const [tab, setTab] = useStateA("overview");
  const [groupBy, setGroupBy] = useStateA("Subsystem");
  const [fillBy, setFillBy] = useStateA("Saturation");

  const subsystems = [
    { id: "kafka",    name: "Kafka",    icon: "kafka",    chart: 1, alerts: 1, pillKind: "warn", pillText: "1 broker hot",   stat: "84.3k", unit: "msgs/s in", sub: "9 brokers · 142 topics", note: "12 under-replicated", series: 1, areaColor: "var(--chart-1)", soft: "var(--chart-1-soft)", click: () => go("kafka") },
    { id: "database", name: "Database", icon: "database", chart: 2, alerts: 2, pillKind: "warn", pillText: "replica-3 lagging", stat: "14.8k", unit: "qps · 42.8ms p99", sub: "checkout-prod · 4 nodes", note: "repl lag 0.14s", series: 2, areaColor: "var(--chart-1)", soft: "var(--chart-1-soft)", click: () => go("database") },
    { id: "redis",    name: "Redis",    icon: "redis",    chart: 3, alerts: 1, pillKind: "warn", pillText: "shard-1 evicting", stat: "184.8k", unit: "ops/s · 97.8% hit", sub: "3 shards · 6 nodes",   note: "142/s evictions", series: 3, areaColor: "var(--chart-1)", soft: "var(--chart-1-soft)", click: null },
    { id: "queues",   name: "Queues",   icon: "queues",   chart: 4, alerts: 2, pillKind: "warn", pillText: "oldest 5m",        stat: "184.8k", unit: "depth · oldest 5m",   sub: "sidekiq-prod · 142 workers", note: "2.8k in DLQ", series: 4, areaColor: "var(--warn)",    soft: "var(--warn-soft)", click: null },
    { id: "storage",  name: "Storage",  icon: "storage",  chart: 5, alerts: 0, pillKind: null,   pillText: null,               stat: "82%", unit: "used · 38TB free", sub: "9 volumes · 142TB total", note: "47/s iops", series: 5, areaColor: "var(--chart-3)", soft: "var(--ok-soft)", click: null },
  ];

  // hex grid generator
  const hexGrid = (n, seedBase, colors) => {
    const tiles = [];
    for (let i = 0; i < n; i++) {
      const c = colors[i % colors.length];
      tiles.push({ id: i, value: 50 + Math.floor(((seedBase * (i+1) * 7) % 47) + (i*3)) % 50, color: c, label: ["B1","B2","B3","B4","B5","B6","B7","B8","B9","B10"][i] });
    }
    return tiles;
  };

  return (
    <div className="page">
      <PageHeader
        icon="saturation" iconColor="var(--accent-violet)" iconBg="var(--accent-violet-soft)"
        title="Saturation"
        subtitle="34 hosts · 5 subsystems · 18 active alerts"
        statusBadge={
          <span className="badge err" style={{ marginLeft: 6, paddingRight: 10 }}>
            <span className="b-dot" />
            <span>3 error · 15 warn</span>
          </span>
        }
        actions={
          <div className="row">
            <button className="btn"><Icon name="refresh" size={14}/>Refresh</button>
            <button className="btn"><Icon name="export" size={14}/>Export</button>
          </div>
        }
      />

      <Tabs
        tabs={[
          { id: "overview", label: "Overview" },
          { id: "kafka", label: "Kafka", badge: 1, badgeKind: "err" },
          { id: "database", label: "Database", badge: 2, badgeKind: "err" },
          { id: "redis", label: "Redis", badge: 1, badgeKind: "err" },
          { id: "queues", label: "Queues", badge: 2, badgeKind: "err" },
          { id: "storage", label: "Storage" },
        ]}
        active={tab}
        setActive={(t) => {
          if (t === "kafka") go("kafka");
          else if (t === "database") go("database");
          else setTab(t);
        }}
      />

      {/* Subsystem cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
        {subsystems.map(s => (
          <div key={s.id} className="card" style={{ padding: 0, overflow: "hidden", cursor: s.click ? "pointer" : "default" }} onClick={s.click || undefined}>
            <div style={{ padding: "16px 18px 18px" }}>
              <div className="row" style={{ gap: 12, alignItems: "center" }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: "var(--brand-tint)", color: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon name={s.icon} size={16} />
                </div>
                <div style={{ fontSize: 15.5, fontWeight: 600, color: "var(--fg-0)" }}>{s.name}</div>
              </div>
              {s.pillText && (
                <span className={"badge " + s.pillKind} style={{ marginTop: 10, whiteSpace: "nowrap", maxWidth: "100%" }}>
                  <span className="b-dot" />
                  <span>{s.pillText}</span>
                </span>
              )}
              <div className="card-sub" style={{ marginTop: 8 }}>{s.sub}</div>
              <div className="stat-row" style={{ marginTop: 12 }}>
                <div className="stat-value" style={{ fontSize: 26 }}>{s.stat}</div>
                <div className="stat-unit">{s.unit}</div>
              </div>
              <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>{s.note}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Fleet map */}
      <div className="card card-pad-lg">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <div className="card-title">Fleet map</div>
            <div className="card-sub" style={{ marginTop: 2 }}>34 hosts · color shows max saturation · hover for details</div>
          </div>
          <div className="row" style={{ gap: 6 }}>
            <span className="muted" style={{ fontSize: 10 }}>0%</span>
            <div style={{ display: "flex" }}>
              {["var(--chart-1)", "var(--chart-3)", "var(--warn)", "var(--orange)", "var(--err)"].map((c,i) =>
                <div key={i} style={{ width: 24, height: 12, background: c }} />
              )}
            </div>
            <span className="muted" style={{ fontSize: 10 }}>100%</span>
          </div>
        </div>

        <div className="row" style={{ marginTop: 16, justifyContent: "space-between" }}>
          <div className="row" style={{ gap: 14 }}>
            <span className="label-up">Group by</span>
            <div className="seg">
              {["Subsystem","Availability zone"].map(o => (
                <div key={o} className={"seg-opt" + (groupBy === o ? " active" : "")} onClick={() => setGroupBy(o)}>{o}</div>
              ))}
            </div>
          </div>
          <div className="row" style={{ gap: 14 }}>
            <span className="label-up">Fill by</span>
            <div className="seg">
              {["Saturation","CPU","Memory","Disk"].map(o => (
                <div key={o} className={"seg-opt" + (fillBy === o ? " active" : "")} onClick={() => setFillBy(o)}>{o}</div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginTop: 18 }}>
          {[
            { name: "Kafka",    count: 9, palette: ["var(--warn)","var(--warn)","var(--warn)","var(--warn)","var(--err)","var(--ok)","var(--warn)","var(--warn)","var(--warn)"], labels: ["B1","B3","B2","B4","B5","B6","B7","B8","B9"] },
            { name: "Database", count: 4, palette: ["var(--warn)","var(--warn)","var(--ok)","var(--warn)"], labels: ["PRI","R2","R1","R3"] },
            { name: "Redis",    count: 6, palette: ["var(--warn)","var(--warn)","var(--err)","var(--warn)","var(--err)","var(--warn)"], labels: ["S0","S2","S1","S0R","S1R","S2R"] },
            { name: "Queues",   count: 6, palette: ["var(--err)","var(--err)","var(--ok)","var(--err)","var(--ok)","var(--warn)"], labels: ["Q-E","US-E","S-E","S-E","S-E","S-W"] },
            { name: "Storage",  count: 9, palette: ["var(--warn)","var(--warn)","var(--err)","var(--ok)","var(--warn)","var(--warn)","var(--warn)","var(--warn)","var(--warn)"], labels: ["PG","PG","PG","KFK","KFK","ES","ES","ES","S3"] },
          ].map((grp, idx) => {
            const vals = grp.palette.map((_, i) => 55 + (((idx+1) * (i+1) * 13) % 45));
            return (
              <div key={grp.name} style={{ border: "1px solid var(--line-2)", borderRadius: 8, padding: 14, background: "var(--bg-card)" }}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--fg-0)" }}>{grp.name}</div>
                  <div className="muted" style={{ fontSize: 11 }}>{grp.count}</div>
                </div>
                <div style={{ marginTop: 14, display: "flex", justifyContent: "center" }}>
                  <HexGrid count={grp.count} palette={grp.palette} labels={grp.labels} values={vals} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top saturated hosts */}
      <div className="card card-pad-lg">
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
          <div>
            <div className="card-title">Most saturated hosts</div>
            <div className="card-sub" style={{ marginTop: 2 }}>Top 10 across the entire fleet · max(CPU, mem, disk, lag)</div>
          </div>
          <div className="row">
            <button className="btn btn-ghost"><Icon name="filter" size={14}/>Filter</button>
            <button className="btn"><Icon name="link-ext" size={14}/>View all</button>
          </div>
        </div>
        <table className="tbl" style={{ marginTop: 8 }}>
          <thead>
            <tr><th>Host</th><th>System</th><th>Location</th><th>Saturation</th><th style={{ textAlign: "right" }}>Trend (1h)</th></tr>
          </thead>
          <tbody>
            {[
              { host: "kafka-broker-b5-prod", sys: "Kafka", loc: "us-east-1b", sat: 94, level: "err",  metric: "CPU 94%", seed: 11 },
              { host: "redis-shard-1-primary",sys: "Redis", loc: "us-east-1a", sat: 91, level: "err",  metric: "Mem 91%", seed: 12 },
              { host: "queue-east-3-worker",  sys: "Queues",loc: "us-east-1c", sat: 100, level: "err", metric: "Depth · oldest 5m", seed: 13 },
              { host: "pg-replica-3",         sys: "Database", loc: "us-east-1b", sat: 84, level: "warn", metric: "Repl-lag 0.14s", seed: 14 },
              { host: "pg-primary",           sys: "Database", loc: "us-east-1a", sat: 82, level: "warn", metric: "Disk 82%",  seed: 15 },
              { host: "kafka-broker-b3-prod", sys: "Kafka", loc: "us-east-1c", sat: 84, level: "warn",  metric: "CPU 84%", seed: 16 },
              { host: "kafka-broker-b2-prod", sys: "Kafka", loc: "us-east-1a", sat: 71, level: "warn",  metric: "CPU 71%", seed: 17 },
              { host: "redis-shard-2-primary",sys: "Redis", loc: "us-east-1c", sat: 74, level: "warn", metric: "Mem 74%", seed: 18 },
            ].map((r, i) => (
              <tr key={i}>
                <td><span className="mono" style={{ color: "var(--fg-0)", fontSize: 12.5 }}>{r.host}</span></td>
                <td>{r.sys}</td>
                <td><span className="mono muted">{r.loc}</span></td>
                <td>
                  <div className="row" style={{ gap: 10 }}>
                    <div style={{ width: 120, height: 6, borderRadius: 3, background: "var(--bg-inset)", overflow: "hidden" }}>
                      <div style={{ width: r.sat + "%", height: "100%", background: r.level === "err" ? "var(--err)" : "var(--warn)" }} />
                    </div>
                    <span style={{ fontWeight: 600, color: r.level === "err" ? "var(--err)" : "var(--warn-fg)", fontSize: 12.5 }}>{r.sat}%</span>
                    <span className="muted" style={{ fontSize: 11.5 }}>{r.metric}</span>
                  </div>
                </td>
                <td style={{ textAlign: "right" }}><MiniSpark seed={r.seed} color={r.level === "err" ? "var(--err)" : "var(--warn)"} width={120} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =========================================================
   SERVICES (Catalog · Service map · Deploys)
   ========================================================= */
function ServicesScreen({ go }) {
  const [tab, setTab] = useStateA("catalog");
  const [view, setView] = useStateA("list");
  const [q, setQ] = useStateA("");

  const services = [
    { id: "payment-svc",   tier: "Tier 0", env: "prod", team: "payments", inst: 12, lang: "Node", rps: 14820, err: 0.42, p99: 184,  status: "warn", trend: 1, change: -2.4, ver: "v8.12.0" },
    { id: "checkout-bff",  tier: "Tier 0", env: "prod", team: "payments", inst: 8,  lang: "Go",   rps: 26410, err: 0.04, p99: 92,   status: "ok",   trend: 2, change: 1.8,  ver: "v3.4.1" },
    { id: "cart",          tier: "Tier 1", env: "prod", team: "shopping", inst: 6,  lang: "Java", rps: 8920,  err: 0.08, p99: 142,  status: "ok",   trend: 3, change: 0.4,  ver: "v12.0.2" },
    { id: "search",        tier: "Tier 0", env: "prod", team: "discovery",inst: 10, lang: "Go",   rps: 32140, err: 1.92, p99: 318,  status: "err",  trend: 4, change: 8.4,  ver: "v2.7.0" },
    { id: "user-profile",  tier: "Tier 1", env: "prod", team: "identity", inst: 4,  lang: "Ruby", rps: 6420,  err: 0.06, p99: 88,   status: "ok",   trend: 5, change: -0.7, ver: "v4.1.3" },
    { id: "notifications", tier: "Tier 2", env: "prod", team: "messaging",inst: 3,  lang: "Node", rps: 2120,  err: 0.12, p99: 64,   status: "ok",   trend: 6, change: 0.0,  ver: "v1.9.7" },
    { id: "shipping-rates",tier: "Tier 1", env: "prod", team: "logistics",inst: 4,  lang: "Java", rps: 4810,  err: 0.20, p99: 218,  status: "warn", trend: 7, change: 4.2,  ver: "v6.2.0" },
    { id: "inventory",     tier: "Tier 0", env: "prod", team: "shopping", inst: 6,  lang: "Java", rps: 12080, err: 0.04, p99: 78,   status: "ok",   trend: 8, change: -1.2, ver: "v9.8.1" },
    { id: "tax-calc",      tier: "Tier 1", env: "prod", team: "payments", inst: 3,  lang: "Python",rps: 5120, err: 0.14, p99: 142,  status: "ok",   trend: 9, change: 1.4,  ver: "v2.0.0" },
    { id: "fraud-detect",  tier: "Tier 0", env: "prod", team: "trust",    inst: 5,  lang: "Python",rps: 1820, err: 0.42, p99: 412,  status: "warn", trend: 10,change: 3.2,  ver: "v0.7.2" },
  ];
  const filtered = services.filter(s => !q || s.id.includes(q) || s.team.includes(q));

  return (
    <div className="page">
      <PageHeader
        icon="service" iconColor="var(--fg-2)" iconBg="var(--bg-inset)"
        title="Services"
        subtitle="My-Organization · production · 15 services · 123.9k rps total"
      />

      <Tabs
        tabs={[
          { id: "catalog", label: "Catalog", badge: 15, badgeKind: "info" },
          { id: "map",     label: "Service map" },
          { id: "deploys", label: "Deploys", badge: "6", badgeKind: "neutral" },
        ]}
        active={tab}
        setActive={setTab}
      />

      {tab === "catalog" && <CatalogView services={filtered} q={q} setQ={setQ} view={view} setView={setView} go={go}/>}
      {tab === "map"     && <ServiceMapView go={go}/>}
      {tab === "deploys" && <DeploysView go={go}/>}
    </div>
  );
}

function CatalogView({ services, q, setQ, view, setView, go }) {
  return (
    <div className="card card-pad-lg">
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
        <div className="row" style={{ gap: 10 }}>
          <div className="search" style={{ width: 320 }}>
            <Icon name="search" size={14} className="muted"/>
            <input placeholder="Filter services…" value={q} onChange={e=>setQ(e.target.value)} />
          </div>
          <button className="btn"><Icon name="filter" size={14}/>Status · all</button>
        </div>
      </div>

      <table className="tbl">
        <thead>
          <tr>
            <th style={{ paddingLeft: 0 }}>Service</th>
            <th>Tier</th>
            <th>Team</th>
            <th style={{ textAlign: "right" }}>RPS</th>
            <th style={{ textAlign: "right" }}>Error</th>
            <th style={{ textAlign: "right" }}>P99</th>
            <th>Last 1 hour</th>
            <th>Δ</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {services.map((s) => (
            <tr key={s.id} onClick={() => go("serviceDetail", { id: s.id })} style={{ cursor: "pointer" }}>
              <td style={{ paddingLeft: 0 }}>
                <div className="row">
                  <span className={"badge " + (s.status === "err" ? "err" : s.status === "warn" ? "warn" : "ok")} style={{ width: 8, height: 8, padding: 0, borderRadius: "50%" }}></span>
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--fg-0)" }}>{s.id}</div>
                    <div className="muted mono" style={{ fontSize: 11 }}>{s.lang} · {s.inst} inst · {s.ver}</div>
                  </div>
                </div>
              </td>
              <td><span className="badge neutral">{s.tier}</span></td>
              <td>{s.team}</td>
              <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{(s.rps/1000).toFixed(1)}k</td>
              <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: s.err > 1 ? "var(--err)" : s.err > 0.2 ? "var(--warn-fg)" : "var(--fg-1)" }}>{s.err.toFixed(2)}%</td>
              <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{s.p99}ms</td>
              <td><MiniSpark seed={s.trend} width={120} color={s.status === "err" ? "var(--err)" : s.status === "warn" ? "var(--warn)" : "var(--chart-1)"}/></td>
              <td><span className={"delta " + (s.change > 0 ? "down" : s.change < 0 ? "up" : "")} style={{ color: s.change > 5 ? "var(--err)" : s.change > 0 ? "var(--warn-fg)" : s.change < 0 ? "var(--ok)" : "var(--fg-3)" }}>
                {s.change > 0 ? "+" : ""}{s.change.toFixed(1)}%
              </span></td>
              <td><Icon name="chevron-right" size={14} className="muted"/></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* =========================================================
   SERVICE MAP — focused on a single service + its 1–2 hop neighbours
   ========================================================= */
function ServiceMapView({ go }) {
  const [focusId, setFocusId] = useStateA("payment-svc");
  const [depth, setDepth] = useStateA(1);
  const [showInfra, setShowInfra] = useStateA(true);
  const [hoverNode, setHoverNode] = useStateA(null);
  const [pickerOpen, setPickerOpen] = useStateA(false);

  // ---- Catalog of nodes (no positions; layout is derived from focus + depth) ----
  const ALL_NODES = {
    "edge":           { label: "edge",           kind: "external", status: "ok" },
    "checkout-bff":   { label: "checkout-bff",   kind: "service", rps: 26410, status: "ok",   team: "payments",  err: 0.04, p99: 92  },
    "search":         { label: "search",         kind: "service", rps: 32140, status: "err",  team: "discovery", err: 1.92, p99: 318 },
    "cart":           { label: "cart",           kind: "service", rps: 8920,  status: "ok",   team: "shopping",  err: 0.08, p99: 142 },
    "user-profile":   { label: "user-profile",   kind: "service", rps: 6420,  status: "ok",   team: "identity",  err: 0.06, p99: 88  },
    "inventory":      { label: "inventory",      kind: "service", rps: 12080, status: "ok",   team: "shopping",  err: 0.04, p99: 78  },
    "payment-svc":    { label: "payment-svc",    kind: "service", rps: 14820, status: "warn", team: "payments",  err: 0.42, p99: 184 },
    "tax-calc":       { label: "tax-calc",       kind: "service", rps: 5120,  status: "ok",   team: "payments",  err: 0.14, p99: 142 },
    "shipping-rates": { label: "shipping-rates", kind: "service", rps: 4810,  status: "warn", team: "logistics", err: 0.20, p99: 218 },
    "fraud-detect":   { label: "fraud-detect",   kind: "service", rps: 1820,  status: "warn", team: "trust",     err: 0.42, p99: 412 },
    "notifications":  { label: "notifications",  kind: "service", rps: 2120,  status: "ok",   team: "messaging", err: 0.12, p99: 64  },
    "postgres":       { label: "postgres",       kind: "db",      status: "warn", sub: "checkout-prod" },
    "redis":          { label: "redis",          kind: "cache",   status: "warn", sub: "3 shards" },
    "kafka":          { label: "kafka",          kind: "queue",   status: "warn", sub: "events-prod" },
  };

  const ALL_EDGES = [
    { from: "edge", to: "checkout-bff",          rps: 26000, status: "ok" },
    { from: "edge", to: "search",                rps: 32000, status: "err" },
    { from: "checkout-bff", to: "cart",          rps: 8000,  status: "ok" },
    { from: "checkout-bff", to: "user-profile",  rps: 6000,  status: "ok" },
    { from: "checkout-bff", to: "inventory",     rps: 12000, status: "ok" },
    { from: "checkout-bff", to: "payment-svc",   rps: 14000, status: "warn" },
    { from: "payment-svc", to: "tax-calc",       rps: 5000,  status: "ok" },
    { from: "payment-svc", to: "fraud-detect",   rps: 1800,  status: "warn" },
    { from: "payment-svc", to: "postgres",       rps: 9800,  status: "warn" },
    { from: "payment-svc", to: "kafka",          rps: 12400, status: "warn" },
    { from: "checkout-bff", to: "shipping-rates",rps: 4800,  status: "warn" },
    { from: "shipping-rates", to: "redis",       rps: 3200,  status: "warn" },
    { from: "search", to: "redis",               rps: 18000, status: "err" },
    { from: "cart", to: "redis",                 rps: 8400,  status: "ok" },
    { from: "cart", to: "postgres",              rps: 4200,  status: "ok" },
    { from: "inventory", to: "postgres",         rps: 6200,  status: "ok" },
    { from: "payment-svc", to: "notifications",  rps: 1800,  status: "ok" },
    { from: "user-profile", to: "postgres",      rps: 5400,  status: "ok" },
  ];

  // ---- Compute visible set: focus + upstream/downstream within `depth` hops ----
  const { layout, visibleEdges } = useMemoA(() => {
    const upstreamLevels = []; // arrays of node ids per hop distance
    const downstreamLevels = [];
    const seen = new Set([focusId]);
    let frontier = new Set([focusId]);
    for (let d = 1; d <= depth; d++) {
      const ups = new Set();
      for (const f of frontier) {
        for (const e of ALL_EDGES) if (e.to === f && !seen.has(e.from)) ups.add(e.from);
      }
      ups.forEach(n => seen.add(n));
      upstreamLevels.push([...ups]);
      frontier = ups;
    }
    seen.clear(); seen.add(focusId);
    frontier = new Set([focusId]);
    for (let d = 1; d <= depth; d++) {
      const downs = new Set();
      for (const f of frontier) {
        for (const e of ALL_EDGES) if (e.from === f && !seen.has(e.to)) downs.add(e.to);
      }
      downs.forEach(n => seen.add(n));
      downstreamLevels.push([...downs]);
      frontier = downs;
    }

    // Filter infra if hidden
    const isInfra = id => { const k = ALL_NODES[id]?.kind; return k === "db" || k === "cache" || k === "queue"; };
    const flt = arr => showInfra ? arr : arr.filter(id => !isInfra(id));
    const upL = upstreamLevels.map(flt);
    const dnL = downstreamLevels.map(flt);

    // ---- LAYOUT: columns. Upstreams left, focus center, downstreams right. ----
    const W = 1100, H = 520;
    const colsLeft = depth;            // hop columns on the left
    const colsRight = depth;           // hop columns on the right
    const totalCols = colsLeft + 1 + colsRight; // +1 for focus
    const gx = W / (totalCols + 1);
    const positions = {};
    positions[focusId] = { x: gx * (colsLeft + 1), y: H / 2, focus: true };

    const placeColumn = (ids, x) => {
      ids.forEach((id, i) => {
        const y = H * 0.12 + ((H * 0.76) * (ids.length === 1 ? 0.5 : i / (ids.length - 1)));
        positions[id] = { x, y };
      });
    };
    // Place columns farther from focus first (outer hops)
    upL.forEach((ids, hop) => placeColumn(ids, gx * (colsLeft - hop)));
    dnL.forEach((ids, hop) => placeColumn(ids, gx * (colsLeft + 2 + hop)));

    const visIds = new Set(Object.keys(positions));
    const visEdges = ALL_EDGES.filter(e => visIds.has(e.from) && visIds.has(e.to));

    return { layout: { positions, W, H, ups: upL, downs: dnL }, visibleEdges: visEdges };
  }, [focusId, depth, showInfra]);

  const { positions, W, H, ups, downs } = layout;
  const visibleCount = Object.keys(positions).length;
  const statusColor = { ok: "var(--ok)", warn: "var(--warn)", err: "var(--err)" };
  const focusNode = ALL_NODES[focusId];

  // List for the picker
  const servicePickList = Object.entries(ALL_NODES)
    .filter(([, n]) => n.kind === "service")
    .map(([id, n]) => ({ id, ...n }));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
      {/* Map card */}
      <div className="card card-pad-lg">
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div className="card-title">Dependency map · focused</div>
            <div className="card-sub" style={{ marginTop: 2 }}>
              {visibleCount} entities · {visibleEdges.length} connections · scoped to <span className="mono" style={{ color: "var(--brand-deep)" }}>{focusId}</span> ± {depth} hop{depth>1?"s":""}
            </div>
          </div>
          <div className="row" style={{ gap: 8, position: "relative" }}>
            <button className="btn" onClick={() => setPickerOpen(o => !o)}>
              <Icon name="service" size={14}/>
              <span>Focus</span>
              <span className="mono" style={{ fontWeight: 600 }}>{focusId}</span>
              <Icon name="chevron-down" size={12}/>
            </button>
            {pickerOpen && (
              <div style={{ position: "absolute", top: 36, right: 0, background: "var(--bg-card)", border: "1px solid var(--line)", borderRadius: 8, boxShadow: "var(--shadow-md)", padding: 6, zIndex: 50, minWidth: 240, maxHeight: 320, overflowY: "auto" }}>
                {servicePickList.map(s => (
                  <div key={s.id} onClick={() => { setFocusId(s.id); setPickerOpen(false); }}
                       style={{ padding: "7px 10px", fontSize: 12.5, borderRadius: 5, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, background: s.id === focusId ? "var(--brand-tint)" : "transparent" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor[s.status] }}/>
                    <span className="mono" style={{ color: s.id === focusId ? "var(--brand-deep)" : "var(--fg-0)", fontWeight: s.id === focusId ? 600 : 500 }}>{s.id}</span>
                    <span className="muted" style={{ marginLeft: "auto", fontSize: 11 }}>{(s.rps/1000).toFixed(1)}k rps</span>
                  </div>
                ))}
              </div>
            )}
            <div className="seg">
              <div className={"seg-opt" + (depth === 1 ? " active" : "")} onClick={() => setDepth(1)}>1 hop</div>
              <div className={"seg-opt" + (depth === 2 ? " active" : "")} onClick={() => setDepth(2)}>2 hops</div>
            </div>
            <button className={"btn" + (showInfra ? "" : " btn-ghost")} onClick={() => setShowInfra(v => !v)}>
              <Icon name={showInfra ? "check" : "plus"} size={14}/>Infrastructure
            </button>
          </div>
        </div>

        {/* Backend-cost note + legend */}
        <div className="row" style={{ gap: 14, marginBottom: 10, justifyContent: "space-between" }}>
          <div className="row" style={{ gap: 14 }}>
            <div className="row" style={{ gap: 6 }}><span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--ok)" }}/><span className="muted" style={{ fontSize: 11 }}>healthy</span></div>
            <div className="row" style={{ gap: 6 }}><span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--warn)" }}/><span className="muted" style={{ fontSize: 11 }}>degraded</span></div>
            <div className="row" style={{ gap: 6 }}><span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--err)" }}/><span className="muted" style={{ fontSize: 11 }}>error</span></div>
            <span className="muted" style={{ fontSize: 11 }}>edge thickness ∝ rps</span>
          </div>
          <span className="muted" style={{ fontSize: 11 }}>query scope: 1 focus × {depth} hop · ~{visibleCount * 4} aggregations · cheap</span>
        </div>

        <div style={{ background: "var(--bg-inset)", borderRadius: 8, position: "relative" }}>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="auto" style={{ display: "block" }}>
            <defs>
              <marker id="arrowOk" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L6,4 L0,8 Z" fill="var(--fg-mute)"/>
              </marker>
              <marker id="arrowWarn" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L6,4 L0,8 Z" fill="var(--warn)"/>
              </marker>
              <marker id="arrowErr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L6,4 L0,8 Z" fill="var(--err)"/>
              </marker>
            </defs>

            {/* Column labels */}
            {ups.length > 0 && ups[0].length > 0 && (
              <text x={positions[ups[0][0]].x} y={26} textAnchor="middle" fontSize="10" fill="var(--fg-mute)" fontWeight="700" letterSpacing="0.1em">CALLERS</text>
            )}
            {downs.length > 0 && downs[0].length > 0 && (
              <text x={positions[downs[0][0]].x} y={26} textAnchor="middle" fontSize="10" fill="var(--fg-mute)" fontWeight="700" letterSpacing="0.1em">DEPENDENCIES</text>
            )}
            <text x={positions[focusId].x} y={26} textAnchor="middle" fontSize="10" fill="var(--brand-deep)" fontWeight="700" letterSpacing="0.1em">FOCUS</text>

            {/* Edges */}
            {visibleEdges.map((e, i) => {
              const a = positions[e.from], b = positions[e.to];
              const involvesFocus = e.from === focusId || e.to === focusId;
              const stroke = e.status === "err" ? "var(--err)" : e.status === "warn" ? "var(--warn)" : "var(--fg-mute)";
              const marker = e.status === "err" ? "url(#arrowErr)" : e.status === "warn" ? "url(#arrowWarn)" : "url(#arrowOk)";
              const w = Math.max(0.8, Math.min(5, e.rps / 6000));
              const dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx*dx + dy*dy);
              const sr = 30, er = 32;
              const x1 = a.x + (dx/d) * sr;
              const y1 = a.y + (dy/d) * sr;
              const x2 = b.x - (dx/d) * er;
              const y2 = b.y - (dy/d) * er;
              return (
                <g key={i}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={w}
                        strokeOpacity={involvesFocus ? 0.9 : 0.35} markerEnd={marker}/>
                  {involvesFocus && (
                    <text x={(x1+x2)/2} y={(y1+y2)/2 - 6} textAnchor="middle" fontSize="9.5" fill="var(--fg-2)" fontFamily="monospace">
                      {(e.rps/1000).toFixed(1)}k/s
                    </text>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {Object.entries(positions).map(([id, p]) => {
              const n = ALL_NODES[id];
              const isHover = hoverNode === id;
              const isFocus = id === focusId;
              const ring = statusColor[n.status] || "var(--fg-mute)";
              const isService = n.kind === "service";
              const isExternal = n.kind === "external";
              const r = isFocus ? 36 : isService ? 26 : 22;
              return (
                <g key={id} transform={`translate(${p.x},${p.y})`}
                   style={{ cursor: isService ? "pointer" : "default" }}
                   onMouseEnter={() => setHoverNode(id)} onMouseLeave={() => setHoverNode(null)}
                   onClick={() => {
                     if (!isService) return;
                     if (isFocus) go("serviceDetail", { id });
                     else setFocusId(id);
                   }}>
                  {isService && (
                    <>
                      <circle r={r+5} fill="none" stroke={ring} strokeOpacity={isFocus ? 0.45 : (isHover ? 0.55 : 0.28)} strokeWidth={isFocus ? 7 : (isHover ? 6 : 4)}/>
                      <circle r={r} fill="var(--bg-card)" stroke={ring} strokeWidth={isFocus ? 2.5 : 2}/>
                    </>
                  )}
                  {isExternal && (
                    <circle r={20} fill="var(--bg-card)" stroke="var(--fg-3)" strokeWidth="1.5" strokeDasharray="4 3"/>
                  )}
                  {!isService && !isExternal && (
                    <>
                      <rect x={-30} y={-22} width="60" height="44" rx="6" fill="none" stroke={ring} strokeOpacity={isHover ? 0.5 : 0.28} strokeWidth={isHover ? 6 : 4}/>
                      <rect x={-28} y={-20} width="56" height="40" rx="6" fill="var(--bg-card)" stroke={ring} strokeWidth="2"/>
                    </>
                  )}

                  {isService && (
                    <text x="0" y={isFocus ? -2 : 3} textAnchor="middle" fontSize={isFocus ? 11 : 9} fontWeight="700" fill="var(--fg-0)" fontFamily="monospace">
                      {(n.rps/1000).toFixed(1) + "k"}
                    </text>
                  )}
                  {isFocus && (
                    <text x="0" y="12" textAnchor="middle" fontSize="9" fill={statusColor[n.status]} fontWeight="600" fontFamily="monospace">
                      {n.err.toFixed(2) + "% err"}
                    </text>
                  )}
                  {!isService && !isExternal && (
                    <text x="0" y="3" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="var(--fg-0)" fontFamily="monospace">
                      {n.kind === "db" ? "DB" : n.kind === "cache" ? "CACHE" : "KAFKA"}
                    </text>
                  )}
                  {isExternal && (
                    <text x="0" y="3" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--fg-3)" fontFamily="monospace">EDGE</text>
                  )}
                  <text x="0" y={isFocus ? 56 : (isService ? 44 : 38)} textAnchor="middle" fontSize={isFocus ? 12 : 10.5} fontWeight={isFocus ? 600 : 400} fill={isFocus ? "var(--fg-0)" : "var(--fg-1)"} fontFamily="monospace" style={{ pointerEvents: "none" }}>
                    {n.label}
                  </text>
                  {!isService && !isExternal && n.sub && (
                    <text x="0" y={isFocus ? 70 : 52} textAnchor="middle" fontSize="9.5" fill="var(--fg-3)" fontFamily="monospace" style={{ pointerEvents: "none" }}>
                      {n.sub}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Side panel: focused service summary */}
      <div className="card card-pad-lg" style={{ alignSelf: "flex-start" }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div className="row">
            <span className={"badge " + (focusNode.status === "err" ? "err" : focusNode.status === "warn" ? "warn" : "ok")} style={{ width: 8, height: 8, padding: 0, borderRadius: "50%" }}/>
            <span className="mono" style={{ fontSize: 14, fontWeight: 600, color: "var(--fg-0)" }}>{focusId}</span>
          </div>
          <button className="btn btn-ghost" onClick={() => go("serviceDetail", { id: focusId })}><Icon name="link-ext" size={13}/>Open</button>
        </div>
        <div className="muted" style={{ fontSize: 11.5, marginTop: 4 }}>team {focusNode.team} · prod</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
          {[
            { l: "Requests", v: (focusNode.rps/1000).toFixed(1)+"k", u: "rps", color: "var(--fg-0)" },
            { l: "Errors",   v: focusNode.err.toFixed(2)+"%", u: "rate",   color: focusNode.err > 1 ? "var(--err)" : focusNode.err > 0.2 ? "var(--warn-fg)" : "var(--fg-0)" },
            { l: "p99",      v: focusNode.p99+"ms", u: "latency", color: focusNode.p99 > 300 ? "var(--err)" : focusNode.p99 > 150 ? "var(--warn-fg)" : "var(--fg-0)" },
            { l: "Status",   v: focusNode.status === "err" ? "Error" : focusNode.status === "warn" ? "Degraded" : "Healthy", u: "live", color: statusColor[focusNode.status] },
          ].map(k => (
            <div key={k.l} style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
              <div className="muted" style={{ fontSize: 11 }}>{k.l}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: k.color, marginTop: 2 }}>{k.v}</div>
              <div className="muted" style={{ fontSize: 10.5 }}>{k.u}</div>
            </div>
          ))}
        </div>

        <div className="hairline" style={{ margin: "16px -4px" }}/>

        <div className="label-up" style={{ marginBottom: 8 }}>Direct callers ({ups[0]?.length || 0})</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
          {(ups[0] || []).length === 0 && <span className="muted" style={{ fontSize: 11.5 }}>No upstream callers</span>}
          {(ups[0] || []).map(id => {
            const n = ALL_NODES[id];
            const e = ALL_EDGES.find(x => x.from === id && x.to === focusId);
            return (
              <div key={id} className="row" style={{ justifyContent: "space-between", padding: "5px 8px", borderRadius: 5, background: "var(--bg-inset)", cursor: "pointer" }} onClick={() => setFocusId(id)}>
                <div className="row" style={{ gap: 6 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor[n.status] }}/>
                  <span className="mono" style={{ fontSize: 12 }}>{n.label}</span>
                </div>
                <span className="muted mono" style={{ fontSize: 11 }}>{e ? (e.rps/1000).toFixed(1)+"k/s" : ""}</span>
              </div>
            );
          })}
        </div>

        <div className="label-up" style={{ marginBottom: 8 }}>Direct dependencies ({downs[0]?.length || 0})</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {(downs[0] || []).length === 0 && <span className="muted" style={{ fontSize: 11.5 }}>No downstream dependencies</span>}
          {(downs[0] || []).map(id => {
            const n = ALL_NODES[id];
            const e = ALL_EDGES.find(x => x.from === focusId && x.to === id);
            const isService = n.kind === "service";
            return (
              <div key={id} className="row" style={{ justifyContent: "space-between", padding: "5px 8px", borderRadius: 5, background: "var(--bg-inset)", cursor: isService ? "pointer" : "default" }} onClick={() => isService && setFocusId(id)}>
                <div className="row" style={{ gap: 6 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor[n.status] || "var(--fg-mute)" }}/>
                  <span className="mono" style={{ fontSize: 12 }}>{n.label}{n.sub ? " · " + n.sub : ""}</span>
                </div>
                <span className="muted mono" style={{ fontSize: 11 }}>{e ? (e.rps/1000).toFixed(1)+"k/s" : ""}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DEPLOYS
   ========================================================= */
function DeploysView({ go }) {
  const deploys = [
    { id: "d-9821", svc: "search",        ver: "v2.7.0",  prev: "v2.6.4", commit: "a1f3b9c", by: "rita.chen",     at: "10:38 — 4m ago",  dur: "2m 18s", status: "rolling", note: "canary 25%" },
    { id: "d-9820", svc: "payment-svc",   ver: "v8.12.0", prev: "v8.11.7",commit: "f4d2e8a", by: "jay.vasquez",   at: "10:24 — 18m ago", dur: "3m 42s", status: "ok",     note: "errors spike post-deploy" },
    { id: "d-9819", svc: "tax-calc",      ver: "v2.0.0",  prev: "v1.9.4", commit: "7c8b1ef", by: "rita.chen",     at: "09:48 — 54m ago", dur: "1m 54s", status: "ok" },
    { id: "d-9818", svc: "search",        ver: "v2.6.4",  prev: "v2.6.3", commit: "2e9a5fd", by: "maya.s",        at: "08:18 — 2h ago",  dur: "2m 02s", status: "rolledback", note: "p99 +180%" },
    { id: "d-9817", svc: "checkout-bff",  ver: "v3.4.1",  prev: "v3.4.0", commit: "9b3a47c", by: "jay.vasquez",   at: "Yesterday 16:42", dur: "1m 38s", status: "ok" },
    { id: "d-9816", svc: "fraud-detect",  ver: "v0.7.2",  prev: "v0.7.1", commit: "3c2f81b", by: "kai.olsson",    at: "Yesterday 14:11", dur: "4m 10s", status: "failed",  note: "image pull error" },
    { id: "d-9815", svc: "inventory",     ver: "v9.8.1",  prev: "v9.8.0", commit: "8d1e4f2", by: "maya.s",        at: "Yesterday 11:32", dur: "1m 21s", status: "ok" },
    { id: "d-9814", svc: "shipping-rates",ver: "v6.2.0",  prev: "v6.1.6", commit: "4f5a9c1", by: "kai.olsson",    at: "Yesterday 09:18", dur: "2m 44s", status: "ok" },
  ];

  // Hourly bins for last 24h, count of deploys per hour
  const deployTimeline = [0,0,1,0,0,1,0,2,1,0,0,1,0,1,0,2,1,0,3,2,0,1,2,1,0,2,1,0,3,1,0,2,1,0,1,2,1,0,4,2,0,2,1,3,2,1,3,2];

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {[
          { label: "Deploys today",  value: "14", sub: "12 services", delta: "+4 vs 7d avg" },
          { label: "Success rate",   value: "92%", sub: "1 rolling back · 1 failed", delta: "−4% vs 7d", deltaCls: "warn" },
          { label: "Lead time",      value: "1h 28m", sub: "commit → prod" },
          { label: "Change failure", value: "8%",  sub: "rollbacks ÷ deploys", delta: "+2%", deltaCls: "down warn" },
        ].map(k => (
          <div key={k.label} className="card">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div className="card-sub" style={{ fontSize: 12 }}>{k.label}</div>
              {k.delta && <span className={"delta " + (k.deltaCls || "")}>{k.delta}</span>}
            </div>
            <div className="stat-value" style={{ fontSize: 26, marginTop: 6 }}>{k.value}</div>
            <div className="muted" style={{ fontSize: 11.5, marginTop: 4 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="card card-pad-lg">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <div className="card-title">Deploy timeline · last 48h</div>
            <div className="card-sub" style={{ marginTop: 2 }}>Each bar = deploys in that hour · color shows worst status</div>
          </div>
          <div className="row">
            <div className="seg">
              <div className="seg-opt active">48h</div>
              <div className="seg-opt">7d</div>
              <div className="seg-opt">30d</div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: `repeat(${deployTimeline.length}, 1fr)`, gap: 2, height: 80, alignItems: "end" }}>
          {deployTimeline.map((c, i) => {
            const isToday = i >= 24;
            const isFail = i === 16 || i === 38; // arbitrary fail markers
            const isRoll = i === 18 || i === 47;
            const color = isFail ? "var(--err)" : isRoll ? "var(--warn)" : c > 0 ? "var(--brand)" : "var(--bg-inset)";
            return (
              <div key={i} style={{
                background: color,
                height: Math.max(4, c * 16) + "px",
                borderRadius: 2,
                opacity: c === 0 ? 0.3 : isToday ? 1 : 0.7,
              }} title={`${c} deploys`}/>
            );
          })}
        </div>
        <div className="row" style={{ marginTop: 6, justifyContent: "space-between" }}>
          <div className="muted mono" style={{ fontSize: 10.5 }}>2d ago</div>
          <div className="muted mono" style={{ fontSize: 10.5 }}>Yesterday</div>
          <div className="muted mono" style={{ fontSize: 10.5 }}>Today</div>
          <div className="muted mono" style={{ fontSize: 10.5 }}>Now</div>
        </div>
      </div>

      <div className="card card-pad-lg">
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
          <div>
            <div className="card-title">Recent deploys</div>
            <div className="card-sub" style={{ marginTop: 2 }}>Across all services · click a row to see post-deploy signals</div>
          </div>
          <div className="row">
            <div className="search" style={{ width: 240 }}>
              <Icon name="search" size={14} className="muted"/>
              <input placeholder="Filter by service or deployer…"/>
            </div>
            <button className="btn"><Icon name="filter" size={14}/>Status · all</button>
          </div>
        </div>

        <table className="tbl">
          <thead>
            <tr>
              <th style={{ paddingLeft: 0 }}>Service</th>
              <th>Version</th>
              <th>Commit</th>
              <th>Deployer</th>
              <th>When</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Post-deploy</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {deploys.map((d, i) => (
              <tr key={d.id} onClick={() => go("serviceDetail", { id: d.svc })} style={{ cursor: "pointer" }}>
                <td style={{ paddingLeft: 0 }}>
                  <div className="mono" style={{ fontWeight: 600, color: "var(--fg-0)" }}>{d.svc}</div>
                  <div className="muted" style={{ fontSize: 11 }}>{d.id}</div>
                </td>
                <td>
                  <span className="mono" style={{ color: "var(--fg-0)" }}>{d.ver}</span>
                  <div className="muted mono" style={{ fontSize: 11 }}>from {d.prev}</div>
                </td>
                <td className="mono muted" style={{ fontSize: 12 }}>{d.commit}</td>
                <td>{d.by}</td>
                <td className="muted">{d.at}</td>
                <td className="mono" style={{ fontVariantNumeric: "tabular-nums" }}>{d.dur}</td>
                <td>
                  {d.status === "ok"        && <span className="badge ok"><span className="b-dot"/>success</span>}
                  {d.status === "rolling"   && <span className="badge info"><span className="b-dot"/>rolling out</span>}
                  {d.status === "rolledback"&& <span className="badge warn"><span className="b-dot"/>rolled back</span>}
                  {d.status === "failed"    && <span className="badge err"><span className="b-dot"/>failed</span>}
                </td>
                <td>
                  {d.note ? (
                    <span className="muted" style={{ fontSize: 11.5 }}>{d.note}</span>
                  ) : (
                    <MiniSpark seed={i + 30} width={110} color={d.status === "failed" || d.status === "rolledback" ? "var(--err)" : "var(--chart-1)"}/>
                  )}
                </td>
                <td><Icon name="chevron-right" size={14} className="muted"/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* =========================================================
   SERVICE DETAIL — "service homepage": header + signals + alerts + endpoints + errors + traces
   ========================================================= */
function ServiceDetailScreen({ go, params }) {
  const id = (params && params.id) || "payment-svc";
  const [tab, setTab] = useStateA("overview");
  const [signalsRange, setSignalsRange] = useStateA("1h");

  const initials = id.split("-").slice(0, 2).map(s => s[0].toUpperCase()).join("");

  // Deploy markers (offsets along signal charts, as a fraction 0..1)
  const deployMarkers = [
    { at: 0.18, ver: "v8.11.7", time: "−54m", status: "ok" },
    { at: 0.58, ver: "v8.12.0", time: "−18m", status: "warn", current: true },
  ];

  return (
    <div className="page">
      {/* Breadcrumb */}
      <div className="row">
        <button className="btn btn-ghost" onClick={() => go("services")}><Icon name="back" size={14}/>Services</button>
        <span className="muted">/</span>
        <span style={{ fontSize: 13, color: "var(--fg-0)", fontWeight: 600 }}>{id}</span>
      </div>

      {/* Profile header */}
      <div className="row" style={{ gap: 16, alignItems: "flex-start" }}>
        <div style={{ width: 64, height: 64, borderRadius: 14, background: "linear-gradient(135deg,#8b5cf6,#3b82f6)", color: "white", fontWeight: 700, fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", letterSpacing: "-0.02em", flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row" style={{ alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
            <div className="page-title">{id}</div>
            <span className="badge warn"><span className="b-dot"/>Warn</span>
            <span className="badge neutral mono">v8.12.0</span>
            <span className="badge neutral">Tier 0</span>
            <span className="badge neutral">prod</span>
            <span className="muted" style={{ fontSize: 12.5 }}>12 instances · 3 azs · us-east-1</span>
          </div>
          <div className="row" style={{ marginTop: 8, gap: 24, flexWrap: "wrap" }}>
            <div className="row" style={{ gap: 6 }}>
              <span className="muted" style={{ fontSize: 11.5 }}>Team</span>
              <span style={{ fontSize: 12.5, fontWeight: 500 }}>payments</span>
            </div>
            <div className="row" style={{ gap: 6 }}>
              <span className="muted" style={{ fontSize: 11.5 }}>Owner</span>
              <span style={{ fontSize: 12.5 }}>Jay Vasquez</span>
            </div>
            <div className="row" style={{ gap: 6 }}>
              <span className="muted" style={{ fontSize: 11.5 }}>Runbook</span>
              <a style={{ fontSize: 12.5, color: "var(--brand-deep)", textDecoration: "underline" }}>payments-runbook.md</a>
            </div>
            <div className="row" style={{ gap: 6 }}>
              <span className="muted" style={{ fontSize: 11.5 }}>Repo</span>
              <a style={{ fontSize: 12.5, color: "var(--brand-deep)" }} className="mono">github.com/my-org/payment-svc <Icon name="link-ext" size={11}/></a>
            </div>
            <div className="row" style={{ gap: 6 }}>
              <span className="muted" style={{ fontSize: 11.5 }}>Last deploy</span>
              <span className="mono" style={{ fontSize: 12.5 }}>v8.12.0</span>
              <span className="muted" style={{ fontSize: 11.5 }}>· 18m ago by rita.chen</span>
            </div>
          </div>
        </div>
        <div className="row" style={{ flexShrink: 0 }}>
          <button className="btn"><Icon name="share" size={14}/>Share</button>
          <button className="btn btn-icon"><Icon name="more" size={14}/></button>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: "overview",     label: "Overview" },
          { id: "deployments",  label: "Deployments", badge: "3", badgeKind: "neutral" },
          { id: "errors",       label: "Errors", badge: 24, badgeKind: "err" },
          { id: "traces",       label: "Traces" },
          { id: "logs",         label: "Logs" },
          { id: "dependencies", label: "Dependencies" },
        ]}
        active={tab} setActive={setTab}
      />

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {[
          { label: "Requests",      value: "14.8k", unit: "rps",            delta: "-2.4%",  deltaCls: "up",        chart: 1, color: "var(--chart-1)" },
          { label: "Errors",        value: "0.42%", unit: "rate",            delta: "+0.18%", deltaCls: "down warn", chart: 2, color: "var(--warn)" },
          { label: "Latency p99",   value: "184ms", unit: "+22ms vs 1h ago", delta: "+13.6%", deltaCls: "down",      chart: 3, color: "var(--err)" },
          { label: "Saturation",    value: "62%",   unit: "max(cpu,mem,disk)", delta: "+4%",  deltaCls: "down warn", chart: 4, color: "var(--warn)" },
        ].map(k => (
          <div key={k.label} className="card">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div className="card-sub" style={{ fontSize: 12 }}>{k.label}</div>
              <span className={"delta " + k.deltaCls}>{k.delta}</span>
            </div>
            <div className="row" style={{ alignItems: "baseline", marginTop: 6, gap: 8 }}>
              <div className="stat-value" style={{ fontSize: 28 }}>{k.value}</div>
              <div className="stat-unit">{k.unit}</div>
            </div>
            <MiniSpark seed={k.chart} color={k.color} height={32} width={260} />
          </div>
        ))}
      </div>

      {/* Golden signals + Active alerts */}
      <div style={{ display: "grid", gridTemplateColumns: "2.1fr 1fr", gap: 16 }}>
        <div className="card card-pad-lg">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div>
              <div className="card-title">Golden signals</div>
              <div className="card-sub" style={{ marginTop: 2 }}>Request · errors · latency · saturation · with deploy markers</div>
            </div>
            <div className="seg">
              {["1h","6h","24h","7d"].map(r => (
                <div key={r} className={"seg-opt" + (signalsRange === r ? " active" : "")} onClick={() => setSignalsRange(r)}>{r}</div>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 14 }}>
            {[
              { label: "Request rate", unit: "rps",  legend: "p50 12.4k · p99 14.8k", seed: 21, color: "var(--chart-1)", soft: "var(--chart-1-soft)", base: 0.5, amp: 0.22 },
              { label: "Error rate",    unit: "%",    legend: "0.42% · spike +220% after deploy", seed: 22, color: "var(--warn)", soft: "var(--warn-soft)", base: 0.4, amp: 0.34 },
              { label: "Latency p50/p95/p99", unit: "ms", legend: "p50 18ms · p95 84ms · p99 184ms", seed: 23, color: "var(--err)", soft: "var(--err-soft)", base: 0.55, amp: 0.28 },
              { label: "Saturation · CPU max", unit: "%", legend: "p99 62% across fleet", seed: 24, color: "var(--accent-violet)", soft: "var(--accent-violet-soft)", base: 0.55, amp: 0.2 },
            ].map(s => (
              <div key={s.label}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div className="muted" style={{ fontSize: 12 }}>{s.label} <span className="mono">· {s.unit}</span></div>
                  <div className="muted" style={{ fontSize: 11 }}>{s.legend}</div>
                </div>
                <div style={{ position: "relative", marginTop: 4 }}>
                  <AreaSpark seed={s.seed} color={s.color} soft={s.soft} height={96} base={s.base} amp={s.amp}/>
                  {/* Deploy marker overlay */}
                  <svg style={{ position: "absolute", inset: 0, pointerEvents: "none" }} width="100%" height="96" viewBox="0 0 100 96" preserveAspectRatio="none">
                    {deployMarkers.map((m, i) => (
                      <line key={i} x1={m.at*100} y1="0" x2={m.at*100} y2="96" stroke={m.current ? "var(--brand)" : "var(--fg-mute)"} strokeDasharray={m.current ? "" : "3 3"} strokeWidth="1" strokeOpacity={m.current ? 0.65 : 0.45}/>
                    ))}
                  </svg>
                </div>
              </div>
            ))}
          </div>
          <div className="row" style={{ marginTop: 10, gap: 14 }}>
            <div className="row" style={{ gap: 6 }}>
              <span style={{ width: 12, height: 2, background: "var(--brand)" }}/>
              <span className="muted" style={{ fontSize: 10.5 }}>v8.12.0 deploy · 18m ago</span>
            </div>
            <div className="row" style={{ gap: 6 }}>
              <span style={{ width: 12, height: 2, background: "var(--fg-mute)", borderTop: "1px dashed var(--fg-mute)" }}/>
              <span className="muted" style={{ fontSize: 10.5 }}>previous deploy · 54m ago</span>
            </div>
          </div>
        </div>

        {/* Active alerts */}
        <div className="card card-pad-lg">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div>
              <div className="card-title">Active alerts</div>
              <div className="card-sub" style={{ marginTop: 2 }}>3 firing on {id}</div>
            </div>
            <button className="btn btn-ghost" style={{ height: 26 }}><Icon name="link-ext" size={12}/>All alerts</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
            {[
              { sev: "err",  name: "Error rate spike", val: "0.42% > 0.05%", time: "fired 12m ago", note: "5xx error budget exhausted · trending up" },
              { sev: "err",  name: "Stripe upstream timeouts", val: "184 events/5m", time: "fired 8m ago", note: "stripe.charges.create · status=null" },
              { sev: "warn", name: "p99 latency drift",  val: "184ms vs 142ms target", time: "fired 4m ago", note: "regression since v8.12.0" },
            ].map((a, i) => (
              <div key={i} style={{ border: "1px solid " + (a.sev === "err" ? "color-mix(in oklab, var(--err) 30%, var(--line))" : "color-mix(in oklab, var(--warn) 30%, var(--line))"), borderRadius: 8, padding: 10, background: a.sev === "err" ? "color-mix(in oklab, var(--err) 4%, var(--bg-card))" : "color-mix(in oklab, var(--warn) 4%, var(--bg-card))" }}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div className="row" style={{ gap: 6 }}>
                    <span className={"badge " + a.sev}><span className="b-dot"/>{a.sev === "err" ? "critical" : "warn"}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--fg-0)" }}>{a.name}</span>
                  </div>
                  <Icon name="more" size={13} className="muted"/>
                </div>
                <div className="muted mono" style={{ fontSize: 11, marginTop: 5 }}>{a.val}</div>
                <div className="row" style={{ justifyContent: "space-between", marginTop: 5 }}>
                  <div className="muted" style={{ fontSize: 11 }}>{a.note}</div>
                  <div className="muted" style={{ fontSize: 10.5 }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
          <button className="btn btn-ghost" style={{ marginTop: 12, width: "100%", justifyContent: "center", height: 30 }}><Icon name="check" size={13}/>Acknowledge all</button>
        </div>
      </div>

      {/* Service map · live topology */}
      <div className="card card-pad-lg">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <div className="card-title">Service map</div>
            <div className="card-sub" style={{ marginTop: 2 }}>2 upstream · 5 downstream · live request flow · last 1 minute</div>
          </div>
          <div className="row">
            <div className="seg">
              <div className="seg-opt active">Requests</div>
              <div className="seg-opt">Errors</div>
              <div className="seg-opt">Latency</div>
            </div>
            <button className="btn btn-ghost" style={{ height: 26 }}><Icon name="filter" size={12}/>2 hops</button>
            <button className="btn btn-ghost" style={{ height: 26 }}><Icon name="link-ext" size={12}/>Open map</button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18, marginTop: 14 }}>
          {/* Topology SVG */}
          <div style={{ position: "relative", background: "var(--bg-inset)", borderRadius: 8, padding: "10px 14px", overflow: "hidden", border: "1px solid var(--line-2)" }}>
            <svg viewBox="0 0 880 420" style={{ display: "block", width: "100%", height: 420 }}>
              <defs>
                {/* arrow head */}
                <marker id="arrow-flow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M0 0 L10 5 L0 10 z" fill="var(--fg-mute)" opacity="0.5"/>
                </marker>
                <pattern id="dot-grid" width="22" height="22" patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="0.6" fill="var(--fg-mute)" opacity="0.18"/>
                </pattern>
              </defs>

              <rect x="0" y="0" width="880" height="420" fill="url(#dot-grid)"/>

              {/* Column labels */}
              <text x="120" y="22" fontSize="9.5" fill="var(--fg-mute)" fontFamily="var(--font)" fontWeight="700" letterSpacing="1.5" textAnchor="middle">UPSTREAM</text>
              <text x="440" y="22" fontSize="9.5" fill="var(--brand-deep)" fontFamily="var(--font)" fontWeight="700" letterSpacing="1.5" textAnchor="middle">THIS SERVICE</text>
              <text x="760" y="22" fontSize="9.5" fill="var(--fg-mute)" fontFamily="var(--font)" fontWeight="700" letterSpacing="1.5" textAnchor="middle">DOWNSTREAM</text>

              {/* Edges */}
              {[
                { d: "M210,110 C280,110 280,165 350,175", w: 5,  col: "var(--chart-1)", dot: "var(--chart-1)", dur: "3s",   delay: "0s",   label: "8.2k rps · 0.04%", lx: 280, ly: 130 },
                { d: "M210,250 C280,250 280,205 350,195", w: 3,  col: "var(--err)",     dot: "var(--err)",     dur: "3.4s", delay: "0.7s", label: "3.1k · 1.92%",     lx: 280, ly: 238 },
                { d: "M530,170 C600,170 600,55  670,55",  w: 4,  col: "var(--chart-1)", dot: "var(--chart-1)", dur: "3.1s", delay: "0.3s", label: "9.8k qps · p95 12ms", lx: 600, ly: 102 },
                { d: "M530,178 C600,178 600,135 670,135", w: 6,  col: "var(--chart-3)", dot: "var(--chart-3)", dur: "2.6s", delay: "0.9s", label: "42.8k ops · p99 0.4ms", lx: 600, ly: 146 },
                { d: "M530,185 C600,185 600,215 670,215", w: 4,  col: "var(--warn)",    dot: "var(--warn)",    dur: "3.3s", delay: "1.4s", label: "12.4k msg/s · lag 0",   lx: 600, ly: 192 },
                { d: "M530,193 C600,193 600,295 670,295", w: 3,  col: "var(--chart-1)", dot: "var(--chart-1)", dur: "3s",   delay: "0.5s", label: "5.1k · 0.14%",          lx: 600, ly: 256 },
                { d: "M530,200 C600,200 600,375 670,375", w: 2,  col: "var(--err)",     dot: "var(--err)",     dur: "3.6s", delay: "1.8s", label: "184 evts/5m · timeouts", lx: 600, ly: 332 },
              ].map((e, i) => (
                <g key={i}>
                  {/* trail */}
                  <path d={e.d} stroke={e.col} strokeOpacity="0.16" strokeWidth={e.w + 4} fill="none" strokeLinecap="round"/>
                  {/* line */}
                  <path d={e.d} stroke={e.col} strokeOpacity="0.85" strokeWidth="1.4" fill="none" markerEnd="url(#arrow-flow)"/>
                  {/* edge label */}
                  <text x={e.lx} y={e.ly} fontSize="10" fill="var(--fg-2)" fontFamily="var(--font-mono)" textAnchor="middle" style={{ paintOrder: "stroke", stroke: "var(--bg-inset)", strokeWidth: 4 }}>{e.label}</text>
                  {/* flowing dots — two staggered for continuous feel */}
                  <circle r="3" fill={e.dot}>
                    <animateMotion dur={e.dur} repeatCount="indefinite" begin={e.delay} path={e.d}/>
                  </circle>
                  <circle r="2" fill={e.dot} opacity="0.55">
                    <animateMotion dur={e.dur} repeatCount="indefinite" begin={(parseFloat(e.delay) + parseFloat(e.dur) / 2) + "s"} path={e.d}/>
                  </circle>
                </g>
              ))}

              {/* NODES */}
              {[
                { name: "checkout-bff",   sub: "http · ruby",    x: 30,  y: 80,  status: "ok"   },
                { name: "search",         sub: "grpc · go",      x: 30,  y: 220, status: "err"  },
                { name: "checkout-prod",  sub: "postgres 15",    x: 670, y: 25,  status: "warn" },
                { name: "redis-shard-1",  sub: "redis 7 · cache",x: 670, y: 105, status: "ok"   },
                { name: "events-prod",    sub: "kafka cluster",  x: 670, y: 185, status: "warn" },
                { name: "tax-calc",       sub: "http · python",  x: 670, y: 265, status: "ok"   },
                { name: "fraud-detect",   sub: "grpc · go",      x: 670, y: 345, status: "warn" },
              ].map((n, i) => {
                const fill = n.status === "err" ? "var(--err)" : n.status === "warn" ? "var(--warn)" : "var(--ok)";
                return (
                  <g key={n.name} transform={`translate(${n.x}, ${n.y})`} style={{ cursor: "pointer" }}>
                    <rect width="180" height="60" rx="10" fill="var(--bg-card)" stroke="var(--line)" strokeWidth="1"/>
                    <rect x="0" y="0" width="4" height="60" rx="2" fill={fill}/>
                    <text x="16" y="24" fontSize="13" fontWeight="700" fill="var(--fg-0)" fontFamily="var(--font)">{n.name}</text>
                    <text x="16" y="42" fontSize="10.5" fill="var(--fg-3)" fontFamily="var(--font-mono)">{n.sub}</text>
                    <circle cx="166" cy="14" r="3.5" fill={fill}/>
                  </g>
                );
              })}

              {/* CENTER NODE */}
              <g transform="translate(350, 125)">
                <rect width="180" height="110" rx="12" fill="var(--brand-tint)" stroke="var(--brand)" strokeWidth="2"/>
                <text x="16" y="26" fontSize="14" fontWeight="700" fill="var(--fg-0)" fontFamily="var(--font)">payment-svc</text>
                <text x="16" y="42" fontSize="10.5" fill="var(--brand-deep)" fontFamily="var(--font-mono)" fontWeight="600">v8.12.0 · 12 pods</text>
                <line x1="16" y1="54" x2="164" y2="54" stroke="var(--brand)" strokeOpacity="0.2"/>
                <text x="16" y="74" fontSize="11" fill="var(--fg-1)" fontFamily="var(--font-mono)" fontWeight="600">14.8k rps</text>
                <text x="16" y="90" fontSize="11" fill="var(--warn-fg)" fontFamily="var(--font-mono)" fontWeight="600">errors 0.42%</text>
                <text x="100" y="74" fontSize="11" fill="var(--err)" fontFamily="var(--font-mono)" fontWeight="600">p99 184ms</text>
                <text x="100" y="90" fontSize="11" fill="var(--warn-fg)" fontFamily="var(--font-mono)" fontWeight="600">sat 62%</text>
                <rect x="0" y="0" width="180" height="110" rx="12" fill="none" stroke="var(--brand)" strokeOpacity="0.3" strokeWidth="6"/>
              </g>
            </svg>

            {/* legend */}
            <div className="row" style={{ position: "absolute", left: 18, bottom: 12, gap: 14, padding: "6px 10px", background: "color-mix(in oklab, var(--bg-card) 92%, transparent)", borderRadius: 6, border: "1px solid var(--line-2)" }}>
              <div className="row" style={{ gap: 5 }}><span style={{ width: 18, height: 3, background: "var(--chart-3)", borderRadius: 2 }}/><span className="muted" style={{ fontSize: 10.5 }}>healthy</span></div>
              <div className="row" style={{ gap: 5 }}><span style={{ width: 18, height: 3, background: "var(--warn)", borderRadius: 2 }}/><span className="muted" style={{ fontSize: 10.5 }}>at risk</span></div>
              <div className="row" style={{ gap: 5 }}><span style={{ width: 18, height: 3, background: "var(--err)", borderRadius: 2 }}/><span className="muted" style={{ fontSize: 10.5 }}>burning</span></div>
              <div className="row" style={{ gap: 5, marginLeft: 6 }}><span className="muted" style={{ fontSize: 10.5 }}>edge width = traffic</span></div>
            </div>
          </div>

          {/* Side: dependency list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="label-up">Dependencies · 7</div>
            {[
              { name: "checkout-bff",            role: "upstream",   rps: "8.2k",        err: 0.04, status: "ok",   seed: 51 },
              { name: "search",                   role: "upstream",   rps: "3.1k",        err: 1.92, status: "err",  seed: 52, note: "elevated 5xx · 4m" },
              { name: "checkout-prod",            role: "downstream", rps: "9.8k qps",    err: 0.0,  status: "warn", seed: 53, note: "pool waits +180%", onClick: "database" },
              { name: "redis-shard-1",            role: "downstream", rps: "42.8k ops/s", err: 0.0,  status: "ok",   seed: 54 },
              { name: "events-prod",              role: "downstream", rps: "12.4k msg/s", err: 0.0,  status: "warn", seed: 55, note: "consumer lag 0", onClick: "kafka" },
              { name: "tax-calc",                 role: "downstream", rps: "5.1k",        err: 0.14, status: "ok",   seed: 56 },
              { name: "fraud-detect",             role: "downstream", rps: "1.8k",        err: 0.42, status: "warn", seed: 57, note: "timeouts to stripe" },
            ].map((d, i) => (
              <div key={i} className="row" style={{ padding: "8px 10px", borderRadius: 6, background: "var(--bg-inset)", justifyContent: "space-between", cursor: d.onClick ? "pointer" : "default", border: "1px solid " + (d.status === "err" ? "color-mix(in oklab, var(--err) 25%, transparent)" : "transparent") }} onClick={d.onClick ? () => go(d.onClick) : undefined}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row" style={{ gap: 7 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: d.status === "err" ? "var(--err)" : d.status === "warn" ? "var(--warn)" : "var(--ok)", flexShrink: 0 }}/>
                    <span className="mono" style={{ fontSize: 12, color: "var(--fg-0)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</span>
                  </div>
                  <div className="muted" style={{ fontSize: 10.5, marginTop: 2 }}>{d.role} · {d.rps}{d.note ? " · " + d.note : ""}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <MiniSpark seed={d.seed} width={60} height={18} color={d.status === "err" ? "var(--err)" : d.status === "warn" ? "var(--warn)" : "var(--chart-1)"}/>
                  <div className="mono muted" style={{ fontSize: 10.5 }}>{d.err.toFixed(2)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent deployments timeline */}
      <div className="card card-pad-lg">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <div className="card-title">Recent deployments</div>
            <div className="card-sub" style={{ marginTop: 2 }}>5 releases · last 24 hours · click a deploy to compare signals before / after</div>
          </div>
          <div className="row">
            <button className="btn btn-ghost" style={{ height: 26 }}><Icon name="refresh" size={12}/>Compare to v8.11.7</button>
            <button className="btn btn-ghost" style={{ height: 26 }}><Icon name="link-ext" size={12}/>Pipeline</button>
            <button className="btn"><Icon name="alert" size={14}/>Rollback to v8.11.7</button>
          </div>
        </div>

        {/* Timeline rail */}
        <div style={{ position: "relative", margin: "20px 8px 28px", height: 64 }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 30, height: 2, background: "var(--line)", borderRadius: 1 }}/>
          {/* tick labels */}
          {[
            { x: "0%",   t: "24h ago" },
            { x: "25%",  t: "18h" },
            { x: "50%",  t: "12h" },
            { x: "75%",  t: "6h" },
            { x: "100%", t: "now" },
          ].map((t, i) => (
            <div key={i} style={{ position: "absolute", left: t.x, top: 26, transform: "translateX(-50%)" }}>
              <div style={{ width: 1, height: 10, background: "var(--fg-mute)", margin: "0 auto" }}/>
              <div className="muted" style={{ fontSize: 10, marginTop: 4, textAlign: "center" }}>{t.t}</div>
            </div>
          ))}
          {/* deploy markers */}
          {[
            { at: 0.08,  ver: "v8.10.2", who: "amber.lee", time: "22h ago", status: "ok"   },
            { at: 0.25,  ver: "v8.11.0", who: "j.tran",    time: "18h ago", status: "ok"   },
            { at: 0.55,  ver: "v8.11.5", who: "rita.chen", time: "11h ago", status: "ok"   },
            { at: 0.78,  ver: "v8.11.7", who: "amber.lee", time: "54m ago", status: "ok"   },
            { at: 0.95,  ver: "v8.12.0", who: "rita.chen", time: "18m ago", status: "warn", current: true },
          ].map((d, i) => {
            const fill = d.status === "err" ? "var(--err)" : d.status === "warn" ? "var(--warn)" : "var(--ok)";
            return (
              <div key={i} style={{ position: "absolute", left: (d.at * 100) + "%", top: 18, transform: "translateX(-50%)", textAlign: "center" }}>
                <div className="mono" style={{ fontSize: 10.5, fontWeight: 600, color: d.current ? "var(--brand-deep)" : "var(--fg-1)", marginBottom: 4 }}>{d.ver}</div>
                <div style={{ width: d.current ? 18 : 14, height: d.current ? 18 : 14, borderRadius: "50%", background: "var(--bg-card)", border: "2px solid " + fill, display: "inline-flex", boxShadow: d.current ? ("0 0 0 5px color-mix(in oklab, " + fill + " 22%, transparent)") : "none", alignItems: "center", justifyContent: "center" }}>
                  {d.current && <div style={{ width: 6, height: 6, borderRadius: "50%", background: fill }}/>}
                </div>
                <div className="muted" style={{ fontSize: 9.5, marginTop: 4, whiteSpace: "nowrap" }}>{d.who}</div>
              </div>
            );
          })}
        </div>

        {/* Per-deploy impact */}
        <table className="tbl" style={{ marginTop: 4 }}>
          <thead>
            <tr>
              <th style={{ paddingLeft: 0 }}>Version</th>
              <th>Released</th>
              <th>Author</th>
              <th>Commit · changes</th>
              <th>Δ Errors</th>
              <th>Δ p99</th>
              <th>Δ Saturation</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {[
              { ver: "v8.12.0", time: "18m ago",  who: "rita.chen", commit: "20ba417", chg: "+248 / −62 in 19 files",  dErr: "+0.24pp", dErrCls: "down",        dP99: "+22ms",  dP99Cls: "down",        dSat: "+4%",  dSatCls: "down warn", status: "warn", note: "current · pr#4218" },
              { ver: "v8.11.7", time: "54m ago",  who: "amber.lee", commit: "9a2cf83", chg: "+18 / −2 in 3 files",     dErr: "0pp",     dErrCls: "",            dP99: "−4ms",   dP99Cls: "up",          dSat: "0%",    dSatCls: "",          status: "ok",   note: "stripe sdk bump" },
              { ver: "v8.11.5", time: "11h ago",  who: "rita.chen", commit: "55b8201", chg: "+62 / −18 in 6 files",    dErr: "−0.04pp", dErrCls: "up",          dP99: "+2ms",   dP99Cls: "down warn",   dSat: "+1%",  dSatCls: "down warn", status: "ok",   note: "fraud-detect retry policy" },
              { ver: "v8.11.0", time: "18h ago",  who: "j.tran",    commit: "c1ee049", chg: "+412 / −180 in 28 files", dErr: "0pp",     dErrCls: "",            dP99: "+8ms",   dP99Cls: "down",        dSat: "−2%",   dSatCls: "up",        status: "ok",   note: "feature flag · idempotency v2" },
              { ver: "v8.10.2", time: "22h ago",  who: "amber.lee", commit: "8f3a12b", chg: "+128 / −44 in 14 files",  dErr: "−0.12pp", dErrCls: "up",          dP99: "−18ms",  dP99Cls: "up",          dSat: "0%",    dSatCls: "",          status: "ok",   note: "connection pool tuning" },
            ].map((d, i) => (
              <tr key={i} style={{ background: i === 0 ? "var(--brand-tint)" : undefined }}>
                <td style={{ paddingLeft: 0 }}>
                  <div className="row" style={{ gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: d.status === "err" ? "var(--err)" : d.status === "warn" ? "var(--warn)" : "var(--ok)" }}/>
                    <span className="mono" style={{ color: "var(--fg-0)", fontSize: 12.5, fontWeight: 600 }}>{d.ver}</span>
                    {i === 0 && <span className="badge info" style={{ height: 16, padding: "0 6px", fontSize: 9.5 }}>current</span>}
                  </div>
                </td>
                <td className="muted" style={{ fontSize: 12 }}>{d.time}</td>
                <td style={{ fontSize: 12 }}>{d.who}</td>
                <td>
                  <div className="mono" style={{ fontSize: 11.5, color: "var(--brand-deep)" }}>{d.commit}</div>
                  <div className="muted" style={{ fontSize: 10.5 }}>{d.chg}</div>
                </td>
                <td className="mono"><span className={"delta " + d.dErrCls} style={{ fontSize: 11.5 }}>{d.dErr}</span></td>
                <td className="mono"><span className={"delta " + d.dP99Cls} style={{ fontSize: 11.5 }}>{d.dP99}</span></td>
                <td className="mono"><span className={"delta " + d.dSatCls} style={{ fontSize: 11.5 }}>{d.dSat}</span></td>
                <td className="muted" style={{ fontSize: 11 }}>{d.note}</td>
                <td><Icon name="chevron-right" size={14} className="muted"/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Top endpoints + Resource consumption */}
      <div style={{ display: "grid", gridTemplateColumns: "2.1fr 1fr", gap: 16 }}>
        <div className="card card-pad-lg">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div>
              <div className="card-title">Top endpoints</div>
              <div className="card-sub" style={{ marginTop: 2 }}>By total requests · last 1 hour</div>
            </div>
            <div className="row">
              <button className="btn btn-ghost" style={{ height: 26 }}>Sort · errors</button>
              <button className="btn btn-ghost" style={{ height: 26 }}>Show all 28</button>
            </div>
          </div>
          <table className="tbl" style={{ marginTop: 6 }}>
            <thead>
              <tr>
                <th style={{ paddingLeft: 0 }}>Endpoint</th>
                <th style={{ textAlign: "right" }}>Hits</th>
                <th style={{ textAlign: "right" }}>Errors</th>
                <th style={{ textAlign: "right" }}>P99</th>
                <th>Latency vs 1h ago</th>
                <th>Last hour</th>
              </tr>
            </thead>
            <tbody>
              {[
                { ep: "POST /v1/charges",         method: "POST", hits: "8.4k",  err: 4.2, p99: 384, delta: "+218ms", deltaCls: "down", seed: 81, lvl: "err" },
                { ep: "POST /v1/charges/:id/capture", method: "POST", hits: "2.1k", err: 0.4, p99: 142, delta: "+12ms",  deltaCls: "down warn", seed: 82, lvl: "warn" },
                { ep: "POST /v1/refunds",         method: "POST", hits: "1.8k",  err: 0.2, p99: 98,  delta: "−4ms",   deltaCls: "up",   seed: 83, lvl: "ok" },
                { ep: "GET /v1/payment_methods/:id", method: "GET", hits: "1.2k", err: 0.0, p99: 24,  delta: "0ms",    deltaCls: "",      seed: 84, lvl: "ok" },
                { ep: "POST /v1/payment_intents", method: "POST", hits: "924",   err: 0.4, p99: 188, delta: "+22ms",  deltaCls: "down warn", seed: 85, lvl: "warn" },
                { ep: "GET /v1/health",           method: "GET",  hits: "420",   err: 0.0, p99: 4,   delta: "0ms",    deltaCls: "",      seed: 86, lvl: "ok" },
              ].map((r, i) => (
                <tr key={i}>
                  <td style={{ paddingLeft: 0 }}>
                    <div className="row" style={{ gap: 8 }}>
                      <span className="mono" style={{ fontSize: 10, fontWeight: 700, padding: "1px 5px", background: r.method === "POST" ? "var(--brand-soft)" : "var(--ok-soft)", color: r.method === "POST" ? "var(--brand-deep)" : "#065f46", borderRadius: 3 }}>{r.method}</span>
                      <span className="mono" style={{ color: "var(--fg-0)", fontSize: 12.5 }}>{r.ep}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{r.hits}</td>
                  <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: r.err > 1 ? "var(--err)" : r.err > 0.2 ? "var(--warn-fg)" : "var(--fg-3)" }}>{r.err.toFixed(2)}%</td>
                  <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: r.lvl === "err" ? "var(--err)" : r.lvl === "warn" ? "var(--warn-fg)" : "var(--fg-1)" }}>{r.p99}ms</td>
                  <td><span className={"delta " + r.deltaCls} style={{ fontSize: 11.5 }}>{r.delta}</span></td>
                  <td><MiniSpark seed={r.seed} width={120} color={r.lvl === "err" ? "var(--err)" : r.lvl === "warn" ? "var(--warn)" : "var(--chart-1)"}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Resource consumption */}
        <div className="card card-pad-lg">
          <div className="card-title">Resource use · pod p99</div>
          <div className="card-sub" style={{ marginTop: 2 }}>12 pods · max across fleet</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 14 }}>
            {[
              { label: "CPU",     value: "62", unit: "%", limit: "of 4 cores", color: "var(--warn)", pct: 62, seed: 91 },
              { label: "Memory",  value: "1.8", unit: "GB", limit: "of 4 GB",   color: "var(--chart-1)", pct: 45, seed: 92 },
              { label: "Network", value: "184", unit: "MB/s", limit: "in + out", color: "var(--accent-violet)", pct: 38, seed: 93 },
              { label: "FS",      value: "12", unit: "%",  limit: "of 200 GB",  color: "var(--ok)", pct: 12, seed: 94 },
            ].map(r => (
              <div key={r.label}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div className="row" style={{ gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: r.color }}/>
                    <span style={{ fontSize: 12, color: "var(--fg-0)", fontWeight: 500 }}>{r.label}</span>
                  </div>
                  <div className="row" style={{ gap: 4, alignItems: "baseline" }}>
                    <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: "var(--fg-0)" }}>{r.value}</span>
                    <span className="muted" style={{ fontSize: 11 }}>{r.unit}</span>
                  </div>
                </div>
                <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{r.limit}</div>
                <div style={{ marginTop: 6, height: 4, background: "var(--bg-inset)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: r.pct + "%", height: "100%", background: r.color }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pod fleet */}
      <div className="card card-pad-lg">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <div className="card-title">Fleet · 12 pods</div>
            <div className="card-sub" style={{ marginTop: 2 }}>Live · k8s prod/us-east-1 · 1 outlier · 2 restarts in last 1h</div>
          </div>
          <div className="row">
            <div className="seg">
              <div className="seg-opt active">CPU</div>
              <div className="seg-opt">Mem</div>
              <div className="seg-opt">Requests</div>
              <div className="seg-opt">Errors</div>
              <div className="seg-opt">Restarts</div>
            </div>
            <button className="btn btn-ghost" style={{ height: 26 }}>Sort · outliers first</button>
            <button className="btn btn-ghost" style={{ height: 26 }} onClick={() => go("infrastructure")}><Icon name="link-ext" size={12}/>Hosts</button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10, marginTop: 14 }}>
          {[
            { name: "payment-svc-7f8b9c-q9k2x", az: "use1-a", cpu: 94, mem: 78, rps: "1.42k", err: 3.8, age: "18m", status: "err",  outlier: true,  restarts: 0, seed: 41 },
            { name: "payment-svc-7f8b9c-mx84p", az: "use1-a", cpu: 71, mem: 52, rps: "1.31k", err: 0.4, age: "18m", status: "warn", outlier: false, restarts: 0, seed: 42 },
            { name: "payment-svc-7f8b9c-r2vc8", az: "use1-b", cpu: 68, mem: 48, rps: "1.28k", err: 0.5, age: "18m", status: "warn", outlier: false, restarts: 0, seed: 43 },
            { name: "payment-svc-7f8b9c-t81lz", az: "use1-c", cpu: 64, mem: 46, rps: "1.24k", err: 0.4, age: "18m", status: "warn", outlier: false, restarts: 1, restartReason: "OOMKilled · 32m ago", seed: 44 },
            { name: "payment-svc-7f8b9c-jc40e", az: "use1-b", cpu: 61, mem: 44, rps: "1.21k", err: 0.4, age: "18m", status: "warn", outlier: false, restarts: 0, seed: 45 },
            { name: "payment-svc-7f8b9c-h5wq1", az: "use1-c", cpu: 60, mem: 45, rps: "1.18k", err: 0.4, age: "18m", status: "warn", outlier: false, restarts: 0, seed: 46 },
            { name: "payment-svc-7f8b9c-kv7y2", az: "use1-a", cpu: 58, mem: 43, rps: "1.15k", err: 0.3, age: "18m", status: "ok",   outlier: false, restarts: 0, seed: 47 },
            { name: "payment-svc-7f8b9c-pq3n8", az: "use1-b", cpu: 56, mem: 42, rps: "1.14k", err: 0.3, age: "18m", status: "ok",   outlier: false, restarts: 0, seed: 48 },
            { name: "payment-svc-7f8b9c-z9ux4", az: "use1-a", cpu: 54, mem: 41, rps: "1.12k", err: 0.3, age: "18m", status: "ok",   outlier: false, restarts: 0, seed: 49 },
            { name: "payment-svc-7f8b9c-y2en7", az: "use1-c", cpu: 52, mem: 40, rps: "1.10k", err: 0.2, age: "18m", status: "ok",   outlier: false, restarts: 0, seed: 50 },
            { name: "payment-svc-7f8b9c-d6ka9", az: "use1-b", cpu: 50, mem: 38, rps: "1.08k", err: 0.2, age: "18m", status: "ok",   outlier: false, restarts: 0, seed: 58 },
            { name: "payment-svc-7f8b9c-b4tw3", az: "use1-a", cpu: 48, mem: 37, rps: "0.94k", err: 0.2, age: "4m",  status: "ok",   outlier: false, restarts: 1, restartReason: "rolling · 4m ago",     seed: 59 },
          ].map((p, i) => {
            const accent = p.status === "err" ? "var(--err)" : p.status === "warn" ? "var(--warn)" : "var(--ok)";
            const cpuCol = p.cpu >= 90 ? "var(--err)" : p.cpu >= 70 ? "var(--warn)" : "var(--ok)";
            const memCol = p.mem >= 90 ? "var(--err)" : p.mem >= 70 ? "var(--warn)" : "var(--chart-1)";
            return (
              <div key={i} style={{ background: "var(--bg-inset)", borderRadius: 8, padding: 12, border: "1px solid " + (p.outlier ? "color-mix(in oklab, var(--err) 35%, var(--line))" : "var(--line-2)"), position: "relative", overflow: "hidden", cursor: "pointer" }} onClick={() => go("containerDetail", { id: p.name })}>
                {p.outlier && <div style={{ position: "absolute", top: 6, right: 6 }}><span className="badge err" style={{ height: 16, padding: "0 6px", fontSize: 9.5 }}>outlier</span></div>}
                <div className="row" style={{ gap: 6 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: accent, flexShrink: 0 }}/>
                  <span className="mono" style={{ fontSize: 10.5, color: "var(--fg-0)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>…{p.name.slice(-9)}</span>
                </div>
                <div className="muted mono" style={{ fontSize: 9.5, marginTop: 2 }}>{p.az} · {p.age}</div>

                {/* CPU */}
                <div style={{ marginTop: 10 }}>
                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <span className="muted" style={{ fontSize: 9.5, letterSpacing: "0.06em", fontWeight: 700, textTransform: "uppercase" }}>CPU</span>
                    <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: cpuCol }}>{p.cpu}%</span>
                  </div>
                  <div style={{ marginTop: 3, height: 3, background: "var(--bg-card)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ width: p.cpu + "%", height: "100%", background: cpuCol }}/>
                  </div>
                </div>
                {/* MEM */}
                <div style={{ marginTop: 6 }}>
                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <span className="muted" style={{ fontSize: 9.5, letterSpacing: "0.06em", fontWeight: 700, textTransform: "uppercase" }}>MEM</span>
                    <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: memCol }}>{p.mem}%</span>
                  </div>
                  <div style={{ marginTop: 3, height: 3, background: "var(--bg-card)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ width: p.mem + "%", height: "100%", background: memCol }}/>
                  </div>
                </div>

                {/* spark */}
                <div style={{ marginTop: 8 }}>
                  <MiniSpark seed={p.seed} width={120} height={20} color={accent}/>
                </div>

                {/* footer */}
                <div className="row" style={{ marginTop: 6, justifyContent: "space-between" }}>
                  <span className="mono muted" style={{ fontSize: 10 }}>{p.rps} rps</span>
                  <span className="mono" style={{ fontSize: 10, color: p.err > 1 ? "var(--err)" : p.err > 0.3 ? "var(--warn-fg)" : "var(--fg-3)" }}>{p.err.toFixed(1)}%</span>
                </div>
                {p.restartReason && (
                  <div className="mono" style={{ fontSize: 9.5, color: "var(--warn-fg)", marginTop: 4, paddingTop: 4, borderTop: "1px solid var(--line-2)" }}>⟳ {p.restartReason}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Error breakdown */}
      <div className="card card-pad-lg">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <div className="card-title">Errors · breakdown</div>
            <div className="card-sub" style={{ marginTop: 2 }}>0.42% rate · 184 events/min · 24 unique groups</div>
          </div>
          <div className="row">
            <div className="seg">
              <div className="seg-opt active">By type</div>
              <div className="seg-opt">By endpoint</div>
              <div className="seg-opt">By host</div>
            </div>
            <button className="btn"><Icon name="link-ext" size={14}/>Open errors</button>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18, marginTop: 14 }}>
          <table className="tbl">
            <thead>
              <tr><th style={{ paddingLeft: 0 }}>Error type</th><th style={{ textAlign: "right" }}>Events</th><th style={{ textAlign: "right" }}>%</th><th>Last 1 hour</th><th>First / last seen</th></tr>
            </thead>
            <tbody>
              {[
                { name: "ConnectionResetError", note: "stripe.charges.create",    cnt: "142", pct: 77.2, seed: 101, lvl: "err", seen: "12m ago · ongoing" },
                { name: "TimeoutError",          note: "http.send /v1/charges",   cnt: "28",  pct: 15.2, seed: 102, lvl: "warn", seen: "8m ago · ongoing" },
                { name: "FraudCheckRejected",   note: "fraud-detect rule_id=8421", cnt: "8",   pct: 4.3,  seed: 103, lvl: "warn", seen: "42m ago · 12s ago" },
                { name: "ValidationError",      note: "card_number invalid",      cnt: "6",   pct: 3.3,  seed: 104, lvl: "ok", seen: "1h ago · 4m ago" },
              ].map((e, i) => (
                <tr key={i}>
                  <td style={{ paddingLeft: 0 }}>
                    <div className="row" style={{ gap: 8 }}>
                      <span className={"badge " + e.lvl} style={{ width: 8, height: 8, padding: 0, borderRadius: "50%" }}/>
                      <div>
                        <div className="mono" style={{ color: "var(--fg-0)", fontSize: 12.5, fontWeight: 600 }}>{e.name}</div>
                        <div className="muted mono" style={{ fontSize: 11 }}>{e.note}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{e.cnt}</td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 50, height: 4, background: "var(--bg-inset)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ width: e.pct + "%", height: "100%", background: e.lvl === "err" ? "var(--err)" : e.lvl === "warn" ? "var(--warn)" : "var(--fg-mute)" }}/>
                      </div>
                      <span className="muted" style={{ fontSize: 11 }}>{e.pct.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td><MiniSpark seed={e.seed} width={110} color={e.lvl === "err" ? "var(--err)" : e.lvl === "warn" ? "var(--warn)" : "var(--chart-1)"}/></td>
                  <td className="muted mono" style={{ fontSize: 11 }}>{e.seen}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Top stack frames */}
          <div style={{ background: "var(--bg-inset)", borderRadius: 8, padding: 14 }}>
            <div className="label-up" style={{ marginBottom: 8 }}>Top stack frames · ConnectionResetError</div>
            {[
              { fr: "HttpClient.send",            file: "lib/http_client.rb:142",    cnt: 142 },
              { fr: "Stripe::Charge.create",      file: "vendor/stripe/charge.rb:38", cnt: 142 },
              { fr: "PaymentsController#charge",  file: "app/controllers/payments_controller.rb:84", cnt: 142 },
              { fr: "ActionDispatch::Routing",    file: "actionpack-7.1.0/router.rb:42", cnt: 142 },
            ].map((f, i) => (
              <div key={i} style={{ padding: "8px 0", borderBottom: i < 3 ? "1px solid var(--line-2)" : 0 }}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <span className="mono" style={{ fontSize: 12, color: "var(--fg-0)", fontWeight: 500 }}>{f.fr}</span>
                  <span className="mono muted" style={{ fontSize: 11 }}>{f.cnt}</span>
                </div>
                <div className="mono muted" style={{ fontSize: 10.5, marginTop: 2 }}>{f.file}</div>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* Recent traces */}
      <div className="card card-pad-lg">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <div className="card-title">Recent traces · slow & failed</div>
            <div className="card-sub" style={{ marginTop: 2 }}>Sorted by duration · last 5 minutes · 184 errored / 1.2k slow (&gt;p95)</div>
          </div>
          <div className="row">
            <div className="seg">
              <div className="seg-opt active">All</div>
              <div className="seg-opt">Errors</div>
              <div className="seg-opt">&gt; p95</div>
              <div className="seg-opt">&gt; p99</div>
            </div>
            <button className="btn" onClick={() => go("traceList")}><Icon name="link-ext" size={14}/>Open in Trace Explorer</button>
          </div>
        </div>
        <table className="tbl" style={{ marginTop: 8 }}>
          <thead>
            <tr>
              <th style={{ paddingLeft: 0 }}>Operation</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Duration</th>
              <th>Latency</th>
              <th>Trace</th>
              <th>Caller</th>
              <th>Pod</th>
              <th>Started</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {[
              { op: "POST /v1/charges",         st: "error", dur: 8042, tid: "7b3f8a2e9c14d5b0", caller: "checkout-bff", pod: "…q9k2x", ago: "2s ago",  bar: 100, note: "stripe upstream timeout" },
              { op: "POST /v1/charges",         st: "error", dur: 8011, tid: "ab2f7e94d3c815a0", caller: "checkout-bff", pod: "…q9k2x", ago: "8s ago",  bar: 99,  note: "connection reset" },
              { op: "POST /v1/charges/:id/capture", st: "error", dur: 6014, tid: "32d5e8a7f9c14b20", caller: "checkout-bff", pod: "…mx84p", ago: "12s ago", bar: 75, note: "downstream postgres slow" },
              { op: "POST /v1/payment_intents", st: "warn",  dur: 1208, tid: "1d8e3f9b4a7c20e5", caller: "checkout-bff", pod: "…r2vc8", ago: "21s ago", bar: 15,  note: "fraud-detect p99 +12×" },
              { op: "POST /v1/charges",         st: "warn",  dur: 904,  tid: "4f2c8e9b1a3d7065", caller: "search",       pod: "…t81lz", ago: "32s ago", bar: 11,  note: "search service degraded" },
              { op: "POST /v1/charges",         st: "ok",    dur: 412,  tid: "5a8b3e2f9c1d4708", caller: "checkout-bff", pod: "…jc40e", ago: "1m ago",  bar: 5,   note: "" },
              { op: "POST /v1/refunds",         st: "ok",    dur: 198,  tid: "8f1ad9e4c2b76503", caller: "checkout-bff", pod: "…h5wq1", ago: "1m ago",  bar: 2,   note: "" },
              { op: "POST /v1/charges",         st: "ok",    dur: 184,  tid: "9a14c2b8e7f10d3a", caller: "checkout-bff", pod: "…kv7y2", ago: "1m ago",  bar: 2,   note: "" },
            ].map((t, i) => (
              <tr key={i} onClick={() => go("trace", { id: t.tid })} style={{ cursor: "pointer" }}>
                <td style={{ paddingLeft: 0 }}>
                  <div className="row" style={{ gap: 8 }}>
                    <span className="mono" style={{ fontSize: 10, fontWeight: 700, padding: "1px 5px", background: "var(--brand-soft)", color: "var(--brand-deep)", borderRadius: 3 }}>POST</span>
                    <span className="mono" style={{ color: "var(--fg-0)", fontSize: 12.5 }}>{t.op}</span>
                  </div>
                </td>
                <td>
                  <span className={"badge " + (t.st === "error" ? "err" : t.st === "warn" ? "warn" : "ok")}>
                    <span className="b-dot"/>{t.st}
                  </span>
                </td>
                <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: t.dur > 1000 ? "var(--err)" : t.dur > 400 ? "var(--warn-fg)" : "var(--fg-1)", fontWeight: 600 }}>{t.dur >= 1000 ? (t.dur / 1000).toFixed(2) + "s" : t.dur + "ms"}</td>
                <td>
                  <div style={{ width: 130, height: 5, background: "var(--bg-inset)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: t.bar + "%", height: "100%", background: t.st === "error" ? "var(--err)" : t.st === "warn" ? "var(--warn)" : "var(--chart-1)" }}/>
                  </div>
                </td>
                <td className="mono muted" style={{ fontSize: 12 }}>{t.tid.slice(0,14)}…</td>
                <td className="mono" style={{ fontSize: 12, color: "var(--brand-deep)" }}>{t.caller}</td>
                <td className="mono muted" style={{ fontSize: 11 }}>{t.pod}</td>
                <td className="muted">{t.ago}</td>
                <td><Icon name="chevron-right" size={14} className="muted"/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

Object.assign(window, { OverviewScreen, SaturationScreen, ServicesScreen, ServiceDetailScreen });
