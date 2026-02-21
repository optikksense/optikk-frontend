# Observability Frontend (React + Vite)

React SPA for the observability platform. Built with Vite, served by nginx in production. All API calls are proxied by nginx to the backend — no CORS configuration needed.

## Tech stack

- React 18 + React Router v6
- Ant Design 5 (UI components)
- TanStack Query v5 (data fetching)
- Chart.js 4 (time-series charts)
- Zustand (state management)
- Axios (HTTP client)
- Vite (build tool)
- nginx (production server + reverse proxy)

---

## Docker

### Build

Run from the **project root** (the directory that contains `observability-frontend/`):

```bash
docker build -t observability-frontend ./observability-frontend
```

### Run standalone (backend already accessible at localhost:8080)

```bash
docker run -d \
  --name frontend \
  -p 80:80 \
  observability-frontend
```

The app is available at `http://localhost`.

> In this mode, nginx proxies `/api/*` and `/otlp/*` to `http://backend:8080`. For this to work the backend container must be on the same Docker network and named `backend` — see "Connecting the two containers" below.

---

## Connecting frontend and backend containers

nginx inside the frontend container proxies API traffic to the backend using the Docker DNS name `backend`. Both containers must be on the **same Docker network** and the backend container must be named `backend`.

```
Browser
  └─► frontend :80
        ├─► nginx /api/*    → http://backend:8080/api/
        ├─► nginx /otlp/*   → http://backend:8080/otlp/
        ├─► nginx /swagger/* → http://backend:8080/swagger/
        └─► nginx /*        → React SPA (index.html)
```

### Step-by-step

```bash
# 1. Create a shared network (only needed once)
docker network create observability-net

# 2. Start MySQL inside the same network (skip if MySQL runs on your host)
docker run -d \
  --name mysql \
  --network observability-net \
  -e MYSQL_ROOT_PASSWORD=root123 \
  -e MYSQL_DATABASE=observability \
  -p 3306:3306 \
  mysql:8.0

# 3. Build and start the backend — MUST be named "backend" to match nginx upstream
docker build -t observability-backend ./observability-orch-service

docker run -d \
  --name backend \
  --network observability-net \
  -p 8080:8080 \
  -p 9876:9876/udp \
  -e MYSQL_HOST=mysql \
  -e MYSQL_PORT=3306 \
  -e MYSQL_DATABASE=observability \
  -e MYSQL_USERNAME=root \
  -e MYSQL_PASSWORD=root123 \
  -e JWT_SECRET=change-me-in-production \
  observability-backend

# 4. Build and start the frontend
docker build -t observability-frontend ./observability-frontend

docker run -d \
  --name frontend \
  --network observability-net \
  -p 80:80 \
  observability-frontend
```

Everything is now running:

| URL | What you get |
|-----|-------------|
| `http://localhost` | React app (login page) |
| `http://localhost/api/...` | Backend REST API (proxied by nginx) |
| `http://localhost/swagger/index.html` | Swagger UI (proxied by nginx) |
| `http://localhost:8080` | Backend direct access (bypasses nginx) |

### Why containers can find each other

Docker assigns each container on the same network a DNS entry equal to its `--name`. So when nginx inside the `frontend` container resolves `backend`, Docker's internal DNS returns the IP of the `backend` container. No IP addresses or extra config needed.

### What happens if you name the backend something other than "backend"

The nginx upstream in `nginx.conf` is hardcoded to `http://backend:8080`. If you use a different `--name` for the backend container, either:
- Rename the container: `--name backend`
- Or create a Docker network alias: `--network-alias backend`

```bash
docker run -d \
  --name my-custom-backend-name \
  --network observability-net \
  --network-alias backend \        # ← nginx will resolve this
  ...
  observability-backend
```

---

## Local development (without Docker)

Requires Node 18+ and the backend running on `localhost:8080`.

```bash
cd observability-frontend
npm install
npm run dev
```

Vite's dev server starts on `http://localhost:3000` and proxies `/api/*` to `http://localhost:8080` (configured in `vite.config.js`).

The `VITE_API_BASE_URL` environment variable overrides the API base URL at build time:

```bash
# Point to a remote backend at build time
VITE_API_BASE_URL=http://my-backend:8080/api npm run build
```

---

## Deploying to Google Cloud

On GCP the frontend and backend run as separate **Cloud Run** services. You must push images to a registry before GCP can pull them.

### Option A — Docker Hub

```bash
# 1. Log in
docker login

# 2. Build and tag  (replace "youruser" with your Docker Hub username)
docker build -t youruser/observability-frontend:latest ./observability-frontend

# 3. Push
docker push youruser/observability-frontend:latest
```

### Option B — Google Artifact Registry (recommended)

```bash
# 1. Set your project and region
PROJECT=your-gcp-project-id
REGION=us-central1

# 2. Create a registry repository (once — shared with backend)
gcloud artifacts repositories create observability \
  --repository-format=docker \
  --location=$REGION \
  --project=$PROJECT

# 3. Authenticate Docker
gcloud auth configure-docker ${REGION}-docker.pkg.dev

# 4. Build and tag
docker build \
  -t ${REGION}-docker.pkg.dev/${PROJECT}/observability/frontend:latest \
  ./observability-frontend

# 5. Push
docker push ${REGION}-docker.pkg.dev/${PROJECT}/observability/frontend:latest
```

### Important: nginx backend URL on Cloud Run

On Cloud Run there is **no shared Docker network**, so the Docker DNS name `backend` does not resolve. nginx inside the frontend container must point to the Cloud Run backend's public HTTPS URL instead.

#### How to update nginx.conf before building

Edit [nginx.conf](nginx.conf) and replace the `proxy_pass` lines:

```nginx
# Local Docker (current default)
proxy_pass http://backend:8080/api/;

# Cloud Run — replace with your actual backend service URL
proxy_pass https://observability-backend-xxxx-uc.a.run.app/api/;
```

Then rebuild and push:

```bash
# After editing nginx.conf:
docker build \
  -t ${REGION}-docker.pkg.dev/${PROJECT}/observability/frontend:latest \
  ./observability-frontend

docker push ${REGION}-docker.pkg.dev/${PROJECT}/observability/frontend:latest
```

#### Deploy to Cloud Run

```bash
# Deploy backend first (see backend README), note its URL, then:
gcloud run deploy observability-frontend \
  --image=${REGION}-docker.pkg.dev/${PROJECT}/observability/frontend:latest \
  --region=$REGION \
  --platform=managed \
  --allow-unauthenticated \
  --port=80 \
  --project=$PROJECT
```

### Full GCP deployment order

```
1. Push backend image  →  deploy backend Cloud Run  →  note HTTPS URL
2. Edit nginx.conf with backend URL
3. Push frontend image  →  deploy frontend Cloud Run
4. Access app at the frontend Cloud Run URL
```

### Summary — what goes where on GCP

| Component | GCP service | Notes |
|-----------|------------|-------|
| Backend | Cloud Run | HTTPS only — UDP port 9876 not available, use OTLP/HTTP |
| Frontend | Cloud Run | nginx serves SPA + proxies to backend Cloud Run URL |
| MySQL | Cloud SQL | Managed MySQL 8.0 |
| Images | Artifact Registry | `{region}-docker.pkg.dev/{project}/observability/` |

See the **backend README** for Cloud SQL setup and backend Cloud Run deployment steps.

---

## Code layout

```
src/
  App.jsx               Root component + route definitions
  main.jsx              Entry point
  config/
    constants.js        API endpoints, themes, time ranges, enums
  services/
    api.js              Axios instance with auth interceptors
    authService.js
    v1Service.js        Advanced analytics endpoints
    dashboardService.js
    alertService.js
    ...
  pages/                43+ page components (one per route)
  components/           Shared UI components
  hooks/                Custom React hooks
  store/                Zustand state stores
  utils/
nginx.conf              nginx config used in the Docker image
Dockerfile              Multi-stage build (Vite → nginx)
vite.config.js          Vite config + dev proxy
```
