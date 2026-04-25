# Frontend Data Flow

Covers initial load, authentication, data fetching, refresh, and the dashboard vs. explorer query distinction.

---

## Application bootstrap

```mermaid
flowchart TD
    MAIN["src/main.tsx\nReactDOM.createRoot.render(App)"]
    MAIN --> APP

    subgraph APP ["src/app/App.tsx"]
        EB["ErrorBoundary"]
        EB --> QCP["AppQueryClientProvider\n(TanStack Query client)"]
        QCP --> TP["ThemeProvider\n(reads persisted theme from Zustand)"]
        TP --> PANELS["DashboardPanelRegistryProvider\n─\nmerge 12 built-in panels\n+ domain-contributed panels\n(registered in App.tsx per domain)"]
        PANELS --> ROUTER["RouterProvider\nsrc/app/routes/router.tsx"]
    end

    ROUTER --> ROUTE_MATCH["TanStack Router\nmatch URL → load route component\n(lazy import per domain)"]

    ROUTE_MATCH --> AUTH_BG["useAuthValidation()\nbackground — non-blocking\ndoes NOT gate initial render"]
    ROUTE_MATCH --> PROTECTED

    subgraph PROTECTED ["ProtectedRoute gate"]
        SESSION_CHECK{"session cookie\nvalid?"}
        SESSION_CHECK -->|yes| PAGE["render page component"]
        SESSION_CHECK -->|no| LOGIN["redirect → /login"]
    end
```

---

## Auth flow (web UI)

```mermaid
flowchart TD
    LOGIN_PAGE["POST /api/v1/auth/login\n(email + password)"]
    LOGIN_PAGE -->|success| COOKIE["session cookie set\n(HTTP-only, Secure)"]
    COOKIE --> APP_RENDER["app renders with\npersisted Zustand state\n(teamId, timeRange, theme, preferences)"]

    subgraph INTERCEPTOR ["src/shared/api/api/client.ts — Axios interceptors"]
        EVERY_REQ["every API call\n─\nautomatically carries session cookie"]
        EVERY_REQ -->|401 response| REDIR["redirect → /login\n(AuthExpiryListener)"]
        EVERY_REQ -->|200| DATA["unwrap {success, data, error} envelope\n→ return data"]
    end

    subgraph BACKGROUND ["useAuthValidation()"]
        POLL["background validation\ncall GET /api/v1/auth/me\n─\nNOT blocking: UI renders optimistically\nif session expired → redirect /login"]
    end
```

---

## Data fetching patterns

```mermaid
flowchart TD
    subgraph EXPLORER ["Explorer queries\n(logs, traces, metrics explorers)"]
        EQ["useStandardQuery / useQuery\n─\nqueryKey includes refreshKey\nstaleTime: 5 000 ms\nretry: 2\nplaceholderData: keepPreviousData"]
        EQ -->|refreshKey changes| REFETCH_E["auto re-fetch\n(time range change or manual refresh)"]
    end

    subgraph DASHBOARD ["Dashboard queries\n(hub pages, chart cards)"]
        DQ["useStandardQuery / useQuery\n─\nstable queryKey — NO refreshKey\nstaleTime: 5 000 ms\nretry: 2\nplaceholderData: keepPreviousData"]
        DQ --> INVALIDATE["useInvalidateQueriesOnAppRefresh\n(refreshKey, queryKeyPrefix, teamId)\n─\nwatches refreshKey in Zustand\non change: queryClient.invalidateQueries\n→ triggers re-fetch"]
    end

    subgraph LOADING ["Loading state convention"]
        LS["isPending && data === undefined\n─\nshow skeleton / spinner\n\nNOT: isLoading (true on background refetch too)"]
    end

    subgraph CLIENT ["src/shared/api/api/client.ts"]
        AXIOS["Axios instance\nauto-unwrap {success, data, error}\nbase URL: /api (proxied to backend)"]
    end
```

---

## Global store and refresh cycle

```mermaid
flowchart TD
    subgraph STORE ["src/app/store/appStore.ts — Zustand (persisted)"]
        STATE["Persisted state:\nselectedTeamId\ntimeRange (relative or absolute)\nsidebarCollapsed\nautoRefreshInterval\ntheme / timezone\ncomparisonMode\nviewPreferences\nrecentPages\n─\nEphemeral:\nrefreshKey: number"]
    end

    subgraph TRIGGERS ["Refresh triggers"]
        T1["setTimeRange(range)\n─\nupdates timeRange\nincrements refreshKey"]
        T2["triggerRefresh()\n─\nincrements refreshKey only\n(manual refresh button or Cmd+R)"]
        T3["useAutoRefresh\n─\npolls at autoRefreshInterval\ncalls triggerRefresh()"]
    end

    T1 --> REFRESH_KEY["refreshKey++"]
    T2 --> REFRESH_KEY
    T3 --> REFRESH_KEY

    REFRESH_KEY -->|explorer queries| AUTO_REFETCH["query key changed\n→ TanStack Query auto-refetches"]
    REFRESH_KEY -->|dashboard queries| INVALIDATE2["useInvalidateQueriesOnAppRefresh\n→ queryClient.invalidateQueries\n→ background refetch"]
```

---

## Domain registry and routing

```mermaid
flowchart TD
    REG["src/app/registry/domainRegistry.ts\n7 registered domains:\noverview, saturation, metrics,\nlogs, traces, infrastructure, settings"]

    REG --> CONFIG["Each DomainConfig:\n- id\n- routes  (lazy-loaded)\n- navItems (sidebar)\n- dashboardPanels (optional)\n- hub page (optional)"]

    CONFIG --> ROUTER2["src/app/routes/router.tsx\n─\nprotected routes from domain configs\nmarketing routes (separate shell)\nlegacy redirects\nglobal fallback → /overview"]

    ROUTER2 --> EXPLORER_SHARED["src/features/explorer/\n(NOT a domain — shared utilities)\n─\nDSL search + tokenisation\nfacet state management\nanalytics + trend visualisation\nused by: logs, traces, metrics"]
```

---

## Dashboard panel system

```mermaid
flowchart TD
    REG_PANELS["DashboardPanelRegistryProvider\n─\n12 built-in panels (builtInDashboardPanels.tsx)\n+ domain panels registered in App.tsx"]

    REG_PANELS --> RESOLVE["useDashboardPanelRegistration(panelType)\n─\nlookup in registry context\nreturns: component + lifecycle hooks"]

    RESOLVE --> CARD["ConfigurableChartCard\n─\ncalls onMount, onDataUpdate, onGlobalTimeChange\nas data / time range changes"]

    CARD --> PANEL_KINDS["Panel kinds:\nbase-chart    — standard chart wrapper\nspecialized   — custom layout\nself-contained — manages own data"]
```

---

## URL state synchronisation

Explorers and hub tabs keep their state in the URL so links are shareable:

| Hook | What it syncs |
|------|--------------|
| `useTimeRangeURL()` | `startMs`, `endMs` or relative range |
| `useURLFilters()` | filter/query DSL string |
| `useUrlSyncedTab()` | active tab name |
| `useSearchParamsCompat()` | generic search param read/write |

Navigation to dynamic paths uses `dynamicNavigateOptions(to, search?)` and `dynamicTo(path)` from `src/shared/utils/navigation.ts` — these replace `as any` casts for TanStack Router branded path types.
