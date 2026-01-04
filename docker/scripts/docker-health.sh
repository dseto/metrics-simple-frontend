#!/bin/bash

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

SERVICE="${1:-all}"

echo "========================================"
echo "Metrics Simple - Docker Health Check"
echo "========================================"
echo ""

SERVICES=("angular-frontend" "csharp-api")
HEALTHY_COUNT=0

if [ "$SERVICE" != "all" ]; then
    SERVICES=("$SERVICE")
fi

for svc in "${SERVICES[@]}"; do
    echo "Checking $svc..."
    
    STATUS=$(docker compose ps "$svc" --format='{{.State}}' 2>/dev/null || echo 'error')
    
    if [ "$STATUS" = "running" ] || [[ "$STATUS" == Up* ]]; then
        echo "  [OK] Container is running"
        ((HEALTHY_COUNT++))
    else
        echo "  [FAIL] Container is not running (Status: $STATUS)"
    fi
done

echo ""
echo "========================================"
echo "Summary: $HEALTHY_COUNT/${#SERVICES[@]} services healthy"
echo "========================================"

if [ "$HEALTHY_COUNT" -eq "${#SERVICES[@]}" ]; then
    echo ""
    echo "[DONE] All services are healthy"
    exit 0
else
    echo ""
    echo "[INFO] Run 'docker compose logs' for more details"
    exit 1
fi
