# Nginx Docker Setup with SSL

This directory contains the nginx configuration and Docker setup for the chartfolio.online domain with automatic SSL certificate management.

## Files

- `Dockerfile` - Docker image for nginx with SSL support
- `nginx.conf` - Full nginx configuration with HTTPS (used when certificates exist)
- `nginx-init.conf` - Initial nginx configuration without HTTPS (used before certificates are obtained)
- `docker-entrypoint.sh` - Entrypoint script that automatically switches between configs based on certificate availability

## SSL Certificate Management

### Initial Setup

1. Ensure your domain `chartfolio.online` points to your server's IP address
2. Make sure ports 80 and 443 are open and accessible
3. Run the initialization script from the project root:

```bash
./init-ssl.sh [your-email@example.com]
```

This script will:
- Start all required services
- Request SSL certificates from Let's Encrypt
- Configure nginx to use HTTPS
- Set up automatic certificate renewal

### Automatic Renewal

Certificates are automatically renewed every 12 hours by the `certbot` container. The renewal process:
- Checks if certificates are due for renewal (Let's Encrypt certificates expire after 90 days)
- Renews certificates if needed
- Certificates are stored in the `certbot-etc` Docker volume

**Note**: After certificate renewal, nginx needs to be reloaded to use the new certificates. You can:

1. **Manual reload** (after renewal):
   ```bash
   ./reload-nginx.sh
   ```

2. **Set up automatic reload** via cron (optional):
   Add this to your crontab to check and reload nginx daily:
   ```bash
   0 3 * * * cd /path/to/chartfolio && ./reload-nginx.sh
   ```

### Manual Renewal

If you need to manually renew certificates:

```bash
docker-compose run --rm certbot renew
./reload-nginx.sh
```

Or using docker compose (newer syntax):

```bash
docker compose run --rm certbot renew
./reload-nginx.sh
```

## How It Works

1. **Initial State**: When nginx starts without certificates, it uses `nginx-init.conf` which:
   - Listens on port 80 only
   - Handles Let's Encrypt challenges at `/.well-known/acme-challenge/`
   - Proxies all traffic to backend services

2. **After Certificate Generation**: The `docker-entrypoint.sh` script detects certificates and switches to `nginx.conf` which:
   - Redirects HTTP (port 80) to HTTPS (port 443)
   - Serves HTTPS traffic with SSL certificates
   - Proxies to backend services

3. **Certificate Renewal**: The certbot container runs continuously and renews certificates when needed. After renewal, you may need to reload nginx:

```bash
docker-compose exec nginx nginx -s reload
```

## Routing Configuration

The nginx configuration routes traffic as follows:

- `/` → `assets-web:4000` (Angular frontend)
- `/api` → `assets-server:3000/api` (API endpoints)
- `/auth` → `assets-server:3000/auth` (Authentication endpoints)

## Troubleshooting

### Certificates not being obtained

- Verify domain DNS points to your server: `dig chartfolio.online`
- Check that ports 80 and 443 are accessible from the internet
- Review certbot logs: `docker-compose logs certbot`
- Review nginx logs: `docker-compose logs nginx`

### Nginx fails to start

- Check if certificates exist: `docker-compose exec nginx ls -la /etc/letsencrypt/live/chartfolio.online/`
- Test nginx configuration: `docker-compose exec nginx nginx -t`
- Review nginx logs: `docker-compose logs nginx`

### Certificate renewal issues

- Check certbot logs: `docker-compose logs certbot`
- Manually test renewal: `docker-compose run --rm certbot renew --dry-run`
- Ensure certbot container has access to the certificate volumes

### Service connectivity issues

- Verify all services are on the same network: `docker-compose ps`
- Check network connectivity: `docker-compose exec nginx ping assets-server`
- Ensure services are running: `docker-compose ps`

## Environment Variables

You can set the following environment variables:

- `CERTBOT_EMAIL` - Email address for Let's Encrypt notifications (default: admin@chartfolio.online)

## Network Architecture

```
Internet
   ↓
Nginx (ports 80, 443)
   ├─→ assets-web:4000 (Angular frontend)
   ├─→ assets-server:3000/api (API endpoints)
   └─→ assets-server:3000/auth (Authentication)
```

All services communicate via the `chartfolio-network` Docker network.

