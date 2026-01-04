param(
    [string]$Action = 'up'
)

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

Write-Host "========================================"
Write-Host "Metrics Simple Frontend - Docker Manager"
Write-Host "========================================"
Write-Host ""

if ($Action -eq 'up' -or $Action -eq 'start') {
    Write-Host "[INFO] Building and starting containers..."
    docker compose build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[FAIL] Docker compose build failed"
        exit 1
    }
    
    docker compose up -d
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[FAIL] Docker compose up failed"
        exit 1
    }
    
    Write-Host "[DONE] Containers started"
    Write-Host ""
    Write-Host "Frontend: http://localhost:4200"
    Write-Host "Backend:  http://localhost:8080"
    Write-Host ""
    Write-Host "[INFO] Waiting for services to be healthy..."
    Start-Sleep -Seconds 3
    
    docker compose ps
}
elseif ($Action -eq 'down' -or $Action -eq 'stop') {
    Write-Host "[INFO] Stopping containers..."
    docker compose down
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[DONE] Containers stopped"
    }
    else {
        Write-Host "[FAIL] Failed to stop containers"
        exit 1
    }
}
elseif ($Action -eq 'restart') {
    Write-Host "[INFO] Restarting containers..."
    docker compose restart
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[DONE] Containers restarted"
    }
    else {
        Write-Host "[FAIL] Failed to restart containers"
        exit 1
    }
}
elseif ($Action -eq 'logs') {
    Write-Host "[INFO] Displaying logs..."
    docker compose logs -f angular-frontend
}
elseif ($Action -eq 'clean') {
    Write-Host "[INFO] Cleaning up containers and images..."
    docker compose down --volumes --remove-orphans
    Write-Host "[DONE] Cleanup complete"
}
else {
    Write-Host "Usage: .\docker-manager.ps1 [up|down|restart|logs|clean]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  up       - Build and start containers"
    Write-Host "  down     - Stop containers"
    Write-Host "  restart  - Restart containers"
    Write-Host "  logs     - Stream frontend logs"
    Write-Host "  clean    - Remove containers and volumes"
    exit 0
}
