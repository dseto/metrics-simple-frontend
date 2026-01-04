# 🎯 Guia Rápido: Como Mudar URLs da API

## Cenário 1: Mudar URL de Produção

**Arquivo:** `src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiBaseUrl: 'https://minha-nova-api.com/api/v1', // ← ALTERE AQUI
  aiEnabled: true,
  envName: 'production'
};
```

**Build:**
```bash
npm run build
```

---

## Cenário 2: Mudar URL de Staging

**Arquivo:** `src/environments/environment.staging.ts`

```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'https://homolog.minhaempresa.com/api/v1', // ← ALTERE AQUI
  aiEnabled: true,
  envName: 'staging'
};
```

**Build:**
```bash
npm run build:staging
```

---

## Cenário 3: Mudar URL de Desenvolvimento Local

**Arquivo:** `src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000/api/v1', // ← ALTERE AQUI (ex: porta 3000)
  aiEnabled: true,
  envName: 'local'
};
```

**Testar:**
```bash
npm start
```

---

## Cenário 4: Criar Ambiente Novo (QA)

### Passo 1: Criar arquivo
**Arquivo:** `src/environments/environment.qa.ts`

```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'https://qa.minhaempresa.com/api/v1',
  aiEnabled: true,
  envName: 'qa'
};
```

### Passo 2: Configurar angular.json
Adicione em `projects.metrics-simple.architect.build.configurations`:

```json
"qa": {
  "fileReplacements": [
    {
      "replace": "src/environments/environment.ts",
      "with": "src/environments/environment.qa.ts"
    }
  ],
  "optimization": true,
  "outputHashing": "all",
  "sourceMap": false
}
```

Adicione em `projects.metrics-simple.architect.serve.configurations`:

```json
"qa": {
  "buildTarget": "metrics-simple:build:qa"
}
```

### Passo 3: Adicionar scripts (package.json)
```json
{
  "scripts": {
    "start:qa": "ng serve --configuration=qa",
    "build:qa": "ng build --configuration=qa"
  }
}
```

### Passo 4: Usar
```bash
npm run start:qa
npm run build:qa
```

---

## Cenário 5: Testar Localmente com URL Remota

**Situação:** Quero testar localmente mas apontar para API de staging.

**Solução 1 - Temporária (não commitar):**
```typescript
// src/environments/environment.ts (temporário)
export const environment = {
  production: false,
  apiBaseUrl: 'https://staging-api.metrics-simple.com/api/v1', // temporário
  aiEnabled: true,
  envName: 'local'
};
```

```bash
npm start
```

**Solução 2 - Usar configuração staging:**
```bash
npm run start:staging
```

---

## Cenário 6: URLs Diferentes por Feature

**Situação:** Preciso de URLs diferentes para diferentes APIs.

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/api/v1',
  authApiUrl: 'http://localhost:8081/auth',  // ← API separada
  analyticsUrl: 'http://localhost:8082/analytics',
  aiEnabled: true,
  envName: 'local'
};
```

**Usar no serviço:**
```typescript
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = environment.authApiUrl; // ← Nova propriedade
  // ...
}
```

---

## Cenário 7: Docker Build com Variável

**Dockerfile:**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

ARG BUILD_ENV=production
RUN npm run build -- --configuration=$BUILD_ENV

FROM nginx:alpine
COPY --from=builder /app/dist/metrics-simple /usr/share/nginx/html
```

**Build commands:**
```bash
# Production
docker build --build-arg BUILD_ENV=production -t app:prod .

# Staging
docker build --build-arg BUILD_ENV=staging -t app:staging .

# QA
docker build --build-arg BUILD_ENV=qa -t app:qa .
```

---

## Cenário 8: CI/CD (GitHub Actions)

**.github/workflows/deploy-staging.yml:**
```yaml
name: Deploy Staging

on:
  push:
    branches: [develop]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build Staging
        run: npm run build:staging
        
      - name: Deploy
        run: |
          # Deploy dist/metrics-simple to staging server
```

---

## ⚠️ IMPORTANTE

### ✅ **FAZER:**
- Commitar mudanças nos environment files
- Revisar URLs antes do deploy
- Testar build localmente primeiro
- Usar HTTPS em produção

### ❌ **NÃO FAZER:**
- Commitar credenciais/API keys nos environment files
- Usar HTTP em produção (use HTTPS)
- Esquecer de atualizar todos os environments necessários

---

## 🔍 Validar Mudanças

### Depois de alterar URL:
```bash
# 1. Limpar cache
rm -rf dist .angular

# 2. Build
npm run build:staging

# 3. Validar bundle
ls -lh dist/metrics-simple/browser/*.js

# 4. Testar localmente (opcional)
npx http-server dist/metrics-simple/browser -p 8080
```

### Verificar no browser console:
```javascript
// Cole no console do browser após carregar app
import { environment } from './environments/environment';
console.log('API URL:', environment.apiBaseUrl);
console.log('Environment:', environment.envName);
```

---

## 📞 Problemas?

### URL não mudou após build
```bash
# Limpar tudo e rebuildar
rm -rf dist .angular node_modules
npm install
npm run build:staging
```

### Testes falhando
```bash
# Verificar que está usando environment.ts correto
npm test
# Testes sempre usam environment.ts (local)
```

### Build dá erro "Cannot find module 'environment.staging'"
```bash
# Verificar que arquivo existe
ls src/environments/environment.staging.ts
# Se não existir, criar conforme documentação
```

---

**📚 Ver também:**
- [ENVIRONMENT-CONFIG.md](./ENVIRONMENT-CONFIG.md) - Guia completo
- [REFACTORING-SUMMARY.md](./REFACTORING-SUMMARY.md) - O que foi mudado
