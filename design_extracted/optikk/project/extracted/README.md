# Optikk — extracted source

Observability product mockup (Datadog-style), unbundled from self-contained HTML
into clean, editable source. Multi-page React app rendered with in-browser Babel.

## Run it
Static files — serve the folder and open any page (browsers block `file://` module
loads, so use a local server):

```
cd extracted
python3 -m http.server 8000
# open http://localhost:8000/index.html  (redirects to Overview.html)
```

## Layout

```
*.html        One file per screen. Each sets window.__OPTIKK_PAGE__ then loads,
              in order: lib/react, lib/react-dom, lib/babel, src/tweaks-panel,
              src/core, the screen module(s) it needs, then src/app last.
lib/          Vendor libs (React 18.3.1 dev, ReactDOM dev, Babel standalone).
src/          App source (JSX, transpiled in-browser via Babel).
fonts/        Inter woff2 subsets (referenced from each page's inline @font-face).
favicon.svg   App logo / favicon.
```

## src/ modules

| File | Exports (window.*) |
|------|--------------------|
| `core.jsx` | Icon, Sidebar, Header, AreaSpark, MiniSpark, Bars, HexGrid, PageHeader, Tabs, seededWave, goTo, getURLParams, PAGE_URL, FilterSearchBar, FiltersPage, FilterChip |
| `app.jsx` | SCREEN_REGISTRY + `<App>` + `ReactDOM.createRoot(...).render()` (loaded last) |
| `tweaks-panel.jsx` | TweaksPanel, useTweaks, Tweak* controls |
| `screens-services.jsx` | OverviewScreen, SaturationScreen, ServicesScreen, ServiceDetailScreen |
| `screens-infra.jsx` | InfrastructureScreen, HostDetailScreen, ContainerDetailScreen, KafkaScreen, DatabaseScreen, LogsScreen |
| `screens-monitors.jsx` | MonitorsScreen, MonitorDetailScreen, NewMonitorScreen, NotificationsScreen, TraceListScreen, TraceScreen |
| `llm-observability.jsx` | LLMObsScreen + shared LLM helpers (KPI, VendorChip, fmtTok…) — also used by Bits |
| `account.jsx` | AccountScreen |
| `bits.jsx` | BitsScreen |
| `cloud.jsx` | CloudScreen |
| `dashboards.jsx` | DashboardListScreen |
| `dashboard-detail.jsx` | DashboardDetailScreen |
| `metrics.jsx` | MetricsScreen + BigChart, Heatmap, QueryRow, Chip |

Modules share code via `window.*` globals (each `<script type="text/babel">` gets
its own scope), so load order in the HTML matters: `core` → screen modules → `app`.

## Notes
- Theme (dark/light), density, and accent palette are persisted in `localStorage`
  under `optikk-tweaks` and applied via `data-theme` / `data-density` + CSS vars.
- Babel runs in the browser (dev convenience). For production, precompile the JSX
  in `src/` and drop the Babel `<script>` + `type="text/babel"` tags.
- Originals (single-file bundles) are in `uploads/Learning/bundled/` if needed.
