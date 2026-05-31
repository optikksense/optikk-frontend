/* global React, Icon, AreaSpark, MiniSpark, Bars, PageHeader, Tabs, seededWave */
const { useState: useStateB, useMemo: useMemoB } = React;

/* =========================================================
   INFRASTRUCTURE — Datadog-style hosts/containers landing
   ========================================================= */
function InfrastructureScreen({ go }) {
  const [tab, setTab] = useStateB("hosts");
  const [view, setView] = useStateB("list");
  const [q, setQ] = useStateB("");
  const [groupBy, setGroupBy] = useStateB("none");

  const hosts = [
    { id: "i-0a1b2c3d", role: "payment-svc",   kind: "k8s",  region: "us-east-1a", env: "prod", cpu: 94, mem: 88, disk: 42, net: 184, up: "4d 12h", status: "err",  pods: 4, ver: "Ubuntu 22.04" },
    { id: "i-0e4f5g6h", role: "checkout-bff",  kind: "k8s",  region: "us-east-1a", env: "prod", cpu: 62, mem: 48, disk: 38, net: 218, up: "12d 4h", status: "ok",   pods: 6, ver: "Ubuntu 22.04" },
    { id: "i-0a1b2c4d", role: "payment-svc",   kind: "k8s",  region: "us-east-1b", env: "prod", cpu: 91, mem: 84, disk: 41, net: 142, up: "4d 12h", status: "err",  pods: 4, ver: "Ubuntu 22.04" },
    { id: "i-0c8d9e0f", role: "search",        kind: "k8s",  region: "us-east-1c", env: "prod", cpu: 84, mem: 72, disk: 68, net: 412, up: "8d 6h",  status: "warn", pods: 5, ver: "Ubuntu 22.04" },
    { id: "i-0d1e2f34", role: "inventory",     kind: "k8s",  region: "us-east-1a", env: "prod", cpu: 48, mem: 52, disk: 24, net: 84,  up: "12d 4h", status: "ok",   pods: 3, ver: "Ubuntu 22.04" },
    { id: "i-0bcdef12", role: "user-profile",  kind: "k8s",  region: "us-east-1b", env: "prod", cpu: 32, mem: 38, disk: 18, net: 42,  up: "12d 4h", status: "ok",   pods: 2, ver: "Ubuntu 22.04" },
    { id: "i-09876abc", role: "kafka-broker",  kind: "ec2",  region: "us-east-1a", env: "prod", cpu: 88, mem: 64, disk: 78, net: 612, up: "42d 8h", status: "warn", pods: 0, ver: "Amazon Linux 2" },
    { id: "i-09876abd", role: "kafka-broker",  kind: "ec2",  region: "us-east-1b", env: "prod", cpu: 71, mem: 62, disk: 74, net: 524, up: "42d 8h", status: "warn", pods: 0, ver: "Amazon Linux 2" },
    { id: "i-09876abe", role: "kafka-broker",  kind: "ec2",  region: "us-east-1c", env: "prod", cpu: 94, mem: 68, disk: 76, net: 612, up: "42d 8h", status: "err",  pods: 0, ver: "Amazon Linux 2" },
    { id: "i-0pg99001", role: "pg-primary",    kind: "rds",  region: "us-east-1a", env: "prod", cpu: 74, mem: 82, disk: 58, net: 286, up: "84d 2h", status: "warn", pods: 0, ver: "PostgreSQL 16.2" },
    { id: "i-0pg99002", role: "pg-replica-1",  kind: "rds",  region: "us-east-1b", env: "prod", cpu: 58, mem: 64, disk: 56, net: 184, up: "84d 2h", status: "ok",   pods: 0, ver: "PostgreSQL 16.2" },
    { id: "i-0pg99003", role: "pg-replica-3",  kind: "rds",  region: "us-east-1c", env: "prod", cpu: 84, mem: 68, disk: 58, net: 142, up: "12d 6h", status: "warn", pods: 0, ver: "PostgreSQL 16.2" },
    { id: "i-0r1a2b3c", role: "redis-shard-1", kind: "ec2",  region: "us-east-1a", env: "prod", cpu: 91, mem: 92, disk: 12, net: 412, up: "28d 4h", status: "err",  pods: 0, ver: "Amazon Linux 2" },
    { id: "i-0r1a2b3d", role: "redis-shard-2", kind: "ec2",  region: "us-east-1b", env: "prod", cpu: 62, mem: 68, disk: 12, net: 384, up: "28d 4h", status: "warn", pods: 0, ver: "Amazon Linux 2" },
    { id: "i-0worker1", role: "sidekiq",       kind: "k8s",  region: "us-east-1a", env: "prod", cpu: 48, mem: 54, disk: 28, net: 92,  up: "8d 12h", status: "ok",   pods: 8, ver: "Ubuntu 22.04" },
    { id: "i-0worker2", role: "sidekiq",       kind: "k8s",  region: "us-east-1b", env: "prod", cpu: 42, mem: 52, disk: 26, net: 88,  up: "8d 12h", status: "ok",   pods: 8, ver: "Ubuntu 22.04" },
    { id: "i-0es99001", role: "elasticsearch", kind: "ec2",  region: "us-east-1a", env: "prod", cpu: 64, mem: 74, disk: 82, net: 248, up: "62d 4h", status: "warn", pods: 0, ver: "Amazon Linux 2" },
    { id: "i-0build01", role: "ci-runner",     kind: "ec2",  region: "us-east-1a", env: "ci",   cpu: 22, mem: 32, disk: 18, net: 18,  up: "2d 1h",  status: "ok",   pods: 0, ver: "Ubuntu 22.04" },
  ];

  const filtered = hosts.filter(h => !q || h.id.includes(q) || h.role.includes(q));
  const statusColor = { ok: "var(--ok)", warn: "var(--warn)", err: "var(--err)" };
  const kindBadge = { k8s: { label: "k8s", color: "#326ce5" }, ec2: { label: "EC2", color: "#f59e0b" }, rds: { label: "RDS", color: "#3b82f6" } };

  const totalCpu = (hosts.reduce((s, h) => s + h.cpu, 0) / hosts.length).toFixed(0);
  const totalMem = (hosts.reduce((s, h) => s + h.mem, 0) / hosts.length).toFixed(0);
  const inAlert = hosts.filter(h => h.status !== "ok").length;
  const totalPods = hosts.reduce((s, h) => s + h.pods, 0);

  return (
    <div className="page">
      {/* Title */}
      <div className="row" style={{ alignItems: "flex-end" }}>
        <div>
          <div className="row" style={{ alignItems: "baseline", gap: 12 }}>
            <div className="page-title">Infrastructure</div>
            <span className="badge warn"><span className="b-dot"/>{inAlert} in alert</span>
          </div>
          <div className="page-sub" style={{ marginTop: 4 }}>{hosts.length} hosts · 3 AZs · {totalPods} pods · 1 cluster · last scrape 2s ago</div>
        </div>
        <div className="spacer"/>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: "hosts",      label: "Hosts",      badge: hosts.length },
          { id: "containers", label: "Containers", badge: totalPods },
        ]}
        active={tab} setActive={setTab}
      />

      {tab === "hosts" && <HostsView hosts={hosts} filtered={filtered} q={q} setQ={setQ} groupBy={groupBy} setGroupBy={setGroupBy} view={view} setView={setView} totalCpu={totalCpu} totalMem={totalMem} inAlert={inAlert} totalPods={totalPods} statusColor={statusColor} kindBadge={kindBadge} go={go}/>}
      {tab === "containers" && <ContainersView go={go}/>}
    </div>
  );
}

function HostsView({ hosts, filtered, q, setQ, groupBy, setGroupBy, view, setView, totalCpu, totalMem, inAlert, totalPods, statusColor, kindBadge, go }) {
  return (
    <>
      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
        {[
          { l: "Hosts up",        v: String(hosts.length), u: "of 34",       d: "0",      cls: "" },
          { l: "In alert",        v: String(inAlert),      u: "across all",  d: "+2",     cls: "down", color: "var(--warn-fg)" },
          { l: "Pods",            v: String(totalPods),    u: "k8s cluster", d: "+4",     cls: "" },
          { l: "Avg CPU",         v: totalCpu + "%",       u: "fleet",       d: "+8%",    cls: "down warn" },
          { l: "Avg Mem",         v: totalMem + "%",       u: "fleet",       d: "+2%",    cls: "" },
          { l: "Container restarts", v: "12",            u: "last 1h",     d: "+12",    cls: "down" },
        ].map(k => (
          <div key={k.l} className="card" style={{ padding: 14 }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div className="card-sub" style={{ fontSize: 11.5 }}>{k.l}</div>
              <span className={"delta " + (k.cls || "")} style={{ fontSize: 10.5 }}>{k.d}</span>
            </div>
            <div className="stat-value" style={{ fontSize: 22, marginTop: 4, color: k.color || "var(--fg-0)" }}>{k.v}</div>
            <div className="muted" style={{ fontSize: 10.5, marginTop: 2 }}>{k.u}</div>
          </div>
        ))}
      </div>

      {/* Filters bar */}
      <div className="card card-pad-lg" style={{ padding: 14 }}>
        <div className="row" style={{ gap: 10, justifyContent: "space-between" }}>
          <div className="row" style={{ gap: 10, flex: 1 }}>
            <div className="search" style={{ width: 320 }}>
              <Icon name="search" size={14} className="muted"/>
              <input placeholder="Filter hosts by name, tag, role…" value={q} onChange={e=>setQ(e.target.value)}/>
            </div>
            <button className="btn"><Icon name="filter" size={14}/>env: prod</button>
            <button className="btn"><Icon name="filter" size={14}/>region: all</button>
            <button className="btn"><Icon name="filter" size={14}/>kind: all</button>
            <button className="btn"><Icon name="filter" size={14}/>status: all</button>
          </div>
          <div className="row" style={{ gap: 6 }}>
            <span className="label-up">Group by</span>
            <div className="seg">
              {["none","kind","region","role"].map(g => (
                <div key={g} className={"seg-opt" + (groupBy === g ? " active" : "")} onClick={() => setGroupBy(g)}>{g}</div>
              ))}
            </div>
            <div className="seg">
              <div className={"seg-opt" + (view === "list" ? " active" : "")} onClick={() => setView("list")}><Icon name="list" size={11}/></div>
              <div className={"seg-opt" + (view === "grid" ? " active" : "")} onClick={() => setView("grid")}><Icon name="grid" size={11}/></div>
            </div>
          </div>
        </div>
      </div>

      {/* Hosts table */}
      <div className="card card-pad-lg" style={{ padding: 0, overflow: "hidden" }}>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ paddingLeft: 18, width: 200 }}>Host</th>
              <th style={{ width: 80 }}>Kind</th>
              <th>Role · service</th>
              <th>Region · env</th>
              <th>CPU</th>
              <th>Memory</th>
              <th>Disk</th>
              <th style={{ textAlign: "right" }}>Net</th>
              <th>Uptime</th>
              <th style={{ width: 18 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(h => (
              <tr key={h.id} onClick={() => go("hostDetail", { id: h.id })} style={{ cursor: "pointer" }}>
                <td style={{ paddingLeft: 18 }}>
                  <div className="row" style={{ gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor[h.status], flexShrink: 0 }}/>
                    <div>
                      <div className="mono" style={{ fontSize: 12.5, color: "var(--fg-0)", fontWeight: 500 }}>{h.id}</div>
                      <div className="muted" style={{ fontSize: 10.5 }}>{h.ver}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="mono" style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", background: kindBadge[h.kind].color + "20", color: kindBadge[h.kind].color, borderRadius: 3 }}>{kindBadge[h.kind].label}</span>
                </td>
                <td>
                  <div className="mono" style={{ fontSize: 12, color: "var(--fg-0)" }}>{h.role}</div>
                  {h.pods > 0 && <div className="muted" style={{ fontSize: 10.5 }}>{h.pods} pods</div>}
                </td>
                <td className="mono muted" style={{ fontSize: 11.5 }}>{h.region} · {h.env}</td>
                {[["cpu", h.cpu], ["mem", h.mem], ["disk", h.disk]].map(([k, v]) => {
                  const color = v >= 90 ? "var(--err)" : v >= 70 ? "var(--warn)" : "var(--ok)";
                  const fgColor = v >= 90 ? "var(--err)" : v >= 70 ? "var(--warn-fg)" : "var(--fg-1)";
                  return (
                    <td key={k}>
                      <div className="row" style={{ gap: 6 }}>
                        <div style={{ width: 50, height: 4, background: "var(--bg-inset)", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ width: v + "%", height: "100%", background: color }}/>
                        </div>
                        <span className="mono" style={{ fontVariantNumeric: "tabular-nums", color: fgColor, fontSize: 11.5, fontWeight: 600, minWidth: 30 }}>{v}%</span>
                      </div>
                    </td>
                  );
                })}
                <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }} className="mono">{h.net}<span className="muted" style={{ fontSize: 10.5 }}> MB/s</span></td>
                <td className="muted mono" style={{ fontSize: 11.5 }}>{h.up}</td>
                <td><Icon name="chevron-right" size={13} className="muted"/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Side rail: top consumers + cluster summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        <div className="card card-pad-lg">
          <div className="card-title">Top CPU consumers</div>
          <div className="card-sub" style={{ marginTop: 2 }}>fleet · last 1 hour</div>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 7 }}>
            {hosts.slice().sort((a,b) => b.cpu - a.cpu).slice(0, 6).map(h => (
              <div key={h.id} className="row" style={{ justifyContent: "space-between", padding: "5px 8px", borderRadius: 5, background: "var(--bg-inset)", cursor: "pointer" }} onClick={() => go("hostDetail", { id: h.id })}>
                <div className="row" style={{ gap: 6, minWidth: 0, flex: 1 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor[h.status], flexShrink: 0 }}/>
                  <span className="mono" style={{ fontSize: 11.5, color: "var(--fg-0)" }}>{h.id}</span>
                  <span className="muted mono" style={{ fontSize: 10.5 }}>· {h.role}</span>
                </div>
                <span className="mono" style={{ fontSize: 11.5, fontWeight: 600, color: h.cpu >= 90 ? "var(--err)" : "var(--warn-fg)" }}>{h.cpu}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card card-pad-lg">
          <div className="card-title">Top memory consumers</div>
          <div className="card-sub" style={{ marginTop: 2 }}>fleet · last 1 hour</div>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 7 }}>
            {hosts.slice().sort((a,b) => b.mem - a.mem).slice(0, 6).map(h => (
              <div key={h.id} className="row" style={{ justifyContent: "space-between", padding: "5px 8px", borderRadius: 5, background: "var(--bg-inset)", cursor: "pointer" }} onClick={() => go("hostDetail", { id: h.id })}>
                <div className="row" style={{ gap: 6, minWidth: 0, flex: 1 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor[h.status], flexShrink: 0 }}/>
                  <span className="mono" style={{ fontSize: 11.5, color: "var(--fg-0)" }}>{h.id}</span>
                  <span className="muted mono" style={{ fontSize: 10.5 }}>· {h.role}</span>
                </div>
                <span className="mono" style={{ fontSize: 11.5, fontWeight: 600, color: h.mem >= 90 ? "var(--err)" : "var(--warn-fg)" }}>{h.mem}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card card-pad-lg">
          <div className="card-title">Kubernetes cluster</div>
          <div className="card-sub" style={{ marginTop: 2 }}>checkout-prod-eks · 1 cluster · 3 AZs</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
            {[
              { l: "Pods running", v: "42", sub: "of 48" },
              { l: "Pending",       v: "2",  sub: "scheduling", color: "var(--warn-fg)" },
              { l: "Restarts (1h)", v: "12", sub: "across fleet" },
              { l: "Nodes ready",   v: "11/12", sub: "1 NotReady", color: "var(--warn-fg)" },
            ].map(s => (
              <div key={s.l} style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
                <div className="muted" style={{ fontSize: 10.5 }}>{s.l}</div>
                <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: s.color || "var(--fg-0)", marginTop: 2 }}>{s.v}</div>
                <div className="muted" style={{ fontSize: 10.5 }}>{s.sub}</div>
              </div>
            ))}
          </div>
          <button className="btn btn-ghost" style={{ marginTop: 12, width: "100%", justifyContent: "center", height: 30 }}><Icon name="link-ext" size={13}/>Open in k8s explorer</button>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   CONTAINERS VIEW — k8s-style pod/container table
   ========================================================= */
function ContainersView({ go }) {
  const [q, setQ] = useStateB("");
  const [groupBy, setGroupBy] = useStateB("none");

  const containers = [
    { id: "payment-svc-7d8c9-jvxk2",    img: "payment-svc:v8.12.0",    ns: "payments-prod",  host: "i-0a1b2c3d", pod: "payment-svc-7d8c9",    status: "running",  cpu: 84, mem: 71, restarts: 2,  age: "18m",  team: "payments" },
    { id: "payment-svc-7d8c9-q1n4r",    img: "payment-svc:v8.12.0",    ns: "payments-prod",  host: "i-0a1b2c4d", pod: "payment-svc-7d8c9",    status: "running",  cpu: 92, mem: 78, restarts: 4,  age: "18m",  team: "payments" },
    { id: "payment-svc-7d8c9-x8b3p",    img: "payment-svc:v8.12.0",    ns: "payments-prod",  host: "i-0a1b2c3d", pod: "payment-svc-7d8c9",    status: "running",  cpu: 88, mem: 74, restarts: 1,  age: "18m",  team: "payments" },
    { id: "payment-svc-7d8c9-r4k1m",    img: "payment-svc:v8.12.0",    ns: "payments-prod",  host: "i-0a1b2c4d", pod: "payment-svc-7d8c9",    status: "crashloop",cpu: 0,  mem: 0,  restarts: 12, age: "12m",  team: "payments" },
    { id: "checkout-bff-5f4b2-a8c1p",   img: "checkout-bff:v3.4.1",    ns: "payments-prod",  host: "i-0e4f5g6h", pod: "checkout-bff-5f4b2",   status: "running",  cpu: 62, mem: 48, restarts: 0,  age: "12d",  team: "payments" },
    { id: "checkout-bff-5f4b2-d2n7e",   img: "checkout-bff:v3.4.1",    ns: "payments-prod",  host: "i-0e4f5g6h", pod: "checkout-bff-5f4b2",   status: "running",  cpu: 58, mem: 44, restarts: 0,  age: "12d",  team: "payments" },
    { id: "search-9c2d8-h3k0r",         img: "search:v2.7.0",          ns: "discovery-prod", host: "i-0c8d9e0f", pod: "search-9c2d8",         status: "running",  cpu: 84, mem: 72, restarts: 0,  age: "4m",   team: "discovery" },
    { id: "search-9c2d8-m9p2x",         img: "search:v2.7.0",          ns: "discovery-prod", host: "i-0c8d9e0f", pod: "search-9c2d8",         status: "pending",  cpu: 0,  mem: 0,  restarts: 0,  age: "2m",   team: "discovery" },
    { id: "search-9c2d8-t7v4q",         img: "search:v2.6.4",          ns: "discovery-prod", host: "i-0c8d9e0f", pod: "search-9c2d8-old",     status: "terminating",cpu: 12,mem: 18, restarts: 0,  age: "8m",   team: "discovery" },
    { id: "cart-2b8e1-w5y3l",           img: "cart:v12.0.2",           ns: "shopping-prod",  host: "i-0d1e2f34", pod: "cart-2b8e1",           status: "running",  cpu: 38, mem: 42, restarts: 0,  age: "5d",   team: "shopping" },
    { id: "inventory-4a7c3-j6k2o",      img: "inventory:v9.8.1",       ns: "shopping-prod",  host: "i-0d1e2f34", pod: "inventory-4a7c3",      status: "running",  cpu: 48, mem: 52, restarts: 0,  age: "5d",   team: "shopping" },
    { id: "fraud-detect-8e1f2-p3q9r",   img: "fraud-detect:v0.7.1",    ns: "trust-prod",     host: "i-0a1b2c3d", pod: "fraud-detect-8e1f2",   status: "running",  cpu: 32, mem: 38, restarts: 1,  age: "1d",   team: "trust" },
    { id: "fraud-detect-9b3c4-r8s2t",   img: "fraud-detect:v0.7.2",    ns: "trust-prod",     host: "i-0a1b2c4d", pod: "fraud-detect-9b3c4",   status: "oomkilled",cpu: 0,  mem: 0,  restarts: 18, age: "14h",  team: "trust" },
    { id: "tax-calc-3c2f8-l4m1n",       img: "tax-calc:v2.0.0",        ns: "payments-prod",  host: "i-0e4f5g6h", pod: "tax-calc-3c2f8",       status: "running",  cpu: 22, mem: 28, restarts: 0,  age: "54m",  team: "payments" },
    { id: "user-profile-7a4e9-g6h0u",   img: "user-profile:v4.1.3",    ns: "identity-prod",  host: "i-0bcdef12", pod: "user-profile-7a4e9",   status: "running",  cpu: 32, mem: 38, restarts: 0,  age: "8d",   team: "identity" },
    { id: "sidekiq-5c8b3-z9x1w",        img: "sidekiq-prod:v3.2.1",    ns: "messaging-prod", host: "i-0worker1", pod: "sidekiq-5c8b3",        status: "running",  cpu: 48, mem: 54, restarts: 2,  age: "8d",   team: "messaging" },
    { id: "datadog-agent-x4j0p",        img: "datadog/agent:7.42.1",   ns: "monitoring",     host: "i-0a1b2c3d", pod: "datadog-agent-x4j0p",  status: "running",  cpu: 4,  mem: 8,  restarts: 0,  age: "8d",   team: "platform" },
  ];

  const filtered = containers.filter(c => !q || c.id.includes(q) || c.img.includes(q) || c.ns.includes(q));
  const statusColor = { running: "var(--ok)", pending: "var(--warn)", terminating: "var(--fg-mute)", crashloop: "var(--err)", oomkilled: "var(--err)" };
  const statusBadge = { running: "ok", pending: "warn", terminating: "neutral", crashloop: "err", oomkilled: "err" };
  const statusLabel = { running: "Running", pending: "Pending", terminating: "Terminating", crashloop: "CrashLoopBackOff", oomkilled: "OOMKilled" };

  const counts = containers.reduce((a, c) => { a[c.status] = (a[c.status] || 0) + 1; return a; }, {});
  const running = counts.running || 0;
  const broken = (counts.crashloop || 0) + (counts.oomkilled || 0);
  const restartsLastHour = containers.reduce((a, c) => a + c.restarts, 0);

  return (
    <>
      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
        {[
          { l: "Running",         v: String(running),                  u: "of " + containers.length,                d: "0",     cls: "",                                       color: "var(--fg-0)" },
          { l: "Pending",         v: String(counts.pending || 0),      u: "scheduling",                              d: "+1",    cls: "down warn",                              color: "var(--warn-fg)" },
          { l: "CrashLoop / OOM", v: String(broken),                   u: "needs attention",                         d: "+2",    cls: "down",                                   color: "var(--err)" },
          { l: "Restarts (1h)",   v: String(restartsLastHour),         u: "across cluster",                          d: "+12",   cls: "down warn",                              color: "var(--warn-fg)" },
          { l: "CPU used",        v: "62%",                            u: "of 88 cores",                             d: "+8%",   cls: "down warn",                              color: "var(--fg-0)" },
          { l: "Mem used",        v: "54%",                            u: "of 176 GB",                               d: "+2%",   cls: "",                                       color: "var(--fg-0)" },
        ].map(k => (
          <div key={k.l} className="card" style={{ padding: 14 }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div className="card-sub" style={{ fontSize: 11.5 }}>{k.l}</div>
              <span className={"delta " + (k.cls || "")} style={{ fontSize: 10.5 }}>{k.d}</span>
            </div>
            <div className="stat-value" style={{ fontSize: 22, marginTop: 4, color: k.color }}>{k.v}</div>
            <div className="muted" style={{ fontSize: 10.5, marginTop: 2 }}>{k.u}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card card-pad-lg" style={{ padding: 14 }}>
        <div className="row" style={{ gap: 10, justifyContent: "space-between" }}>
          <div className="row" style={{ gap: 10, flex: 1 }}>
            <div className="search" style={{ width: 320 }}>
              <Icon name="search" size={14} className="muted"/>
              <input placeholder="Filter by name, image, namespace…" value={q} onChange={e=>setQ(e.target.value)}/>
            </div>
            <button className="btn"><Icon name="filter" size={14}/>namespace: all</button>
            <button className="btn"><Icon name="filter" size={14}/>image: all</button>
            <button className="btn"><Icon name="filter" size={14}/>status: all</button>
          </div>
          <div className="row" style={{ gap: 6 }}>
            <span className="label-up">Group by</span>
            <div className="seg">
              {["none","image","host","namespace"].map(g => (
                <div key={g} className={"seg-opt" + (groupBy === g ? " active" : "")} onClick={() => setGroupBy(g)}>{g}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Containers table */}
      <div className="card card-pad-lg" style={{ padding: 0, overflow: "hidden" }}>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ paddingLeft: 18, width: 260 }}>Container</th>
              <th>Image</th>
              <th>Status</th>
              <th>Host</th>
              <th style={{ textAlign: "right" }}>CPU</th>
              <th style={{ textAlign: "right" }}>Memory</th>
              <th style={{ textAlign: "right" }}>Restarts</th>
              <th>Age</th>
              <th style={{ width: 18 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} onClick={() => go("containerDetail", { id: c.id })} style={{ cursor: "pointer" }}>
                <td style={{ paddingLeft: 18 }}>
                  <div className="row" style={{ gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor[c.status], flexShrink: 0 }}/>
                    <div>
                      <div className="mono" style={{ fontSize: 12.5, color: "var(--fg-0)", fontWeight: 500 }}>{c.id}</div>
                      <div className="muted mono" style={{ fontSize: 10.5 }}>{c.ns} · pod {c.pod}</div>
                    </div>
                  </div>
                </td>
                <td className="mono" style={{ fontSize: 11.5, color: "var(--fg-1)" }}>{c.img}</td>
                <td>
                  <span className={"badge " + statusBadge[c.status]}><span className="b-dot"/>{statusLabel[c.status]}</span>
                </td>
                <td>
                  <a className="mono" style={{ fontSize: 11.5, color: "var(--brand-deep)", cursor: "pointer" }} onClick={e => { e.stopPropagation(); go("hostDetail", { id: c.host }); }}>{c.host}</a>
                </td>
                {[["cpu", c.cpu], ["mem", c.mem]].map(([k, v]) => {
                  const color = v >= 90 ? "var(--err)" : v >= 70 ? "var(--warn)" : "var(--ok)";
                  const fgColor = v >= 90 ? "var(--err)" : v >= 70 ? "var(--warn-fg)" : "var(--fg-1)";
                  return (
                    <td key={k} style={{ textAlign: "right" }}>
                      <div className="row" style={{ gap: 6, justifyContent: "flex-end" }}>
                        <div style={{ width: 44, height: 4, background: "var(--bg-inset)", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ width: v + "%", height: "100%", background: color }}/>
                        </div>
                        <span className="mono" style={{ fontVariantNumeric: "tabular-nums", color: fgColor, fontSize: 11.5, fontWeight: 600, minWidth: 28 }}>{v}%</span>
                      </div>
                    </td>
                  );
                })}
                <td style={{ textAlign: "right" }}>
                  <span className="mono" style={{ fontVariantNumeric: "tabular-nums", color: c.restarts > 5 ? "var(--err)" : c.restarts > 0 ? "var(--warn-fg)" : "var(--fg-3)", fontSize: 11.5, fontWeight: c.restarts > 0 ? 600 : 400 }}>{c.restarts}</span>
                </td>
                <td className="muted mono" style={{ fontSize: 11.5 }}>{c.age}</td>
                <td><Icon name="chevron-right" size={13} className="muted"/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Side rail */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        <div className="card card-pad-lg">
          <div className="card-title">Top CPU containers</div>
          <div className="card-sub" style={{ marginTop: 2 }}>last 1 hour</div>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
            {containers.slice().sort((a,b) => b.cpu - a.cpu).slice(0, 6).map(c => (
              <div key={c.id} className="row" style={{ justifyContent: "space-between", padding: "5px 8px", borderRadius: 5, background: "var(--bg-inset)", cursor: "pointer" }} onClick={() => go("containerDetail", { id: c.id })}>
                <div className="row" style={{ gap: 6, minWidth: 0, flex: 1 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor[c.status], flexShrink: 0 }}/>
                  <span className="mono" style={{ fontSize: 11, color: "var(--fg-0)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.id}</span>
                </div>
                <span className="mono" style={{ fontSize: 11, fontWeight: 600, color: c.cpu >= 90 ? "var(--err)" : "var(--warn-fg)" }}>{c.cpu}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card card-pad-lg">
          <div className="card-title">Top memory containers</div>
          <div className="card-sub" style={{ marginTop: 2 }}>last 1 hour</div>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
            {containers.slice().sort((a,b) => b.mem - a.mem).slice(0, 6).map(c => (
              <div key={c.id} className="row" style={{ justifyContent: "space-between", padding: "5px 8px", borderRadius: 5, background: "var(--bg-inset)", cursor: "pointer" }} onClick={() => go("containerDetail", { id: c.id })}>
                <div className="row" style={{ gap: 6, minWidth: 0, flex: 1 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor[c.status], flexShrink: 0 }}/>
                  <span className="mono" style={{ fontSize: 11, color: "var(--fg-0)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.id}</span>
                </div>
                <span className="mono" style={{ fontSize: 11, fontWeight: 600, color: c.mem >= 90 ? "var(--err)" : "var(--warn-fg)" }}>{c.mem}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card card-pad-lg">
          <div className="card-title">Most restarted</div>
          <div className="card-sub" style={{ marginTop: 2 }}>since last hour</div>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
            {containers.slice().sort((a,b) => b.restarts - a.restarts).slice(0, 6).map(c => (
              <div key={c.id} className="row" style={{ justifyContent: "space-between", padding: "5px 8px", borderRadius: 5, background: "var(--bg-inset)", cursor: "pointer" }} onClick={() => go("containerDetail", { id: c.id })}>
                <div className="row" style={{ gap: 6, minWidth: 0, flex: 1 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor[c.status], flexShrink: 0 }}/>
                  <span className="mono" style={{ fontSize: 11, color: "var(--fg-0)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.id}</span>
                </div>
                <span className="mono" style={{ fontSize: 11, fontWeight: 600, color: c.restarts > 5 ? "var(--err)" : c.restarts > 0 ? "var(--warn-fg)" : "var(--fg-3)" }}>{c.restarts}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   HOST DETAIL — drilldown for a single host
   ========================================================= */
function HostDetailScreen({ go, params }) {
  const id = (params && params.id) || "i-0a1b2c3d";
  const [tab, setTab] = useStateB("overview");

  // Look up the host record (fall back to a default)
  const ALL = [
    { id: "i-0a1b2c3d", role: "payment-svc",   kind: "k8s", region: "us-east-1a", env: "prod", cpu: 94, mem: 88, disk: 42, net: 184, up: "4d 12h", status: "err",  pods: 4, ver: "Ubuntu 22.04", svc: "payment-svc" },
    { id: "i-0e4f5g6h", role: "checkout-bff",  kind: "k8s", region: "us-east-1a", env: "prod", cpu: 62, mem: 48, disk: 38, net: 218, up: "12d 4h", status: "ok",   pods: 6, ver: "Ubuntu 22.04", svc: "checkout-bff" },
    { id: "i-0pg99001", role: "pg-primary",    kind: "rds", region: "us-east-1a", env: "prod", cpu: 74, mem: 82, disk: 58, net: 286, up: "84d 2h", status: "warn", pods: 0, ver: "PostgreSQL 16.2", svc: "database" },
  ];
  const h = ALL.find(x => x.id === id) || ALL[0];
  const statusColor = { ok: "var(--ok)", warn: "var(--warn)", err: "var(--err)" };

  return (
    <div className="page">
      <div className="row">
        <button className="btn btn-ghost" onClick={() => go("infrastructure")}><Icon name="back" size={14}/>Infrastructure</button>
        <span className="muted">/</span>
        <span className="mono" style={{ fontSize: 13, color: "var(--fg-0)", fontWeight: 600 }}>{h.id}</span>
      </div>

      {/* Header */}
      <div className="row" style={{ alignItems: "flex-start", gap: 16 }}>
        <div style={{ width: 56, height: 56, borderRadius: 12, background: "var(--bg-inset)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg-2)", flexShrink: 0 }}>
          <Icon name="infra" size={26}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row" style={{ alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
            <div className="page-title mono" style={{ fontSize: 22 }}>{h.id}</div>
            <span className={"badge " + h.status}><span className="b-dot"/>{h.status === "err" ? "alerting" : h.status === "warn" ? "degraded" : "healthy"}</span>
            <span className="badge neutral mono" style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px" }}>{h.kind.toUpperCase()}</span>
            <span className="badge neutral">{h.env}</span>
          </div>
          <div className="row" style={{ marginTop: 6, gap: 20, flexWrap: "wrap" }}>
            <div className="row" style={{ gap: 6 }}><span className="muted" style={{ fontSize: 11.5 }}>OS</span><span className="mono" style={{ fontSize: 12 }}>{h.ver}</span></div>
            <div className="row" style={{ gap: 6 }}><span className="muted" style={{ fontSize: 11.5 }}>Region</span><span className="mono" style={{ fontSize: 12 }}>{h.region}</span></div>
            <div className="row" style={{ gap: 6 }}><span className="muted" style={{ fontSize: 11.5 }}>Role</span>
              <a className="mono" style={{ fontSize: 12, color: "var(--brand-deep)", cursor: "pointer" }} onClick={() => go("serviceDetail", { id: h.svc })}>{h.role}</a>
            </div>
            <div className="row" style={{ gap: 6 }}><span className="muted" style={{ fontSize: 11.5 }}>Uptime</span><span className="mono" style={{ fontSize: 12 }}>{h.up}</span></div>
            <div className="row" style={{ gap: 6 }}><span className="muted" style={{ fontSize: 11.5 }}>Instance</span><span className="mono" style={{ fontSize: 12 }}>c5.2xlarge · 8 vCPU · 16 GB</span></div>
            <div className="row" style={{ gap: 6 }}><span className="muted" style={{ fontSize: 11.5 }}>Agent</span><span className="mono" style={{ fontSize: 12, color: "var(--ok)" }}>7.42.1 ✓</span></div>
          </div>
          <div className="row" style={{ marginTop: 8, gap: 6, flexWrap: "wrap" }}>
            <span className="muted" style={{ fontSize: 11.5 }}>tags</span>
            {[`env:${h.env}`, `region:${h.region}`, `service:${h.svc}`, "tier:0", "team:payments", `kind:${h.kind}`].map(t => (
              <span key={t} className="mono" style={{ padding: "1px 7px", background: "var(--bg-inset)", borderRadius: 3, fontSize: 11, color: "var(--fg-2)" }}>{t}</span>
            ))}
          </div>
        </div>
        <div className="row" style={{ flexShrink: 0 }}>
          <button className="btn"><Icon name="zap" size={14}/>SSH</button>
          <button className="btn"><Icon name="link-ext" size={14}/>Logs</button>
          <button className="btn btn-icon"><Icon name="more" size={14}/></button>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: "overview",   label: "Overview" },
          { id: "processes",  label: "Processes", badge: 142 },
          { id: "containers", label: "Containers", badge: h.pods },
          { id: "network",    label: "Network" },
          { id: "logs",       label: "Logs", badge: 18412, badgeKind: "neutral" },
          { id: "events",     label: "Events", badge: 6, badgeKind: "warn" },
        ]}
        active={tab} setActive={setTab}
      />

      {/* Resource KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {[
          { l: "CPU",     v: h.cpu, max: "8 cores",   sub: "user 78% · sys 16%",       seed: 121, color: h.cpu >= 90 ? "var(--err)" : h.cpu >= 70 ? "var(--warn)" : "var(--ok)" },
          { l: "Memory",  v: h.mem, max: "16 GB",     sub: (h.mem * 0.16).toFixed(1) + " GB used · 2.4 GB cached", seed: 122, color: h.mem >= 90 ? "var(--err)" : h.mem >= 70 ? "var(--warn)" : "var(--ok)" },
          { l: "Disk",    v: h.disk, max: "200 GB",    sub: (h.disk * 2).toFixed(0) + " GB used · 18 GB swap",  seed: 123, color: h.disk >= 80 ? "var(--err)" : "var(--ok)" },
          { l: "Network", v: h.net,  max: "1 Gbit/s",  sub: "in 84 · out 100 MB/s",      seed: 124, color: h.net >= 500 ? "var(--warn)" : "var(--chart-1)", suffix: " MB/s", noPct: true },
        ].map(k => (
          <div key={k.l} className="card">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div className="card-sub" style={{ fontSize: 12 }}>{k.l}</div>
              <span className="muted" style={{ fontSize: 11 }}>{k.max}</span>
            </div>
            <div className="row" style={{ alignItems: "baseline", marginTop: 4 }}>
              <div className="stat-value" style={{ fontSize: 28, color: k.color }}>{k.v}{!k.noPct && "%"}</div>
              {k.suffix && <span className="stat-unit">{k.suffix}</span>}
            </div>
            <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{k.sub}</div>
            <MiniSpark seed={k.seed} color={k.color} height={28} width={260}/>
          </div>
        ))}
      </div>

      {/* System charts */}
      <div className="card card-pad-lg">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <div className="card-title">System metrics</div>
            <div className="card-sub" style={{ marginTop: 2 }}>CPU · memory · disk · network — last 1 hour</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 14 }}>
          {[
            { label: "CPU · user / system / iowait", seed: 131, color: "var(--accent-violet)", soft: "rgba(99,102,241,0.18)", base: 0.7, amp: 0.18, legend: "user 78% · sys 16% · iowait 4%" },
            { label: "Memory · used / cached / free",  seed: 132, color: "var(--chart-1)", soft: "var(--chart-1-soft)", base: 0.55, amp: 0.14, legend: "used 14.0 GB · cached 2.4 GB" },
            { label: "Disk I/O · read / write",         seed: 133, color: "var(--ok)", soft: "var(--ok-soft)", base: 0.4, amp: 0.22, legend: "read 8 MB/s · write 24 MB/s · iops 412" },
            { label: "Network · in / out / errors",     seed: 134, color: "var(--warn)", soft: "var(--warn-soft)", base: 0.5, amp: 0.3, legend: "in 84 · out 100 MB/s · 0 err/s" },
          ].map(s => (
            <div key={s.label}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div className="muted" style={{ fontSize: 12 }}>{s.label}</div>
                <div className="muted mono" style={{ fontSize: 11 }}>{s.legend}</div>
              </div>
              <AreaSpark seed={s.seed} color={s.color} soft={s.soft} height={84} base={s.base} amp={s.amp}/>
            </div>
          ))}
        </div>
      </div>

      {/* Processes + Containers + Events */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }}>
        {/* Top processes */}
        <div className="card card-pad-lg">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div>
              <div className="card-title">Top processes</div>
              <div className="card-sub" style={{ marginTop: 2 }}>by CPU · 142 processes total</div>
            </div>
            <button className="btn btn-ghost" style={{ height: 26 }}>Show all</button>
          </div>
          <table className="tbl" style={{ marginTop: 6 }}>
            <thead>
              <tr><th style={{ paddingLeft: 0 }}>Process</th><th>PID</th><th>User</th><th style={{ textAlign: "right" }}>CPU</th><th style={{ textAlign: "right" }}>Mem</th><th style={{ textAlign: "right" }}>Threads</th></tr>
            </thead>
            <tbody>
              {[
                { name: "ruby /app/bin/payment-svc",        pid: 1284,  user: "app", cpu: 184, mem: 4200, th: 28, lvl: "err" },
                { name: "ruby /app/bin/payment-svc (worker)", pid: 1285,  user: "app", cpu: 84,  mem: 1820, th: 12, lvl: "warn" },
                { name: "nginx: master",                     pid: 142,   user: "nginx", cpu: 8, mem: 84, th: 1, lvl: "ok" },
                { name: "nginx: worker",                     pid: 148,   user: "nginx", cpu: 4, mem: 64, th: 1, lvl: "ok" },
                { name: "datadog-agent",                     pid: 4218,  user: "dd-agent", cpu: 6, mem: 142, th: 8, lvl: "ok" },
                { name: "systemd-journald",                  pid: 412,   user: "root", cpu: 1, mem: 18, th: 1, lvl: "ok" },
              ].map((p, i) => (
                <tr key={i}>
                  <td style={{ paddingLeft: 0 }}>
                    <div className="row" style={{ gap: 8 }}>
                      <span className={"badge " + p.lvl} style={{ width: 6, height: 6, padding: 0, borderRadius: "50%", flexShrink: 0 }}/>
                      <span className="mono" style={{ fontSize: 12, color: "var(--fg-0)" }}>{p.name}</span>
                    </div>
                  </td>
                  <td className="mono muted" style={{ fontSize: 11 }}>{p.pid}</td>
                  <td className="mono muted" style={{ fontSize: 11 }}>{p.user}</td>
                  <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: p.lvl === "err" ? "var(--err)" : p.lvl === "warn" ? "var(--warn-fg)" : "var(--fg-1)" }} className="mono">{p.cpu}%</td>
                  <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }} className="mono">{p.mem >= 1000 ? (p.mem/1024).toFixed(1) + " GB" : p.mem + " MB"}</td>
                  <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }} className="mono">{p.th}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Containers + events */}
        <div className="col" style={{ gap: 16 }}>
          <div className="card card-pad-lg">
            <div className="card-title">Containers</div>
            <div className="card-sub" style={{ marginTop: 2 }}>{h.pods} pods · k8s namespace payments-prod</div>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
              {(h.pods > 0 ? [
                { name: "payment-svc-7d8c9-jvxk2", img: "v8.12.0", cpu: 84, mem: 71, age: "18m", lvl: "warn" },
                { name: "payment-svc-7d8c9-q1n4r", img: "v8.12.0", cpu: 92, mem: 78, age: "18m", lvl: "err" },
                { name: "payment-svc-7d8c9-x8b3p", img: "v8.12.0", cpu: 88, mem: 74, age: "18m", lvl: "warn" },
                { name: "datadog-agent-x4j0p",     img: "7.42.1",  cpu: 4,  mem: 8,  age: "8d",  lvl: "ok" },
              ] : [
                { name: "(no pods on this host)", img: "—", cpu: 0, mem: 0, age: "—", lvl: "ok" },
              ]).map((c, i) => (
                <div key={i} className="row" style={{ justifyContent: "space-between", padding: "6px 8px", borderRadius: 5, background: "var(--bg-inset)" }}>
                  <div className="row" style={{ gap: 6, minWidth: 0, flex: 1 }}>
                    <span className={"badge " + c.lvl} style={{ width: 6, height: 6, padding: 0, borderRadius: "50%", flexShrink: 0 }}/>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div className="mono" style={{ fontSize: 11.5, color: "var(--fg-0)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                      <div className="muted mono" style={{ fontSize: 10.5 }}>{c.img} · {c.age}</div>
                    </div>
                  </div>
                  <span className="mono" style={{ fontSize: 10.5, color: "var(--fg-3)" }}>{c.cpu}% · {c.mem}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card card-pad-lg">
            <div className="card-title">Recent events</div>
            <div className="card-sub" style={{ marginTop: 2 }}>deploys, k8s lifecycle, alerts</div>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { sev: "err",  msg: "Alert: CPU > 90% sustained 5m",       at: "8m ago" },
                { sev: "warn", msg: "v8.12.0 deployed · rollout completed", at: "18m ago" },
                { sev: "ok",   msg: "Pod payment-svc-7d8c9-x8b3p scheduled", at: "18m ago" },
                { sev: "ok",   msg: "Agent self-check passed",              at: "1h ago" },
              ].map((e, i) => (
                <div key={i} className="row" style={{ gap: 8, alignItems: "flex-start" }}>
                  <span className={"badge " + e.sev} style={{ width: 6, height: 6, padding: 0, borderRadius: "50%", marginTop: 6, flexShrink: 0 }}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: "var(--fg-0)" }}>{e.msg}</div>
                    <div className="muted" style={{ fontSize: 10.5, marginTop: 2 }}>{e.at}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   CONTAINER DETAIL — single-container deep dive
   ========================================================= */
function ContainerDetailScreen({ go, params }) {
  const id = (params && params.id) || "payment-svc-7d8c9-jvxk2";
  const [tab, setTab] = useStateB("overview");

  const ALL = {
    "payment-svc-7d8c9-jvxk2":  { img: "payment-svc:v8.12.0",  ns: "payments-prod", host: "i-0a1b2c3d", pod: "payment-svc-7d8c9",    status: "running",  cpu: 84, mem: 71, restarts: 2, age: "18m", svc: "payment-svc", limits: { cpu: "2 cores", mem: "4 GB" }, team: "payments" },
    "payment-svc-7d8c9-r4k1m":  { img: "payment-svc:v8.12.0",  ns: "payments-prod", host: "i-0a1b2c4d", pod: "payment-svc-7d8c9",    status: "crashloop",cpu: 0,  mem: 0,  restarts: 12,age: "12m", svc: "payment-svc", limits: { cpu: "2 cores", mem: "4 GB" }, team: "payments" },
    "fraud-detect-9b3c4-r8s2t": { img: "fraud-detect:v0.7.2",  ns: "trust-prod",    host: "i-0a1b2c4d", pod: "fraud-detect-9b3c4",  status: "oomkilled",cpu: 0,  mem: 0,  restarts: 18,age: "14h", svc: "fraud-detect", limits: { cpu: "1 core",  mem: "512 MB" }, team: "trust" },
  };
  const c = ALL[id] || ALL["payment-svc-7d8c9-jvxk2"];
  const statusColor = { running: "var(--ok)", pending: "var(--warn)", terminating: "var(--fg-mute)", crashloop: "var(--err)", oomkilled: "var(--err)" };
  const statusBadge = { running: "ok", pending: "warn", terminating: "neutral", crashloop: "err", oomkilled: "err" };
  const statusLabel = { running: "Running", pending: "Pending", terminating: "Terminating", crashloop: "CrashLoopBackOff", oomkilled: "OOMKilled" };
  const sev = statusBadge[c.status];
  const showCrash = c.status === "crashloop" || c.status === "oomkilled";

  return (
    <div className="page">
      <div className="row">
        <button className="btn btn-ghost" onClick={() => go("infrastructure")}><Icon name="back" size={14}/>Infrastructure</button>
        <span className="muted">/</span>
        <span style={{ fontSize: 13, color: "var(--fg-3)", fontWeight: 500, cursor: "pointer" }} onClick={() => go("infrastructure")}>Containers</span>
        <span className="muted">/</span>
        <span className="mono" style={{ fontSize: 13, color: "var(--fg-0)", fontWeight: 600 }}>{id}</span>
      </div>

      {/* Header */}
      <div className="row" style={{ alignItems: "flex-start", gap: 16 }}>
        <div style={{ width: 56, height: 56, borderRadius: 12, background: "var(--accent-violet-soft)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-violet)", flexShrink: 0 }}>
          <Icon name="grid" size={26}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row" style={{ alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
            <div className="page-title mono" style={{ fontSize: 20 }}>{id}</div>
            <span className={"badge " + sev}><span className="b-dot"/>{statusLabel[c.status]}</span>
            <span className="badge neutral mono">{c.img}</span>
          </div>
          <div className="row" style={{ marginTop: 6, gap: 20, flexWrap: "wrap" }}>
            <div className="row" style={{ gap: 6 }}>
              <span className="muted" style={{ fontSize: 11.5 }}>Pod</span>
              <span className="mono" style={{ fontSize: 12 }}>{c.pod}</span>
            </div>
            <div className="row" style={{ gap: 6 }}>
              <span className="muted" style={{ fontSize: 11.5 }}>Host</span>
              <a className="mono" style={{ fontSize: 12, color: "var(--brand-deep)", cursor: "pointer" }} onClick={() => go("hostDetail", { id: c.host })}>{c.host}</a>
            </div>
            <div className="row" style={{ gap: 6 }}>
              <span className="muted" style={{ fontSize: 11.5 }}>Namespace</span>
              <span className="mono" style={{ fontSize: 12 }}>{c.ns}</span>
            </div>
            <div className="row" style={{ gap: 6 }}>
              <span className="muted" style={{ fontSize: 11.5 }}>Service</span>
              <a className="mono" style={{ fontSize: 12, color: "var(--brand-deep)", cursor: "pointer" }} onClick={() => go("serviceDetail", { id: c.svc })}>{c.svc}</a>
            </div>
            <div className="row" style={{ gap: 6 }}>
              <span className="muted" style={{ fontSize: 11.5 }}>Age</span>
              <span className="mono" style={{ fontSize: 12 }}>{c.age}</span>
            </div>
            <div className="row" style={{ gap: 6 }}>
              <span className="muted" style={{ fontSize: 11.5 }}>Restarts</span>
              <span className="mono" style={{ fontSize: 12, color: c.restarts > 5 ? "var(--err)" : c.restarts > 0 ? "var(--warn-fg)" : "var(--fg-1)", fontWeight: 600 }}>{c.restarts}</span>
            </div>
          </div>
          <div className="row" style={{ marginTop: 8, gap: 6, flexWrap: "wrap" }}>
            <span className="muted" style={{ fontSize: 11.5 }}>labels</span>
            {[`app:${c.svc}`, `team:${c.team}`, `env:prod`, `version:${c.img.split(":")[1]}`, `pod-template-hash:${c.pod.split("-").pop()}`].map(t => (
              <span key={t} className="mono" style={{ padding: "1px 7px", background: "var(--bg-inset)", borderRadius: 3, fontSize: 11, color: "var(--fg-2)" }}>{t}</span>
            ))}
          </div>
        </div>
        <div className="row" style={{ flexShrink: 0 }}>
          <button className="btn"><Icon name="zap" size={14}/>Exec</button>
          <button className="btn"><Icon name="refresh" size={14}/>Restart</button>
          <button className="btn"><Icon name="link-ext" size={14}/>Logs</button>
          <button className="btn btn-icon"><Icon name="more" size={14}/></button>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: "overview", label: "Overview" },
          { id: "logs",     label: "Logs", badge: 412 },
          { id: "events",   label: "Events", badge: showCrash ? c.restarts : 4, badgeKind: showCrash ? "err" : "neutral" },
          { id: "env",      label: "Env vars", badge: 18 },
          { id: "manifest", label: "Manifest" },
        ]}
        active={tab} setActive={setTab}
      />

      {/* Crash banner if needed */}
      {showCrash && (
        <div style={{ background: "color-mix(in oklab, var(--err) 6%, var(--bg-card))", border: "1px solid color-mix(in oklab, var(--err) 30%, var(--line))", borderRadius: 8, padding: "12px 16px" }}>
          <div className="row" style={{ alignItems: "flex-start", gap: 12 }}>
            <Icon name="alert" size={18} className="muted" style={{ color: "var(--err)", marginTop: 1 }}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--err-fg)" }}>
                {c.status === "oomkilled" ? "OOMKilled — process exceeded memory limit" : "CrashLoopBackOff — container failing to start"}
              </div>
              <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                {c.status === "oomkilled"
                  ? `Container exited with code 137 · last restart 4m ago · limit ${c.limits.mem} reached`
                  : `Container exited with code 1 · last restart 24s ago · ${c.restarts} restarts in 12m`}
              </div>
              <div className="row" style={{ marginTop: 10, gap: 6 }}>
                <button className="btn"><Icon name="zap" size={13}/>View last logs</button>
                <button className="btn"><Icon name="refresh" size={13}/>Force restart</button>
                <button className="btn btn-ghost"><Icon name="link-ext" size={13}/>Open runbook</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {[
          { l: "CPU",     v: c.cpu + "%", sub: "request 200m · limit " + c.limits.cpu, seed: 141, color: c.cpu >= 90 ? "var(--err)" : c.cpu >= 70 ? "var(--warn)" : "var(--ok)" },
          { l: "Memory",  v: c.mem + "%", sub: "request 512 Mi · limit " + c.limits.mem, seed: 142, color: c.mem >= 90 ? "var(--err)" : c.mem >= 70 ? "var(--warn)" : "var(--ok)" },
          { l: "Network", v: "84 KB/s",  sub: "in 38 · out 46", seed: 143, color: "var(--chart-1)" },
          { l: "Restarts",v: String(c.restarts), sub: c.restarts > 5 ? "last 24s ago" : c.restarts > 0 ? "last 18m ago" : "stable", seed: 144, color: c.restarts > 5 ? "var(--err)" : c.restarts > 0 ? "var(--warn)" : "var(--ok)", noChart: true },
        ].map(k => (
          <div key={k.l} className="card">
            <div className="card-sub" style={{ fontSize: 12 }}>{k.l}</div>
            <div className="stat-value" style={{ fontSize: 28, color: k.color, marginTop: 4 }}>{k.v}</div>
            <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{k.sub}</div>
            {!k.noChart && <MiniSpark seed={k.seed} color={k.color} height={28} width={260}/>}
          </div>
        ))}
      </div>

      {/* System metrics */}
      <div className="card card-pad-lg">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <div className="card-title">Container metrics</div>
            <div className="card-sub" style={{ marginTop: 2 }}>cgroup · last 1 hour</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 14 }}>
          {[
            { label: "CPU · usage vs limit", seed: 151, color: "var(--accent-violet)", soft: "rgba(99,102,241,0.18)", base: 0.55, amp: 0.18, legend: "used 84% · throttled 4%", limit: 0.95 },
            { label: "Memory · usage vs limit", seed: 152, color: "var(--chart-1)", soft: "var(--chart-1-soft)", base: 0.5, amp: 0.14, legend: "RSS 2.84 GB · limit 4 GB", limit: 1.0 },
            { label: "Network I/O · in / out", seed: 153, color: "var(--ok)", soft: "var(--ok-soft)", base: 0.35, amp: 0.22, legend: "in 38 · out 46 KB/s · 0 err" },
            { label: "Disk I/O · read / write", seed: 154, color: "var(--warn)", soft: "var(--warn-soft)", base: 0.3, amp: 0.18, legend: "read 2 · write 8 MB/s" },
          ].map(s => (
            <div key={s.label}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div className="muted" style={{ fontSize: 12 }}>{s.label}</div>
                <div className="muted mono" style={{ fontSize: 11 }}>{s.legend}</div>
              </div>
              <div style={{ position: "relative" }}>
                <AreaSpark seed={s.seed} color={s.color} soft={s.soft} height={86} base={s.base} amp={s.amp}/>
                {s.limit && (
                  <svg style={{ position: "absolute", inset: 0, pointerEvents: "none" }} width="100%" height="86" viewBox="0 0 100 86" preserveAspectRatio="none">
                    <line x1="0" y1={86 * (1 - s.limit) + 6} x2="100" y2={86 * (1 - s.limit) + 6} stroke="var(--err)" strokeWidth="0.5" strokeDasharray="2 2" strokeOpacity="0.6"/>
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logs + Events */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }}>
        <div className="card card-pad-lg">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div>
              <div className="card-title">Recent logs</div>
              <div className="card-sub" style={{ marginTop: 2 }}>tail of container stdout · last 5 minutes</div>
            </div>
            <button className="btn btn-ghost" style={{ height: 26 }} onClick={() => go("logs")}><Icon name="link-ext" size={12}/>Open in Logs</button>
          </div>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 4, background: "var(--bg-inset)", borderRadius: 6, padding: 8 }}>
            {[
              { sev: "ERROR", ts: "10:42:18.421", msg: "ConnectionResetError: stripe API socket closed during /v1/charges" },
              { sev: "WARN",  ts: "10:42:18.402", msg: "Retrying payment provider call (attempt 2/3)" },
              { sev: "ERROR", ts: "10:42:18.388", msg: "Upstream timeout calling stripe.charges.create after 4218ms" },
              { sev: "WARN",  ts: "10:42:17.842", msg: "Circuit breaker entering half-open state (cooldown 12s)" },
              { sev: "INFO",  ts: "10:42:17.520", msg: "POST /api/v2/checkout 200 (412ms) user=u_842919" },
              { sev: "INFO",  ts: "10:42:14.421", msg: "Worker started · accepting connections" },
              { sev: "DEBUG", ts: "10:42:13.802", msg: "Span checkout.payments.charge started parent=POST /api/v2/checkout" },
            ].map((l, i) => (
              <div key={i} className="row" style={{ alignItems: "flex-start", gap: 8, fontSize: 11.5 }}>
                <div className={"sev-gutter " + l.sev.toLowerCase()} style={{ minHeight: 14 }}/>
                <span className="mono muted" style={{ minWidth: 84 }}>{l.ts}</span>
                <span className={"sev-chip " + l.sev.toLowerCase()} style={{ minWidth: 0, padding: "1px 5px" }}>{l.sev}</span>
                <span className="mono" style={{ flex: 1, color: "var(--fg-0)" }}>{l.msg}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card card-pad-lg">
          <div className="card-title">Container events</div>
          <div className="card-sub" style={{ marginTop: 2 }}>k8s lifecycle · last 24h</div>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 0 }}>
            {(showCrash ? [
              { sev: "err",  type: "OOMKilled",      at: "4m ago", msg: "Container exceeded memory limit (512 MB), killed with signal 9" },
              { sev: "ok",   type: "Started",       at: "5m ago", msg: "Container started · image fraud-detect:v0.7.2 pulled" },
              { sev: "err",  type: "OOMKilled",      at: "21m ago", msg: "Container exceeded memory limit (512 MB)" },
              { sev: "ok",   type: "Pulled",        at: "21m ago", msg: "fraud-detect:v0.7.2 from registry/my-org" },
              { sev: "ok",   type: "Scheduled",     at: "21m ago", msg: "Successfully assigned to i-0a1b2c4d" },
              { sev: "ok",   type: "Deployment",    at: "14h ago", msg: "Rollout fraud-detect → v0.7.2 by kai.olsson" },
            ] : [
              { sev: "warn", type: "Restarted",     at: "18m ago", msg: "Liveness probe failed 3× · container restarted" },
              { sev: "ok",   type: "Started",       at: "18m ago", msg: "Container started · image payment-svc:v8.12.0 pulled" },
              { sev: "ok",   type: "Pulled",        at: "18m ago", msg: "payment-svc:v8.12.0 pulled from registry/my-org" },
              { sev: "ok",   type: "Scheduled",     at: "18m ago", msg: "Successfully assigned to i-0a1b2c3d" },
              { sev: "ok",   type: "Deployment",    at: "18m ago", msg: "Rollout payment-svc → v8.12.0 by rita.chen" },
              { sev: "ok",   type: "Healthy",       at: "12d ago", msg: "Readiness probe passing · added to service" },
            ]).map((e, i, arr) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: i < arr.length-1 ? "1px solid var(--line-2)" : 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                  <span className={"badge " + e.sev} style={{ width: 8, height: 8, padding: 0, borderRadius: "50%" }}/>
                  {i < arr.length-1 && <div style={{ flex: 1, width: 1, background: "var(--line-2)", marginTop: 2 }}/>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <span className="mono" style={{ fontSize: 11.5, fontWeight: 600, color: e.sev === "err" ? "var(--err-fg)" : "var(--fg-0)" }}>{e.type}</span>
                    <span className="muted mono" style={{ fontSize: 10.5 }}>{e.at}</span>
                  </div>
                  <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{e.msg}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   KAFKA
   ========================================================= */
function KafkaScreen({ go }) {
  const [tab, setTab] = useStateB("overview");

  const brokers = Array.from({ length: 9 }).map((_, i) => {
    const cpu = [62,71,84,66,94,58,68,72,61,79][i] || 60;
    const tier = cpu >= 90 ? "err" : cpu >= 70 ? "warn" : "ok";
    return { id: "B"+(i+1), cpu, msgs: 12 - i*0.4, replicas: 3, partitions: 142 + i*7, tier };
  });

  return (
    <div className="page">
      <div className="row">
        <button className="btn btn-ghost" onClick={() => go("overview")}><Icon name="back" size={14}/>Overview</button>
        <span className="muted">/</span>
        <span style={{ fontSize: 13, color: "var(--fg-0)", fontWeight: 600 }}>Kafka</span>
      </div>

      <PageHeader
        icon="kafka" iconColor="var(--brand)" iconBg="var(--brand-tint)"
        title="Kafka"
        subtitle="events-prod-us-east-1 · 9 brokers · 142 topics · 1840 partitions"
        statusBadge={<span className="badge warn" style={{ marginLeft: 6 }}><span className="b-dot"/>degraded · 1 broker hot, 1 group stalled</span>}
        actions={
          <div className="row">
            <button className="btn"><Icon name="refresh" size={14}/>Rebalance</button>
            <button className="btn"><Icon name="export" size={14}/>Export</button>
          </div>
        }
      />

      <Tabs
        tabs={[
          { id: "overview", label: "Overview" },
          { id: "brokers",  label: "Brokers", badge: 9 },
          { id: "topics",   label: "Topics", badge: 142 },
          { id: "consumers",label: "Consumer groups", badge: 28 },
          { id: "lag",      label: "Lag", badge: 1, badgeKind: "warn" },
        ]}
        active={tab} setActive={setTab}
      />

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 16 }}>
        {[
          { label: "Msgs in",   value: "84.3k", unit: "/sec",  d: "+4.2%", dCls: "down warn", color: "var(--chart-1)", seed: 31 },
          { label: "Msgs out",  value: "82.1k", unit: "/sec",  d: "+3.8%", dCls: "down warn", color: "var(--chart-1)", seed: 32 },
          { label: "Bytes in",  value: "412 MB",unit: "/sec",  d: "+1.2%", dCls: "", color: "var(--chart-1)", seed: 33 },
          { label: "Under-replicated", value: "12", unit: "partitions", d: "+12", dCls: "down", color: "var(--err)", seed: 34 },
          { label: "Total lag", value: "284k", unit: "msgs", d: "+72%", dCls: "down", color: "var(--err)", seed: 35 },
        ].map(k => (
          <div key={k.label} className="card">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div className="card-sub" style={{ fontSize: 12 }}>{k.label}</div>
              <span className={"delta " + (k.dCls || "")}>{k.d}</span>
            </div>
            <div className="row" style={{ alignItems: "baseline", gap: 6, marginTop: 6 }}>
              <div className="stat-value" style={{ fontSize: 24 }}>{k.value}</div>
              <div className="stat-unit">{k.unit}</div>
            </div>
            <MiniSpark seed={k.seed} color={k.color} height={28} width={220}/>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        {/* Broker grid */}
        <div className="card card-pad-lg">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div>
              <div className="card-title">Brokers · CPU saturation</div>
              <div className="card-sub" style={{ marginTop: 2 }}>9 brokers · color shows CPU max</div>
            </div>
            <div className="seg">
              <div className="seg-opt active">CPU</div>
              <div className="seg-opt">Net</div>
              <div className="seg-opt">Disk</div>
            </div>
          </div>
          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
            {brokers.map(b => (
              <div key={b.id} style={{ border: "1px solid var(--line-2)", borderRadius: 8, padding: 12, background: "var(--bg-inset)" }}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div className="mono" style={{ fontSize: 11.5, fontWeight: 600 }}>{b.id}</div>
                  <span className={"badge " + b.tier} style={{ height: 16, padding: "0 6px", fontSize: 10 }}>{b.cpu}%</span>
                </div>
                <div style={{ marginTop: 8, height: 6, borderRadius: 3, background: "var(--bg-card)", overflow: "hidden" }}>
                  <div style={{ width: b.cpu + "%", height: "100%", background: b.tier === "err" ? "var(--err)" : b.tier === "warn" ? "var(--warn)" : "var(--ok)" }}/>
                </div>
                <div className="muted mono" style={{ fontSize: 10.5, marginTop: 6 }}>{b.partitions} parts</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 18 }}>
            <div className="row" style={{ justifyContent: "space-between", marginBottom: 6 }}>
              <div className="muted" style={{ fontSize: 12 }}>Throughput · msg/s in (blue) · out (violet)</div>
              <div className="muted" style={{ fontSize: 11 }}>1h</div>
            </div>
            <div style={{ position: "relative" }}>
              <AreaSpark seed={51} height={120} color="var(--chart-1)" soft="var(--chart-1-soft)"/>
              <div style={{ position: "absolute", inset: 0 }}>
                <AreaSpark seed={52} height={120} color="var(--accent-violet)" soft="rgba(99,102,241,0.12)" amp={0.18} base={0.42}/>
              </div>
            </div>
          </div>
        </div>

        {/* Consumer group lag */}
        <div className="card card-pad-lg">
          <div className="card-title">Consumer group lag</div>
          <div className="card-sub" style={{ marginTop: 2 }}>Top stalled · 28 groups</div>
          <table className="tbl" style={{ marginTop: 12 }}>
            <thead><tr><th style={{ paddingLeft: 0 }}>Group</th><th style={{ textAlign: "right" }}>Lag</th><th>Trend</th></tr></thead>
            <tbody>
              {[
                { g: "checkout-events.v3", lag: "184k", trend: 41, level: "err" },
                { g: "fulfillment-orders.v2", lag: "42.1k", trend: 42, level: "warn" },
                { g: "audit-trail-sink", lag: "8.4k", trend: 43, level: "warn" },
                { g: "search-indexer.v8", lag: "1.2k", trend: 44, level: "ok" },
                { g: "metrics-aggregator", lag: "412", trend: 45, level: "ok" },
                { g: "notification-fanout", lag: "84", trend: 46, level: "ok" },
                { g: "ml-feature-pipe", lag: "12", trend: 47, level: "ok" },
              ].map((r, i) => (
                <tr key={i}>
                  <td style={{ paddingLeft: 0 }}>
                    <div className="row">
                      <span className={"badge " + r.level} style={{ width: 8, height: 8, padding: 0, borderRadius: "50%" }}></span>
                      <span className="mono" style={{ fontSize: 12.5, color: "var(--fg-0)" }}>{r.g}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: r.level === "err" ? "var(--err)" : r.level === "warn" ? "var(--warn-fg)" : "var(--fg-1)" }}>{r.lag}</td>
                  <td><MiniSpark seed={r.trend} width={80} color={r.level === "err" ? "var(--err)" : r.level === "warn" ? "var(--warn)" : "var(--chart-1)"}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Topics table */}
      <div className="card card-pad-lg">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div className="card-title">Top topics · last 1 hour</div>
          <div className="search" style={{ width: 280 }}>
            <Icon name="search" size={14} className="muted"/>
            <input placeholder="Filter topics…"/>
          </div>
        </div>
        <table className="tbl" style={{ marginTop: 8 }}>
          <thead><tr><th>Topic</th><th>Partitions</th><th style={{ textAlign: "right" }}>Msg/s in</th><th style={{ textAlign: "right" }}>Bytes/s</th><th style={{ textAlign: "right" }}>Under-repl</th><th>Throughput</th><th></th></tr></thead>
          <tbody>
            {[
              { t: "checkout.events.v3",   p: 32, in: "24.1k", b: "118 MB", ur: 4, seed: 61, level: "warn" },
              { t: "orders.lifecycle.v2",  p: 24, in: "18.4k", b: "82 MB",  ur: 0, seed: 62, level: "ok" },
              { t: "payments.captured.v1", p: 16, in: "12.2k", b: "54 MB",  ur: 2, seed: 63, level: "warn" },
              { t: "inventory.updates",    p: 32, in: "9.8k",  b: "38 MB",  ur: 0, seed: 64, level: "ok" },
              { t: "audit.trail.v4",       p: 16, in: "6.1k",  b: "28 MB",  ur: 0, seed: 65, level: "ok" },
              { t: "search.documents",     p: 48, in: "5.4k",  b: "62 MB",  ur: 6, seed: 66, level: "err" },
              { t: "user.activity.events", p: 12, in: "3.2k",  b: "14 MB",  ur: 0, seed: 67, level: "ok" },
            ].map((r, i) => (
              <tr key={i}>
                <td className="mono" style={{ color: "var(--fg-0)", fontWeight: 500 }}>{r.t}</td>
                <td className="muted">{r.p}</td>
                <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{r.in}</td>
                <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{r.b}</td>
                <td style={{ textAlign: "right", color: r.ur > 0 ? (r.level === "err" ? "var(--err)" : "var(--warn-fg)") : "var(--fg-3)", fontVariantNumeric: "tabular-nums" }}>{r.ur}</td>
                <td><MiniSpark seed={r.seed} width={140} color={r.level === "err" ? "var(--err)" : r.level === "warn" ? "var(--warn)" : "var(--chart-1)"}/></td>
                <td><Icon name="chevron-right" size={14} className="muted"/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =========================================================
   DATABASE
   ========================================================= */
function DatabaseScreen({ go }) {
  const [tab, setTab] = useStateB("overview");
  return (
    <div className="page">
      <div className="row">
        <button className="btn btn-ghost" onClick={() => go("overview")}><Icon name="back" size={14}/>Overview</button>
        <span className="muted">/</span>
        <span style={{ fontSize: 13, color: "var(--fg-0)", fontWeight: 600 }}>Database</span>
      </div>

      <PageHeader
        icon="database" iconColor="var(--brand)" iconBg="var(--brand-tint)"
        title="Database"
        subtitle="checkout-prod · PostgreSQL 16.2 · us-east-1 · 4 nodes"
        statusBadge={<span className="badge warn" style={{ marginLeft: 6 }}><span className="b-dot"/>degraded · replica-3 lagging, p99 +62%</span>}
        actions={
          <div className="row">
            <button className="btn"><Icon name="zap" size={14}/>Failover</button>
            <button className="btn"><Icon name="export" size={14}/>Export</button>
          </div>
        }
      />

      <Tabs
        tabs={[
          { id: "overview", label: "Overview" },
          { id: "queries", label: "Queries", badge: "top-N", badgeKind: "neutral" },
          { id: "tables", label: "Tables", badge: 184 },
          { id: "replication", label: "Replication", badge: 1, badgeKind: "warn" },
          { id: "locks", label: "Locks" },
          { id: "slow", label: "Slow log", badge: 412, badgeKind: "err" },
        ]}
        active={tab} setActive={setTab}
      />

      {/* KPI + topology */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
          {[
            { label: "QPS",       value: "14.8k", unit: "queries/s", d: "+2.1%", dCls: "", color: "var(--chart-1)", seed: 71 },
            { label: "p99 latency", value: "42.8ms", unit: "+16ms", d: "+62%", dCls: "down", color: "var(--err)", seed: 72 },
            { label: "Connections", value: "284", unit: "of 500", d: "57%", dCls: "warn", color: "var(--warn)", seed: 73 },
            { label: "Replication lag", value: "0.14s", unit: "replica-3", d: "+0.12s", dCls: "down warn", color: "var(--warn)", seed: 74 },
          ].map(k => (
            <div key={k.label} className="card">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div className="card-sub" style={{ fontSize: 12 }}>{k.label}</div>
                <span className={"delta " + k.dCls}>{k.d}</span>
              </div>
              <div className="row" style={{ alignItems: "baseline", gap: 6, marginTop: 6 }}>
                <div className="stat-value" style={{ fontSize: 24 }}>{k.value}</div>
                <div className="stat-unit">{k.unit}</div>
              </div>
              <MiniSpark seed={k.seed} color={k.color} height={28} width={220}/>
            </div>
          ))}

          {/* Latency dist */}
          <div className="card card-pad-lg" style={{ gridColumn: "span 4" }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div>
                <div className="card-title">Query latency distribution · p50 / p95 / p99</div>
                <div className="card-sub" style={{ marginTop: 2 }}>1h · across all tables</div>
              </div>
              <div className="row" style={{ gap: 14 }}>
                <div className="row" style={{ gap: 5 }}><span style={{ width: 10, height: 2, background: "var(--chart-1)" }}/><span className="muted" style={{ fontSize: 11 }}>p50 · 4.2ms</span></div>
                <div className="row" style={{ gap: 5 }}><span style={{ width: 10, height: 2, background: "var(--warn)" }}/><span className="muted" style={{ fontSize: 11 }}>p95 · 18.1ms</span></div>
                <div className="row" style={{ gap: 5 }}><span style={{ width: 10, height: 2, background: "var(--err)" }}/><span className="muted" style={{ fontSize: 11 }}>p99 · 42.8ms</span></div>
              </div>
            </div>
            <div style={{ position: "relative", height: 160 }}>
              <div style={{ position: "absolute", inset: 0 }}><AreaSpark seed={81} height={160} color="var(--chart-1)" soft="var(--chart-1-soft)" base={0.3} amp={0.12}/></div>
              <div style={{ position: "absolute", inset: 0 }}><AreaSpark seed={82} height={160} color="var(--warn)" soft="transparent" base={0.55} amp={0.18}/></div>
              <div style={{ position: "absolute", inset: 0 }}><AreaSpark seed={83} height={160} color="var(--err)" soft="transparent" base={0.78} amp={0.14}/></div>
            </div>
          </div>
        </div>

        {/* Topology */}
        <div className="card card-pad-lg">
          <div className="card-title">Topology</div>
          <div className="card-sub" style={{ marginTop: 2 }}>1 primary · 3 replicas</div>
          <div style={{ marginTop: 16, position: "relative", height: 220 }}>
            <svg viewBox="0 0 320 220" width="100%" height="220">
              {/* primary */}
              <g>
                <circle cx="160" cy="50" r="28" fill="var(--brand-tint)" stroke="var(--brand)" strokeWidth="2"/>
                <text x="160" y="48" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--brand-deep)">PRIMARY</text>
                <text x="160" y="62" textAnchor="middle" fontSize="9" fill="var(--brand-deep)" fontFamily="monospace">74%</text>
                <text x="160" y="92" textAnchor="middle" fontSize="10" fill="var(--fg-2)" fontFamily="monospace">pg-primary</text>
              </g>
              {[
                { x: 50,  y: 175, name: "replica-1", val: "58%", color: "var(--ok)" },
                { x: 160, y: 175, name: "replica-2", val: "60%", color: "var(--warn)" },
                { x: 270, y: 175, name: "replica-3", val: "84%", color: "var(--warn)" },
              ].map((r, i) => (
                <g key={i}>
                  <path d={`M 160 80 Q ${(160+r.x)/2} ${120} ${r.x} ${r.y - 28}`} fill="none" stroke="var(--line)" strokeWidth="1.5" strokeDasharray={i === 2 ? "4 3" : ""}/>
                  <circle cx={r.x} cy={r.y} r="22" fill="var(--bg-inset)" stroke={r.color} strokeWidth="2"/>
                  <text x={r.x} y={r.y+4} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--fg-0)">{r.val}</text>
                  <text x={r.x} y={r.y + 38} textAnchor="middle" fontSize="10" fill="var(--fg-2)" fontFamily="monospace">{r.name}</text>
                </g>
              ))}
              <text x="240" y="120" fontSize="10" fill="var(--warn-fg)" fontWeight="600">lag 0.14s</text>
            </svg>
          </div>
        </div>
      </div>

      {/* Top queries + connections */}
      <div className="card card-pad-lg">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <div className="card-title">Top queries by total time</div>
            <div className="card-sub" style={{ marginTop: 2 }}>fingerprinted · last 1 hour</div>
          </div>
          <div className="row">
            <button className="btn"><Icon name="filter" size={14}/>By table</button>
            <button className="btn"><Icon name="export" size={14}/>Export</button>
          </div>
        </div>
        <table className="tbl" style={{ marginTop: 8 }}>
          <thead>
            <tr><th>Query</th><th style={{ textAlign: "right" }}>Calls</th><th style={{ textAlign: "right" }}>Avg time</th><th style={{ textAlign: "right" }}>P99</th><th style={{ textAlign: "right" }}>Total time</th><th>Trend</th></tr>
          </thead>
          <tbody>
            {[
              { q: "SELECT * FROM checkout_session WHERE session_id = $1", c: "1.2M", a: "0.4ms", p: "2.1ms",  tt: "8m 12s",  seed: 91, lvl: "ok" },
              { q: "UPDATE orders SET status = $1 WHERE id = $2",          c: "642k", a: "1.8ms", p: "12.4ms", tt: "19m 24s", seed: 92, lvl: "warn" },
              { q: "INSERT INTO payment_attempts (...) VALUES ($1,$2,..)", c: "418k", a: "0.8ms", p: "4.2ms",  tt: "5m 34s",  seed: 93, lvl: "ok" },
              { q: "SELECT order_id, total FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2", c: "84k", a: "8.4ms", p: "42.8ms", tt: "11m 50s", seed: 94, lvl: "err" },
              { q: "SELECT count(*) FROM inventory_movements WHERE sku = ANY ($1) AND ts > $2", c: "12k", a: "18.2ms", p: "84.1ms", tt: "3m 38s", seed: 95, lvl: "err" },
              { q: "DELETE FROM session_cache WHERE expires_at < now()",   c: "8.4k", a: "2.4ms", p: "8.1ms", tt: "20s", seed: 96, lvl: "ok" },
            ].map((r, i) => (
              <tr key={i}>
                <td className="mono" style={{ color: "var(--fg-0)", maxWidth: 540, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.q}</td>
                <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{r.c}</td>
                <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{r.a}</td>
                <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: r.lvl === "err" ? "var(--err)" : r.lvl === "warn" ? "var(--warn-fg)" : "var(--fg-1)" }}>{r.p}</td>
                <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: "var(--fg-0)", fontWeight: 500 }}>{r.tt}</td>
                <td><MiniSpark seed={r.seed} width={110} color={r.lvl === "err" ? "var(--err)" : r.lvl === "warn" ? "var(--warn)" : "var(--chart-1)"}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =========================================================
   LOGS
   ========================================================= */
function LogsScreen({ go }) {
  const [selected, setSelected] = useStateB(2);
  const [detailOpen, setDetailOpen] = useStateB(true);
  const [colsOpen, setColsOpen] = useStateB(false);
  const [cols, setCols] = useStateB({ ts: true, sev: true, svc: true, host: true, msg: true });
  const [filters, setFilters] = useStateB([
    { attr: "service.name",  op: ":", val: "checkout-bff", color: "var(--brand-deep)" },
    { attr: "severity_text", op: ":", val: "ERROR",        color: "var(--err)" },
    { attr: "env",           op: ":", val: "prod",         color: "var(--brand-deep)" },
  ]);
  const [filtersOpen, setFiltersOpen] = useStateB(false);

  // Schema drives the suggestions popover AND the filter page.
  const logsSchema = {
    quick: [
      { attr: "severity_text", op: ":", val: "ERROR", icon: "alert", color: "var(--err)", tint: "var(--err-soft)" },
      { attr: "severity_text", op: ":", val: "WARN",  icon: "alert", color: "var(--warn-fg)", tint: "var(--warn-soft)" },
      { attr: "has_trace",     op: ":", val: "true",  icon: "trace" },
      { attr: "env",           op: ":", val: "prod",  icon: "globe" },
      { attr: "k8s.namespace", op: ":", val: "checkout", icon: "infra" },
    ],
    groups: [
      { id: "common",     label: "Common",         icon: "filter",   desc: "Most used", attrs: ["service.name", "severity_text", "env", "host.name"] },
      { id: "service",    label: "Service",        icon: "service",  attrs: ["service.name", "service.version", "deployment.environment"] },
      { id: "infra",      label: "Infrastructure", icon: "infra",    attrs: ["host.name", "host.az", "k8s.namespace", "k8s.pod.name", "container.id"] },
      { id: "trace",      label: "Trace",          icon: "trace",    attrs: ["trace.id", "span.id", "has_trace"] },
      { id: "http",       label: "HTTP",           icon: "code",     attrs: ["http.route", "http.method", "http.status_code"] },
      { id: "user",       label: "User & session", icon: "user",     attrs: ["user.id", "user.tier", "session.id"] },
    ],
    attrs: {
      "service.name":   { label: "service.name",  icon: "service", desc: "Logical service", values: [
        { v: "checkout-bff", c: 6420, color: "var(--brand-deep)" }, { v: "payment-svc", c: 1184, color: "var(--err)" }, { v: "search", c: 842 }, { v: "cart", c: 412 }, { v: "inventory", c: 218 }, { v: "user-profile", c: 142 }, { v: "notif-svc", c: 96 },
      ]},
      "service.version":{ label: "service.version", icon: "tag",   values: [{ v: "8.12.0", c: 184201 }, { v: "8.11.4", c: 41200 }, { v: "canary", c: 1820 }] },
      "deployment.environment": { label: "deployment.environment", icon: "globe", values: [{ v: "prod", c: 184201 }, { v: "staging", c: 12410 }, { v: "dev", c: 4218 }] },
      "severity_text":  { label: "severity_text", icon: "alert",   desc: "Log level",        values: [
        { v: "ERROR", c: 412, color: "var(--err)" }, { v: "WARN", c: 1812, color: "var(--warn-fg)" }, { v: "INFO", c: 182411, color: "var(--brand-deep)" }, { v: "DEBUG", c: 42118, color: "var(--fg-3)" }, { v: "FATAL", c: 4, color: "var(--err-fg)" },
      ]},
      "env":            { label: "env",           icon: "globe",   values: [{ v: "prod", c: 184201, color: "var(--brand-deep)" }, { v: "staging", c: 0 }, { v: "dev", c: 0 }] },
      "host.name":      { label: "host.name",     icon: "infra",   desc: "Originating host", values: [{ v: "i-0a1b2c3d", c: 124 }, { v: "i-0e4f5g6h", c: 68 }, { v: "i-0a1b2c4d", c: 42 }, { v: "i-0c8d9e0f", c: 28 }, { v: "i-0bcdef12", c: 18 }] },
      "host.az":        { label: "host.az",       icon: "infra",   values: [{ v: "us-east-1a", c: 128411 }, { v: "us-east-1b", c: 41200 }, { v: "us-east-1c", c: 14590 }] },
      "k8s.namespace":  { label: "k8s.namespace", icon: "infra",   values: [{ v: "checkout", c: 8420 }, { v: "platform", c: 4214 }, { v: "ingest", c: 1820 }] },
      "k8s.pod.name":   { label: "k8s.pod.name",  icon: "infra",   freeform: true, placeholder: "payment-svc-7d8c9-…", values: [{ v: "payment-svc-7d8c9-jvxk2", c: 124 }, { v: "checkout-bff-4f8a-2lk9q", c: 68 }] },
      "container.id":   { label: "container.id",  icon: "infra",   freeform: true, values: [{ v: "8c4a91f3b2e1", c: 42 }, { v: "7b3f8a2e9c14", c: 38 }] },
      "trace.id":       { label: "trace.id",      icon: "trace",   freeform: true, placeholder: "Paste a 16-char trace id", values: [{ v: "7b3f8a2e9c14d5b0", c: 14 }, { v: "9a14c2b8e7f10d3a", c: 11 }] },
      "span.id":        { label: "span.id",       icon: "trace",   freeform: true, values: [] },
      "has_trace":      { label: "has_trace",     icon: "trace",   desc: "Log carries a trace id", values: [{ v: "true", c: 84120 }, { v: "false", c: 100081 }] },
      "http.route":     { label: "http.route",    icon: "code",    freeform: true, values: [{ v: "/api/v2/checkout", c: 8421 }, { v: "/api/v2/payments", c: 4218 }, { v: "/api/v2/orders/:id", c: 2410 }, { v: "/api/v2/search", c: 842 }] },
      "http.method":    { label: "http.method",   icon: "code",    values: [{ v: "GET", c: 124000 }, { v: "POST", c: 58420 }, { v: "DELETE", c: 218 }] },
      "http.status_code":{label: "http.status_code", icon: "code", values: [{ v: "200", c: 173728, color: "var(--ok)" }, { v: "404", c: 412 }, { v: "408", c: 84, color: "var(--warn-fg)" }, { v: "500", c: 84, color: "var(--err)" }, { v: "504", c: 244, color: "var(--err)" }] },
      "user.id":        { label: "user.id",       icon: "user",    freeform: true, placeholder: "u_842919", values: [{ v: "u_842919", c: 14 }, { v: "u_842920", c: 8 }] },
      "user.tier":      { label: "user.tier",     icon: "user",    values: [{ v: "free", c: 91200 }, { v: "plus", c: 41200 }, { v: "enterprise", c: 4218 }] },
      "session.id":     { label: "session.id",    icon: "user",    freeform: true, values: [] },
    },
  };

  const savedViews = [
    { label: "Payment 5xx — last hour",      count: "412 logs",   apply: () => setFilters([{ attr: "service.name", op: ":", val: "payment-svc", color: "var(--err)" }, { attr: "http.status_code", op: ":", val: "504", color: "var(--err)" }]) },
    { label: "Checkout retries",              count: "1.8k logs", apply: () => setFilters([{ attr: "service.name", op: ":", val: "checkout-bff", color: "var(--brand-deep)" }, { attr: "severity_text", op: ":", val: "WARN", color: "var(--warn-fg)" }]) },
    { label: "Prod errors across all services", count: "412 logs", apply: () => setFilters([{ attr: "env", op: ":", val: "prod", color: "var(--brand-deep)" }, { attr: "severity_text", op: ":", val: "ERROR", color: "var(--err)" }]) },
  ];
  const recents = [
    { attr: "service.name",    op: ":", val: "search",           color: "var(--brand-deep)" },
    { attr: "http.route",      op: ":", val: "/api/v2/checkout", color: "var(--fg-2)" },
    { attr: "host.az",         op: ":", val: "us-east-1a",       color: "var(--fg-2)" },
  ];
  const presets = [
    { label: "Errors only",      filters: [{ attr: "severity_text", op: ":", val: "ERROR", color: "var(--err)" }] },
    { label: "Payment timeouts", filters: [{ attr: "service.name", op: ":", val: "payment-svc", color: "var(--err)" }, { attr: "http.status_code", op: ":", val: "504", color: "var(--err)" }] },
    { label: "Slow requests > 1s", filters: [{ attr: "duration_ms", op: ">", val: "1000", color: "var(--warn-fg)" }] },
    { label: "Linked to a trace", filters: [{ attr: "has_trace", op: ":", val: "true", color: "var(--brand-deep)" }] },
  ];

  const lines = [
    { ts: "10:42:18.421", sev: "ERROR", svc: "payment-svc", host: "i-0a1b2c3d", msg: "Upstream timeout calling stripe.charges.create after 4218ms (request_id=7b3f8a)", attrs: { trace_id: "7b3f8a2e9c14d5b0", duration_ms: 4218 } },
    { ts: "10:42:18.402", sev: "WARN",  svc: "checkout-bff", host: "i-0e4f5g6h", msg: "Retrying payment provider call (attempt 2/3) trace_id=7b3f8a2e9c14d5b0" },
    { ts: "10:42:18.388", sev: "ERROR", svc: "payment-svc", host: "i-0a1b2c3d", msg: "ConnectionResetError: stripe API socket closed unexpectedly during /v1/charges (request_id=7b3f8a)", attrs: { stack_lines: 12, status_code: null } },
    { ts: "10:42:18.022", sev: "INFO",  svc: "checkout-bff", host: "i-0e4f5g6h", msg: "checkout.complete attempt user=u_842919 cart=$184.20" },
    { ts: "10:42:17.918", sev: "DEBUG", svc: "search",       host: "i-0c8d9e0f", msg: "Query parsed: { term: 'iphone', filters: { brand: ['apple'] } }" },
    { ts: "10:42:17.842", sev: "WARN",  svc: "payment-svc", host: "i-0a1b2c3d", msg: "Circuit breaker for stripe.charges entering half-open state (cooldown 12s)" },
    { ts: "10:42:17.520", sev: "INFO",  svc: "checkout-bff", host: "i-0e4f5g6h", msg: "POST /api/v2/checkout 200 (412ms) user=u_842919" },
    { ts: "10:42:17.218", sev: "ERROR", svc: "payment-svc", host: "i-0a1b2c4d", msg: "Upstream timeout calling stripe.charges.create after 4042ms (request_id=ab2f7e)" },
    { ts: "10:42:17.084", sev: "DEBUG", svc: "checkout-bff", host: "i-0e4f5g6h", msg: "Span checkout.payments.charge started parent=POST /api/v2/checkout" },
    { ts: "10:42:16.901", sev: "INFO",  svc: "user-profile", host: "i-0bcdef12", msg: "Identity refresh for user u_842919 ok" },
    { ts: "10:42:16.802", sev: "ERROR", svc: "payment-svc", host: "i-0a1b2c4d", msg: "Upstream timeout calling stripe.charges.create after 3984ms (request_id=1d8e3f)" },
    { ts: "10:42:16.418", sev: "WARN",  svc: "search", host: "i-0c8d9e0f", msg: "Elasticsearch shard rebalance triggered (8 shards rebalancing)" },
    { ts: "10:42:16.012", sev: "INFO",  svc: "checkout-bff", host: "i-0e4f5g6h", msg: "POST /api/v2/checkout 200 (218ms) user=u_842920" },
    { ts: "10:42:15.821", sev: "DEBUG", svc: "inventory", host: "i-0d1e2f34", msg: "Stock reservation: sku=SKU-19271 qty=1 expires_in=300s" },
  ];

  return (
    <div className="page" style={{ padding: 0, gap: 0, height: "calc(100vh - var(--header-h))" }}>
      {/* search bar */}
      <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--line)" }}>
        <div className="row" style={{ gap: 10 }}>
          <FilterSearchBar
            kind="logs"
            schema={logsSchema}
            filters={filters}
            onAddFilter={(f) => setFilters(prev => [...prev, f])}
            onRemoveFilter={(i) => setFilters(prev => prev.filter((_, j) => j !== i))}
            onClearAll={() => setFilters([])}
            onOpenFiltersPage={() => setFiltersOpen(true)}
            savedViews={savedViews}
            recents={recents}
          />
          <button className="btn"><Icon name="share" size={14}/>Share</button>
          <button className="btn"><Icon name="export" size={14}/>Export</button>
        </div>
      </div>

      <FiltersPage
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        kind="logs"
        filters={filters}
        onApply={setFilters}
        schema={logsSchema}
        presets={presets}
      />

      {/* trend strip */}
      <div style={{ padding: "14px 24px", borderBottom: "1px solid var(--line)", background: "var(--bg-inset)" }}>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
          <div className="row" style={{ gap: 18 }}>
            <span style={{ fontSize: 26, fontWeight: 700 }}>184.2k</span>
            <span className="muted" style={{ fontSize: 12 }}>logs · 412 errors, 1.8k warns</span>
            <div className="row" style={{ gap: 12 }}>
              {[
                { l: "ERROR", c: "412",  k: "error" },
                { l: "WARN",  c: "1.8k", k: "warn" },
                { l: "INFO",  c: "182k", k: "info" },
                { l: "DEBUG", c: "42k",  k: "debug" },
              ].map(s => (
                <div key={s.l} className="row" style={{ gap: 6 }}>
                  <span className={"sev-chip " + s.k}>{s.l}</span>
                  <span className="mono muted" style={{ fontSize: 11.5 }}>{s.c}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="row">
            <span className="muted" style={{ fontSize: 11 }}>brush a window on the timeline to refine</span>
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <Bars seed={101} h={56} w={1200} n={48} color="var(--brand-2)" base={0.3} amp={0.4}/>
          <div style={{ position: "absolute", left: "62%", top: 0, bottom: 0, width: "8%", background: "rgba(59,130,246,0.12)", border: "1px solid var(--brand-2)", borderRadius: 3, pointerEvents: "none" }}/>
        </div>
      </div>

      {/* main split */}
      <div style={{ display: "grid", gridTemplateColumns: detailOpen ? "220px 1fr 380px" : "220px 1fr", flex: 1, minHeight: 0 }}>
        {/* facets */}
        <div style={{ borderRight: "1px solid var(--line)", padding: "16px 16px", overflowY: "auto" }}>
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 6 }}>
            <div className="label-up">Facets</div>
            <Icon name="plus" size={12} className="muted"/>
          </div>
          {[
            { name: "Service", items: [["payment-svc", 142, true], ["checkout-bff", 38, false], ["search", 12, false], ["inventory", 8, false], ["user-profile", 4, false]] },
            { name: "Severity", items: [["ERROR", 412, true], ["WARN", 1812, false], ["INFO", 182411, false], ["DEBUG", 42118, false]] },
            { name: "Environment", items: [["prod", 184201, true], ["staging", 0, false]] },
            { name: "Host", items: [["i-0a1b2c3d", 124, false], ["i-0e4f5g6h", 68, false], ["i-0a1b2c4d", 42, false]] },
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
            <div className="muted" style={{ fontSize: 11 }}>Showing 184,201 logs · live tail on</div>
            <div className="row" style={{ position: "relative" }}>
              <button className="btn btn-ghost" style={{ height: 26 }} onClick={() => setColsOpen(o => !o)}>
                Columns · {Object.values(cols).filter(Boolean).length}
              </button>
              {colsOpen && (
                <div style={{ position: "absolute", right: 0, top: 32, background: "var(--bg-card)", border: "1px solid var(--line)", borderRadius: 8, padding: 8, minWidth: 180, zIndex: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
                  <div className="label-up" style={{ padding: "2px 8px 6px" }}>Visible columns</div>
                  {[
                    { k: "ts",   label: "Timestamp" },
                    { k: "sev",  label: "Severity"  },
                    { k: "svc",  label: "Service"   },
                    { k: "host", label: "Host"      },
                    { k: "msg",  label: "Message"   },
                  ].map(c => (
                    <label key={c.k} className="row" style={{ gap: 8, padding: "5px 8px", borderRadius: 4, cursor: "pointer", fontSize: 12 }}>
                      <input type="checkbox" checked={!!cols[c.k]} onChange={() => setCols(prev => ({ ...prev, [c.k]: !prev[c.k] }))} style={{ accentColor: "var(--brand)" }}/>
                      <span style={{ color: "var(--fg-0)" }}>{c.label}</span>
                    </label>
                  ))}
                </div>
              )}
              {!detailOpen && (
                <button className="btn btn-ghost" style={{ height: 26 }} onClick={() => setDetailOpen(true)}>
                  Show detail
                </button>
              )}
            </div>
          </div>
          {lines.map((l, i) => (
            <div key={i} className="row" style={{ alignItems: "flex-start", padding: "8px 18px", borderBottom: "1px solid var(--line-2)", background: i === selected ? "var(--brand-tint)" : "transparent", cursor: "pointer" }} onClick={() => { setSelected(i); setDetailOpen(true); }}>
              <div className={"sev-gutter " + l.sev.toLowerCase()}/>
              {cols.ts && <span className="mono muted" style={{ fontSize: 11.5, minWidth: 96 }}>{l.ts}</span>}
              {cols.sev && <span className={"sev-chip " + l.sev.toLowerCase()}>{l.sev}</span>}
              {cols.svc && <span className="mono" style={{ minWidth: 110, color: "var(--brand-deep)", fontSize: 12 }}>{l.svc}</span>}
              {cols.host && <span className="mono muted" style={{ minWidth: 110, fontSize: 11.5 }}>{l.host}</span>}
              {cols.msg && <span style={{ flex: 1, color: "var(--fg-0)", fontSize: 12.5 }} className="mono">{l.msg}</span>}
            </div>
          ))}
        </div>

        {/* detail */}
        {detailOpen && (
        <div style={{ borderLeft: "1px solid var(--line)", padding: 18, overflowY: "auto" }}>
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
            <div className="row">
              <span className="sev-chip error">ERROR</span>
              <span className="mono muted" style={{ fontSize: 11 }}>10:42:18.388</span>
            </div>
            <button className="btn btn-icon btn-ghost" onClick={() => setDetailOpen(false)} title="Close" style={{ height: 24, width: 24 }}>
              <Icon name="x" size={14} className="muted"/>
            </button>
          </div>
          <div className="row" style={{ gap: 6, marginBottom: 14, fontSize: 11.5 }}>
            <span className="tab active" style={{ padding: "4px 8px", fontSize: 11.5 }}>Message</span>
            <span className="tab" style={{ padding: "4px 8px", fontSize: 11.5 }}>Fields</span>
            <span className="tab" style={{ padding: "4px 8px", fontSize: 11.5 }}>JSON</span>
            <span className="tab" style={{ padding: "4px 8px", fontSize: 11.5 }}>Correlate</span>
          </div>

          <div style={{ fontSize: 12.5, color: "var(--fg-0)", marginBottom: 14, lineHeight: 1.5 }} className="mono">
            ConnectionResetError: stripe API socket closed unexpectedly during /v1/charges (request_id=7b3f8a)
          </div>

          <div className="label-up" style={{ marginBottom: 6 }}>Trace correlation</div>
          <div onClick={() => go("trace")} style={{ padding: 10, borderRadius: 6, background: "var(--bg-inset)", marginBottom: 14, cursor: "pointer", border: "1px solid var(--line-2)" }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div className="mono" style={{ fontSize: 12, color: "var(--brand-deep)" }}>7b3f8a2e9c14d5b0…</div>
              <Icon name="link-ext" size={12} className="muted"/>
            </div>
            <div className="muted" style={{ fontSize: 11, marginTop: 3 }}>POST /api/v2/checkout · 4218 ms · 14 spans · 2 errors</div>
          </div>

          <div className="label-up" style={{ marginBottom: 6 }}>Fields</div>
          <div style={{ borderRadius: 6, border: "1px solid var(--line-2)" }}>
            {[
              ["service.name", "payment-svc"],
              ["service.version", "8.12.0"],
              ["host.name", "i-0a1b2c3d"],
              ["host.az", "us-east-1a"],
              ["k8s.pod.name", "payment-svc-7d8c9-jvxk2"],
              ["trace.id", "7b3f8a2e9c14d5b0"],
              ["span.id", "9a14c2b8e7f10d3a"],
              ["http.route", "/api/v2/checkout"],
              ["http.status_code", "—"],
              ["error.type", "ConnectionResetError"],
              ["duration_ms", "4218"],
              ["user.id", "u_842919"],
            ].map(([k, v], i) => (
              <div key={k} className="row" style={{ padding: "6px 10px", borderBottom: i < 11 ? "1px solid var(--line-2)" : 0, fontSize: 11.5 }}>
                <span className="muted mono" style={{ minWidth: 130 }}>{k}</span>
                <span className="mono" style={{ color: "var(--fg-0)" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { InfrastructureScreen, HostDetailScreen, ContainerDetailScreen, KafkaScreen, DatabaseScreen, LogsScreen });
