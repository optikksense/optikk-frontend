# Docker — Optic Frontend

Reference guide for building, tagging, and publishing the frontend image to Docker Hub.

---

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) ≥ 24
- A Docker Hub account with push access to the repository
- Logged in: `docker login`

---

## Image details

| Attribute | Value |
|---|---|
| Served by | NGINX (alpine) |
| Exposed ports | `8080` (HTTP), `8443` (HTTPS) |
| Build base | `node:18-alpine` |
| Runtime base | `nginx:alpine` |
| SSL | Self-signed cert generated at build time |

---

## 1 · Build

Run from the repo root (where `Dockerfile` lives):

```bash
# Syntax: docker build -t <image>:<tag> .
docker build -t optic-frontend:latest .
```

Pass `--platform` for a specific target architecture:

```bash
docker build --platform linux/amd64 -t optic-frontend:latest .
```

### How the build works

The Dockerfile uses a **two-stage build**:

1. **Builder stage (`node:18-alpine`)** — runs `npm ci` then `npm run build`, producing the static assets in `/app/dist`.
2. **Runtime stage (`nginx:alpine`)** — copies `dist/` to NGINX's web root, injects `nginx.conf`, generates a self-signed TLS certificate, and creates a startup script that rewrites `$BACKEND_URL` in the NGINX config via `envsubst` before starting NGINX.

---

## 2 · Tag

Always tag with both a version and `latest`:

```bash
# Replace <dockerhub-username> and <version> as appropriate
docker tag optic-frontend:latest <dockerhub-username>/optic-frontend:latest
docker tag optic-frontend:latest <dockerhub-username>/optic-frontend:<version>

# Example
docker tag optic-frontend:latest ramantayal/optic-frontend:latest
docker tag optic-frontend:latest ramantayal/optic-frontend:1.0.0
```

---

## 3 · Push

```bash
docker push <dockerhub-username>/optic-frontend:latest
docker push <dockerhub-username>/optic-frontend:<version>

# Example
docker push ramantayal/optic-frontend:latest
docker push ramantayal/optic-frontend:1.0.0
```

---

## 4 · One-liner (build → tag → push)

```bash
VERSION=1.0.0
REPO=ramantayal/optic-frontend

docker build --platform linux/amd64 -t $REPO:$VERSION -t $REPO:latest . \
  && docker push $REPO:$VERSION \
  && docker push $REPO:latest
```

---

## 5 · Multi-platform builds (BuildKit)

```bash
# One-time setup — create a multi-platform builder
docker buildx create --use --name multi-builder

VERSION=1.0.0
REPO=ramantayal/optic-frontend

docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag $REPO:$VERSION \
  --tag $REPO:latest \
  --push \
  .
```

> **Note:** `--push` is required with `buildx` because multi-platform images can't be loaded into the local Docker daemon directly.

---

## 6 · Running the image locally

```bash
docker run --rm \
  -p 8080:8080 \
  -p 8443:8443 \
  -e BACKEND_URL="http://localhost:9000" \
  ramantayal/optic-frontend:latest
```

The startup script substitutes `$BACKEND_URL` into `nginx.conf` at container start, so you can point the container at any backend without rebuilding.

---

## 7 · Environment variables (runtime)

| Variable | Default | Description |
|---|---|---|
| `BACKEND_URL` | `http://backend:8080` | URL of the Optikk backend API, injected into the NGINX reverse-proxy config |

---

## 8 · NGINX configuration

The container reads `nginx.conf` from the image at `/etc/nginx/conf.d/default.conf`. To override it, bind-mount your own config:

```bash
docker run --rm \
  -p 8080:8080 \
  -v $(pwd)/my-nginx.conf:/etc/nginx/conf.d/default.conf \
  -e BACKEND_URL="http://api.optikk.io" \
  ramantayal/optic-frontend:latest
```

---

## 9 · CI / GitHub Actions snippet

```yaml
- name: Build and push frontend image
  uses: docker/build-push-action@v5
  with:
    context: .
    platforms: linux/amd64,linux/arm64
    push: true
    tags: |
      ramantayal/optic-frontend:${{ github.sha }}
      ramantayal/optic-frontend:latest
```
