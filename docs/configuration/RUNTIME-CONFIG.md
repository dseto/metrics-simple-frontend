# 🔒 Configurações Runtime (Injeção em Deploy)

## 🎯 Problema Resolvido

**Cenário:** Você tem configurações que **NÃO PODEM** estar no repositório:
- URLs de APIs específicas de produção
- Feature flags por cliente
- Configurações sensíveis (sem ser secrets)
- Valores que mudam **após o build**

**Solução:** Sistema de **Runtime Configuration** usando `assets/config.json` + `APP_INITIALIZER`

---

## 🏗️ Como Funciona

### Build Time (Compilação)
```
ng build → Gera bundle JavaScript
          ↓
          Bundle NÃO contém configurações hardcoded
          ↓
          config.template.json é incluído no dist/
```

### Runtime (Execução)
```
Container/Server inicia
          ↓
Substitui config.template.json → config.json
(usando variáveis de ambiente)
          ↓
Nginx serve aplicação
          ↓
Angular bootstrap → APP_INITIALIZER
          ↓
Carrega /assets/config.json via HTTP
          ↓
Aplicação usa configurações runtime
```

---

## 📁 Arquivos Criados

### 1. **src/assets/config.json**
Configuração padrão para desenvolvimento local:
```json
{
  "apiBaseUrl": "http://localhost:8080/api/v1",
  "aiEnabled": true,
  "production": false,
  "envName": "local"
}
```

### 2. **src/assets/config.template.json**
Template com placeholders para Docker/K8s:
```json
{
  "apiBaseUrl": "${API_BASE_URL}",
  "aiEnabled": "${AI_ENABLED}",
  "production": "${PRODUCTION}",
  "envName": "${ENV_NAME}"
}
```

### 3. **src/app/core/services/runtime-config.service.ts**
Service que carrega configurações na inicialização:
```typescript
// Uso nos services:
constructor(private config: RuntimeConfigService) {}

get baseUrl(): string {
  return `${this.config.apiBaseUrl}/connectors`;
}
```

### 4. **docker-entrypoint.sh**
Script que substitui placeholders com variáveis de ambiente:
```bash
envsubst < config.template.json > config.json
```

---

## 🐳 Opção 1: Docker com Variáveis de Ambiente

### Build da imagem:
```bash
docker build -f Dockerfile.runtime -t metrics-simple:latest .
```

### Run com variáveis:
```bash
docker run -d \
  -p 8080:80 \
  -e API_BASE_URL=https://api.producao.com/api/v1 \
  -e AI_ENABLED=true \
  -e PRODUCTION=true \
  -e ENV_NAME=production \
  metrics-simple:latest
```

### Docker Compose:
```yaml
version: '3.8'
services:
  frontend:
    image: metrics-simple:latest
    ports:
      - "8080:80"
    environment:
      API_BASE_URL: https://api.staging.com/api/v1
      AI_ENABLED: "true"
      PRODUCTION: "false"
      ENV_NAME: staging
```

---

## 🖥️ Opção 2: VM/Servidor Tradicional

### Após build:
```bash
npm run build

# Editar config.json diretamente
vi dist/metrics-simple/browser/assets/config.json
```

```json
{
  "apiBaseUrl": "https://api.vm-prod.com/api/v1",
  "aiEnabled": true,
  "production": true,
  "envName": "vm-production"
}
```

### Copiar para servidor:
```bash
scp -r dist/metrics-simple/browser/* user@server:/var/www/html/
```

---

## 🔧 Opção 3: CI/CD com Substituição

### GitHub Actions:
```yaml
name: Deploy Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build
        run: npm run build
        
      - name: Inject Runtime Config
        run: |
          cat > dist/metrics-simple/browser/assets/config.json <<EOF
          {
            "apiBaseUrl": "${{ secrets.API_BASE_URL }}",
            "aiEnabled": true,
            "production": true,
            "envName": "github-actions"
          }
          EOF
        
      - name: Deploy to S3
        run: |
          aws s3 sync dist/metrics-simple/browser/ s3://my-bucket/
```

---

## 🧪 Como Testar Localmente

### 1. Testar com config padrão:
```bash
npm start
# Usa src/assets/config.json
```

### 2. Testar com Docker:
```bash
# Build
docker build -f Dockerfile.runtime -t metrics-simple:test .

# Run
docker run -p 8080:80 \
  -e API_BASE_URL=https://api.teste.com/api/v1 \
  -e ENV_NAME=docker-test \
  metrics-simple:test

# Acessar
open http://localhost:8080

# Verificar configuração carregada (browser console)
# Deve mostrar: "✅ Runtime configuration loaded: {...}"
```

### 3. Verificar qual config foi carregada:
```javascript
// No browser console:
fetch('/assets/config.json').then(r => r.json()).then(console.log)
```

---

## 📊 Comparação: Build Time vs Runtime

| Aspecto | Build Time (environment.ts) | Runtime (config.json) |
|---------|----------------------------|----------------------|
| **Quando definido** | Durante `ng build` | No deploy/startup |
| **Flexibilidade** | Requer rebuild | Apenas restart |
| **Uso ideal** | Configs que não mudam | Configs por ambiente |
| **Secrets** | ❌ Não recomendado | ✅ OK (com cuidado) |
| **Performance** | ⚡ Mais rápido | Mínima diferença |
| **Cache** | Bundled no JS | Pode ter cache issues |

---

## ✅ Boas Práticas

### ✅ **FAZER:**
- Usar runtime config para URLs de API
- Manter config.json no .gitignore em produção
- Validar configurações no APP_INITIALIZER
- Ter fallback para valores padrão
- Usar cache-buster na requisição do config.json

### ❌ **NÃO FAZER:**
- Colocar API keys no config.json (use secrets do K8s)
- Expor passwords ou tokens
- Commitar configurações de produção
- Esquecer de validar tipos (string "true" vs boolean)

---

## 🔒 Configurações Sensíveis (Secrets)

Para **verdadeiros secrets** (API keys, tokens), use variáveis de ambiente do Docker:

### Docker Secrets (Swarm):
```bash
echo "my-secret-key" | docker secret create api_key -

# Use com Docker Swarm
docker service create \
  --secret api_key \
  --env API_KEY_FILE=/run/secrets/api_key \
  metrics-simple:latest
```

### Docker Compose com arquivo .env:
```yaml
# docker-compose.yml
services:
  frontend:
    image: metrics-simple:latest
    env_file:
      - .env  # Arquivo com secrets (NUNCA commitar!)
```

```bash
# .env (adicionar ao .gitignore)
API_BASE_URL=https://api.producao.com/api/v1
SECRET_API_KEY=super-secret-key
```

---

## 🆘 Troubleshooting

### Configuração não está sendo carregada
```bash
# Verificar se arquivo existe no container
docker exec <container-id> cat /usr/share/nginx/html/assets/config.json

# Verificar logs do entrypoint
docker logs <container-id>
```

### Valores não estão sendo substituídos
```bash
# Verificar se envsubst está instalado
docker exec <container-id> which envsubst

# Verificar variáveis de ambiente
docker exec <container-id> env | grep API_BASE_URL
```

### Aplicação não inicia
```bash
# Verificar console do browser
# Deve mostrar: "✅ Runtime configuration loaded"

# Se mostrar erro 404 para config.json
# Verificar se arquivo existe em /assets/
```

---

## 📚 Documentação Relacionada

- [ENVIRONMENT-CONFIG.md](./ENVIRONMENT-CONFIG.md) - Build-time configuration
- [Dockerfile.runtime](./Dockerfile.runtime) - Docker com runtime config
- [k8s-deployment.yaml](./k8s-deployment.yaml) - Kubernetes exemplo
- [docker-entrypoint.sh](./docker-entrypoint.sh) - Script de injeção

---

## 🎯 Resumo

**Build Time (`environment.ts`)**: Use para configs que não mudam entre ambientes ou que são necessárias no build

**Runtime (`config.json`)**: Use para URLs de APIs, feature flags, e qualquer coisa que mude por ambiente sem rebuild

**Ambos podem coexistir!** 
- environment.ts: default sensato
- config.json: override no deploy
