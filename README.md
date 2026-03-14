# Optikk Lens Frontend

React + Vite single-page application (SPA) for the Optikk observability platform. Built with TypeScript, Ant Design, and TanStack Query for advanced telemetry visualization (traces, logs, metrics, service topology, RED metrics, error tracking, and more).

## Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- A running Optikk Lens backend at `http://localhost:9090` (or set `VITE_BACKEND_URL`)

### Local Development

```bash
# Install dependencies
npm install

# Start the dev server (http://localhost:3000 or http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**Development defaults to proxying `/api/*` to `http://localhost:9090`** — no CORS configuration needed locally.

---

## Docker Deployment

### Pull the Image from GHCR

```bash
docker pull ghcr.io/optikk-org/optikk-lens-frontend:latest
```

Or pull a specific version:

```bash
docker pull ghcr.io/optikk-org/optikk-lens-frontend:v1.0.123
```

### Run as a Container

```bash
docker run -d \
  --name optikk-frontend \
  -p 8443:8443 \
  -e BACKEND_URL=http://localhost:9090 \
  ghcr.io/optikk-org/optikk-lens-frontend:latest
```

**Note:** The frontend runs HTTPS on port 8443 with a self-signed certificate. Access at `https://localhost:8443` (accept the SSL warning).

#### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `BACKEND_URL` | Backend API base URL | `http://localhost:9090` |
| `PORT` | Container port | `8443` |

---

## Full Stack with Docker Compose

Deploy backend, frontend, MySQL, and ClickHouse together:

```bash
# From the frontend directory
docker-compose up -d
```

Or manually with Podman:

```bash
# Create a shared network
podman network create observability-net

# 1. MySQL
podman run -d --name mysql --network observability-net \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=root123 \
  -e MYSQL_DATABASE=observability \
  -v mysql-data:/var/lib/mysql \
  mariadb:11.4

# 2. ClickHouse
podman run -d --name clickhouse --network observability-net \
  -p 9000:9000 -p 8123:8123 \
  -e CLICKHOUSE_DB=observability \
  -e CLICKHOUSE_USER=default \
  -e CLICKHOUSE_PASSWORD=clickhouse123 \
  --ulimit nofile=262144:262144 \
  -v clickhouse-data:/var/lib/clickhouse \
  clickhouse/clickhouse-server:26.2

# 3. Backend
podman run -d --name backend --network observability-net \
  -p 9090:9090 \
  -e PORT=9090 \
  -e MYSQL_HOST=mysql \
  -e CLICKHOUSE_HOST=clickhouse \
  -e JWT_SECRET=your-secret-key-here \
  ghcr.io/optikk-org/optikk-lens:latest

# 4. Frontend
podman run -d --name frontend --network observability-net \
  -p 8443:8443 \
  -e BACKEND_URL=http://backend:9090 \
  ghcr.io/optikk-org/optikk-lens-frontend:latest

# Verify
podman logs backend
podman logs frontend

# Access at https://localhost:8443
```

---

## Project Structure

```
optic-frontend/
├── src/
│   ├── app/                 # App-level layout & routing
│   ├── pages/               # Top-level page components
│   ├── features/            # Feature-specific modules
│   │   ├── traces/          # Trace listing & detail
│   │   ├── spans/           # Span analysis
│   │   ├── services/        # Service topology & details
│   │   ├── metrics/         # Dashboards (RED, saturation, resource utilization)
│   │   ├── log/             # Log search & filtering
│   │   ├── errors/          # Error tracking & analysis
│   │   ├── overview/        # Dashboard aggregations
│   │   └── ...
│   ├── shared/              # Shared components & utilities
│   │   ├── components/      # Reusable UI components
│   │   ├── api/             # API service clients
│   │   ├── hooks/           # Custom React hooks
│   │   └── utils/           # Helper functions
│   ├── store/               # App state management (Zustand)
│   ├── config/              # App configuration
│   └── main.tsx             # Entry point
├── public/                  # Static assets
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── package.json             # Dependencies
```

---

## Key Features

### Traces & Spans
- **Trace List** — Filter by service, operation, latency, error status
- **Trace Detail** — Waterfall visualization with:
  - Critical path highlighting
  - Error path tracking
  - Span event inspector (exceptions, logs)
  - Self-time breakdown per span
  - Related trace discovery
  - Full attribute viewer (DB statements, RPC details, resource attributes)

### Services
- **Service List** — Overview of all services, throughput, error rate, p95 latency
- **Service Detail** — Service-specific metrics, dependencies, topology
- **Service Map** — Visualize upstream/downstream dependencies with latency

### Dashboards & Metrics
- **Overview** — Summary of platform health (tabbed: Summary / Errors / SLOs)
- **RED Metrics** — Rate, Error %, Duration by operation (tabbed)
- **Saturation** — Kafka consumer lag, queue depths, resource utilization
- **Resource Utilization** — CPU, memory, disk, network by service & instance
- **SLO/SLI** — SLO tracking and burn-down rates

### Logs
- **Log Search** — Full-text search with field filters & time range
- **Saved Searches** — Store & reuse query filters
- **Column Presets** — Quick column layout switching (Default / APM / Kubernetes / Verbose)
- **Attribute Inspector** — Expandable JSON tree for detailed log attributes
- **Keyboard Shortcuts** — `j/k` navigation, `/` search, `Esc` escape

### Errors
- **Error Dashboard** — Exception types, error rates, affected services
- **Error Hotspot** — Error rate matrix by service × operation
- **HTTP 5xx Analysis** — 5xx errors by route

---

## Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Run ESLint
npm run type-check      # TypeScript type checking

# Building Docker image locally
docker build -t optikk-frontend:latest .
```

---

## Authentication

The frontend uses JWT token-based authentication:

1. **Login** — Enter credentials on the login page to receive a JWT
2. **Token Storage** — JWT is stored in an httpOnly cookie (secure, XSS-protected)
3. **Auto-Refresh** — Token refresh happens automatically before expiry
4. **Logout** — Clears the JWT cookie

All `/api/v1/*` requests include the JWT in the `Authorization: Bearer <token>` header.

---

## Configuration

### Vite Environment Variables

Create a `.env.local` file or use system variables:

```env
VITE_BACKEND_URL=http://localhost:9090
VITE_API_TIMEOUT=30000
```

These are injected at build time into the frontend bundle.

### Dashboard Customization

Dashboards (Overview, Metrics, etc.) pull configuration from the backend:

- `GET /api/v1/dashboard-config/:pageId` — Fetch dashboard layout & charts
- Charts are configured via YAML stored in MySQL
- Tab support for multi-tab dashboards (Overview has Summary / Errors / SLOs)

---

## Styling

- **Ant Design** — UI component library
- **Tailwind CSS** — Utility-first styling
- **CSS Modules** — Component-scoped styles in `*.module.css` files
- **Color System** — Defined in `src/config/colorLiterals.ts`

---

## State Management

Uses **Zustand** for lightweight app state:

- **appStore** — Global app state (theme, time range, user session, refresh key)
- **Query-based state** — TanStack Query handles async data fetching

Example:

```typescript
import { useAppStore } from '@store/appStore';

function MyComponent() {
  const { refreshKey, setRefreshKey } = useAppStore();

  return <button onClick={() => setRefreshKey(Date.now())}>Refresh</button>;
}
```

---

## API Integration

All API calls go through service clients in `src/shared/api/`:

- `tracesService` — Trace queries
- `servicesService` — Service & topology endpoints
- `metricsService` — RED metrics, resource utilization
- `logsService` — Log search
- `errorService` — Error tracking
- etc.

Each service uses the base fetch helper with automatic JWT injection and error handling:

```typescript
import { tracesService } from '@shared/api/tracesService';

const traces = await tracesService.getTraces(teamId, startMs, endMs, {
  serviceName: 'payment-api',
  operation: 'charge',
  limit: 100,
});
```

---

## Performance

- **Code Splitting** — Routes lazy-loaded via React.lazy
- **Query Caching** — TanStack Query caches API responses intelligently
- **Memoization** — useMemo/useCallback prevent unnecessary re-renders
- **Virtual Scrolling** — Long lists use virtual scroll (e.g., log tables)
- **Waterfall Charts** — Optimized rendering for large traces (1000+ spans)

---

## Development & Contributing

### Code Style

- **TypeScript strict mode** — All files must pass type checking
- **ESLint** — Enforced linting rules
- **Path aliases** — Use `@shared/*`, `@features/*`, `@services/*`, etc. (see `tsconfig.json`)

### Adding a New Feature

1. Create a new directory under `src/features/<featureName>/`
2. Organize: `pages/` → `components/` → `hooks/` → `types.ts`
3. Add API service methods to `src/shared/api/`
4. Register routes in `src/app/App.tsx`
5. Test with `npm run dev`

### TypeScript Strict Checks

```bash
npm run type-check
```

Ensure no `any` types and all types are properly defined.

---

## Troubleshooting

### CORS Errors

**Local dev:** Vite proxy handles `/api/*` → backend automatically.

**Production:** Backend must have `ALLOWED_ORIGINS` env var set to the frontend domain (e.g., `https://observability.example.com`).

### JWT Token Expired

The frontend automatically refreshes tokens before expiry. If you see "Unauthorized" errors:
1. Check browser console for JWT errors
2. Verify backend's `JWT_SECRET` matches across deployments
3. Clear cookies and re-login

### Slow Dashboard Loads

- Check backend response times: `curl -I http://localhost:9090/api/v1/health`
- Review browser DevTools Network tab for slow API calls
- Consider narrowing the time range on dashboards
- Check ClickHouse & MySQL query performance

---

## License

This project is part of Optikk. See LICENSE file for details.
