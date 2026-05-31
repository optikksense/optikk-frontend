/* global React, Icon, MiniSpark, AreaSpark, Bars, PageHeader, seededWave, goTo, PAGE_URL */
const { useState: useStateDB, useMemo: useMemoDB } = React;

/* =========================================================
   CUSTOM DASHBOARDS — PAGES LIST
   A "Page" is a user-defined container. Each page holds one
   or more "Dashboards" (configurable visualizations).
   This screen lists the user's Pages.
   ========================================================= */

const STORAGE_KEY = "optikk-page-widgets";
function widgetCountFor(pageId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const all = JSON.parse(raw);
    return (all[pageId] || []).length;
  } catch (e) { return 0; }
}

const PAGES = [
  { id: "payments-prod",   name: "Payments — Production health",    desc: "Live revenue, error rate, end-to-end latency. Pinned to TV in the SRE room.",  icon: "tag",        iconBg: "#a78bfa", owner: { name: "Jay Vasquez", initials: "JV", color: "linear-gradient(135deg,#6366f1,#3b82f6)" }, sharedWith: 12, modified: "12m ago",       fav: true,  tags: ["sre", "payments"] },
  { id: "checkout-funnel", name: "Checkout funnel — by region",     desc: "Conversion + drop-off broken down by region, device, locale, AB cohort.",      icon: "topology",   iconBg: "#34d399", owner: { name: "Rita Chen",   initials: "RC", color: "linear-gradient(135deg,#34d399,#3b82f6)" }, sharedWith: 8,  modified: "2h ago",        fav: true,  tags: ["growth", "payments"] },
  { id: "search-perf",     name: "Search — performance & quality",  desc: "ES cluster health, relevance scores, zero-result rate, slow queries.",        icon: "search",     iconBg: "#60a5fa", owner: { name: "Rita Chen",   initials: "RC", color: "linear-gradient(135deg,#34d399,#10b981)" }, sharedWith: 4,  modified: "Yesterday",     fav: true,  tags: ["discovery"] },
  { id: "infra-fleet",     name: "Infrastructure — fleet health",   desc: "412 hosts. CPU, RAM, disk, network across the platform fleet.",                icon: "infra",      iconBg: "#fb923c", owner: { name: "Maya Singh",  initials: "MS", color: "linear-gradient(135deg,#f97316,#ef4444)" }, sharedWith: 22, modified: "3h ago",        fav: false, tags: ["platform"] },
  { id: "reliability",     name: "Reliability — incidents this quarter",desc: "Incident rate per service. 14d/3d windows. Replaces the wiki page.",          icon: "saturation", iconBg: "#6366f1", owner: { name: "Jay Vasquez", initials: "JV", color: "linear-gradient(135deg,#6366f1,#3b82f6)" }, sharedWith: 18, modified: "2 days ago",    fav: false, tags: ["sre", "platform"] },
  { id: "llm-cost",        name: "LLM cost & quality",               desc: "Token spend per model, groundedness, p95 latency for AI features.",            icon: "ai",         iconBg: "#a78bfa", owner: { name: "Priya Anand", initials: "PA", color: "linear-gradient(135deg,#a78bfa,#6366f1)" }, sharedWith: 6,  modified: "4 days ago",    fav: true,  tags: ["growth", "ai"] },
  { id: "vendor-status",   name: "Third-party vendors",              desc: "Stripe, Sendgrid, Twilio, Auth0 — uptime + latency + spend.",                  icon: "globe",      iconBg: "#22d3ee", owner: { name: "Rita Chen",   initials: "RC", color: "linear-gradient(135deg,#34d399,#3b82f6)" }, sharedWith: 5,  modified: "1 week ago",    fav: false, tags: ["payments", "platform"] },
  { id: "kafka-ops",       name: "Kafka — broker & consumer",        desc: "Per-broker throughput, ISR, consumer lag, partition skew.",                     icon: "kafka",      iconBg: "#3b82f6", owner: { name: "Kai Olsson",  initials: "KO", color: "linear-gradient(135deg,#3b82f6,#1d4ed8)" }, sharedWith: 3,  modified: "1 week ago",    fav: false, tags: ["platform"] },
];

const VIEW_PRESETS = [
  { id: "mine",      label: "Pages I created",  icon: "user"     },
  { id: "shared",    label: "Shared with me",   icon: "share"    },
  { id: "favorites", label: "Favorites",        icon: "bookmark" },
  { id: "recent",    label: "Recently opened",  icon: "clock"    },
  { id: "all",       label: "All pages",        icon: "grid"     },
];

function presetCount(id) {
  if (id === "mine")      return PAGES.filter(p => p.owner.name === "Jay Vasquez").length;
  if (id === "shared")    return PAGES.filter(p => p.owner.name !== "Jay Vasquez").length;
  if (id === "favorites") return PAGES.filter(p => p.fav).length;
  return PAGES.length;
}

function DashboardListScreen({ go }) {
  const [preset, setPreset] = useStateDB("mine");
  const [view, setView] = useStateDB("grid");
  const [query, setQuery] = useStateDB("");
  const [showCreate, setShowCreate] = useStateDB(false);
  const [tagFilter, setTagFilter] = useStateDB(null);

  const allTags = useMemoDB(() => {
    const m = {};
    PAGES.forEach(p => p.tags.forEach(t => { m[t] = (m[t] || 0) + 1; }));
    return Object.entries(m).sort((a,b) => b[1]-a[1]);
  }, []);

  const filtered = PAGES.filter(p => {
    if (preset === "favorites" && !p.fav) return false;
    if (preset === "mine" && p.owner.name !== "Jay Vasquez") return false;
    if (query && !p.name.toLowerCase().includes(query.toLowerCase()) && !p.desc.toLowerCase().includes(query.toLowerCase())) return false;
    if (tagFilter && !p.tags.includes(tagFilter)) return false;
    return true;
  });

  return (
    <div className="page">
      <PageHeader
        icon="grid"
        iconColor="var(--brand-deep)"
        iconBg="var(--brand-soft)"
        title="Custom dashboards"
        subtitle={`Pages are empty containers. Open one, then build widgets powered by queries. ${PAGES.length} page${PAGES.length === 1 ? "" : "s"} across the workspace.`}
        actions={
          <div className="row" style={{ gap: 6 }}>
            <button className="btn"><Icon name="export" size={13}/>Import</button>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Icon name="plus" size={13}/>Create page</button>
          </div>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 24 }}>
        {/* LEFT RAIL */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {/* Presets */}
          <div>
            <div className="label-up" style={{ marginBottom: 8 }}>Views</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {VIEW_PRESETS.map(p => {
                const active = preset === p.id;
                return (
                  <div key={p.id}
                    onClick={() => setPreset(p.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "7px 10px", borderRadius: 6, cursor: "pointer",
                      background: active ? "var(--brand-tint)" : "transparent",
                      color: active ? "var(--brand-deep)" : "var(--fg-1)",
                      fontWeight: active ? 600 : 500, fontSize: 12.5,
                    }}>
                    <Icon name={p.icon} size={14}/>
                    <span style={{ flex: 1 }}>{p.label}</span>
                    <span className="mono muted" style={{ fontSize: 10.5 }}>{presetCount(p.id)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div>
            <div className="row" style={{ marginBottom: 8, justifyContent: "space-between" }}>
              <span className="label-up">Tags</span>
              {tagFilter && (
                <span style={{ fontSize: 10.5, color: "var(--brand-deep)", cursor: "pointer" }} onClick={() => setTagFilter(null)}>Clear</span>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {allTags.map(([t, c]) => {
                const active = tagFilter === t;
                return (
                  <div key={t}
                    onClick={() => setTagFilter(active ? null : t)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "5px 8px", borderRadius: 5, cursor: "pointer",
                      background: active ? "var(--bg-inset)" : "transparent",
                      fontSize: 12,
                    }}>
                    <span className="mono" style={{ flex: 1, color: active ? "var(--fg-0)" : "var(--fg-1)" }}>#{t}</span>
                    <span className="mono muted" style={{ fontSize: 10.5 }}>{c}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Help card */}
          <div style={{ padding: 12, background: "var(--bg-inset)", border: "1px solid var(--line-2)", borderRadius: 8 }}>
            <div className="row" style={{ gap: 6, marginBottom: 6 }}>
              <Icon name="sparkle" size={13} style={{ color: "var(--accent-violet)" }}/>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--fg-0)" }}>How pages work</span>
            </div>
            <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
              A page is a workspace you own. Inside it, you define dashboards — each one a configured chart, table, or KPI tied to a data source.
            </div>
          </div>
        </div>

        {/* MAIN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22, minWidth: 0 }}>
          {/* Toolbar */}
          <div className="row" style={{ gap: 10 }}>
            <div className="search" style={{ flex: 1, height: 34 }}>
              <Icon name="search" size={14} className="muted"/>
              <input placeholder="Search pages by name, owner or tag…" value={query} onChange={e => setQuery(e.target.value)}/>
              <span className="kbd">/</span>
            </div>
            <div className="seg">
              <div className={"seg-opt" + (view === "grid" ? " active" : "")} onClick={() => setView("grid")}><Icon name="grid" size={11}/></div>
              <div className={"seg-opt" + (view === "list" ? " active" : "")} onClick={() => setView("list")}><Icon name="list" size={11}/></div>
            </div>
            <button className="btn"><span className="muted" style={{ fontSize: 11.5, marginRight: 4 }}>Sort:</span>Recently modified<Icon name="chevron-down" size={12}/></button>
          </div>

          {/* Count */}
          <div className="row" style={{ margin: "-10px 0 0" }}>
            <span className="muted" style={{ fontSize: 12 }}>
              {filtered.length} page{filtered.length === 1 ? "" : "s"}
              {tagFilter && <> · filtered by <span className="mono" style={{ color: "var(--brand-deep)" }}>#{tagFilter}</span></>}
            </span>
          </div>

          {/* Grid / List */}
          {view === "grid" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {/* Create page tile — always first */}
              <CreatePageTile onClick={() => setShowCreate(true)}/>
              {filtered.map(p => <PageCard key={p.id} page={p} go={go}/>)}
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <table className="tbl">
                <thead>
                  <tr>
                    <th style={{ width: 22 }}></th>
                    <th>Page</th>
                    <th style={{ width: 100 }}>Widgets</th>
                    <th style={{ width: 120 }}>Owner</th>
                    <th style={{ width: 90 }}>Shared</th>
                    <th style={{ width: 120 }}>Tags</th>
                    <th style={{ width: 110 }}>Modified</th>
                    <th style={{ width: 32 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id} style={{ cursor: "pointer" }} onClick={() => go("dashboardDetail", { id: p.id })}>
                      <td><Icon name="bookmark" size={13} style={{ color: p.fav ? "var(--warn)" : "var(--fg-mute)" }}/></td>
                      <td>
                        <div className="row" style={{ gap: 10 }}>
                          <div style={{ width: 30, height: 30, borderRadius: 7, background: p.iconBg + "22", color: p.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Icon name={p.icon} size={15}/>
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, color: "var(--fg-0)" }}>{p.name}</div>
                            <div className="muted" style={{ fontSize: 11.5, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 480 }}>{p.desc}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {(() => { const c = widgetCountFor(p.id); return c === 0
                          ? <span className="muted" style={{ fontSize: 11.5 }}>empty</span>
                          : <><span className="mono" style={{ fontSize: 12, fontWeight: 600, color: "var(--fg-0)" }}>{c}</span><span className="muted" style={{ fontSize: 11, marginLeft: 4 }}>widget{c === 1 ? "" : "s"}</span></>; })()}
                      </td>
                      <td>
                        <div className="row" style={{ gap: 6 }}>
                          <span style={{ width: 20, height: 20, borderRadius: "50%", background: p.owner.color, color: "white", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{p.owner.initials}</span>
                          <span style={{ fontSize: 12 }}>{p.owner.name.split(" ")[0]}</span>
                        </div>
                      </td>
                      <td><span className="mono muted" style={{ fontSize: 11.5 }}>{p.sharedWith} people</span></td>
                      <td>
                        <div className="row" style={{ gap: 4, flexWrap: "wrap" }}>
                          {p.tags.slice(0,2).map(t => (
                            <span key={t} className="mono" style={{ fontSize: 10.5, padding: "1px 6px", borderRadius: 3, background: "var(--bg-inset)", color: "var(--fg-2)" }}>{t}</span>
                          ))}
                        </div>
                      </td>
                      <td className="muted mono" style={{ fontSize: 11.5 }}>{p.modified}</td>
                      <td><Icon name="more" size={14} className="muted"/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <CreatePageDrawer open={showCreate} onClose={() => setShowCreate(false)} go={go}/>
    </div>
  );
}

/* ============================
   Create Page tile (in grid)
   ============================ */
function CreatePageTile({ onClick }) {
  return (
    <div onClick={onClick}
      style={{
        border: "1.5px dashed var(--brand-soft)",
        borderRadius: 8,
        background: "color-mix(in oklab, var(--brand) 2%, transparent)",
        padding: 18,
        cursor: "pointer",
        display: "flex", flexDirection: "column", gap: 8,
        minHeight: 230,
        justifyContent: "center", alignItems: "center",
        textAlign: "center",
      }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--brand-tint)", color: "var(--brand-deep)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="plus" size={20}/>
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--brand-deep)" }}>Create page</div>
      <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.5, maxWidth: 220 }}>
        Empty by default. Add widgets after creating — each one powered by its own query.
      </div>
    </div>
  );
}

/* ============================
   Page card (in grid)
   ============================ */
function PageCard({ page, go }) {
  const widgetCount = widgetCountFor(page.id);
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column", minHeight: 180 }}
         onClick={() => go("dashboardDetail", { id: page.id })}>
      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        <div className="row" style={{ gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: page.iconBg + "22", color: page.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name={page.icon} size={17}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--fg-0)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{page.name}</div>
            <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>
              {widgetCount === 0
                ? <span style={{ color: "var(--fg-mute)" }}>Empty page · no widgets yet</span>
                : <><span className="mono" style={{ color: "var(--fg-0)", fontWeight: 600 }}>{widgetCount}</span> widget{widgetCount === 1 ? "" : "s"}</>}
            </div>
          </div>
          <Icon name="bookmark" size={14} style={{ color: page.fav ? "var(--warn)" : "var(--fg-mute)", flexShrink: 0 }}/>
        </div>

        <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: 32 }}>
          {page.desc}
        </div>

        <div className="row" style={{ gap: 4, flexWrap: "wrap", marginTop: 2 }}>
          {page.tags.map(t => (
            <span key={t} className="mono" style={{ fontSize: 10.5, padding: "1px 7px", borderRadius: 3, background: "var(--bg-inset)", color: "var(--fg-3)" }}>#{t}</span>
          ))}
        </div>
      </div>

      <div className="row" style={{ padding: "10px 16px", borderTop: "1px solid var(--line-2)", gap: 6, background: "var(--bg-inset)" }}>
        <span style={{ width: 18, height: 18, borderRadius: "50%", background: page.owner.color, color: "white", fontSize: 8.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{page.owner.initials}</span>
        <span className="muted" style={{ fontSize: 11 }}>{page.owner.name.split(" ")[0]}</span>
        <span className="spacer"/>
        <div className="row" style={{ gap: 4 }}>
          <Icon name="share" size={10} className="muted"/>
          <span className="muted mono" style={{ fontSize: 10.5 }}>{page.sharedWith}</span>
        </div>
        <span className="muted mono" style={{ fontSize: 10.5 }}>· {page.modified}</span>
      </div>
    </div>
  );
}

/* ============================
   Create Page drawer
   ============================ */
function CreatePageDrawer({ open, onClose, go }) {
  const [name, setName] = useStateDB("");
  const [desc, setDesc] = useStateDB("");

  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.42)", zIndex: 100, display: "flex", justifyContent: "flex-end" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 480, height: "100%", background: "var(--bg-canvas)", borderLeft: "1px solid var(--line)", display: "flex", flexDirection: "column", boxShadow: "-24px 0 60px rgba(15,23,42,0.18)" }}>
        <div className="row" style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)" }}>
          <div className="page-icon" style={{ width: 32, height: 32, background: "var(--brand-soft)", color: "var(--brand-deep)" }}>
            <Icon name="plus" size={16}/>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>New page</div>
            <div className="muted" style={{ fontSize: 11.5 }}>Empty by default — add widgets after creating</div>
          </div>
          <div className="spacer"/>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>

        <div style={{ padding: "20px 22px", flex: 1, overflowY: "auto" }}>
          <div className="label-up" style={{ marginBottom: 8 }}>Page name</div>
          <div className="search" style={{ height: 36 }}>
            <input autoFocus placeholder="e.g. Payments — Production health" value={name} onChange={e => setName(e.target.value)} style={{ fontSize: 13.5 }}/>
          </div>

          <div className="label-up" style={{ marginTop: 18, marginBottom: 8 }}>Description (optional)</div>
          <div className="search" style={{ height: 36 }}>
            <input placeholder="One line — what this page is for, who looks at it" value={desc} onChange={e => setDesc(e.target.value)} style={{ fontSize: 13 }}/>
          </div>

          <div className="label-up" style={{ marginTop: 18, marginBottom: 8 }}>Tags (optional)</div>
          <div className="search" style={{ height: 36 }}>
            <input placeholder="sre, payments, on-call…" style={{ fontSize: 12.5 }}/>
          </div>

          <div style={{ marginTop: 22, padding: 14, background: "var(--bg-inset)", border: "1px solid var(--line-2)", borderRadius: 8 }}>
            <div className="row" style={{ gap: 6, marginBottom: 6 }}>
              <Icon name="zap" size={12} style={{ color: "var(--brand-deep)" }}/>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--fg-0)" }}>What happens next</span>
            </div>
            <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.6 }}>
              We'll create an empty page called <span className="mono" style={{ color: "var(--fg-0)" }}>“{name || "Untitled page"}”</span> and drop you straight into it. From there, click <span className="mono" style={{ color: "var(--brand-deep)" }}>+ New widget</span> to start building — each widget is powered by its own query.
            </div>
          </div>
        </div>

        <div className="row" style={{ padding: "14px 20px", borderTop: "1px solid var(--line)", gap: 8, background: "var(--bg-inset)" }}>
          <span className="muted" style={{ fontSize: 11.5 }}>Visibility: <span className="mono" style={{ color: "var(--fg-0)" }}>workspace · view-only</span></span>
          <div className="spacer"/>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => go("dashboardDetail", { id: "new" })}>
            Create page <Icon name="chevron-right" size={13}/>
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DashboardListScreen });
