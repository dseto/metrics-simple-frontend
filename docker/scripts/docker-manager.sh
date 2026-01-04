#!/bin/bash

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

ACTION="${1:-up}"

echo "========================================"
echo "Metrics Simple Frontend - Docker Manager"
echo "========================================"
echo ""

case "$ACTION" in
  up|start)
    echo "[INFO] Building and starting containers..."
    docker compose build
    docker compose up -d
    echo "[DONE] Containers started"
    echo ""
    echo "Frontend: http://localhost:4200"
    echo "Backend:  http://localhost:8080"
    echo ""
    echo "[INFO] Waiting for services to be healthy..."
    sleep 3
    docker compose ps
    ;;
  down|stop)
    echo "[INFO] Stopping containers..."
    docker compose down
    echo "[DONE] Containers stopped"
    ;;
  restart)
    echo "[INFO] Restarting containers..."
    docker compose restart
    echo "[DONE] Containers restarted"
    ;;
  logs)
    echo "[INFO] Displaying logs..."
    docker compose logs -f angular-frontend
    ;;
  clean)
    echo "[INFO] Cleaning up containers and images..."
    docker compose down --volumes --remove-orphans
    echo "[DONE] Cleanup complete"
    ;;
  *)
    echo "Usage: ./docker-manager.sh [up|down|restart|logs|clean]"
    echo ""
    echo "Commands:"
    echo "  up       - Build and start containers"
    echo "  down     - Stop containers"
    echo "  restart  - Restart containers"
    echo "  logs     - Stream frontend logs"
    echo "  clean    - Remove containers and volumes"
    exit 0
    ;;
esac
