/* Per-page bootstrap. Each HTML file sets window.__OPTIKK_PAGE__ and includes this file last.
   Available screens: overview | services | serviceDetail | kafka | database | logs | trace
*/
const { useState: useStateApp, useEffect: useEffectApp } = React;

const SCREEN_REGISTRY = {
  overview:       { c: window.OverviewScreen,       crumbs: [{ label: "Optikk" }, { label: "Overview" }],                                                  time: "Last 1 hour", live: "live" },
  metrics:        { c: window.MetricsScreen,        crumbs: [{ label: "Observe" }, { label: "Metrics", href: PAGE_URL.metrics }],                          time: "Last 4 hours", live: "live" },
  saturation:     { c: window.SaturationScreen,     crumbs: [{ label: "Operate" }, { label: "Saturation", href: PAGE_URL.saturation }],                     time: "Last 1 hour", live: "live" },
  infrastructure: { c: window.InfrastructureScreen, crumbs: [{ label: "Operate" }, { label: "Infrastructure", href: PAGE_URL.infrastructure }],             time: "Last 1 hour", live: "live" },
  hostDetail:      { c: window.HostDetailScreen,     crumbs: [{ label: "Operate" }, { label: "Infrastructure", href: PAGE_URL.infrastructure }, { label: "host" }], time: "Last 1 hour", live: "live" },
  containerDetail: { c: window.ContainerDetailScreen, crumbs: [{ label: "Operate" }, { label: "Infrastructure", href: PAGE_URL.infrastructure }, { label: "container" }], time: "Last 1 hour", live: "live" },
  monitors:        { c: window.MonitorsScreen,        crumbs: [{ label: "Operate" }, { label: "Monitors", href: PAGE_URL.monitors }],                                  time: "Last 1 hour", live: "live" },
  monitorDetail:   { c: window.MonitorDetailScreen,   crumbs: [{ label: "Operate" }, { label: "Monitors", href: PAGE_URL.monitors }, { label: "monitor" }],            time: "Last 1 hour", live: "live" },
  newMonitor:      { c: window.NewMonitorScreen,      crumbs: [{ label: "Operate" }, { label: "Monitors", href: PAGE_URL.monitors }, { label: "New monitor" }],        time: "Last 1 hour", live: "live" },
  notifications:   { c: window.NotificationsScreen,   crumbs: [{ label: "Operate" }, { label: "Monitors", href: PAGE_URL.monitors }, { label: "Notifications" }],      time: "Last 1 hour", live: "live" },
  services:       { c: window.ServicesScreen,       crumbs: [{ label: "Observe" }, { label: "Services", href: PAGE_URL.services }],                         time: "Last 1 hour", live: "live" },
  serviceDetail:  { c: window.ServiceDetailScreen,  crumbs: [{ label: "Observe" }, { label: "Services", href: PAGE_URL.services }, { label: "payment-svc" }], time: "Last 1 hour", live: "live" },
  kafka:          { c: window.KafkaScreen,          crumbs: [{ label: "Operate" }, { label: "Saturation", href: PAGE_URL.saturation }, { label: "Kafka" }], time: "Last 1 hour", live: "live" },
  database:       { c: window.DatabaseScreen,       crumbs: [{ label: "Operate" }, { label: "Saturation", href: PAGE_URL.saturation }, { label: "Database" }], time: "Last 1 hour", live: "live" },
  logs:           { c: window.LogsScreen,           crumbs: [{ label: "Observe" }, { label: "Logs" }],                                                      time: "Last 2 days", live: "live" },
  traceList:      { c: window.TraceListScreen,      crumbs: [{ label: "Observe" }, { label: "Traces", href: PAGE_URL.traceList }],                          time: "Last 5 minutes", live: "paused" },
  trace:          { c: window.TraceScreen,          crumbs: [{ label: "Observe" }, { label: "Traces", href: PAGE_URL.traceList }, { label: "POST /api/v2/checkout" }], time: "Last 5 minutes", live: "paused" },
  llmobs:         { c: window.LLMObsScreen,          crumbs: [{ label: "Observe" }, { label: "LLM Observability", href: PAGE_URL.llmobs }], time: "Last 1 hour", live: "live" },
  bits:           { c: window.BitsScreen,            crumbs: [{ label: "Observe" }, { label: "Bits", href: PAGE_URL.bits }], time: "Last 1 hour", live: "live" },
  cloud:          { c: window.CloudScreen,           crumbs: [{ label: "Operate" }, { label: "Cloud", href: PAGE_URL.cloud }], time: "Last 1 hour", live: "live" },
  account:        { c: window.AccountScreen,         crumbs: [{ label: "Settings" }, { label: "Account", href: PAGE_URL.account }], time: "Last 30 days", live: "paused" },
  dashboards:      { c: window.DashboardListScreen,   crumbs: [{ label: "Observe" }, { label: "Custom dashboards", href: PAGE_URL.dashboards }], time: "Last 1 hour", live: "live" },
  dashboardDetail: { c: window.DashboardDetailScreen, crumbs: [{ label: "Observe" }, { label: "Custom dashboards", href: PAGE_URL.dashboards }, { label: "Payments — Production health" }], time: "Last 1 hour", live: "live" },
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "density": "comfortable",
  "theme": "light",
  "accentSet": ["#3b82f6","#a78bfa","#34d399"]
}/*EDITMODE-END*/;

const STORAGE_KEY = "optikk-tweaks";
function readPersistedTweaks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...TWEAK_DEFAULTS, ...JSON.parse(raw) };
  } catch (e) {}
  return TWEAK_DEFAULTS;
}

function App() {
  const screen = window.__OPTIKK_PAGE__ || "overview";
  const meta = SCREEN_REGISTRY[screen] || SCREEN_REGISTRY.overview;
  const params = getURLParams();

  const [t, setTweakBase] = useTweaks(readPersistedTweaks());
  const setTweak = (key, value) => {
    setTweakBase(key, value);
    // Persist across pages
    requestAnimationFrame(() => {
      try {
        const cur = readPersistedTweaks();
        const next = typeof key === "object" ? { ...cur, ...key } : { ...cur, [key]: value };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {}
    });
  };

  useEffectApp(() => {
    document.documentElement.setAttribute("data-theme", t.theme || "light");
    document.documentElement.setAttribute("data-density", t.density);
  }, [t.density, t.theme]);

  // Keep the Tweaks panel in sync when the floating toggle (or another tab) changes theme.
  useEffectApp(() => {
    const onThemeChange = (e) => {
      if (e.detail && e.detail !== t.theme) setTweak("theme", e.detail);
    };
    window.addEventListener("optikk:themechange", onThemeChange);
    return () => window.removeEventListener("optikk:themechange", onThemeChange);
  }, [t.theme]);

  useEffectApp(() => {
    if (Array.isArray(t.accentSet)) {
      const [brand, violet, ok] = t.accentSet;
      const r = document.documentElement.style;
      r.setProperty("--brand", brand);
      r.setProperty("--brand-2", brand);
      r.setProperty("--accent-violet", violet);
      r.setProperty("--ok", ok);
      r.setProperty("--brand-soft", brand + "1f");
      r.setProperty("--brand-tint", brand + "12");
      r.setProperty("--accent-violet-soft", violet + "1c");
    }
  }, [t.accentSet]);

  const Cur = meta.c;
  if (!Cur) return <div style={{ padding: 40 }}>Unknown screen: {screen}</div>;

  return (
    <div className="app">
      <Sidebar screen={screen} />
      <div style={{ display: "grid", gridTemplateRows: "var(--header-h) 1fr", minWidth: 0 }}>
        <Header screen={screen} crumbs={meta.crumbs} time={meta.time} live={meta.live} />
        <div className="main">
          <Cur go={goTo} params={params} />
        </div>
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Display" />
        <TweakRadio label="Theme" value={t.theme || "light"} onChange={v => setTweak("theme", v)} options={["light","dark"]}/>
        <TweakRadio label="Density" value={t.density} onChange={v => setTweak("density", v)} options={["comfortable","compact"]}/>
        <TweakSection label="Brand" />
        <TweakColor label="Accent palette" value={t.accentSet} onChange={v => setTweak("accentSet", v)} options={[
          ["#2563eb","#6366f1","#10b981"],
          ["#7c3aed","#06b6d4","#10b981"],
          ["#0ea5e9","#8b5cf6","#22c55e"],
          ["#ef4444","#f59e0b","#10b981"],
          ["#0f172a","#475569","#10b981"],
        ]}/>
        <TweakSection label="Navigate" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {Object.keys(PAGE_URL).map(k => (
            <a key={k} className="btn" href={PAGE_URL[k] + (k === "serviceDetail" ? "?id=payment-svc" : "")} style={{
              height: 30, justifyContent: "flex-start",
              background: screen === k ? "var(--brand-tint)" : "var(--bg-card)",
              color: screen === k ? "var(--brand-deep)" : "var(--fg-1)",
              fontSize: 11.5, textDecoration: "none"
            }}>
              <Icon name="chevron-right" size={12}/>{k}
            </a>
          ))}
        </div>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
