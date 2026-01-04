# Docker Setup - Metrics Simple Frontend

Complete containerization setup for the Angular frontend application using Docker Desktop.

## Files Created

- **Dockerfile** - Multi-stage build with Node.js 20 LTS + nginx 1.27 Alpine
- **.dockerignore** - Excludes unnecessary files from build context
- **docker-compose.yml** - Orchestrates frontend and backend services
- **nginx.conf** - Nginx configuration with SPA routing and caching
- **.env.example** - Environment variables template
- **scripts/docker-manager.ps1** - PowerShell script to manage containers (Windows)
- **scripts/docker-manager.sh** - Shell script to manage containers (Linux/Mac)
- **scripts/docker-health.ps1** - Health check script (Windows)
- **scripts/docker-health.sh** - Health check script (Linux/Mac)

## Quick Start (Windows PowerShell)

```powershell
# Start containers
.\scripts\docker-manager.ps1 up

# Check health
.\scripts\docker-health.ps1

# View logs
.\scripts\docker-manager.ps1 logs

# Stop containers
.\scripts\docker-manager.ps1 down

# Clean up
.\scripts\docker-manager.ps1 clean
```

## Quick Start (Linux/macOS Bash)

```bash
# Start containers
./scripts/docker-manager.sh up

# Check health
./scripts/docker-health.sh

# View logs
./scripts/docker-manager.sh logs

# Stop containers
./scripts/docker-manager.sh down

# Clean up
./scripts/docker-manager.sh clean
```

## Manual Docker Commands

### Build and Start

```bash
docker compose build
docker compose up -d
```

### View Services

```bash
docker compose ps
docker compose logs angular-frontend
docker compose logs csharp-api
```

### Stop Services

```bash
docker compose down
```

## Access Points

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:8080
- **API Proxy**: Frontend routes to /api/* through nginx to backend

## Environment Configuration

Create `.env` file in project root (or use `.env.example`):

```env
NODE_ENV=production
API_BASE_URL=http://localhost:8080/api/v1
E2E_API_MODE=mock
E2E_MOCK_API_URL=http://localhost:3000
E2E_BASE_URL=http://localhost:4200
```

## Architecture

### Build Stage
- Node.js 20 LTS Alpine image
- Installs dependencies with `npm ci --legacy-peer-deps`
- Builds Angular application with production configuration
- Output directory: `dist/metrics-simple`

### Runtime Stage
- nginx 1.27 Alpine image (minimal footprint)
- Serves built Angular application
- Single Page Application (SPA) routing fallback
- Cache headers for static assets (1 year)
- Gzip compression enabled
- HEALTHCHECK configured

## Features

### Multi-stage Build
- Reduces final image size (~100MB)
- Separates build dependencies from runtime
- Improves build caching

### SPA Routing
- All non-static routes fallback to index.html
- Enables client-side routing
- Assets (*.js, *.css, *.png, etc.) return 404 if not found

### Healthcheck
- Runs every 30 seconds
- Uses wget to test http://localhost/
- Fails after 3 consecutive failures
- Initial delay of 5 seconds before first check

### Networking
- Services communicate via service name (`csharp-api:8080`)
- Bridge network: `metrics-net`
- Frontend depends on backend service

## Validation Checklist

After running `docker compose up -d`:

1. **Frontend Running**
   ```bash
   curl http://localhost:4200
   # Should return HTTP 200 with HTML content
   ```

2. **Services List**
   ```bash
   docker compose ps
   # Both angular-frontend and csharp-api should be running
   ```

3. **Health Status**
   ```bash
   docker compose ps
   # Look for "healthy" in HEALTHCHECK column
   ```

4. **Logs**
   ```bash
   docker compose logs angular-frontend
   # Should show nginx startup messages
   ```

## Troubleshooting

### Port Already in Use
```bash
# Change port mapping in docker-compose.yml
# Example: "8080:80" instead of "4200:80"
docker compose down
docker compose up -d
```

### Backend Not Reachable
```bash
# Check if backend service is running
docker compose ps csharp-api

# Verify backend URL in environment
docker compose logs csharp-api
```

### Build Fails
```bash
# Clear cache and rebuild
docker compose down
docker system prune -a
docker compose build --no-cache
```

### SPA Routing Not Working
```bash
# Verify nginx.conf try_files directive
# Should route all non-asset requests to index.html
docker compose exec angular-frontend cat /etc/nginx/nginx.conf
```

## Docker Desktop Requirements

- Docker Desktop 4.0+
- 2GB RAM minimum (4GB+ recommended)
- 2 CPU cores minimum
- 10GB disk space

## Performance Optimization

### Build Caching
- Dependencies layer cached separately
- Source code changes don't rebuild npm dependencies
- Significantly faster rebuilds

### Image Size
- Build: ~1.2GB (temporary, discarded)
- Final: ~100MB (slim nginx + app)
- Runtime memory: ~50MB

### Asset Caching
- Static assets cached for 1 year
- ETags enabled for validation
- Gzip compression reduces transfer size

## Security Notes

- Runs as nginx user in container (not root)
- No secrets in Dockerfile
- Environment variables passed via docker-compose.yml
- HEALTHCHECK endpoint is public (/ route)

## Next Steps

1. Build backend image: `docker build -t metrics-simple-api:latest .`
2. Update `docker-compose.yml` backend image name/tag
3. Run `docker compose up` to orchestrate both services
4. Access frontend at http://localhost:4200
