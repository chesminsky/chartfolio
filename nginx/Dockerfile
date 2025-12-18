FROM nginx:alpine

# Copy nginx configurations
COPY nginx.conf /etc/nginx/conf.d/nginx.conf
COPY nginx-init.conf /etc/nginx/conf.d/nginx-init.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh

# Create directory for certbot webroot
RUN mkdir -p /var/www/certbot && \
    chmod +x /docker-entrypoint.sh

# Expose ports
EXPOSE 80 443

# Use custom entrypoint to check for SSL certificates
ENTRYPOINT ["/docker-entrypoint.sh"]

