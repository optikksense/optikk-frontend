/* global React */
const { useState, useMemo, useEffect, useRef } = React;

/* =================================================================
   ICONS — minimal stroke-based set
   ================================================================= */
const Icon = ({ name, size = 16, stroke = 1.6, className }) => {
  const sw = stroke;
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round", className };
  switch (name) {
    case "grid": return <svg {...props}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
    case "service": return <svg {...props}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/><circle cx="7" cy="7.5" r=".6" fill="currentColor" stroke="none"/></svg>;
    case "metrics": return <svg {...props}><path d="M4 18V14"/><path d="M9 18V10"/><path d="M14 18V6"/><path d="M19 18V12"/><path d="M3 21h18"/></svg>;
    case "logs": return <svg {...props}><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8"/><path d="M8 12h8"/><path d="M8 16h5"/></svg>;
    case "trace": return <svg {...props}><path d="M3 7h10"/><path d="M7 12h12"/><path d="M5 17h9"/></svg>;
    case "saturation": return <svg {...props}><path d="M4 16a8 8 0 1 1 16 0"/><path d="M12 16l5-7"/><circle cx="12" cy="16" r="1.2" fill="currentColor" stroke="none"/></svg>;
    case "infra": return <svg {...props}><rect x="4" y="4" width="16" height="6" rx="1.5"/><rect x="4" y="14" width="16" height="6" rx="1.5"/><circle cx="7" cy="7" r=".8" fill="currentColor" stroke="none"/><circle cx="7" cy="17" r=".8" fill="currentColor" stroke="none"/></svg>;
    case "search": return <svg {...props}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
    case "chevron-down": return <svg {...props}><path d="m6 9 6 6 6-6"/></svg>;
    case "chevron-right": return <svg {...props}><path d="m9 6 6 6-6 6"/></svg>;
    case "chevron-left": return <svg {...props}><path d="m15 6-6 6 6 6"/></svg>;
    case "back": return <svg {...props}><path d="m15 6-6 6 6 6"/></svg>;
    case "clock": return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case "refresh": return <svg {...props}><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/></svg>;
    case "export": return <svg {...props}><path d="M12 4v12"/><path d="m7 11 5 5 5-5"/><path d="M5 20h14"/></svg>;
    case "share": return <svg {...props}><circle cx="6" cy="12" r="2.4"/><circle cx="18" cy="6" r="2.4"/><circle cx="18" cy="18" r="2.4"/><path d="m8 11 8-4"/><path d="m8 13 8 4"/></svg>;
    case "more": return <svg {...props}><circle cx="5" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.2" fill="currentColor" stroke="none"/></svg>;
    case "kafka": return <svg {...props}><polyline points="6 6 6 11 10 13 10 18"/><polyline points="18 6 18 11 14 13 14 18"/><circle cx="10" cy="13" r="1.3" fill="currentColor" stroke="none"/><circle cx="14" cy="13" r="1.3" fill="currentColor" stroke="none"/></svg>;
    case "database": return <svg {...props}><ellipse cx="12" cy="5.5" rx="7" ry="2.5"/><path d="M5 5.5v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-6"/><path d="M5 11.5v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-6"/></svg>;
    case "redis": return <svg {...props}><circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none"/></svg>;
    case "queues": return <svg {...props}><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>;
    case "storage": return <svg {...props}><rect x="4" y="5" width="16" height="6" rx="1.5"/><rect x="4" y="13" width="16" height="6" rx="1.5"/><circle cx="7" cy="8" r=".8" fill="currentColor" stroke="none"/><circle cx="7" cy="16" r=".8" fill="currentColor" stroke="none"/></svg>;
    case "bell": return <svg {...props}><path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9Z"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>;
    case "user": return <svg {...props}><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 5-6 8-6s7 2 8 6"/></svg>;
    case "filter": return <svg {...props}><path d="M3 5h18l-7 9v6l-4-2v-4Z"/></svg>;
    case "x": return <svg {...props}><path d="M6 6 18 18M18 6 6 18"/></svg>;
    case "plus": return <svg {...props}><path d="M12 5v14M5 12h14"/></svg>;
    case "alert": return <svg {...props}><path d="M12 4 2 20h20Z"/><path d="M12 11v4"/><circle cx="12" cy="18" r=".7" fill="currentColor" stroke="none"/></svg>;
    case "check": return <svg {...props}><path d="m5 12 5 5 9-11"/></svg>;
    case "play": return <svg {...props}><path d="M7 5v14l12-7Z" fill="currentColor"/></svg>;
    case "pause": return <svg {...props}><rect x="6" y="5" width="4" height="14" fill="currentColor" stroke="none"/><rect x="14" y="5" width="4" height="14" fill="currentColor" stroke="none"/></svg>;
    case "zap": return <svg {...props}><path d="M13 3 4 14h7l-1 7 9-11h-7Z"/></svg>;
    case "link-ext": return <svg {...props}><path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M19 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6"/></svg>;
    case "topology": return <svg {...props}><circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="12" cy="18" r="2.5"/><path d="M8 7.5l8 0M8 8l4 8M16 8l-4 8"/></svg>;
    case "list": return <svg {...props}><rect x="3" y="4" width="3" height="3" rx=".5" fill="currentColor" stroke="none"/><rect x="3" y="10.5" width="3" height="3" rx=".5" fill="currentColor" stroke="none"/><rect x="3" y="17" width="3" height="3" rx=".5" fill="currentColor" stroke="none"/><path d="M9 5.5h12M9 12h12M9 18.5h12"/></svg>;
    case "send": return <svg {...props}><path d="m4 12 16-8-7 16-2-7Z"/></svg>;
    case "bookmark": return <svg {...props}><path d="M6 4h12v17l-6-4-6 4Z"/></svg>;
    case "tag": return <svg {...props}><path d="M20 13 13 20a2 2 0 0 1-2.8 0L4 13.8V4h9.8L20 10.2a2 2 0 0 1 0 2.8Z"/><circle cx="9" cy="9" r="1" fill="currentColor" stroke="none"/></svg>;
    case "globe": return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>;
    case "cloud": return <svg {...props}><path d="M7 18h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6 11.5 4 4 0 0 0 7 18Z"/></svg>;
    case "code": return <svg {...props}><path d="m8 8-5 4 5 4M16 8l5 4-5 4M14 4l-4 16"/></svg>;
    case "ai": return <svg {...props}><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/><circle cx="12" cy="12" r="3.6"/></svg>;
    case "sparkle": return <svg {...props}><path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8Z"/><path d="M18 16l.7 1.8L20.5 18.5l-1.8.7L18 21l-.7-1.8L15.5 18.5l1.8-.7Z"/></svg>;
    case "chip": return <svg {...props}><rect x="6" y="6" width="12" height="12" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx=".6"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/></svg>;
    case "mcp": return <svg {...props}><rect x="2.5" y="7" width="6" height="10" rx="1.5"/><rect x="15.5" y="7" width="6" height="10" rx="1.5"/><path d="M8.5 12h2.5M13 12h2.5"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/></svg>;
    case "plug": return <svg {...props}><path d="M9 3v4M15 3v4"/><path d="M7 7h10v4a5 5 0 0 1-10 0Z"/><path d="M12 16v5"/></svg>;
    case "tool": return <svg {...props}><path d="M14.7 6.3a3.5 3.5 0 0 0-4.6 4.6L4 17v3h3l6.1-6.1a3.5 3.5 0 0 0 4.6-4.6l-2.1 2.1-2-2Z"/></svg>;
    case "resource": return <svg {...props}><path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10Z"/><path d="M13 3v6h7"/><path d="M8 13h7M8 17h5"/></svg>;
    case "shield": return <svg {...props}><path d="M12 3 4 6v6c0 4.5 3.4 8.4 8 9 4.6-.6 8-4.5 8-9V6Z"/><path d="m9 12 2 2 4-4"/></svg>;
    case "key": return <svg {...props}><circle cx="8" cy="14" r="3.5"/><path d="m11 12 9-7"/><path d="m16 5 3 3M14 7l3 3"/></svg>;
    default: return <svg {...props}><circle cx="12" cy="12" r="3"/></svg>;
  }
};

/* =================================================================
   PAGE NAVIGATION — each "screen" is a separate HTML file
   ================================================================= */
const PAGE_URL = {
  overview:        "Overview.html",
  metrics:         "Metrics.html",
  saturation:      "Saturation.html",
  infrastructure:  "Infrastructure.html",
  hostDetail:      "HostDetail.html",
  containerDetail: "ContainerDetail.html",
  services:        "Services.html",
  serviceDetail:   "ServiceDetail.html",
  monitors:        "Monitors.html",
  monitorDetail:   "MonitorDetail.html",
  newMonitor:      "NewMonitor.html",
  notifications:   "Notifications.html",
  kafka:           "Kafka.html",
  database:        "Database.html",
  logs:            "Logs.html",
  traceList:       "Traces.html",
  trace:           "TraceDetail.html",
  llmobs:          "LLMObservability.html",
  bits:            "Bits.html",
  cloud:           "Cloud.html",
  account:         "Account.html",
  dashboards:      "Dashboards.html",
  dashboardDetail: "DashboardDetail.html",
};
function goTo(name, params) {
  let url = PAGE_URL[name] || "Overview.html";
  if (params && Object.keys(params).length) {
    url += "?" + new URLSearchParams(params).toString();
  }
  location.href = url;
}
function getURLParams() {
  const u = new URLSearchParams(location.search);
  const out = {};
  for (const [k, v] of u) out[k] = v;
  return out;
}

/* =================================================================
   SIDEBAR
   ================================================================= */
const NAV = [
  { group: "OBSERVE", items: [
    { id: "overview",   label: "Overview",   icon: "grid" },
    { id: "dashboards", label: "Dashboards", icon: "bookmark" },
    { id: "services",   label: "Service",    icon: "service" },
    { id: "metrics",    label: "Metrics",    icon: "metrics" },
    { id: "logs",       label: "Logs",       icon: "logs" },
    { id: "traces",     label: "Traces",     icon: "trace" },
    { id: "llmobs",     label: "LLM Obs",    icon: "ai" },
    { id: "bits",       label: "Bits",       icon: "sparkle" },
  ]},
  { group: "OPERATE", items: [
    { id: "saturation",    label: "Saturation",    icon: "saturation" },
    { id: "infrastructure",label: "Infrastructure",icon: "infra" },
    { id: "cloud",         label: "Cloud",         icon: "cloud" },
    { id: "monitors",      label: "Monitors",      icon: "bell" },
  ]},
];

// Map sidebar nav id → page url
const NAV_TARGET = {
  overview: PAGE_URL.overview,
  dashboards: PAGE_URL.dashboards,
  services: PAGE_URL.services,
  metrics:  PAGE_URL.metrics,
  logs:     PAGE_URL.logs,
  traces:   PAGE_URL.traceList,
  saturation: PAGE_URL.saturation,
  infrastructure: PAGE_URL.infrastructure,
  monitors: PAGE_URL.monitors,
  llmobs:   PAGE_URL.llmobs,
  bits:     PAGE_URL.bits,
  cloud:    PAGE_URL.cloud,
};

// Maps screen-id → which nav item is active
const NAV_FOR_SCREEN = {
  overview: "overview",
  dashboards: "dashboards",
  dashboardDetail: "dashboards",
  metrics: "metrics",
  saturation: "saturation",
  infrastructure: "infrastructure",
  hostDetail: "infrastructure",
  containerDetail: "infrastructure",
  monitors: "monitors",
  monitorDetail: "monitors",
  newMonitor: "monitors",
  notifications: "monitors",
  services: "services",
  serviceDetail: "services",
  kafka: "saturation",
  database: "saturation",
  logs: "logs",
  traceList: "traces",
  trace: "traces",
  llmobs: "llmobs",
  bits: "bits",
  cloud: "cloud",
};

function Sidebar({ screen }) {
  const activeId = NAV_FOR_SCREEN[screen] || screen;
  return (
    <aside className="sidebar">
      <a className="brand" href={PAGE_URL.overview}>
        <img className="brand-mark" src="favicon.svg" alt="Optikk" width="26" height="26" />
        <div className="brand-name">Optikk</div>
      </a>
      {NAV.map(sec => (
        <div key={sec.group}>
          <div className="nav-section">{sec.group}</div>
          {sec.items.map(it => (
            <a
              key={it.id}
              className={"nav-item" + (activeId === it.id ? " active" : "")}
              href={NAV_TARGET[it.id]}
            >
              <span className="nav-icon"><Icon name={it.icon} size={16} /></span>
              <span>{it.label}</span>
            </a>
          ))}
        </div>
      ))}
      <div className="nav-spacer" />
      <a href={PAGE_URL.account} style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, borderTop: "1px solid var(--line)", textDecoration: "none", color: "inherit", cursor: "pointer", background: screen === "account" ? "var(--bg-inset)" : "transparent" }} title="Open account">
        <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#3b82f6)", color: "white", fontWeight: 700, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>JV</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--fg-0)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Jay Vasquez</div>
          <div style={{ fontSize: 11, color: "var(--fg-3)" }}>SRE · Platform</div>
        </div>
        <Icon name="chevron-right" size={14} className="muted" />
      </a>
    </aside>
  );
}

/* =================================================================
   TIME RANGE PANEL — simple: quick presets + optional custom range
   ================================================================= */
function TimeRangePanel({ value, onChange, onClose }) {
  const presets = [
    "Last 5 minutes",
    "Last 15 minutes",
    "Last 1 hour",
    "Last 6 hours",
    "Last 24 hours",
    "Last 7 days",
    "Last 30 days",
  ];
  const [draft, setDraft]   = useState(value || "Last 1 hour");
  const [tz, setTz]         = useState("UTC");
  const [from, setFrom]     = useState("2026-05-25 10:30");
  const [to, setTo]         = useState("2026-05-26 10:42");
  const [customOpen, setCustomOpen] = useState(false);

  const isCustom = draft.includes("→");

  const apply = () => {
    const v = customOpen ? `${from} → ${to}` : draft;
    onChange && onChange(v);
    onClose && onClose();
  };

  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: "absolute", top: 38, left: 0,
        background: "var(--bg-card)", border: "1px solid var(--line)",
        borderRadius: 8, boxShadow: "0 18px 40px rgba(15,23,42,0.16), 0 2px 6px rgba(15,23,42,0.05)",
        zIndex: 60, width: 320, overflow: "hidden",
      }}
    >
      {/* Quick presets */}
      <div style={{ padding: 6 }}>
        {presets.map(p => {
          const selected = !customOpen && draft === p;
          return (
            <div key={p}
              onClick={() => { setDraft(p); setCustomOpen(false); }}
              style={{
                padding: "8px 12px",
                fontSize: 13,
                borderRadius: 5,
                cursor: "pointer",
                color: selected ? "var(--brand-deep)" : "var(--fg-1)",
                fontWeight: selected ? 600 : 500,
                background: selected ? "var(--brand-tint)" : "transparent",
                display: "flex", alignItems: "center", gap: 8,
              }}
              onMouseEnter={e => { if (!selected) e.currentTarget.style.background = "var(--bg-inset)"; }}
              onMouseLeave={e => { if (!selected) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ flex: 1 }}>{p}</span>
              {selected && <Icon name="check" size={13}/>}
            </div>
          );
        })}
      </div>

      {/* Custom range — collapsible */}
      <div style={{ borderTop: "1px solid var(--line-2)" }}>
        <div
          onClick={() => setCustomOpen(o => !o)}
          style={{
            padding: "10px 12px", fontSize: 12.5, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8,
            color: customOpen ? "var(--brand-deep)" : "var(--fg-1)",
            fontWeight: customOpen ? 600 : 500,
          }}
        >
          <Icon name="clock" size={13} className="muted"/>
          <span style={{ flex: 1 }}>Custom range</span>
          <Icon name={customOpen ? "chevron-down" : "chevron-right"} size={12} className="muted"/>
        </div>
        {customOpen && (
          <div style={{ padding: "0 12px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              <div>
                <div className="muted" style={{ fontSize: 10.5, marginBottom: 3 }}>From</div>
                <div className="search" style={{ height: 28, padding: "0 8px" }}>
                  <input value={from} onChange={e => setFrom(e.target.value)} className="mono" style={{ fontSize: 11.5 }}/>
                </div>
              </div>
              <div>
                <div className="muted" style={{ fontSize: 10.5, marginBottom: 3 }}>To</div>
                <div className="search" style={{ height: 28, padding: "0 8px" }}>
                  <input value={to} onChange={e => setTo(e.target.value)} className="mono" style={{ fontSize: 11.5 }}/>
                </div>
              </div>
            </div>

            {/* Inline calendar */}
            <div style={{ border: "1px solid var(--line-2)", borderRadius: 6, padding: 8, background: "var(--bg-card)" }}>
              <div className="row" style={{ marginBottom: 6 }}>
                <Icon name="chevron-left" size={13} className="muted" style={{ cursor: "pointer" }}/>
                <div className="spacer"/>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--fg-0)" }}>May 2026</span>
                <div className="spacer"/>
                <Icon name="chevron-right" size={13} className="muted" style={{ cursor: "pointer" }}/>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1 }}>
                {["S","M","T","W","T","F","S"].map((d, i) => (
                  <div key={i} className="muted" style={{ textAlign: "center", fontSize: 10, padding: "3px 0", fontWeight: 600 }}>{d}</div>
                ))}
                {/* May 2026 starts on a Friday — 5 empty leading cells */}
                {Array.from({ length: 5 }).map((_, i) => <div key={"e" + i}/>)}
                {Array.from({ length: 31 }).map((_, i) => {
                  const day = i + 1;
                  const inRange = day >= 25 && day <= 26;
                  const isEdge  = day === 25 || day === 26;
                  return (
                    <div key={day} style={{
                      textAlign: "center",
                      padding: "5px 0",
                      fontSize: 11,
                      borderRadius: isEdge ? 4 : 0,
                      background: inRange ? "var(--brand-tint)" : "transparent",
                      color: inRange ? "var(--brand-deep)" : "var(--fg-1)",
                      fontWeight: isEdge ? 700 : 400,
                      border: isEdge ? "1px solid var(--brand)" : "1px solid transparent",
                      cursor: "pointer",
                    }}>{day}</div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="row" style={{ padding: "8px 10px", borderTop: "1px solid var(--line)", background: "var(--bg-inset)", gap: 8 }}>
        <select
          value={tz} onChange={e => setTz(e.target.value)}
          style={{
            height: 26, padding: "0 6px", fontSize: 11.5,
            border: "1px solid var(--line)", borderRadius: 5,
            background: "var(--bg-card)", color: "var(--fg-1)",
          }}>
          <option>UTC</option>
          <option>Local</option>
          <option>US/Pacific</option>
          <option>US/Eastern</option>
          <option>Asia/Kolkata</option>
        </select>
        <div className="spacer"/>
        <button className="btn btn-ghost" style={{ height: 26, fontSize: 12 }} onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" style={{ height: 26, fontSize: 12 }} onClick={apply}>Apply</button>
      </div>
    </div>
  );
}

/* =================================================================
   HEADER
   ================================================================= */
function Header({ screen, go, crumbs = [], time = "Last 1 hour", live = "live" }) {
  const [showTime, setShowTime] = useState(false);
  const [isPaused, setPaused] = useState(live === "paused");
  const [t, setT] = useState(time);
  const timeRef = useRef();
  useEffect(() => {
    if (!showTime) return;
    const h = e => { if (timeRef.current && !timeRef.current.contains(e.target)) setShowTime(false); };
    const k = e => { if (e.key === "Escape") setShowTime(false); };
    document.addEventListener("mousedown", h);
    document.addEventListener("keydown", k);
    return () => { document.removeEventListener("mousedown", h); document.removeEventListener("keydown", k); };
  }, [showTime]);
  return (
    <div className="header">
      <div ref={timeRef} style={{ position: "relative" }}>
        <div className="time-pill" onClick={() => setShowTime(s => !s)}>
          <Icon name="clock" size={14} className="muted" />
          <span>{t}</span>
          <Icon name="chevron-down" size={14} className="muted" />
        </div>
        {showTime && (
          <TimeRangePanel
            value={t}
            onChange={(v) => setT(v)}
            onClose={() => setShowTime(false)}
          />
        )}
      </div>

      <button className="btn btn-ghost btn-icon" title="Compare">
        <Icon name="chevron-right" size={14} />
      </button>

      <div className={"live-pill" + (isPaused ? " paused" : "")} onClick={() => setPaused(p => !p)}>
        <span className="dot" />
        <span>{isPaused ? "PAUSED" : "LIVE"}</span>
      </div>

      <div className="spacer" />

      {crumbs.length > 0 && (
        <div className="crumbs">
          {crumbs.map((c, i) => {
            const isLast = i === crumbs.length - 1;
            const inner = <span style={{ color: isLast ? "var(--fg-0)" : "var(--fg-3)", fontWeight: isLast ? 600 : 500 }}>{c.label}</span>;
            return (
              <React.Fragment key={i}>
                {i > 0 && <span className="sep">/</span>}
                {c.href && !isLast ? <a href={c.href} style={{ cursor: "pointer" }}>{inner}</a> : inner}
              </React.Fragment>
            );
          })}
        </div>
      )}

      <div className="spacer" />

      <span className="workspace-label">WORKSPACE</span>
      <span className="workspace-val">My-Organization / My Team</span>
      <Icon name="chevron-down" size={14} className="muted" />

      <div className="refresh-pill" title="Auto-refresh">
        <Icon name="refresh" size={14} />
        <span>5s</span>
        <Icon name="chevron-down" size={12} className="muted" />
      </div>
    </div>
  );
}

/* =================================================================
   SPARK / AREA CHART (deterministic procedural data)
   ================================================================= */
function seededWave(seed, n, base = 0.5, amp = 0.25, freq = 0.5) {
  // simple deterministic noisy wave
  const out = [];
  let s = seed * 9301 + 49297;
  for (let i = 0; i < n; i++) {
    s = (s * 9301 + 49297) % 233280;
    const r = (s / 233280 - 0.5) * 0.12;
    out.push(Math.max(0, Math.min(1, base + Math.sin(i * freq + seed) * amp + r)));
  }
  return out;
}
function AreaSpark({ seed = 1, color = "var(--chart-1)", soft = "var(--chart-1-soft)", height = 60, width = "100%", padX = 0, n = 40, base = 0.5, amp = 0.22, freq = 0.45 }) {
  const data = useMemo(() => seededWave(seed, n, base, amp, freq), [seed, n, base, amp, freq]);
  const w = 320, h = height;
  const pts = data.map((v, i) => [padX + (i/(n-1))*(w-padX*2), h - 6 - v*(h-14)]);
  const path = "M " + pts.map(p => p[0].toFixed(1)+","+p[1].toFixed(1)).join(" L ");
  const fill = path + ` L ${pts[pts.length-1][0].toFixed(1)},${h-2} L ${pts[0][0].toFixed(1)},${h-2} Z`;
  return (
    <svg className="spark" width={width} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <path d={fill} fill={soft} opacity="0.65" />
      <path d={path} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function MiniSpark({ seed = 2, color = "var(--chart-1)", height = 24, width = 100, freq = 0.7, base = 0.5, amp = 0.3 }) {
  const data = useMemo(() => seededWave(seed, 28, base, amp, freq), [seed, base, amp, freq]);
  const w = width, h = height;
  const pts = data.map((v, i) => [(i/(data.length-1))*w, h - 2 - v*(h-6)]);
  const path = "M " + pts.map(p => p[0].toFixed(1)+","+p[1].toFixed(1)).join(" L ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <path d={path} fill="none" stroke={color} strokeWidth="1.4" />
    </svg>
  );
}
function Bars({ seed = 5, color = "var(--chart-1)", h = 50, w = 320, n = 40, base = 0.5, amp = 0.3 }) {
  const data = useMemo(() => seededWave(seed, n, base, amp, 0.5), [seed, n, base, amp]);
  const gap = 2;
  const bw = (w - gap*(n-1)) / n;
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      {data.map((v, i) => (
        <rect key={i} x={i*(bw+gap)} y={h - 2 - v*(h-4)} width={bw} height={v*(h-4)} fill={color} rx="1" />
      ))}
    </svg>
  );
}

/* HexGrid — flat-row honeycomb that zigzags right.
   Each tile alternates up/down by half-height; tiles march right by half-width.
   Matches the SVG mockup layout (B1↑ B3↓ B2↑ B4↓ B5↑ …). */
function HexGrid({ count, palette, labels, values }) {
  const W = 38, H = 44;          // hex bounding box
  const halfW = W / 2;
  const verticalShift = H * 0.75; // vertical spacing for offset row
  const padX = 4, padY = 4;
  // X marches by halfW each tile (zigzag); Y alternates between top and bottom.
  const totalW = padX*2 + W + (count - 1) * halfW;
  const totalH = padY*2 + H + verticalShift;
  const hexPath = (cx, cy) => {
    const w = W/2, h = H/2;
    // pointy-top hex (peaks at top and bottom, vertical sides)
    return `M ${cx} ${cy-h} L ${cx+w} ${cy-h*0.5} L ${cx+w} ${cy+h*0.5} L ${cx} ${cy+h} L ${cx-w} ${cy+h*0.5} L ${cx-w} ${cy-h*0.5} Z`;
  };
  return (
    <svg width={totalW} height={totalH} viewBox={`0 0 ${totalW} ${totalH}`}>
      {Array.from({ length: count }).map((_, i) => {
        const cx = padX + W/2 + i * halfW;
        const cy = padY + H/2 + (i % 2 === 1 ? verticalShift : 0);
        const fill = palette[i % palette.length];
        const value = (values && values[i]) ?? 60;
        const label = (labels && labels[i]) ?? "";
        return (
          <g key={i}>
            <path d={hexPath(cx, cy)} fill={fill} stroke="rgba(0,0,0,0.06)" strokeWidth="0.6" />
            <text x={cx} y={cy - 1} textAnchor="middle" fontSize="11" fontWeight="700" fill="white">{value}</text>
            {label && <text x={cx} y={cy + 11} textAnchor="middle" fontSize="7.5" fontWeight="600" fill="white" opacity="0.92">{label}</text>}
          </g>
        );
      })}
    </svg>
  );
}

/* =================================================================
   SHARED layout helpers
   ================================================================= */
function PageHeader({ icon = "grid", iconColor = "var(--accent-violet)", iconBg = "var(--accent-violet-soft)", title, subtitle, statusBadge, actions }) {
  return (
    <div className="page-title-row">
      <div className="page-icon" style={{ background: iconBg, color: iconColor }}>
        <Icon name={icon} size={20} />
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="page-title">{title}</div>
          {statusBadge}
        </div>
        <div className="page-sub">{subtitle}</div>
      </div>
      <div className="spacer" />
      {actions}
    </div>
  );
}

function Tabs({ tabs, active, setActive }) {
  return (
    <div className="tab-bar">
      {tabs.map(t => (
        <div key={t.id} className={"tab" + (active === t.id ? " active" : "")} onClick={() => setActive(t.id)}>
          <span>{t.label}</span>
          {t.badge != null && (
            <span className={"badge " + (t.badgeKind || "neutral")} style={{ height: 16, padding: "0 6px", fontSize: 10 }}>{t.badge}</span>
          )}
        </div>
      ))}
    </div>
  );
}

/* =================================================================
   FILTER BAR — chip-only (no free text). Click to open Suggestions.
   ================================================================= */
function FilterChip({ f, onRemove }) {
  return (
    <span
      onClick={(e) => e.stopPropagation()}
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        fontSize: 12.5, padding: "3px 4px 3px 8px",
        background: "var(--bg-inset)", borderRadius: 4,
        border: "1px solid var(--line-2)", flexShrink: 0,
      }}
    >
      {f.attr && <span style={{ color: "var(--fg-3)" }}>{f.attr}{f.op || ":"}</span>}
      <span style={{ color: f.color || "var(--fg-0)", fontWeight: 500 }} className="mono">{f.val}</span>
      <button onClick={onRemove} title="Remove filter"
        style={{ all: "unset", cursor: "pointer", display: "inline-flex", padding: 2, borderRadius: 3, color: "var(--fg-3)" }}
        onMouseEnter={e => e.currentTarget.style.background = "var(--line-2)"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      >
        <Icon name="x" size={11}/>
      </button>
    </span>
  );
}

function FilterSearchBar({ filters, onRemoveFilter, onAddFilter, onClearAll, onOpenFiltersPage, kind = "logs", schema, savedViews = [], recents = [] }) {
  const [open, setOpen] = useState(false);
  const [drill, setDrill] = useState(null); // attr key being expanded
  const [valQuery, setValQuery] = useState("");
  const wrapRef = useRef();

  useEffect(() => {
    if (!open) return;
    const h = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) { setOpen(false); setDrill(null); setValQuery(""); } };
    const k = e => { if (e.key === "Escape") { setOpen(false); setDrill(null); setValQuery(""); } };
    document.addEventListener("mousedown", h);
    document.addEventListener("keydown", k);
    return () => { document.removeEventListener("mousedown", h); document.removeEventListener("keydown", k); };
  }, [open]);

  const allAttrs = Object.entries(schema.attrs);

  const drilledAttr = drill && schema.attrs[drill];
  const filteredValues = drilledAttr
    ? drilledAttr.values.filter(v => !valQuery || v.v.toLowerCase().includes(valQuery.toLowerCase()))
    : [];

  const isApplied = (attr, val) => filters.some(f => f.attr === attr && f.val === val);

  return (
    <div ref={wrapRef} style={{ position: "relative", flex: 1 }}>
      {/* Search bar (chips + trigger) */}
      <div
        className="search"
        style={{ height: 36, cursor: "text", flexWrap: "wrap", padding: "4px 10px", alignItems: "center", borderColor: open ? "var(--brand)" : undefined, boxShadow: open ? "0 0 0 3px var(--brand-soft)" : undefined }}
        onClick={() => { setOpen(true); setDrill(null); }}
      >
        <Icon name="search" size={16} className="muted"/>
        <span className="muted" style={{ fontSize: 13 }}>Filter {kind}:</span>
        <div className="row" style={{ gap: 6, flexWrap: "wrap", flex: 1, minWidth: 0 }}>
          {filters.map((f, i) => (
            <FilterChip key={i} f={f} onRemove={() => onRemoveFilter(i)} />
          ))}
          <span
            className="row"
            style={{
              gap: 4, fontSize: 12.5, color: "var(--fg-3)", padding: "3px 8px",
              borderRadius: 4, border: "1px dashed var(--line)",
              cursor: "pointer", userSelect: "none", flexShrink: 0,
            }}
            onClick={(e) => { e.stopPropagation(); setOpen(true); setDrill(null); }}
          >
            <Icon name="plus" size={11}/>
            <span>Add filter</span>
          </span>
        </div>
        {filters.length > 0 && (
          <button
            className="btn btn-ghost"
            style={{ height: 24, padding: "0 6px", fontSize: 11.5, color: "var(--fg-3)" }}
            onClick={(e) => { e.stopPropagation(); onClearAll(); }}
          >Clear</button>
        )}
        <span className="kbd">K</span>
      </div>

      {/* Suggestions popover */}
      {open && (
        <div
          style={{
            position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
            background: "var(--bg-card)", border: "1px solid var(--line)",
            borderRadius: 8, boxShadow: "0 16px 40px rgba(15,23,42,0.18), 0 2px 6px rgba(15,23,42,0.06)",
            zIndex: 20, maxHeight: 460, overflow: "hidden",
            display: "grid", gridTemplateColumns: drill ? "260px 1fr" : "1fr",
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* LEFT: Attributes list */}
          <div style={{ overflowY: "auto", maxHeight: 460, borderRight: drill ? "1px solid var(--line)" : 0 }}>
            {/* Header search hint */}
            <div className="row" style={{ padding: "10px 14px", borderBottom: "1px solid var(--line-2)", gap: 8 }}>
              <span className="muted" style={{ fontSize: 11, letterSpacing: 0.4, textTransform: "uppercase", fontWeight: 600 }}>Suggestions</span>
              <div className="spacer"/>
              <span className="muted" style={{ fontSize: 11 }}>↑↓ navigate · ↵ apply · esc</span>
            </div>

            {/* Quick chips: shortcut filters */}
            {schema.quick && schema.quick.length > 0 && (
              <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--line-2)" }}>
                <div className="label-up" style={{ marginBottom: 8, fontSize: 10 }}>Quick filters</div>
                <div className="row" style={{ flexWrap: "wrap", gap: 6 }}>
                  {schema.quick.map((q, i) => (
                    <button key={i}
                      onClick={() => { onAddFilter(q); setOpen(false); }}
                      style={{
                        all: "unset", cursor: "pointer",
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "4px 9px", borderRadius: 999,
                        background: q.tint || "var(--bg-inset)",
                        color: q.color || "var(--fg-1)",
                        fontSize: 11.5, fontWeight: 500,
                        border: "1px solid var(--line-2)",
                      }}>
                      {q.icon && <Icon name={q.icon} size={11}/>}
                      <span className="mono" style={{ color: "var(--fg-3)", fontWeight: 400 }}>{q.attr}:</span>
                      <span>{q.val}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Attributes — group by category */}
            <div style={{ padding: "6px 0" }}>
              <div className="label-up" style={{ padding: "6px 14px", fontSize: 10 }}>Attributes</div>
              {allAttrs.map(([key, a]) => {
                const active = drill === key;
                return (
                  <div key={key}
                    onClick={() => setDrill(key)}
                    onMouseEnter={() => { if (drill) setDrill(key); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "7px 14px",
                      background: active ? "var(--brand-tint)" : "transparent",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ color: active ? "var(--brand-deep)" : "var(--fg-3)", display: "inline-flex" }}>
                      <Icon name={a.icon || "filter"} size={13}/>
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="mono" style={{ fontSize: 12.5, color: active ? "var(--brand-deep)" : "var(--fg-0)", fontWeight: 500 }}>{a.label || key}</div>
                      <div className="muted" style={{ fontSize: 10.5 }}>{a.desc || `${a.values?.length || 0} values`}</div>
                    </div>
                    <Icon name="chevron-right" size={12} className="muted"/>
                  </div>
                );
              })}
            </div>

            {/* Saved views */}
            {savedViews.length > 0 && (
              <div style={{ padding: "6px 0", borderTop: "1px solid var(--line-2)" }}>
                <div className="label-up" style={{ padding: "8px 14px 6px", fontSize: 10 }}>Saved views</div>
                {savedViews.map((v, i) => (
                  <div key={i}
                    onClick={() => { v.apply && v.apply(); setOpen(false); }}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 14px", cursor: "pointer" }}
                  >
                    <Icon name="bookmark" size={12} className="muted"/>
                    <span style={{ flex: 1, fontSize: 12.5, color: "var(--fg-0)" }}>{v.label}</span>
                    <span className="mono muted" style={{ fontSize: 10.5 }}>{v.count}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Recent */}
            {recents.length > 0 && (
              <div style={{ padding: "6px 0", borderTop: "1px solid var(--line-2)" }}>
                <div className="label-up" style={{ padding: "8px 14px 6px", fontSize: 10 }}>Recent</div>
                {recents.map((r, i) => (
                  <div key={i}
                    onClick={() => { onAddFilter(r); setOpen(false); }}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 14px", cursor: "pointer" }}
                  >
                    <Icon name="clock" size={12} className="muted"/>
                    <span className="mono" style={{ flex: 1, fontSize: 12, color: "var(--fg-1)" }}>
                      <span style={{ color: "var(--fg-3)" }}>{r.attr}:</span> {r.val}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Browse all */}
            <div
              onClick={() => { setOpen(false); onOpenFiltersPage(); }}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px",
                borderTop: "1px solid var(--line-2)",
                background: "var(--bg-inset)", cursor: "pointer",
              }}
            >
              <Icon name="filter" size={13} className="muted"/>
              <span style={{ flex: 1, fontSize: 12.5, color: "var(--brand-deep)", fontWeight: 600 }}>Browse all filters…</span>
              <span className="kbd">F</span>
            </div>
          </div>

          {/* RIGHT: drill-in values */}
          {drill && drilledAttr && (
            <div style={{ display: "flex", flexDirection: "column", maxHeight: 460 }}>
              <div className="row" style={{ padding: "10px 14px", borderBottom: "1px solid var(--line-2)", gap: 8 }}>
                <span className="mono" style={{ fontSize: 12.5, color: "var(--fg-0)", fontWeight: 600 }}>{drilledAttr.label || drill}</span>
                <span className="muted" style={{ fontSize: 11 }}>· pick value</span>
                <div className="spacer"/>
                <Icon name="x" size={13} className="muted" onClick={() => { setDrill(null); setValQuery(""); }} style={{ cursor: "pointer" }}/>
              </div>
              <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--line-2)" }}>
                <div className="search" style={{ height: 28 }}>
                  <Icon name="search" size={12} className="muted"/>
                  <input
                    autoFocus
                    placeholder={`Find a ${drilledAttr.label || drill} value…`}
                    value={valQuery}
                    onChange={e => setValQuery(e.target.value)}
                    style={{ fontSize: 12 }}
                  />
                </div>
              </div>
              <div style={{ overflowY: "auto", flex: 1 }}>
                {filteredValues.length === 0 && (
                  <div className="muted" style={{ padding: 16, fontSize: 12 }}>No matching values.</div>
                )}
                {filteredValues.map((v, i) => {
                  const applied = isApplied(drill, v.v);
                  return (
                    <div key={i}
                      onClick={() => {
                        if (!applied) onAddFilter({ attr: drill, op: ":", val: v.v, color: v.color });
                        setOpen(false); setDrill(null); setValQuery("");
                      }}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "7px 14px",
                        cursor: applied ? "default" : "pointer",
                        opacity: applied ? 0.5 : 1,
                      }}
                      onMouseEnter={e => { if (!applied) e.currentTarget.style.background = "var(--brand-tint)"; }}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      {v.color && <span style={{ width: 8, height: 8, borderRadius: 2, background: v.color, flexShrink: 0 }}/>}
                      <span className="mono" style={{ flex: 1, fontSize: 12, color: "var(--fg-0)" }}>{v.v}</span>
                      <span className="mono muted" style={{ fontSize: 10.5 }}>{(v.c || 0).toLocaleString()}</span>
                      {applied && <span className="badge ok" style={{ height: 16, padding: "0 5px", fontSize: 9.5 }}><Icon name="check" size={9}/></span>}
                    </div>
                  );
                })}
              </div>
              <div className="row" style={{ padding: "8px 12px", borderTop: "1px solid var(--line-2)", justifyContent: "space-between", background: "var(--bg-inset)" }}>
                <span className="muted" style={{ fontSize: 10.5 }}>Hold ⌥ to negate · type a value to add a custom match</span>
                <button className="btn btn-ghost" style={{ height: 24, fontSize: 11.5 }} onClick={() => { setOpen(false); onOpenFiltersPage(); }}>Open in filters →</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* =================================================================
   FILTERS PAGE — full slide-over panel for managing all filters
   ================================================================= */
function FiltersPage({ open, onClose, kind, filters, onApply, schema, presets = [] }) {
  const [draft, setDraft] = useState(filters);
  const [activeGroup, setActiveGroup] = useState(schema.groups?.[0]?.id || "common");
  const [search, setSearch] = useState("");

  useEffect(() => { if (open) setDraft(filters); }, [open, filters]);

  if (!open) return null;

  const isPicked = (attr, val) => draft.some(f => f.attr === attr && f.val === val);
  const toggle = (attr, val, color) => {
    setDraft(d => {
      const exists = d.find(f => f.attr === attr && f.val === val);
      if (exists) return d.filter(f => !(f.attr === attr && f.val === val));
      return [...d, { attr, op: ":", val, color }];
    });
  };

  const activeGroupObj = schema.groups.find(g => g.id === activeGroup) || schema.groups[0];
  const visibleAttrs = (activeGroupObj.attrs || []).filter(a => {
    if (!search) return true;
    const meta = schema.attrs[a];
    const lbl = (meta?.label || a).toLowerCase();
    return lbl.includes(search.toLowerCase());
  });

  // group counts
  const groupCount = (g) => g.attrs.reduce((acc, a) => acc + draft.filter(f => f.attr === a).length, 0);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(15,23,42,0.42)",
        display: "flex", justifyContent: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 880, maxWidth: "94vw", height: "100%",
          background: "var(--bg-canvas)", borderLeft: "1px solid var(--line)",
          display: "flex", flexDirection: "column",
          boxShadow: "-24px 0 60px rgba(15,23,42,0.18)",
        }}
      >
        {/* Header */}
        <div className="row" style={{ padding: "16px 22px", borderBottom: "1px solid var(--line)" }}>
          <div className="page-icon" style={{ width: 32, height: 32, background: "var(--brand-soft)", color: "var(--brand-deep)" }}>
            <Icon name="filter" size={16}/>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--fg-0)" }}>Filter {kind}</div>
            <div className="muted" style={{ fontSize: 11.5 }}>Build a filter set across attributes — no query syntax required.</div>
          </div>
          <div className="spacer"/>
          <button className="btn btn-ghost" onClick={onClose}><Icon name="x" size={14}/>Close</button>
        </div>

        {/* Applied summary */}
        <div className="row" style={{ padding: "10px 22px", borderBottom: "1px solid var(--line)", background: "var(--bg-inset)", flexWrap: "wrap", gap: 6 }}>
          <span className="muted" style={{ fontSize: 11.5, fontWeight: 600 }}>{draft.length === 0 ? "No filters applied" : `${draft.length} filter${draft.length === 1 ? "" : "s"} active`}</span>
          {draft.map((f, i) => (
            <FilterChip key={i} f={f} onRemove={() => setDraft(d => d.filter((_, j) => j !== i))}/>
          ))}
          {draft.length > 0 && (
            <button className="btn btn-ghost" style={{ height: 22, padding: "0 6px", fontSize: 11, color: "var(--fg-3)" }} onClick={() => setDraft([])}>Reset</button>
          )}
        </div>

        {/* Presets */}
        {presets.length > 0 && (
          <div className="row" style={{ padding: "10px 22px", borderBottom: "1px solid var(--line-2)", gap: 6, flexWrap: "wrap" }}>
            <span className="label-up" style={{ marginRight: 6 }}>Presets</span>
            {presets.map((p, i) => (
              <button key={i}
                onClick={() => setDraft(p.filters)}
                className="btn btn-ghost"
                style={{ height: 24, fontSize: 11.5, border: "1px solid var(--line-2)" }}
              >{p.label}</button>
            ))}
          </div>
        )}

        {/* Main split: groups | values */}
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", flex: 1, minHeight: 0 }}>
          {/* Group rail */}
          <div style={{ borderRight: "1px solid var(--line)", overflowY: "auto", padding: "10px 0" }}>
            {schema.groups.map(g => {
              const active = g.id === activeGroup;
              const c = groupCount(g);
              return (
                <div key={g.id}
                  onClick={() => setActiveGroup(g.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 16px",
                    background: active ? "var(--brand-tint)" : "transparent",
                    borderLeft: active ? "2px solid var(--brand)" : "2px solid transparent",
                    cursor: "pointer",
                  }}
                >
                  <Icon name={g.icon || "filter"} size={13} className="muted" style={{ color: active ? "var(--brand-deep)" : undefined }}/>
                  <span style={{ flex: 1, fontSize: 12.5, color: active ? "var(--brand-deep)" : "var(--fg-0)", fontWeight: active ? 600 : 500 }}>{g.label}</span>
                  {c > 0 && (
                    <span className="badge info" style={{ height: 16, padding: "0 6px", fontSize: 10 }}>{c}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Value editor */}
          <div style={{ overflowY: "auto", padding: "16px 22px" }}>
            <div className="row" style={{ marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--fg-0)" }}>{activeGroupObj.label}</div>
                <div className="muted" style={{ fontSize: 11.5 }}>{activeGroupObj.desc || `${(activeGroupObj.attrs || []).length} attributes`}</div>
              </div>
              <div className="spacer"/>
              <div className="search" style={{ height: 30, width: 240 }}>
                <Icon name="search" size={13} className="muted"/>
                <input placeholder="Find an attribute…" value={search} onChange={e => setSearch(e.target.value)}/>
              </div>
            </div>

            {visibleAttrs.length === 0 && (
              <div className="muted" style={{ fontSize: 12, padding: "24px 0" }}>No attributes match “{search}”.</div>
            )}

            {visibleAttrs.map(attrKey => {
              const a = schema.attrs[attrKey];
              if (!a) return null;
              return (
                <div key={attrKey} style={{ marginBottom: 18, border: "1px solid var(--line-2)", borderRadius: 8, overflow: "hidden", background: "var(--bg-card)" }}>
                  <div className="row" style={{ padding: "10px 14px", borderBottom: "1px solid var(--line-2)", background: "var(--bg-inset)" }}>
                    <Icon name={a.icon || "filter"} size={13} className="muted"/>
                    <span className="mono" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--fg-0)" }}>{a.label || attrKey}</span>
                    <span className="muted" style={{ fontSize: 11 }}>· {a.desc || a.type || "enum"}</span>
                    <div className="spacer"/>
                    <span className="muted" style={{ fontSize: 11 }}>{a.values?.length || 0} values</span>
                  </div>
                  {/* values grid */}
                  <div style={{ padding: 10, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 6 }}>
                    {(a.values || []).map((v, i) => {
                      const picked = isPicked(attrKey, v.v);
                      return (
                        <div key={i}
                          onClick={() => toggle(attrKey, v.v, v.color)}
                          style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "6px 10px", borderRadius: 5,
                            border: "1px solid " + (picked ? "var(--brand)" : "var(--line-2)"),
                            background: picked ? "var(--brand-tint)" : "var(--bg-card)",
                            cursor: "pointer",
                          }}
                        >
                          <input type="checkbox" checked={picked} readOnly style={{ accentColor: "var(--brand)" }}/>
                          {v.color && <span style={{ width: 7, height: 7, borderRadius: 2, background: v.color }}/>}
                          <span className="mono" style={{ flex: 1, fontSize: 11.5, color: picked ? "var(--brand-deep)" : "var(--fg-0)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.v}</span>
                          <span className="mono muted" style={{ fontSize: 10.5 }}>{(v.c || 0).toLocaleString()}</span>
                        </div>
                      );
                    })}
                  </div>
                  {/* freeform add */}
                  {a.freeform && (
                    <div className="row" style={{ padding: "8px 12px", borderTop: "1px solid var(--line-2)", gap: 8, background: "var(--bg-canvas)" }}>
                      <span className="muted" style={{ fontSize: 11 }}>Add custom:</span>
                      <div className="search" style={{ height: 26, flex: 1 }}>
                        <input
                          placeholder={a.placeholder || "Type a value and press Enter"}
                          onKeyDown={e => {
                            if (e.key === "Enter" && e.currentTarget.value.trim()) {
                              toggle(attrKey, e.currentTarget.value.trim());
                              e.currentTarget.value = "";
                            }
                          }}
                          style={{ fontSize: 11.5 }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="row" style={{ padding: "12px 22px", borderTop: "1px solid var(--line)", background: "var(--bg-card)", justifyContent: "space-between" }}>
          <div className="row" style={{ gap: 12 }}>
            <button className="btn btn-ghost" onClick={() => setDraft([])}>Reset all</button>
            <span className="muted" style={{ fontSize: 11.5 }}>{draft.length} filter{draft.length === 1 ? "" : "s"} ready · est. {Math.max(1, 184201 - draft.length * 14000).toLocaleString()} matching {kind}</span>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn"><Icon name="bookmark" size={13}/>Save view</button>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={() => { onApply(draft); onClose(); }}>Apply filters</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Export to window so other script files can use them */
Object.assign(window, { Icon, Sidebar, Header, AreaSpark, MiniSpark, Bars, HexGrid, PageHeader, Tabs, seededWave, goTo, getURLParams, PAGE_URL, FilterSearchBar, FiltersPage, FilterChip });
