                         
FROM nginx:alpine


                  
COPY dist /usr/share/nginx/html


                   
COPY nginx.conf /etc/nginx/conf.d/default.conf

                             
EXPOSE 3000

                                         
ENV BACKEND_URL="http://query:19090"

                                                              
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'set -e' >> /docker-entrypoint.sh && \
    echo 'envsubst '"'"'$BACKEND_URL'"'"' < /etc/nginx/conf.d/default.conf > /etc/nginx/conf.d/default.conf.tmp' >> /docker-entrypoint.sh && \
    echo 'mv /etc/nginx/conf.d/default.conf.tmp /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'exec nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

                                                                  
RUN mkdir -p /var/cache/nginx /var/run && \
    sed -i 's|^pid .*|pid /tmp/nginx.pid;|' /etc/nginx/nginx.conf && \
    chown -R nginx:nginx /var/cache/nginx /var/run /etc/nginx /usr/share/nginx/html /docker-entrypoint.sh && \
    chmod -R 775 /etc/nginx/conf.d

USER nginx

                                      
CMD ["/docker-entrypoint.sh"]
