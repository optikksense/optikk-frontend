# Multi-stage build for React frontend

# Stage 1: Build the React app
FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the app
RUN yarn build

# Stage 2: Serve with NGINX
FROM nginx:alpine

# Install OpenSSL for certificate generation
RUN apk add --no-cache openssl

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create SSL directory
RUN mkdir -p /etc/nginx/ssl

# Generate self-signed SSL certificate
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/key.pem \
    -out /etc/nginx/ssl/cert.pem \
    -subj "/C=US/ST=State/L=City/O=Organization/OU=IT/CN=localhost"

# Expose non-privileged ports
EXPOSE 8080 8443

# Set default backend URL if not provided
ENV BACKEND_URL="http://backend:8080"

# Create startup script to substitute env vars and start nginx
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'set -e' >> /docker-entrypoint.sh && \
    echo 'envsubst '"'"'$BACKEND_URL'"'"' < /etc/nginx/conf.d/default.conf > /etc/nginx/conf.d/default.conf.tmp' >> /docker-entrypoint.sh && \
    echo 'mv /etc/nginx/conf.d/default.conf.tmp /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'exec nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

# Use the startup script as entrypoint
CMD ["/docker-entrypoint.sh"]