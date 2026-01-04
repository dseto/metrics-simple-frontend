# 🌍 Sistema de Configuração Multi-Ambiente

## ✅ **Status: IMPLEMENTADO**

Hardcodes foram **eliminados** do projeto. Agora usa **environment files** do Angular com suporte completo a múltiplos ambientes.

---

## 📁 Estrutura de Arquivos

```
src/environments/
├── environment.ts           # Local/Development (padrão)
├── environment.prod.ts      # Production
└── environment.staging.ts   # Staging/Homologação
```

---

## 🚀 Como Usar

### **Development (Local)**
```bash
npm start
# Usa: http://localhost:8080/api/v1
```

### **Staging**
```bash
npm run start:staging
# Usa: https://staging-api.metrics-simple.com/api/v1
```

### **Production Build**
```bash
npm run build
# Usa: https://api.metrics-simple.com/api/v1
# Gera build otimizado em /dist
```

### **Staging Build**
```bash
npm run build:staging
# Usa: https://staging-api.metrics-simple.com/api/v1
```

---

## 🔧 Configurações Atuais

| Ambiente | API URL | Production | AI Enabled |
|----------|---------|------------|------------|
| **Local** | `http://localhost:8080/api/v1` | `false` | `true` |
| **Staging** | `https://staging-api.metrics-simple.com/api/v1` | `false` | `true` |
| **Production** | `https://api.metrics-simple.com/api/v1` | `true` | `true` |

---

## ✏️ Como Alterar URLs

### Para Development:
Edite: `src/environments/environment.ts`
```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000/api/v1', // ← Altere aqui
  aiEnabled: true,
  envName: 'local'
};
```

### Para Production:
Edite: `src/environments/environment.prod.ts`
```typescript
export const environment = {
  production: true,
  apiBaseUrl: 'https://minha-api.com/api/v1', // ← Altere aqui
  aiEnabled: true,
  envName: 'production'
};
```

### Para Staging:
Edite: `src/environments/environment.staging.ts`

---

## ➕ Adicionar Novo Ambiente (Ex: QA)

### 1. Criar arquivo
```bash
src/environments/environment.qa.ts
```

```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'https://qa-api.metrics-simple.com/api/v1',
  aiEnabled: true,
  envName: 'qa'
};
```

### 2. Configurar angular.json
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
  "outputHashing": "all"
}
```

Adicione em `projects.metrics-simple.architect.serve.configurations`:
```json
"qa": {
  "buildTarget": "metrics-simple:build:qa"
}
```

### 3. Adicionar scripts (package.json)
```json
{
  "scripts": {
    "start:qa": "ng serve --configuration=qa",
    "build:qa": "ng build --configuration=qa"
  }
}
```

### 4. Usar
```bash
npm run start:qa
npm run build:qa
```

---

## 🐳 Docker/CI/CD

### Dockerfile Multi-Stage
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Argumento para escolher ambiente no build
ARG BUILD_ENV=production
RUN npm run build -- --configuration=$BUILD_ENV

FROM nginx:alpine
COPY --from=builder /app/dist/metrics-simple /usr/share/nginx/html
EXPOSE 80
```

### Build para cada ambiente
```bash
# Production
docker build --build-arg BUILD_ENV=production -t metrics-simple:prod .

# Staging
docker build --build-arg BUILD_ENV=staging -t metrics-simple:staging .
```

---

## 📊 Validação

### Verificar configuração atual (no browser console):
```javascript
// No código TypeScript:
import { environment } from './environments/environment';
console.log('Environment:', environment.envName);
console.log('API URL:', environment.apiBaseUrl);
```

### Testes
```bash
npm test
# ✅ 169 testes passando
# Testes usam sempre environment.ts (local)
```

---

## 🔒 Segurança

### ❌ **NÃO FAZER:**
- Commitar credenciais (API keys, tokens) nos environment files
- Expor secrets no código frontend

### ✅ **FAZER:**
- Configurações públicas apenas (URLs, feature flags)
- Secrets devem estar no backend
- Usar variáveis de ambiente para dados sensíveis no backend

---

## 🛠️ Troubleshooting

### Problema: URL não mudou após build
**Solução:**
```bash
rm -rf dist .angular
npm run build:staging
```

### Problema: Configuração errada em produção
**Solução:** Verifique o `fileReplacements` no angular.json e confirme que está buildando com `--configuration=production`

### Problema: Testes falhando
**Solução:** Testes sempre usam `environment.ts`. Se precisar de URL diferente, mocke no teste.

---

## 📚 Documentação Completa

Veja: [ENVIRONMENTS.md](./ENVIRONMENTS.md)

---

## ✅ Checklist de Deploy

- [ ] Atualizar URLs nos environment files
- [ ] Testar build local: `npm run build:<env>`
- [ ] Validar bundle size (não deve exceder limites)
- [ ] Testar aplicação buildada: `npx http-server dist/metrics-simple`
- [ ] Conferir que environment correto foi usado no build
- [ ] Deploy!

---

**🎯 Resultado:** Zero hardcoded URLs, configuração por ambiente via build time replacement.
