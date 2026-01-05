---
agent: spec-driven-dockerizer-frontend
context: Metrics Simple Frontend - Angular 19 with Docker Desktop
---

# Build & Publish Container - Local Only Mode

Recriar o container Docker da aplicação Angular no Docker Desktop usando configuração existente.

## 🎯 Objetivo

Publicar nova versão do frontend no Docker Desktop **SEM push para Docker Hub** (local-only mode).

---

## ⚠️ REGRA CRÍTICA: Modo Local Apenas

- ✅ **FAÇA**: Build + container no Docker Desktop local
- ✅ **FAÇA**: Validar aplicação respondendo em http://localhost:4200
- ❌ **NÃO FAÇA**: Perguntar por credenciais Docker Hub
- ❌ **NÃO FAÇA**: Executar `docker login` ou `docker push`
- ❌ **NÃO FAÇA**: Verificar status de login com `docker info`

Se usuário quiser push para Docker Hub: **requeira permissão explícita + username/repository**

---

## 📋 Instruções Obrigatórias (em ordem)

### 1️⃣ Build da Imagem Docker
```powershell
cd c:\Projetos\metrics-simple-frontend
docker compose build
```

**Esperado**: 
- Status `FINISHED`
- Mensagem: `✔ angular-frontend Built`
- Sem erros críticos no build

**Se falhar**: Interrompa e reporte erro do build

---

### 2️⃣ Remover Container Antigo
```powershell
docker rm -f metrics-simple-frontend
```

**Esperado**: 
- Saída: `metrics-simple-frontend` (container removido)
- OU: `Error: No such container` (container não existe - OK)

**Ignorar erros de "container not found"**

---

### 3️⃣ Iniciar Container Novo
```powershell
docker compose up -d
```

**Esperado**:
- Status: `✔ Container metrics-simple-frontend Started`
- Mensagem: `Up X seconds (health: starting)`

**Se falhar**: Reporte erro exato

---

### 4️⃣ Aguardar Inicialização
```powershell
Start-Sleep -Seconds 5
```

**Por quê**: Nginx precisa de tempo para inicializar completamente

---

### 5️⃣ Validar Status do Container
```powershell
docker compose ps
```

**Esperado**:
- STATUS: `Up X seconds (health: starting)` ou `healthy`
- PORTS: `0.0.0.0:4200->80/tcp`

**Se não estiver `running`**: Verifique logs com `docker compose logs angular-frontend`

---

### 6️⃣ Validar Aplicação Respondendo
```powershell
Invoke-WebRequest -Uri http://localhost:4200 -UseBasicParsing | Select-Object StatusCode, @{Name="ContentLength"; Expression={$_.Content.Length}}
```

**Esperado**:
- StatusCode: `200`
- ContentLength: ~74000+ bytes (HTML da aplicação)

**Se StatusCode ≠ 200**: Aguarde mais 5 segundos e tente novamente

---

### 7️⃣ Validar Logs (Opcional mas Recomendado)
```powershell
docker compose logs --tail=50 angular-frontend
```

**Esperado**: Nginx startup messages, sem erros críticos

---

## ✅ Validações Obrigatórias

Após completar todos os passos, valide:

- [x] Build concluído com sucesso (`✔ angular-frontend Built`)
- [x] Container rodando (`Up X seconds`)
- [x] HTTP Status Code: 200
- [x] Aplicação acessível em http://localhost:4200
- [x] Logs sem erros críticos (network, file, permission)

---

## 🎯 Critério de Sucesso

Tarefa **CONCLUÍDA** quando:

✅ `docker compose ps` mostra STATUS `Up X seconds (health: starting/healthy)`  
✅ `Invoke-WebRequest http://localhost:4200` retorna StatusCode 200  
✅ Nenhum erro crítico nos logs do container  
✅ URL http://localhost:4200 acessível no navegador (opcional visual)

---

## 🚨 Tratamento de Erros

### Erro: "Conflict. The container name is already in use"
**Solução**: Execute novamente o Passo 2
```powershell
docker rm -f metrics-simple-frontend
docker compose up -d
```

### Erro: "Cannot connect to http://localhost:4200"
**Solução**: 
1. Aguarde mais 10 segundos
2. Verifique logs: `docker compose logs angular-frontend`
3. Se logs mostram erro: execute rebuild (Passo 1)

### Erro: Build falha com "FAILED"
**Solução**:
1. Interrompa (Ctrl+C)
2. Execute: `docker compose build --no-cache`
3. Reporte erro exato encontrado

### Erro: npm install/build timeout
**Solução**: Execute novamente com `--no-cache`
```powershell
docker compose build --no-cache
```

---

## 📝 Script Completo (Copy-Paste)

Para executar tudo de uma vez, use este script PowerShell:

```powershell
Write-Host "[1/7] Building Docker image..."
cd c:\Projetos\metrics-simple-frontend
docker compose build
if ($LASTEXITCODE -ne 0) { Write-Host "BUILD FAILED"; exit 1 }

Write-Host "`n[2/7] Removing old container..."
docker rm -f metrics-simple-frontend 2>&1 | Out-Null

Write-Host "[3/7] Starting new container..."
docker compose up -d
if ($LASTEXITCODE -ne 0) { Write-Host "UP FAILED"; exit 1 }

Write-Host "[4/7] Waiting for initialization..."
Start-Sleep -Seconds 5

Write-Host "[5/7] Checking container status..."
docker compose ps

Write-Host "`n[6/7] Testing application..."
try {
    $response = Invoke-WebRequest -Uri http://localhost:4200 -UseBasicParsing
    Write-Host "HTTP Status: $($response.StatusCode) (OK)" -ForegroundColor Green
    Write-Host "Content Length: $($response.Content.Length) bytes"
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
    Write-Host "Checking logs..."
    docker compose logs --tail=20 angular-frontend
    exit 1
}

Write-Host "`n[7/7] SUCCESS" -ForegroundColor Green
Write-Host "Application ready at: http://localhost:4200`n"
```

---

## 📚 Documentação de Referência

- **Completa**: [docs/deployment/DOCKER-PUBLISH-COMMANDS.md](docs/deployment/DOCKER-PUBLISH-COMMANDS.md)
- **Rápida**: [DOCKER-QUICK-START.md](DOCKER-QUICK-START.md)
- **Agent Rules**: [.github/agents/spec-driven-dockerizer-frontend.agent.md](.github/agents/spec-driven-dockerizer-frontend.agent.md)

---

## 🔄 Fluxo Resumido

```
1. docker compose build
   ↓
2. docker rm -f metrics-simple-frontend
   ↓
3. docker compose up -d
   ↓
4. Start-Sleep -Seconds 5
   ↓
5. docker compose ps (validar)
   ↓
6. Invoke-WebRequest http://localhost:4200 (validar HTTP 200)
   ↓
7. ✅ SUCESSO
```

---

## ⏱️ Tempo Esperado

- Build: 2-10 segundos (depende de cache)
- Container start: 3-5 segundos
- Health check: 5-10 segundos
- **Total**: ~15-30 segundos

---

## 📌 Notas Importantes

1. **Sem Docker Hub**: Esta tarefa é **local-only**. Não fazer push a menos que explicitamente solicitado.
2. **Sem login necessário**: Não precisa de `docker login` ou credenciais.
3. **Repeatável**: Comando pode ser executado múltiplas vezes sem conflitos.
4. **Idempotente**: Executar 2x segue com mesmo resultado.
