/* global React, Icon, MiniSpark, AreaSpark, Bars, seededWave, goTo, PAGE_URL */
const { useState: useStateDD, useMemo: useMemoDD, useRef: useRefDD, useEffect: useEffectDD } = React;

/* =================================================================
   CUSTOM DASHBOARDS — PAGE EDITOR
   ─────────────────────────────────────────────────────────────────
   - A "Page" is a user-created container. Empty by default.
   - Inside it, the user creates "Dashboards" (widgets) — each is
     powered by a query (Datadog widget-editor model).
   - The Pages rail (left) lists all pages; click to switch.
   ================================================================= */

const PAGE_REGISTRY = {
  "payments-prod":   { name: "Payments — Production health",  desc: "Live revenue, error rate, end-to-end latency for the payments stack.", icon: "tag",      iconBg: "#a78bfa", tags: ["sre", "payments"],   owner: { name: "Jay Vasquez", initials: "JV", color: "linear-gradient(135deg,#6366f1,#3b82f6)" }, sharedWith: 12, modified: "12 min ago",  fav: true },
  "checkout-funnel": { name: "Checkout funnel — by region",    desc: "Conversion + drop-off by region, device, locale, AB cohort.",          icon: "topology", iconBg: "#34d399", tags: ["growth", "payments"], owner: { name: "Rita Chen",   initials: "RC", color: "linear-gradient(135deg,#34d399,#3b82f6)" }, sharedWith: 8,  modified: "2 hours ago", fav: true },
  "search-perf":     { name: "Search — performance & quality", desc: "ES cluster health, relevance scores, zero-result rate, slow queries.", icon: "search",   iconBg: "#60a5fa", tags: ["discovery"],          owner: { name: "Rita Chen",   initials: "RC", color: "linear-gradient(135deg,#34d399,#10b981)" }, sharedWith: 4,  modified: "Yesterday",   fav: true },
  "infra-fleet":     { name: "Infrastructure — fleet health",  desc: "412 hosts. CPU, RAM, disk, network across the platform fleet.",        icon: "infra",    iconBg: "#fb923c", tags: ["platform"],           owner: { name: "Maya Singh",  initials: "MS", color: "linear-gradient(135deg,#f97316,#ef4444)" }, sharedWith: 22, modified: "3 hours ago", fav: false },
  "reliability":     { name: "Reliability — incidents this quarter", desc: "Incident rate per service. 14d / 3d windows.",                          icon: "saturation",iconBg: "#6366f1", tags: ["sre", "platform"],    owner: { name: "Jay Vasquez", initials: "JV", color: "linear-gradient(135deg,#6366f1,#3b82f6)" }, sharedWith: 18, modified: "2 days ago",  fav: false },
  "llm-cost":        { name: "LLM cost & quality",             desc: "Token spend per model, groundedness, p95 latency.",                     icon: "ai",       iconBg: "#a78bfa", tags: ["growth", "ai"],       owner: { name: "Priya Anand", initials: "PA", color: "linear-gradient(135deg,#a78bfa,#6366f1)" }, sharedWith: 6,  modified: "4 days ago",  fav: true },
  "vendor-status":   { name: "Third-party vendors",            desc: "Stripe, Sendgrid, Twilio, Auth0 — uptime + latency + spend.",           icon: "globe",    iconBg: "#22d3ee", tags: ["payments"],           owner: { name: "Rita Chen",   initials: "RC", color: "linear-gradient(135deg,#34d399,#3b82f6)" }, sharedWith: 5,  modified: "1 week ago",  fav: false },
  "kafka-ops":       { name: "Kafka — broker & consumer",      desc: "Per-broker throughput, ISR, consumer lag, partition skew.",             icon: "kafka",    iconBg: "#3b82f6", tags: ["platform"],           owner: { name: "Kai Olsson",  initials: "KO", color: "linear-gradient(135deg,#3b82f6,#1d4ed8)" }, sharedWith: 3,  modified: "1 week ago",  fav: false },
  "new":             { name: "Untitled page",                   desc: "Add a description so people know what this page is for.",              icon: "plus",     iconBg: "#94a3b8", tags: [],                     owner: { name: "Jay Vasquez", initials: "JV", color: "linear-gradient(135deg,#6366f1,#3b82f6)" }, sharedWith: 0,  modified: "just now",    fav: false, isNew: true },
};

const PAGE_ORDER = ["payments-prod", "checkout-funnel", "search-perf", "infra-fleet", "reliability", "llm-cost", "vendor-status", "kafka-ops"];

/* All pages start EMPTY. Widgets are added by the user via the
   query-driven widget editor and persisted to localStorage. */
const STORAGE_KEY = "optikk-page-widgets";

function loadWidgets(pageId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw);
    return all[pageId] || [];
  } catch (e) { return []; }
}
function saveWidgets(pageId, widgets) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    all[pageId] = widgets;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (e) {}
}

const SOURCE_META = {
  metrics:  { label: "Metrics",   icon: "metrics", color: "#3b82f6" },
  apm:      { label: "APM",       icon: "trace",   color: "#a78bfa" },
  infra:    { label: "Infra",     icon: "infra",   color: "#fb923c" },
  logs:     { label: "Logs",      icon: "logs",    color: "#34d399" },
  events:   { label: "Events",    icon: "bell",    color: "#fbbf24" },
  rum:      { label: "RUM",       icon: "globe",   color: "#22d3ee" },
};

const VIZ_TYPES = [
  { id: "timeseries", label: "Timeseries",   icon: "metrics", desc: "Line / area over time" },
  { id: "qval",       label: "Query value",  icon: "tag",     desc: "Single big number" },
  { id: "toplist",    label: "Top list",     icon: "list",    desc: "Ranked bars" },
  { id: "table",      label: "Table",        icon: "list",    desc: "Tabular results" },
  { id: "heatmap",    label: "Heatmap",      icon: "grid",    desc: "Density grid" },
  { id: "hostmap",    label: "Host map",     icon: "infra",   desc: "Hex grid of hosts" },
  { id: "pie",        label: "Pie chart",    icon: "redis",   desc: "Share of total" },
  { id: "geomap",     label: "Geomap",       icon: "globe",   desc: "By country" },
  { id: "scatter",    label: "Scatter",      icon: "topology",desc: "Two-metric plot" },
  { id: "note",       label: "Note / text",  icon: "logs",    desc: "Markdown" },
];

/* =========================================================
   MAIN SCREEN
   ========================================================= */
function DashboardDetailScreen({ go, params }) {
  const pageId = params.id || "payments-prod";
  const page = PAGE_REGISTRY[pageId] || PAGE_REGISTRY["payments-prod"];

  const [widgets, setWidgets] = useStateDD(() => loadWidgets(pageId));
  const [editing, setEditing] = useStateDD(page.isNew || false);
  const [showEditor, setShowEditor] = useStateDD(false);
  const [editingWidget, setEditingWidget] = useStateDD(null);
  const [fav, setFav] = useStateDD(page.fav);
  const [pageName, setPageName] = useStateDD(page.name);
  const [pageDesc, setPageDesc] = useStateDD(page.desc);

  useEffectDD(() => { setWidgets(loadWidgets(pageId)); setPageName(page.name); setPageDesc(page.desc); setFav(page.fav); setEditing(page.isNew || false); }, [pageId]);

  const persist = (next) => { setWidgets(next); saveWidgets(pageId, next); };
  const addWidget = (w) => persist([...widgets, { ...w, id: "w_" + Date.now().toString(36) }]);
  const updateWidget = (id, w) => persist(widgets.map(x => x.id === id ? { ...x, ...w } : x));
  const removeWidget = (id) => persist(widgets.filter(w => w.id !== id));

  const openEditor = (w) => { setEditingWidget(w || null); setShowEditor(true); };
  const onSaveWidget = (w) => {
    if (editingWidget) updateWidget(editingWidget.id, w);
    else addWidget(w);
    setShowEditor(false);
  };

  return (
    <div className="page" style={{ padding: 0, gap: 0 }}>
      {/* ===== PAGE-SCOPED CSS ===== */}
      <style>{`
        .dpage-shell { display: grid; grid-template-columns: 240px 1fr; min-height: calc(100vh - var(--header-h)); }
        .dpage-rail { border-right: 1px solid var(--line); background: var(--bg-sidebar); display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
        .dpage-rail-head { padding: 14px 16px 10px; border-bottom: 1px solid var(--line-2); }
        .dpage-rail-search { padding: 10px 12px; border-bottom: 1px solid var(--line-2); }
        .dpage-rail-tabs { display: flex; padding: 0 8px; gap: 0; border-bottom: 1px solid var(--line-2); }
        .dpage-rail-tab { padding: 8px 8px; font-size: 11.5px; color: var(--fg-3); cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; font-weight: 500; }
        .dpage-rail-tab:hover { color: var(--fg-0); }
        .dpage-rail-tab.active { color: var(--brand-deep); border-bottom-color: var(--brand-deep); font-weight: 600; }
        .dpage-rail-list { overflow-y: auto; flex: 1; padding: 6px 0; }
        .dpage-rail-section { padding: 10px 14px 4px; font-size: 9.5px; font-weight: 700; color: var(--fg-mute); letter-spacing: 0.1em; text-transform: uppercase; }
        .dpage-rail-row {
          display: flex; align-items: center; gap: 8px;
          padding: 6px 14px; cursor: pointer; font-size: 12.5px;
          color: var(--fg-1);
        }
        .dpage-rail-row:hover { background: var(--bg-hover); color: var(--fg-0); }
        .dpage-rail-row.active { background: var(--brand-tint); color: var(--brand-deep); font-weight: 600; }
        .dpage-rail-row .star { color: var(--fg-mute); }
        .dpage-rail-row .star.on { color: var(--warn); }
        .dpage-rail-row .name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .dpage-rail-row .count { font-family: var(--font-mono); font-size: 10.5px; color: var(--fg-mute); }
        .dpage-rail-row.active .count { color: var(--brand-deep); }

        .dpage-main { padding: 22px 24px 60px; display: flex; flex-direction: column; gap: 18px; min-width: 0; overflow-x: hidden; }

        .dpage-head { display: flex; align-items: flex-start; gap: 12px; min-width: 0; }
        .dpage-title-input { all: unset; display: block; font-size: 22px; font-weight: 700; color: var(--fg-0); letter-spacing: -0.01em; width: 100%; box-sizing: border-box; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .dpage-title-input:focus { background: var(--brand-tint); border-radius: 4px; padding: 0 6px; margin: 0 -6px; }
        .dpage-desc-input { all: unset; font-size: 12.5px; color: var(--fg-3); display: block; margin-top: 4px; width: 100%; }
        .dpage-desc-input:focus { background: var(--brand-tint); border-radius: 4px; padding: 2px 6px; margin: 2px -6px 0; color: var(--fg-0); }

        .dboard {
          background: var(--bg-card); border: 1px solid var(--line);
          border-radius: var(--r-lg); overflow: hidden;
          display: flex; flex-direction: column;
        }
        .dpage-edit .dboard { border-style: dashed; }
        .dpage-edit .dboard:hover { border-color: var(--brand); border-style: solid; }
        .dboard-head { padding: 10px 14px; border-bottom: 1px solid var(--line-2); display: flex; align-items: flex-start; gap: 8px; }
        .dboard-head-text { flex: 1; min-width: 0; }
        .dboard-name { font-size: 13px; font-weight: 600; color: var(--fg-0); }
        .dboard-viz-tag {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 1px 6px; border-radius: 3px;
          background: var(--bg-inset); color: var(--fg-3);
          font-size: 9.5px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
          margin-left: 6px;
        }
        .dboard-q {
          font-family: var(--font-mono); font-size: 11px; color: var(--brand-deep);
          padding: 1px 6px; border-radius: 3px;
          background: var(--brand-tint); border: 1px solid var(--brand-soft);
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          max-width: 100%; display: block; margin-top: 3px;
        }
        .dboard-actions { display: flex; gap: 1px; opacity: 0; transition: opacity 100ms; }
        .dboard:hover .dboard-actions { opacity: 1; }
        .dpage-edit .dboard-actions { opacity: 0.9; }
        .dboard-iconbtn { width: 24px; height: 24px; border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; color: var(--fg-3); cursor: pointer; }
        .dboard-iconbtn:hover { background: var(--bg-inset); color: var(--fg-0); }
        .dboard-iconbtn.danger:hover { background: var(--err-soft); color: var(--err); }
        .dboard-body { padding: 12px 14px; }

        .add-widget-inline {
          padding: 14px 18px;
          border: 1.5px dashed var(--brand-soft); border-radius: 8px;
          background: color-mix(in oklab, var(--brand) 1.5%, transparent);
          display: flex; align-items: center; justify-content: center; gap: 10px;
          cursor: pointer; color: var(--brand-deep); font-weight: 600; font-size: 12.5px;
        }
        .add-widget-inline:hover { background: var(--brand-tint); }
      `}</style>

      <div className="dpage-shell">
        {/* ===== PAGES RAIL ===== */}
        <PagesRail currentId={pageId} go={go}/>

        {/* ===== MAIN ===== */}
        <div className="dpage-main">
          {/* HEADER */}
          <div className="dpage-head">
            <Icon name="bookmark" size={18} style={{ color: fav ? "var(--warn)" : "var(--fg-mute)", cursor: "pointer", marginTop: 8 }} onClick={() => setFav(f => !f)}/>
            <div style={{ width: 40, height: 40, borderRadius: 9, background: page.iconBg + "22", color: page.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name={page.icon} size={20}/>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <input className="dpage-title-input" value={pageName} onChange={e => setPageName(e.target.value)} placeholder="Untitled page" readOnly={!editing}/>
              <div className="row" style={{ gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                {editing && <span className="badge info"><Icon name="tool" size={10}/>Editing</span>}
                {page.tags.map(t => (
                  <span key={t} className="mono" style={{ fontSize: 11, padding: "1px 7px", borderRadius: 3, background: "var(--bg-inset)", color: "var(--fg-3)" }}>#{t}</span>
                ))}
              </div>
              <input className="dpage-desc-input" value={pageDesc} onChange={e => setPageDesc(e.target.value)} placeholder="Add a description" readOnly={!editing}/>
              <div className="muted" style={{ fontSize: 11.5, marginTop: 6 }}>
                <span style={{ width: 16, height: 16, borderRadius: "50%", background: page.owner.color, color: "white", fontSize: 8, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", marginRight: 6, verticalAlign: "middle" }}>{page.owner.initials}</span>
                {page.owner.name} · shared with {page.sharedWith} · {widgets.length} widget{widgets.length === 1 ? "" : "s"} · edited {page.modified}
              </div>
            </div>
            <div className="row" style={{ gap: 6, flexShrink: 0 }}>
              <button className="btn"><Icon name="share" size={13}/>Share</button>
              <button className="btn"><Icon name="export" size={13}/>Export</button>
              {!editing ? (
                <button className="btn btn-primary" onClick={() => setEditing(true)}><Icon name="tool" size={13}/>Edit page</button>
              ) : (
                <button className="btn btn-primary" onClick={() => setEditing(false)}><Icon name="check" size={13}/>Done editing</button>
              )}
              <button className="btn btn-ghost btn-icon"><Icon name="more" size={14}/></button>
            </div>
          </div>

          {/* === BODY === */}
          <div className={editing ? "dpage-edit" : ""}>
            {widgets.length === 0 ? (
              <EmptyPageState onAdd={() => openEditor(null)} pageName={pageName}/>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 12 }}>
                {widgets.map(w => (
                  <DashboardCard
                    key={w.id}
                    w={w}
                    editing={editing}
                    onEdit={() => openEditor(w)}
                    onRemove={() => removeWidget(w.id)}
                  />
                ))}

                {/* Add widget tile (in edit mode, or always if user wants) */}
                <div
                  onClick={() => openEditor(null)}
                  className="add-widget-inline"
                  style={{ gridColumn: "span 12", margin: "4px 0 0" }}>
                  <Icon name="plus" size={14}/>
                  Create a new widget — define a query
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Widget editor */}
      <WidgetEditor
        open={showEditor}
        widget={editingWidget}
        onClose={() => setShowEditor(false)}
        onSave={onSaveWidget}
        pageName={pageName}
      />
    </div>
  );
}

/* =================================================================
   PAGES RAIL — secondary nav listing all pages
   ================================================================= */
function PagesRail({ currentId, go }) {
  const [q, setQ] = useStateDD("");
  const [tab, setTab] = useStateDD("all"); // all | mine | shared | favorites

  const filtered = PAGE_ORDER.filter(id => {
    const p = PAGE_REGISTRY[id];
    if (!p) return false;
    if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (tab === "favorites" && !p.fav) return false;
    if (tab === "mine" && p.owner.name !== "Jay Vasquez") return false;
    return true;
  });
  const favs = filtered.filter(id => PAGE_REGISTRY[id].fav);
  const others = filtered.filter(id => !PAGE_REGISTRY[id].fav);

  return (
    <aside className="dpage-rail">
      <div className="dpage-rail-head">
        <div className="row" style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--fg-0)", flex: 1 }}>Custom dashboards</span>
          <a href={PAGE_URL.dashboards} className="btn btn-ghost btn-icon" style={{ width: 24, height: 24 }} title="All pages"><Icon name="list" size={13}/></a>
        </div>
        <button
          className="btn btn-primary"
          style={{ width: "100%", justifyContent: "center", height: 30, fontSize: 12 }}
          onClick={() => go("dashboardDetail", { id: "new" })}>
          <Icon name="plus" size={12}/>New page
        </button>
      </div>

      <div className="dpage-rail-search">
        <div className="search" style={{ height: 28 }}>
          <Icon name="search" size={12} className="muted"/>
          <input placeholder="Search pages…" value={q} onChange={e => setQ(e.target.value)} style={{ fontSize: 12 }}/>
        </div>
      </div>

      <div className="dpage-rail-tabs">
        {[
          { id: "all",       label: "All" },
          { id: "mine",      label: "Mine" },
          { id: "favorites", label: "Favorites" },
        ].map(t => (
          <div key={t.id} className={"dpage-rail-tab" + (tab === t.id ? " active" : "")} onClick={() => setTab(t.id)}>{t.label}</div>
        ))}
      </div>

      <div className="dpage-rail-list">
        {favs.length > 0 && tab !== "favorites" && (
          <>
            <div className="dpage-rail-section">Favorites</div>
            {favs.map(id => <PageRailRow key={id} id={id} active={id === currentId} go={go}/>)}
            <div className="dpage-rail-section">All pages</div>
          </>
        )}
        {others.map(id => <PageRailRow key={id} id={id} active={id === currentId} go={go}/>)}
        {tab === "favorites" && favs.map(id => <PageRailRow key={id} id={id} active={id === currentId} go={go}/>)}

        {filtered.length === 0 && (
          <div className="muted" style={{ padding: "20px 14px", fontSize: 11.5 }}>No pages match.</div>
        )}
      </div>
    </aside>
  );
}

function PageRailRow({ id, active, go }) {
  const p = PAGE_REGISTRY[id];
  const widgets = loadWidgets(id);
  return (
    <div className={"dpage-rail-row" + (active ? " active" : "")} onClick={() => go("dashboardDetail", { id })}>
      <Icon name="bookmark" size={11} className={"star" + (p.fav ? " on" : "")}/>
      <span style={{ width: 16, height: 16, borderRadius: 4, background: p.iconBg + "22", color: p.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name={p.icon} size={9}/>
      </span>
      <span className="name">{p.name}</span>
      <span className="count">{widgets.length}</span>
    </div>
  );
}

/* =================================================================
   EMPTY STATE
   ================================================================= */
function EmptyPageState({ onAdd, pageName }) {
  return (
    <div style={{
      padding: "60px 30px",
      border: "2px dashed var(--line)",
      borderRadius: 12,
      background: "var(--bg-inset)",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center",
    }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: "var(--brand-tint)", color: "var(--brand-deep)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="metrics" size={28}/>
      </div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--fg-0)" }}>{pageName} is empty</div>
        <div className="muted" style={{ fontSize: 12.5, marginTop: 6, lineHeight: 1.6, maxWidth: 520 }}>
          A page is just a container. To see something here, create your first widget — define a query against a data source and pick how to visualize it.
        </div>
      </div>
      <div className="row" style={{ gap: 8, marginTop: 4 }}>
        <button className="btn btn-primary" onClick={onAdd}>
          <Icon name="plus" size={13}/>Create your first widget
        </button>
        <button className="btn"><Icon name="export" size={13}/>Import from JSON</button>
        <button className="btn"><Icon name="sparkle" size={13}/>Generate with Bits</button>
      </div>

      {/* Tiny prompt examples */}
      <div style={{ marginTop: 14, padding: 14, background: "var(--bg-card)", border: "1px solid var(--line-2)", borderRadius: 8, textAlign: "left", maxWidth: 540 }}>
        <div className="label-up" style={{ marginBottom: 6 }}>Examples to start from</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {[
            { q: "avg:trace.http.request.duration{service:payment-svc} by {region}",  label: "Request latency by region" },
            { q: "sum:trace.http.request.errors{env:prod}.as_rate()",                  label: "Error rate over time" },
            { q: "top(sum:trace.span.hits{...} by {resource_name}, 10)",               label: "Top 10 endpoints by traffic" },
          ].map((e, i) => (
            <div key={i} onClick={onAdd} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 5, cursor: "pointer", fontSize: 11.5 }}>
              <Icon name="plus" size={11} className="muted"/>
              <span style={{ color: "var(--fg-0)", fontWeight: 500 }}>{e.label}</span>
              <span className="mono" style={{ color: "var(--fg-3)", fontSize: 10.5, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.q}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =================================================================
   DashboardCard — render a saved widget
   ================================================================= */
function DashboardCard({ w, editing, onEdit, onRemove }) {
  const span = w.span || (w.viz === "qval" ? 3 : w.viz === "toplist" ? 4 : w.viz === "table" ? 12 : 6);
  const src = SOURCE_META[w.source] || SOURCE_META.metrics;
  const viz = VIZ_TYPES.find(v => v.id === w.viz) || VIZ_TYPES[0];
  return (
    <div className="dboard" style={{ gridColumn: `span ${span}` }}>
      <div className="dboard-head">
        <div style={{ width: 24, height: 24, borderRadius: 5, background: src.color + "22", color: src.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
          <Icon name={viz.icon} size={12}/>
        </div>
        <div className="dboard-head-text">
          <div className="row" style={{ gap: 4, alignItems: "center" }}>
            <span className="dboard-name">{w.name || "Untitled widget"}</span>
            <span className="dboard-viz-tag">{viz.label}</span>
          </div>
          <span className="dboard-q mono" title={w.query}>{w.query}</span>
        </div>
        <div className="dboard-actions">
          <button className="dboard-iconbtn" title="Edit query" onClick={onEdit}><Icon name="tool" size={12}/></button>
          <button className="dboard-iconbtn" title="Duplicate"><Icon name="plus" size={12}/></button>
          {editing
            ? <button className="dboard-iconbtn danger" title="Remove" onClick={onRemove}><Icon name="x" size={12}/></button>
            : <button className="dboard-iconbtn" title="More"><Icon name="more" size={12}/></button>}
        </div>
      </div>
      <div className="dboard-body">
        <WidgetViz w={w}/>
      </div>
    </div>
  );
}

/* =================================================================
   WidgetViz — paint the chart from saved widget config
   ================================================================= */
function WidgetViz({ w }) {
  const seed = useMemoDD(() => {
    let s = 0; for (let i = 0; i < (w.id || w.query || "x").length; i++) s += (w.id || w.query || "x").charCodeAt(i);
    return s;
  }, [w.id]);

  if (w.viz === "qval") {
    // Try to derive a sensible value from query
    const isPct = (w.query || "").includes("error") || (w.query || "").includes("%");
    const val = isPct ? "0.61" : (Math.random() < 0.5 ? "184.2k" : "218");
    const unit = isPct ? "%" : (w.query || "").includes("duration") ? "ms" : "";
    const color = isPct ? "var(--warn)" : "var(--chart-1)";
    return (
      <div>
        <div className="row" style={{ alignItems: "baseline", gap: 6 }}>
          <span style={{ fontSize: 30, fontWeight: 700, color: "var(--fg-0)", letterSpacing: "-0.02em", fontFamily: "var(--font-mono)" }}>{val}</span>
          <span style={{ fontSize: 12, color: "var(--fg-3)" }}>{unit}</span>
          <span className="delta down warn">+2.4%</span>
        </div>
        <div style={{ height: 48, marginTop: 4 }}>
          <AreaSpark seed={seed} color={color} soft={color + "22"} height={48} base={0.5} amp={0.22}/>
        </div>
      </div>
    );
  }

  if (w.viz === "timeseries") {
    return (
      <div style={{ position: "relative", height: 180 }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <AreaSpark seed={seed} color="var(--chart-1)" soft="var(--chart-1-soft)" height={180} base={0.55} amp={0.18}/>
        </div>
        <div style={{ position: "absolute", inset: 0, opacity: 0.8 }}>
          <AreaSpark seed={seed + 11} color="var(--accent-violet)" soft="var(--accent-violet-soft)" height={180} base={0.40} amp={0.14}/>
        </div>
        <div style={{ position: "absolute", inset: 0, opacity: 0.8 }}>
          <AreaSpark seed={seed + 22} color="var(--chart-3)" soft="var(--ok-soft)" height={180} base={0.25} amp={0.10}/>
        </div>
      </div>
    );
  }

  if (w.viz === "toplist") {
    const rows = [
      { k: "POST /api/v2/checkout",    v: 142, color: "var(--err)" },
      { k: "POST /api/v2/charges",     v: 98,  color: "var(--err)" },
      { k: "GET /api/v2/cart/quote",   v: 84,  color: "var(--warn)" },
      { k: "POST /api/v2/3ds/verify",  v: 64,  color: "var(--warn)" },
      { k: "GET /api/v2/tax/calculate",v: 42,  color: "var(--chart-4)" },
      { k: "PUT /api/v2/payment-methods", v: 18, color: "var(--chart-1)" },
    ];
    const max = Math.max(...rows.map(r => r.v));
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {rows.map((r, i) => (
          <div key={i} style={{ position: "relative", padding: "5px 8px", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, width: (r.v/max)*100 + "%", background: r.color + "22" }}/>
            <div className="row" style={{ position: "relative", gap: 8 }}>
              <span className="mono" style={{ fontSize: 11, color: "var(--fg-3)", width: 12 }}>{i+1}</span>
              <span className="mono" style={{ fontSize: 11.5, flex: 1, color: "var(--fg-0)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.k}</span>
              <span className="mono" style={{ fontSize: 11.5, fontWeight: 600, color: r.color }}>{r.v}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (w.viz === "table") {
    return (
      <table className="tbl" style={{ marginTop: -8 }}>
        <thead>
          <tr><th>Group</th><th>Value</th><th>Δ 1h</th><th></th></tr>
        </thead>
        <tbody>
          {[
            { k: "us-east-1",  v: "62.4k", d: "+2.4%", dc: "down warn" },
            { k: "us-west-2",  v: "38.2k", d: "+1.1%", dc: "down warn" },
            { k: "eu-west-1",  v: "23.3k", d: "-0.4%", dc: "up" },
            { k: "ap-south-1", v: "12.1k", d: "+0.2%", dc: "" },
          ].map((r, i) => (
            <tr key={i}>
              <td className="mono" style={{ fontSize: 12 }}>{r.k}</td>
              <td className="mono" style={{ fontSize: 12, fontWeight: 600 }}>{r.v}</td>
              <td><span className={"delta " + r.dc}>{r.d}</span></td>
              <td style={{ width: 80 }}><MiniSpark seed={i*7+seed} width={68} height={20}/></td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (w.viz === "heatmap") {
    const cols = 32, rows = 6;
    return (
      <svg width="100%" height="120" viewBox={`0 0 ${cols * 14} ${rows * 16}`} preserveAspectRatio="none">
        {Array.from({ length: rows }).map((_, r) => (
          Array.from({ length: cols }).map((__, c) => {
            const v = Math.abs(Math.sin((c + r * 5 + seed) * 0.6)) * 0.9 + 0.1;
            return <rect key={r+"-"+c} x={c*14} y={r*16} width={12} height={14} rx={1.5}
              fill={`color-mix(in oklab, var(--chart-1) ${Math.round(v*80)}%, transparent)`}/>;
          })
        ))}
      </svg>
    );
  }

  if (w.viz === "hostmap") {
    const cols = 14, rows = 3;
    const W = 32, H = 38, halfW = W/2, vShift = H * 0.75;
    const padX = 4, padY = 4;
    const totalW = padX*2 + W + (cols - 1) * halfW;
    const totalH = padY*2 + rows * vShift + H/2;
    const data = seededWave(seed, cols * rows, 0.55, 0.32, 0.65);
    const colorFor = v => v > 0.85 ? "var(--err)" : v > 0.7 ? "var(--orange)" : v > 0.55 ? "var(--warn)" : v > 0.3 ? "var(--chart-3)" : "#5eead4";
    const hex = (cx, cy) => `M ${cx} ${cy-H/2} L ${cx+W/2} ${cy-H/4} L ${cx+W/2} ${cy+H/4} L ${cx} ${cy+H/2} L ${cx-W/2} ${cy+H/4} L ${cx-W/2} ${cy-H/4} Z`;
    return (
      <svg width="100%" height={totalH} viewBox={`0 0 ${totalW} ${totalH}`} preserveAspectRatio="xMidYMid meet">
        {Array.from({ length: rows }).map((_, r) => (
          Array.from({ length: cols }).map((__, c) => {
            const v = data[r * cols + c];
            const cx = padX + W/2 + c * halfW;
            const cy = padY + H/2 + r * vShift + (c % 2) * (H * 0.5);
            if (cy + H/2 > totalH) return null;
            return <path key={r+"-"+c} d={hex(cx, cy)} fill={colorFor(v)} stroke="rgba(0,0,0,0.08)" strokeWidth="0.5"/>;
          })
        ))}
      </svg>
    );
  }

  if (w.viz === "pie") {
    const slices = [
      { v: 42, c: "var(--chart-1)", l: "us-east-1" },
      { v: 28, c: "var(--accent-violet)", l: "us-west-2" },
      { v: 18, c: "var(--chart-3)", l: "eu-west-1" },
      { v: 12, c: "var(--orange)", l: "ap-south-1" },
    ];
    let a = -Math.PI/2;
    const total = slices.reduce((s, x) => s + x.v, 0);
    return (
      <div className="row" style={{ gap: 14 }}>
        <svg width="120" height="120" viewBox="0 0 120 120">
          {slices.map((s, i) => {
            const angle = (s.v/total) * Math.PI * 2;
            const x1 = 60 + Math.cos(a) * 50;
            const y1 = 60 + Math.sin(a) * 50;
            a += angle;
            const x2 = 60 + Math.cos(a) * 50;
            const y2 = 60 + Math.sin(a) * 50;
            const large = angle > Math.PI ? 1 : 0;
            return <path key={i} d={`M 60 60 L ${x1} ${y1} A 50 50 0 ${large} 1 ${x2} ${y2} Z`} fill={s.c}/>;
          })}
          <circle cx="60" cy="60" r="26" fill="var(--bg-card)"/>
        </svg>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {slices.map((s, i) => (
            <div key={i} className="row" style={{ gap: 6, fontSize: 11.5 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: s.c }}/>
              <span className="mono" style={{ color: "var(--fg-1)", flex: 1 }}>{s.l}</span>
              <span className="mono" style={{ color: "var(--fg-0)", fontWeight: 600 }}>{s.v}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (w.viz === "note") {
    return <div style={{ fontSize: 12.5, color: "var(--fg-1)", lineHeight: 1.6 }}>{w.note || "Empty note — click edit to add markdown content."}</div>;
  }

  // Default fallback
  return (
    <div style={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg-mute)", fontSize: 12 }}>
      Preview not available for {w.viz}
    </div>
  );
}

/* =================================================================
   WIDGET EDITOR — Datadog-style: viz picker + query builder + preview
   ================================================================= */

const AGG_FNS = ["avg", "sum", "min", "max", "count", "p50", "p75", "p95", "p99"];
const TIME_PRESETS = ["Last 5 minutes", "Last 15 minutes", "Last 1 hour", "Last 4 hours", "Last 24 hours", "Last 7 days"];

function WidgetEditor({ open, widget, onClose, onSave, pageName }) {
  const [viz, setViz] = useStateDD(widget?.viz || "timeseries");
  const [name, setName] = useStateDD(widget?.name || "");
  const [source, setSource] = useStateDD(widget?.source || "metrics");
  const [agg, setAgg] = useStateDD(widget?.agg || "avg");
  const [metric, setMetric] = useStateDD(widget?.metric || "trace.http.request.duration");
  const [from, setFrom] = useStateDD(widget?.from || ["env:prod", "service:payment-svc"]);
  const [by, setBy] = useStateDD(widget?.by || ["region"]);
  const [fn, setFn] = useStateDD(widget?.fn || "as_count()");
  const [time, setTime] = useStateDD(widget?.time || "Last 1 hour");
  const [queries, setQueries] = useStateDD(widget?.queries || []); // additional queries
  const [smoothing, setSmoothing] = useStateDD(true);
  const [legend, setLegend]       = useStateDD(true);
  const [markers, setMarkers]     = useStateDD(true);
  const [span, setSpan] = useStateDD(widget?.span || (widget?.viz === "qval" ? 3 : 6));

  useEffectDD(() => {
    if (!open) return;
    setViz(widget?.viz || "timeseries");
    setName(widget?.name || "");
    setSource(widget?.source || "metrics");
    setAgg(widget?.agg || "avg");
    setMetric(widget?.metric || "trace.http.request.duration");
    setFrom(widget?.from || ["env:prod", "service:payment-svc"]);
    setBy(widget?.by || ["region"]);
    setFn(widget?.fn || "as_count()");
    setTime(widget?.time || "Last 1 hour");
    setSpan(widget?.span || (widget?.viz === "qval" ? 3 : 6));
  }, [open, widget]);

  if (!open) return null;

  const query = `${agg}:${metric}{${from.join(", ")}}${by.length ? " by {" + by.join(", ") + "}" : ""}${fn ? "." + fn : ""}`;

  const preview = { id: "preview", viz, name, source, query, span };

  const removeTag = (idx, list, setter) => setter(list.filter((_, i) => i !== idx));
  const addTag    = (val, list, setter) => { if (val && !list.includes(val)) setter([...list, val]); };

  const doSave = () => {
    onSave({
      viz, name: name || `${agg}:${metric}`, source, query, agg, metric, from, by, fn, time, span,
    });
  };

  const srcMeta = SOURCE_META[source];

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 200, display: "flex", alignItems: "stretch" }}>
      <div onClick={e => e.stopPropagation()} style={{
        margin: "auto", width: "min(1240px, 96vw)", height: "min(820px, 94vh)",
        background: "var(--bg-canvas)", borderRadius: 12, overflow: "hidden",
        display: "grid", gridTemplateRows: "auto 1fr auto",
        boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
      }}>
        {/* HEADER */}
        <div className="row" style={{ padding: "14px 22px", borderBottom: "1px solid var(--line)" }}>
          <div className="page-icon" style={{ width: 32, height: 32, background: "var(--brand-soft)", color: "var(--brand-deep)" }}>
            <Icon name="tool" size={16}/>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--fg-0)" }}>{widget ? "Edit widget" : "New widget"}</div>
            <div className="muted" style={{ fontSize: 11.5 }}>On page · <span className="mono">{pageName}</span></div>
          </div>
          <div className="spacer"/>
          <span className="kbd">esc</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>

        {/* BODY */}
        <div style={{ display: "grid", gridTemplateColumns: "440px 1fr", minHeight: 0 }}>
          {/* LEFT — Query builder */}
          <div style={{ overflowY: "auto", padding: "16px 18px 22px", borderRight: "1px solid var(--line)" }}>
            {/* Viz type tabs */}
            <div className="label-up" style={{ marginBottom: 8 }}>Visualization</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4, marginBottom: 18 }}>
              {VIZ_TYPES.map(v => {
                const active = viz === v.id;
                return (
                  <div key={v.id} onClick={() => setViz(v.id)}
                    title={v.desc}
                    style={{
                      padding: "8px 4px", borderRadius: 6, cursor: "pointer",
                      border: "1px solid " + (active ? "var(--brand)" : "var(--line-2)"),
                      background: active ? "var(--brand-tint)" : "var(--bg-card)",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                    }}>
                    <Icon name={v.icon} size={14} style={{ color: active ? "var(--brand-deep)" : "var(--fg-2)" }}/>
                    <span style={{ fontSize: 10.5, fontWeight: 600, color: active ? "var(--brand-deep)" : "var(--fg-1)", textAlign: "center" }}>{v.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Data source */}
            <div className="label-up" style={{ marginBottom: 6 }}>Data source</div>
            <div className="row" style={{ gap: 4, flexWrap: "wrap", marginBottom: 16 }}>
              {Object.entries(SOURCE_META).map(([k, m]) => {
                const active = source === k;
                return (
                  <div key={k} onClick={() => setSource(k)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "4px 9px", borderRadius: 5, cursor: "pointer",
                      border: "1px solid " + (active ? m.color : "var(--line-2)"),
                      background: active ? m.color + "22" : "var(--bg-card)",
                      fontSize: 11.5, fontWeight: 500,
                      color: active ? m.color : "var(--fg-1)",
                    }}>
                    <Icon name={m.icon} size={11}/>
                    {m.label}
                  </div>
                );
              })}
            </div>

            {/* Query builder */}
            <div className="row" style={{ marginBottom: 8 }}>
              <span className="label-up">Graph your data</span>
              <div className="spacer"/>
              <button className="btn btn-ghost" style={{ height: 22, padding: "0 6px", fontSize: 11, color: "var(--fg-3)" }}><Icon name="zap" size={11}/>Suggest</button>
            </div>

            {/* Query A */}
            <QueryRowInternal
              letter="a" agg={agg} setAgg={setAgg}
              metric={metric} setMetric={setMetric}
              from={from} setFrom={setFrom}
              by={by} setBy={setBy}
              fn={fn} setFn={setFn}
              removeTag={removeTag} addTag={addTag}
            />

            <div className="row" style={{ gap: 6, marginTop: 8 }}>
              <button className="btn" style={{ height: 28, fontSize: 11.5 }}><Icon name="plus" size={11}/>Add query</button>
              <button className="btn" style={{ height: 28, fontSize: 11.5 }}><Icon name="plus" size={11}/>Add formula</button>
              <div className="spacer"/>
              <span className="muted mono" style={{ fontSize: 11 }}>184ms · cached</span>
            </div>

            {/* Display options */}
            <div className="label-up" style={{ marginTop: 22, marginBottom: 8 }}>Display options</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <ToggleRow label="Show legend" v={legend} on={setLegend}/>
              <ToggleRow label="Show deploy markers" v={markers} on={setMarkers}/>
              <ToggleRow label="Smoothing" v={smoothing} on={setSmoothing}/>
            </div>

            <div className="label-up" style={{ marginTop: 18, marginBottom: 8 }}>Size on page</div>
            <div className="seg">
              {[{ v: 3, l: "S" }, { v: 4, l: "M" }, { v: 6, l: "L" }, { v: 8, l: "XL" }, { v: 12, l: "Full" }].map(o => (
                <div key={o.v} className={"seg-opt" + (span === o.v ? " active" : "")} onClick={() => setSpan(o.v)}>{o.l}</div>
              ))}
            </div>
          </div>

          {/* RIGHT — Preview */}
          <div style={{ overflowY: "auto", padding: "16px 22px 22px", background: "var(--bg-inset)" }}>
            <div className="row" style={{ marginBottom: 10 }}>
              <span className="label-up">Preview</span>
              <div className="spacer"/>
              <div className="row" style={{ gap: 6 }}>
                <select value={time} onChange={e => setTime(e.target.value)} style={{ height: 26, padding: "0 8px", fontSize: 11.5, border: "1px solid var(--line)", borderRadius: 5, background: "var(--bg-card)", color: "var(--fg-1)" }}>
                  {TIME_PRESETS.map(p => <option key={p}>{p}</option>)}
                </select>
                <button className="btn btn-ghost btn-icon" style={{ width: 26, height: 26 }} title="Refresh"><Icon name="refresh" size={12}/></button>
              </div>
            </div>

            {/* Title field */}
            <div className="search" style={{ marginBottom: 10, height: 34 }}>
              <input autoFocus placeholder="Widget title — e.g. p99 latency by region" value={name} onChange={e => setName(e.target.value)} style={{ fontSize: 13.5, fontWeight: 600 }}/>
            </div>

            {/* Query echo */}
            <div className="row" style={{ marginBottom: 10, padding: "6px 10px", background: "var(--bg-card)", border: "1px solid var(--line-2)", borderRadius: 6 }}>
              <Icon name="code" size={11} className="muted"/>
              <span className="mono" style={{ fontSize: 11.5, color: "var(--brand-deep)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{query}</span>
              <span className="badge neutral" style={{ height: 18, padding: "0 6px", fontSize: 10 }}>{srcMeta.label}</span>
            </div>

            {/* Preview chart card */}
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--line)", borderRadius: 8, padding: 16, minHeight: 320 }}>
              <div className="row" style={{ marginBottom: 14 }}>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--fg-0)" }}>{name || (`${agg}:${metric}`)}</span>
                <span className="dboard-viz-tag" style={{ marginLeft: 6 }}>{VIZ_TYPES.find(v => v.id === viz)?.label}</span>
                <div className="spacer"/>
                <span className="muted mono" style={{ fontSize: 11 }}>{time}</span>
              </div>
              <WidgetViz w={preview}/>
              {legend && (
                <div className="row" style={{ marginTop: 12, gap: 16, paddingTop: 10, borderTop: "1px solid var(--line-2)" }}>
                  {by.length > 0 && by[0] === "region" && (
                    <>
                      <div className="row" style={{ gap: 5 }}><span style={{ width: 10, height: 3, background: "var(--chart-1)" }}/><span className="mono" style={{ fontSize: 11 }}>us-east-1</span></div>
                      <div className="row" style={{ gap: 5 }}><span style={{ width: 10, height: 3, background: "var(--accent-violet)" }}/><span className="mono" style={{ fontSize: 11 }}>us-west-2</span></div>
                      <div className="row" style={{ gap: 5 }}><span style={{ width: 10, height: 3, background: "var(--chart-3)" }}/><span className="mono" style={{ fontSize: 11 }}>eu-west-1</span></div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Helper */}
            <div className="row" style={{ marginTop: 10, gap: 6, padding: "8px 12px", background: "color-mix(in oklab, var(--accent-violet) 6%, var(--bg-card))", border: "1px solid var(--accent-violet-soft)", borderRadius: 6 }}>
              <Icon name="sparkle" size={12} style={{ color: "var(--accent-violet)" }}/>
              <span style={{ fontSize: 11.5, color: "var(--fg-1)" }}>Need help writing a query? Describe what you want — </span>
              <span className="mono" style={{ fontSize: 11, color: "var(--accent-violet)", cursor: "pointer", textDecoration: "underline" }}>"p99 errors per region last 1h"</span>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="row" style={{ padding: "12px 22px", borderTop: "1px solid var(--line)", gap: 8, background: "var(--bg-inset)" }}>
          <button className="btn btn-ghost"><Icon name="alert" size={12}/>Create monitor</button>
          <button className="btn btn-ghost"><Icon name="export" size={12}/>Export JSON</button>
          <div className="spacer"/>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={doSave}><Icon name="check" size={13}/>{widget ? "Save changes" : "Add to page"}</button>
        </div>
      </div>
    </div>
  );
}

function QueryRowInternal({ letter, agg, setAgg, metric, setMetric, from, setFrom, by, setBy, fn, setFn, removeTag, addTag }) {
  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: 8, padding: 10, background: "var(--bg-card)" }}>
      <div className="row" style={{ gap: 6, marginBottom: 8 }}>
        <div style={{ width: 22, height: 22, borderRadius: 4, background: "var(--brand-soft)", color: "var(--brand-deep)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11, fontFamily: "var(--font-mono)" }}>{letter}</div>
        <span className="mono muted" style={{ fontSize: 11 }}>query</span>
        <div className="spacer"/>
        <button className="btn btn-ghost btn-icon" style={{ width: 22, height: 22 }} title="Remove"><Icon name="x" size={11}/></button>
      </div>

      {/* agg + metric */}
      <div className="row" style={{ gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
        <select value={agg} onChange={e => setAgg(e.target.value)} style={{ height: 28, padding: "0 8px", fontSize: 12, border: "1px solid var(--line)", borderRadius: 5, background: "var(--bg-canvas)", color: "var(--fg-0)", fontFamily: "var(--font-mono)" }}>
          {AGG_FNS.map(a => <option key={a}>{a}</option>)}
        </select>
        <span className="mono muted">:</span>
        <div className="search" style={{ flex: 1, minWidth: 200, height: 28 }}>
          <Icon name="metrics" size={12} className="muted"/>
          <input value={metric} onChange={e => setMetric(e.target.value)} style={{ fontFamily: "var(--font-mono)", fontSize: 12 }} placeholder="metric name"/>
        </div>
      </div>

      {/* from filter */}
      <FilterRow label="from" tags={from} setTags={setFrom} placeholder="env:prod, service:..." color="var(--chart-3)"/>

      {/* by group */}
      <FilterRow label="by" tags={by} setTags={setBy} placeholder="region, service, host" color="var(--accent-violet)"/>

      {/* fn */}
      <div className="row" style={{ gap: 6, marginTop: 8 }}>
        <span className="mono muted" style={{ fontSize: 11, width: 32 }}>fn</span>
        <select value={fn} onChange={e => setFn(e.target.value)} style={{ height: 26, padding: "0 8px", fontSize: 11.5, border: "1px solid var(--line)", borderRadius: 5, background: "var(--bg-canvas)", color: "var(--fg-1)", fontFamily: "var(--font-mono)", flex: 1 }}>
          <option value="">(none)</option>
          <option value="as_rate()">as_rate()</option>
          <option value="as_count()">as_count()</option>
          <option value="rollup(avg, 60)">rollup(avg, 60)</option>
          <option value="anomalies()">anomalies(...)</option>
        </select>
      </div>
    </div>
  );
}

function FilterRow({ label, tags, setTags, placeholder, color }) {
  const [draft, setDraft] = useStateDD("");
  return (
    <div className="row" style={{ gap: 6, marginTop: 6, alignItems: "flex-start", flexWrap: "wrap" }}>
      <span className="mono muted" style={{ fontSize: 11, width: 32, marginTop: 6 }}>{label}</span>
      <div className="row" style={{ flex: 1, flexWrap: "wrap", gap: 4, alignItems: "center", border: "1px solid var(--line)", borderRadius: 5, padding: "4px 6px", background: "var(--bg-canvas)", minHeight: 28 }}>
        {tags.map((t, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "1px 6px", background: color + "22", color: color, borderRadius: 3, fontSize: 11, fontFamily: "var(--font-mono)" }}>
            {t}
            <span onClick={() => setTags(tags.filter((_, j) => j !== i))} style={{ cursor: "pointer", display: "inline-flex" }}><Icon name="x" size={9}/></span>
          </span>
        ))}
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && draft.trim()) { setTags([...tags, draft.trim()]); setDraft(""); } }}
          placeholder={tags.length === 0 ? placeholder : ""}
          style={{ border: 0, outline: 0, background: "transparent", flex: 1, minWidth: 80, fontSize: 11.5, fontFamily: "var(--font-mono)", color: "var(--fg-0)" }}
        />
      </div>
    </div>
  );
}

function ToggleRow({ label, v, on }) {
  return (
    <div className="row" style={{ justifyContent: "space-between", padding: "4px 0" }}>
      <span style={{ fontSize: 12, color: "var(--fg-1)" }}>{label}</span>
      <div onClick={() => on(!v)} style={{
        width: 30, height: 18, borderRadius: 10, background: v ? "var(--brand)" : "var(--line)",
        position: "relative", cursor: "pointer", transition: "background 120ms",
      }}>
        <div style={{
          position: "absolute", top: 2, left: v ? 14 : 2,
          width: 14, height: 14, borderRadius: "50%", background: "white", transition: "left 120ms",
          boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
        }}/>
      </div>
    </div>
  );
}

Object.assign(window, { DashboardDetailScreen });
