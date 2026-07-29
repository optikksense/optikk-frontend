# Stage 1: Build static assets
FROM node:22-alpine AS builder
WORKDIR /app

# Enable Corepack for Yarn
RUN corepack enable

# Install dependencies deterministically (cached layer)
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source code and build production assets
COPY . .
RUN yarn build

# Stage 2: Serve static assets with unprivileged NGINX
FROM nginxinc/nginx-unprivileged:alpine

# Copy built static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy NGINX configuration template
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Environment variables for template expansion
ENV BACKEND_URL="http://query:19090"
# Filter envsubst to ONLY substitute BACKEND_URL (preserves NGINX variables like $host, $remote_addr)
ENV NGINX_ENVSUBST_FILTER="BACKEND_URL"

EXPOSE 3000

# Explicit non-root user declaration for static container scanners
USER 101
