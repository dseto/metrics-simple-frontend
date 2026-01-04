param(
    [string]$Service = 'all'
)

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

Write-Host "========================================"
Write-Host "Metrics Simple - Docker Health Check"
Write-Host "========================================"
Write-Host ""

$services = @('angular-frontend', 'csharp-api')
$healthyCount = 0

if ($Service -ne 'all') {
    $services = @($Service)
}

foreach ($svc in $services) {
    Write-Host "Checking $svc..."
    
    $status = docker compose ps $svc --format='{{.State}}'
    
    if ($status -eq 'running' -or $status -like 'Up*') {
        Write-Host "  [OK] Container is running"
        $healthyCount++
    }
    else {
        Write-Host "  [FAIL] Container is not running (Status: $status)"
    }
}

Write-Host ""
Write-Host "========================================"
Write-Host "Summary: $healthyCount/$($services.Count) services healthy"
Write-Host "========================================"

if ($healthyCount -eq $services.Count) {
    Write-Host ""
    Write-Host "[DONE] All services are healthy"
    exit 0
}
else {
    Write-Host ""
    Write-Host "[INFO] Run 'docker compose logs' for more details"
    exit 1
}
