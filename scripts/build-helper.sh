#!/bin/bash
# Script helper para gerenciar builds por ambiente
# Uso: ./build-helper.sh [local|staging|production]

set -e

ENVIRONMENT=${1:-production}

echo "🚀 Building Metrics Simple Frontend"
echo "📦 Environment: $ENVIRONMENT"
echo ""

case $ENVIRONMENT in
  local|dev|development)
    echo "Building for LOCAL/DEVELOPMENT..."
    npm run build:dev
    ;;
  
  staging|homolog|hml)
    echo "Building for STAGING..."
    npm run build:staging
    ;;
  
  production|prod)
    echo "Building for PRODUCTION..."
    npm run build
    ;;
  
  *)
    echo "❌ Unknown environment: $ENVIRONMENT"
    echo "Usage: $0 [local|staging|production]"
    exit 1
    ;;
esac

echo ""
echo "✅ Build completed successfully!"
echo "📂 Output: dist/metrics-simple/"
echo ""
echo "To test locally:"
echo "  npx http-server dist/metrics-simple/browser -p 8080"
