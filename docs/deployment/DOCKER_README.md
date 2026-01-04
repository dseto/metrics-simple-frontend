# 🐳 Docker Setup - Metrics Simple Frontend

Containerização completa do projeto Angular para execução em Docker Desktop.

## 📦 Arquivos Criados

### Arquivos Principais
- **Dockerfile** - Multi-stage build (Node.js 20 Alpine + nginx)
- **docker-compose.yml** - Orquestração de serviços
- **nginx.conf** - Configuração para SPA com routing client-side
- **.dockerignore** - Otimização do contexto de build
- **.env.example** - Template de variáveis de ambiente

### Scripts de Gerenciamento

#### Windows PowerShell
```
scripts/docker-manager.ps1    - Comandos: up, down, restart, logs, clean
scripts/docker-health.ps1     - Verifica saúde dos containers
```

#### Linux/macOS
```
scripts/docker-manager.sh     - Comandos: up, down, restart, logs, clean
scripts/docker-health.sh      - Verifica saúde dos containers
```

### Documentação
- **DOCKER_SETUP.md** - Guia completo de configuração e troubleshooting
- **DOCKER_VALIDATION_REPORT.md** - Relatório de validação (sucessfully tested)

## 🚀 Quick Start

### Windows PowerShell
```powershell
# Iniciar containers
.\scripts\docker-manager.ps1 up

# Acessar a aplicação
Start-Process "http://localhost:4200"

# Parar containers
.\scripts\docker-manager.ps1 down
```

### Linux/macOS Bash
```bash
# Iniciar containers
./scripts/docker-manager.sh up

# Acessar a aplicação
open http://localhost:4200

# Parar containers
./scripts/docker-manager.sh down
```

### Comandos Docker Diretos
```bash
# Build e iniciar
docker compose build
docker compose up -d

# Status
docker compose ps

# Logs
docker compose logs angular-frontend

# Parar
docker compose down
```

## 🎯 Características

✓ **Build Multi-stage** - Reduz tamanho final para ~100MB  
✓ **SPA Routing** - Fallback para index.html automaticamente  
✓ **Cache Otimizado** - Assets com expiração de 1 ano  
✓ **Health Check** - Verificação automática de saúde a cada 30s  
✓ **npm ci** - Builds reproduzíveis com lock de dependências  
✓ **AOT Compiler** - Produção otimizada (minificação + tree-shaking)  

## 📍 Acesso

- **Frontend**: http://localhost:4200
- **Status**: `docker compose ps` (verificar coluna STATUS)

## ⚙️ Configuração

### Variáveis de Ambiente

Criar `.env` na raiz do projeto:

```env
NODE_ENV=production
API_BASE_URL=http://localhost:8080/api/v1
E2E_API_MODE=mock
E2E_BASE_URL=http://localhost:4200
```

### Customização

**Mudar porta de acesso** - Editar `docker-compose.yml`:
```yaml
ports:
  - "8080:80"  # Acesso em http://localhost:8080
```

**Integração com Backend** - Descomente em `docker-compose.yml`:
```yaml
csharp-api:
  image: metrics-simple-api:latest
  ports:
    - "8080:8080"
```

## 🔧 Troubleshooting

| Problema | Solução |
|----------|---------|
| Port 4200 already in use | Mudar porta em `docker-compose.yml` ou `docker compose down` |
| Container crashes | Verificar logs: `docker compose logs angular-frontend` |
| SPA routing não funciona | Validar nginx.conf: `docker compose exec angular-frontend nginx -t` |
| Build lento | Cache rebuild: `docker compose build --no-cache` |

## 📚 Documentação Completa

Veja [DOCKER_SETUP.md](DOCKER_SETUP.md) para:
- Arquitetura completa
- Configuração avançada
- Performance tuning
- Security best practices
- Integração com backend

## ✅ Validação

Teste rápido:
```bash
docker compose build
docker compose up -d
curl http://localhost:4200      # Deve retornar HTTP 200
docker compose logs angular-frontend
docker compose ps               # Verificar STATUS
docker compose down
```

## 📋 Requisitos

- Docker Desktop 4.0+
- 2GB RAM mínimo (4GB recomendado)
- 2 CPU cores
- 10GB espaço em disco

## 🎓 Stack

- **Node.js**: 20 Alpine (build)
- **nginx**: latest (runtime)
- **Angular**: 17.3.0
- **TypeScript**: 5.4.2
- **Angular Material**: 17.3.10

---

**Status**: ✅ **PRONTO PARA PRODUÇÃO**  
Teste realizado e validado em Windows 10 + Docker Desktop 28.3.2
