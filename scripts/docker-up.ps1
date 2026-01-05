Param(
    [switch] $NoCache
)

# Rebuild and publish Angular frontend as a local Docker container
# Usage: .\scripts\docker-up.ps1 [-NoCache]

Set-StrictMode -Version Latest

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$projectRoot = Resolve-Path (Join-Path $scriptRoot '..')
Push-Location $projectRoot

function FailExit($msg, $code = 1) {
    Write-Host "ERROR: $msg" -ForegroundColor Red
    Pop-Location
    exit $code
}

Write-Host "[1/7] Building Docker image (angular-frontend only)..."
$buildArgs = 'docker compose build angular-frontend'
if ($NoCache) { $buildArgs += ' --no-cache' }

Write-Host "Running: $buildArgs"
cmd /c $buildArgs
if ($LASTEXITCODE -ne 0) { FailExit 'Docker build failed' }

Write-Host "`n[2/7] Removing old container if exists..."
try {
    docker rm -f metrics-simple-frontend 2>$null | Out-Null
} catch { }

Write-Host "[3/7] Starting new container (detached, angular-frontend only)..."
docker compose up -d angular-frontend
if ($LASTEXITCODE -ne 0) { FailExit 'docker compose up failed' }

Write-Host "[4/7] Waiting for initialization (5s)..."
Start-Sleep -Seconds 5

Write-Host "[5/7] Checking container status (angular-frontend only)..."
docker compose ps angular-frontend

Write-Host "`n[6/7] Testing application HTTP response..."
try {
    $response = Invoke-WebRequest -Uri http://localhost:4200 -UseBasicParsing -TimeoutSec 15
    Write-Host "HTTP Status: $($response.StatusCode) (OK)" -ForegroundColor Green
    Write-Host "Content Length: $($response.Content.Length) bytes"
} catch {
    Write-Host "ERROR: HTTP request failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Fetching last logs for diagnosis..."
    docker compose logs --tail=50 angular-frontend
    FailExit 'Application healthcheck failed'
}

Write-Host "`n[7/7] Fetching recent logs (optional)..."
docker compose logs --tail=50 angular-frontend

Write-Host "`n[DONE] Application ready at: http://localhost:4200" -ForegroundColor Green

Pop-Location