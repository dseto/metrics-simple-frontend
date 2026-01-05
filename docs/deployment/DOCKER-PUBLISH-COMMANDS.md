# Docker Publish Commands - Sessão 05/01/2026

## Objetivo
Publicar a nova versão do frontend no Docker Desktop **SEM push para Docker Hub** (local-only mode).

---

## Comandos Executados (em ordem)

### 1. Build da Imagem
```powershell
cd c:\Projetos\metrics-simple-frontend
docker compose build
```

**O que faz**: 
- Constrói a imagem Docker usando `docker/Dockerfile`
- Multi-stage build: compila Angular em node:20-alpine, depois copia para nginx:latest
- Resultado: `metrics-simple-frontend-angular-frontend:latest` (local)

**Esperado**: 
```
[+] Building 0.6s (19/19) FINISHED
...
[+] Building 1/1
✔ angular-frontend  Built
```

---

### 2. Remover Container Antigo (se existir)
```powershell
docker rm -f metrics-simple-frontend
```

**O que faz**: Remove container anterior para evitar conflito de nome.

**Esperado**: 
```
metrics-simple-frontend
```

ou

```
Error response from daemon: No such container
```
(ambos são OK - se container não existe, ignora erro)

---

### 3. Iniciar Container Novo
```powershell
docker compose up -d
```

**O que faz**: 
- Inicia container com a imagem construída
- `-d` = detached mode (roda em background)
- Porta `4200:80` (localhost:4200 → container:80)

**Esperado**:
```
[+] Running 1/1
✔ Container metrics-simple-frontend  Started
```

---

### 4. Verificar Status (opcional mas recomendado)
```powershell
docker compose ps
```

**Esperado**:
```
NAME                      IMAGE                                      COMMAND    
              SERVICE            CREATED         STATUS                            PORTS
metrics-simple-frontend   metrics-simple-frontend-angular-frontend   "/docker-en
trypoint.…"   angular-frontend   3 seconds ago   Up 2 seconds (health: starting)   0.0.0.0:4200->80/tcp
```

Status deve ser `Up X seconds (health: starting)` ou `healthy`.

---

### 5. Testar Aplicação (esperar ~5 segundos)
```powershell
Start-Sleep -Seconds 5
Invoke-WebRequest -Uri http://localhost:4200 -UseBasicParsing | Select-Object StatusCode, @{Name="ContentLength"; Expression={$_.Content.Length}}
```

**Esperado**:
```
StatusCode ContentLength
---------- --------
       200      74397
```

HTTP 200 = ✅ Aplicação respondendo

---

## Script Completo (Copy-Paste)

Execute este script completo uma única vez:

```powershell
# 1. Build
Write-Host "[1/5] Building Docker image..."
cd c:\Projetos\metrics-simple-frontend
docker compose build

# 2. Remove container antigo
Write-Host "`n[2/5] Removing old container..."
docker rm -f metrics-simple-frontend 2>&1 | Out-Null

# 3. Start novo container
Write-Host "[3/5] Starting container..."
docker compose up -d

# 4. Verificar status
Write-Host "[4/5] Checking status..."
Start-Sleep -Seconds 3
docker compose ps

# 5. Test health
Write-Host "`n[5/5] Testing application..."
Start-Sleep -Seconds 3
try {
    $response = Invoke-WebRequest -Uri http://localhost:4200 -UseBasicParsing
    Write-Host "HTTP Status: $($response.StatusCode) (OK)" -ForegroundColor Green
    Write-Host "Content Length: $($response.Content.Length) bytes"
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
}

Write-Host "`n[OK] PUBLICACAO CONCLUIDA" -ForegroundColor Green
Write-Host "Acesse: http://localhost:4200" -ForegroundColor Cyan
```

---

## Instruções para Evitar Confusão com Docker Hub

### Cenário 1: Build & Pub Local (o que foi feito aqui)
**Objetivo**: Construir e rodar no Docker Desktop SEM enviar para nenhum registry.

**Comandos** (exatos):
```powershell
docker compose build
docker rm -f metrics-simple-frontend
docker compose up -d
```

**Resultado**: Container rodando em `http://localhost:4200` ✅

**NÃO EXECUTA**: `docker login`, `docker push`, `docker tag` (com registry)

---

### Cenário 2: Se Precisar Enviar para Docker Hub (OPCIONAL)

⚠️ **Só faça isso se você realmente quiser publicar em Docker Hub**

**Pré-requisitos**:
1. Ter Docker Hub account (criar em https://hub.docker.com)
2. Ter logado localmente ANTES de chamar o agente:
   ```powershell
   docker login
   # Insira username e password/token
   ```

**Então (não peça para o agente fazer isso)**:
```powershell
# 1. Tag com seu usuário Docker Hub
docker tag metrics-simple-frontend-angular-frontend:latest seuUsuario/metrics-simple-frontend:latest

# 2. Push
docker push seuUsuario/metrics-simple-frontend:latest

# 3. Verifica
docker images | grep metrics-simple-frontend
```

---

## ⚠️ REGRA IMPORTANTE

**O agente DEVE respeitar**:

```
- Do NOT attempt docker push without explicit instruction
- Do NOT prompt user for Docker Hub credentials  
- Do NOT check docker info or docker login status
- If user requests push:
  - REQUIRE explicit Docker Hub username/repository (ex: user/metrics-simple-frontend)
  - REQUIRE user to be pre-authenticated (user must run: docker login)
  - Tag image: docker tag metrics-simple-frontend-angular-frontend:latest {username}/{repository}:latest
  - Push only after user confirms repository and authentication details
```

**Se o agente perguntar por credenciais ou repositório Docker Hub**, responda:

```
Não quero fazer push. Só quero rodar localmente no Docker Desktop.

Use estes comandos:
1. docker compose build
2. docker rm -f metrics-simple-frontend
3. docker compose up -d

Depois acesse http://localhost:4200
```

---

## Troubleshooting

### Erro: "Conflict. The container name "/metrics-simple-frontend" is already in use"
**Solução**: 
```powershell
docker rm -f metrics-simple-frontend
docker compose up -d
```

### Erro: "Cannot connect to http://localhost:4200"
**Solução**: 
1. Aguarde 5-10 segundos para Nginx inicializar
2. Verifique status: `docker compose ps`
3. Verifique logs: `docker compose logs angular-frontend`

### Erro: "image not found"
**Solução**: 
```powershell
docker compose build --no-cache
docker compose up -d
```

---

## Quick Reference - Comandos Diários

```powershell
# Iniciar container (já construído)
docker compose up -d

# Ver logs
docker compose logs -f angular-frontend

# Parar container
docker compose down

# Rebuild e restart
docker compose build
docker compose down
docker compose up -d

# Status
docker compose ps

# Testar
Invoke-WebRequest http://localhost:4200 -UseBasicParsing
```

---

## Resumo Final

✅ **Sessão 05/01/2026 - Resultado**

```
- Build: docker compose build ✅
- Container: metrics-simple-frontend running ✅
- Port: 4200:80 ✅
- Health: OK ✅
- URL: http://localhost:4200 ✅
- Docker Hub: NOT PUSHED (local-only mode) ✅
```

**Próximas vezes**: Execute apenas os 3 comandos do Script Completo.
