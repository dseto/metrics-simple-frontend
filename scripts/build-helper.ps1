# PowerShell script helper para gerenciar builds por ambiente
# Uso: .\build-helper.ps1 [local|staging|production]

param(
    [Parameter(Position=0)]
    [ValidateSet("local", "dev", "development", "staging", "homolog", "hml", "production", "prod")]
    [string]$Environment = "production"
)

Write-Host "🚀 Building Metrics Simple Frontend" -ForegroundColor Cyan
Write-Host "📦 Environment: $Environment" -ForegroundColor Yellow
Write-Host ""

try {
    switch -Regex ($Environment) {
        "^(local|dev|development)$" {
            Write-Host "Building for LOCAL/DEVELOPMENT..." -ForegroundColor Green
            npm run build:dev
        }
        
        "^(staging|homolog|hml)$" {
            Write-Host "Building for STAGING..." -ForegroundColor Green
            npm run build:staging
        }
        
        "^(production|prod)$" {
            Write-Host "Building for PRODUCTION..." -ForegroundColor Green
            npm run build
        }
    }
    
    Write-Host ""
    Write-Host "✅ Build completed successfully!" -ForegroundColor Green
    Write-Host "📂 Output: dist/metrics-simple/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To test locally:" -ForegroundColor Yellow
    Write-Host "  npx http-server dist/metrics-simple/browser -p 8080" -ForegroundColor White
}
catch {
    Write-Host ""
    Write-Host "❌ Build failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
