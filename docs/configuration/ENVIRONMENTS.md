# Configuração de Ambientes

Este projeto usa **environment files** do Angular para gerenciar configurações específicas por ambiente, eliminando hardcoded URLs.

## Ambientes Disponíveis

### 1. **Local (Development)**
- **Arquivo:** `src/environments/environment.ts`
- **URL da API:** `http://localhost:8080/api/v1`
- **Quando usar:** Desenvolvimento local
- **Como rodar:**
  ```bash
  npm start
  # ou
  ng serve
  ```

### 2. **Staging**
- **Arquivo:** `src/environments/environment.staging.ts`
- **URL da API:** `https://staging-api.metrics-simple.com/api/v1`
- **Quando usar:** Testes de homologação/QA
- **Como rodar:**
  ```bash
  npm run start:staging
  # ou
  ng serve --configuration=staging
  ```
- **Como buildar:**
  ```bash
  npm run build:staging
  # ou
  ng build --configuration=staging
  ```

### 3. **Production**
- **Arquivo:** `src/environments/environment.prod.ts`
- **URL da API:** `https://api.metrics-simple.com/api/v1`
- **Quando usar:** Produção
- **Como buildar:**
  ```bash
  npm run build
  # ou
  ng build --configuration=production
  ```

## Como Adicionar um Novo Ambiente

### Passo 1: Criar arquivo de environment
```bash
# Exemplo: environment.qa.ts
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

E em `projects.metrics-simple.architect.serve.configurations`:
```json
"qa": {
  "buildTarget": "metrics-simple:build:qa"
}
```

### Passo 3: Adicionar scripts no package.json (opcional)
```json
{
  "scripts": {
    "start:qa": "ng serve --configuration=qa",
    "build:qa": "ng build --configuration=qa"
  }
}
```

## Como Funciona (File Replacement)

Durante o build, o Angular substitui automaticamente o arquivo base (`environment.ts`) pelo arquivo específico do ambiente:

- **Development:** Usa `environment.ts` diretamente
- **Staging:** Substitui `environment.ts` → `environment.staging.ts`
- **Production:** Substitui `environment.ts` → `environment.prod.ts`

Isso garante que **cada build contenha apenas as configurações do ambiente correto**.

## Checklist de Configuração por Ambiente

Ao configurar um novo ambiente, ajuste:

- [ ] `apiBaseUrl` - URL base da API backend
- [ ] `production` - true para prod/staging, false para dev
- [ ] `aiEnabled` - habilita/desabilita funcionalidades de IA
- [ ] `envName` - nome do ambiente (para debug/logs)

## Boas Práticas

✅ **NUNCA** commitar credenciais sensíveis nos arquivos environment  
✅ URLs de produção devem usar HTTPS  
✅ Validar que todas as configurações estão corretas antes do deploy  
✅ Use `environment.envName` em logs para identificar o ambiente  
✅ Testar build de cada ambiente antes do release  

## Docker/Kubernetes

Para deploy em containers, o build deve ser feito **durante a criação da imagem Docker**:

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Build com configuração específica via ARG
ARG ENV_CONFIG=production
RUN npm run build -- --configuration=$ENV_CONFIG

FROM nginx:alpine
COPY --from=builder /app/dist/metrics-simple /usr/share/nginx/html
```

Build:
```bash
# Build para staging
docker build --build-arg ENV_CONFIG=staging -t metrics-simple:staging .

# Build para production
docker build --build-arg ENV_CONFIG=production -t metrics-simple:prod .
```

## Troubleshooting

### "URL errada após build"
- Verifique se o `fileReplacements` está correto no angular.json
- Confirme que o arquivo environment específico existe
- Limpe e rebuilde: `rm -rf dist && ng build --configuration=<env>`

### "Configuração não está mudando"
- Limpe o cache: `npm run clean` ou `rm -rf .angular`
- Verifique se está usando a flag `--configuration` correta
- Confirme que não há imports diretos de `environment.prod.ts` no código

### "Testes quebraram"
- Testes sempre usam `environment.ts` (não substituem)
- Se precisar testar com URL diferente, mocke o environment no teste

## Referências

- [Angular Environments](https://angular.io/guide/build#configuring-application-environments)
- [File Replacements](https://angular.io/guide/workspace-config#fileReplacements)
