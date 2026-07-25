# Stage: Serve with NGINX
FROM nginx:alpine


# Copy built files
COPY dist /usr/share/nginx/html


# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose non-privileged ports
EXPOSE 3000

# Set default backend URL if not provided
ENV BACKEND_URL="http://backend:8080"

# Create startup script to substitute env vars and start nginx
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'set -e' >> /docker-entrypoint.sh && \
    echo 'envsubst '"'"'$BACKEND_URL'"'"' < /etc/nginx/conf.d/default.conf > /etc/nginx/conf.d/default.conf.tmp' >> /docker-entrypoint.sh && \
    echo 'mv /etc/nginx/conf.d/default.conf.tmp /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'exec nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

# Change ownership of nginx directories to the non-root nginx user
RUN mkdir -p /var/cache/nginx /var/run && \
    sed -i 's|^pid .*|pid /tmp/nginx.pid;|' /etc/nginx/nginx.conf && \
    chown -R nginx:nginx /var/cache/nginx /var/run /etc/nginx /usr/share/nginx/html /docker-entrypoint.sh && \
    chmod -R 775 /etc/nginx/conf.d

USER nginx

# Use the startup script as entrypoint
CMD ["/docker-entrypoint.sh"]
