# 🚀 INSTRUÇÕES PARA OUTRA SESSÃO

## Problema Original
Agente estava pedindo credenciais Docker Hub quando só queríamos publicar localmente.

## Solução
**NÃO fazer push para Docker Hub** - usar **local-only mode** (padrão).

---

## Para Usar em Outra Sessão (Copy-Paste)

### Opção 1: Um Comando por Vez
```powershell
# Navega para projeto
cd c:\Projetos\metrics-simple-frontend

# 1. Build
docker compose build

# 2. Remove container antigo
docker rm -f metrics-simple-frontend

# 3. Start novo
docker compose up -d

# 4. Testa
Invoke-WebRequest http://localhost:4200 -UseBasicParsing
```

---

### Opção 2: Script Completo (Recomendado)
Cole tudo de uma vez em PowerShell:

```powershell
# Build & Publish Local Only
Write-Host "[1/4] Building..."
cd c:\Projetos\metrics-simple-frontend
docker compose build

Write-Host "`n[2/4] Removing old container..."
docker rm -f metrics-simple-frontend 2>&1 | Out-Null

Write-Host "[3/4] Starting container..."
docker compose up -d

Write-Host "[4/4] Testing application..."
Start-Sleep -Seconds 5
try {
    $response = Invoke-WebRequest -Uri http://localhost:4200 -UseBasicParsing
    Write-Host "HTTP $($response.StatusCode) - OK" -ForegroundColor Green
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
}

Write-Host "`n[DONE] Acesse: http://localhost:4200`n" -ForegroundColor Green
```

---

## Se Agente Perguntar por Credenciais Docker Hub

**Responda EXATAMENTE assim**:

```
Não quero fazer push para Docker Hub. 

Quero só rodar localmente no Docker Desktop.

Use estes comandos:
1. docker compose build
2. docker rm -f metrics-simple-frontend
3. docker compose up -d

Pronto. Container rodando em http://localhost:4200
```

---

## Resultado Esperado

✅ Status: `Up X seconds (health: starting)` ou `healthy`  
✅ Port: `0.0.0.0:4200->80/tcp`  
✅ URL: `http://localhost:4200` respondendo com HTTP 200

---

## Referência Completa
[docs/deployment/DOCKER-PUBLISH-COMMANDS.md](docs/deployment/DOCKER-PUBLISH-COMMANDS.md)
