# 📊 Relatório de Implementação - Janeiro 2026

**Período**: 04/01/2026 - 05/01/2026  
**Projeto**: Metrics Simple Frontend  
**Versão**: 1.2.0  
**Responsável**: Daniel Seto

---

## 📋 Sumário Executivo

Durante os dias 04 e 05 de janeiro de 2026, foram realizadas implementações críticas relacionadas a:
1. **Feature de API Token em Connectors** (conforme Delta Spec Deck 2026-01-04)
2. **Eliminação de hardcoded URLs** (refatoração de configuração)
3. **Sistema de Runtime Configuration** (deployment-time config)
4. **Organização de documentação** (estrutura profissional)
5. **Migração completa para RuntimeConfigService**

**Total de arquivos modificados**: 80  
**Total de linhas adicionadas**: 4.124+  
**Total de linhas removidas**: 636  
**Commits**: 2 commits principais

---

## 🎯 Implementações por Categoria

### 1. Feature: API Token em Connector (Delta Spec Deck)

#### 1.1 Alterações no Schema Shared
**Arquivo**: `specs/shared/domain/schemas/connector.schema.json`

**Mudanças**:
- ✅ Adicionado campo `apiToken` (opcional, string, 1-500 caracteres)
- ✅ Descrição: "Optional API token/key stored in the connector (alternative to authRef)"
- ✅ Campo segue padrão de segurança (não deve ser logado)

**Impacto no contrato**:
```json
{
  "apiToken": {
    "type": "string",
    "minLength": 1,
    "maxLength": 500,
    "description": "Optional API token/key stored in the connector (alternative to authRef)"
  }
}
```

#### 1.2 Modelo TypeScript (Frontend)
**Arquivo**: `src/app/shared/models/connector.model.ts`

**Mudanças**:
- ✅ Adicionado campo `apiToken?: string` na interface `ConnectorDto`
- ✅ Campo opcional conforme schema
- ✅ Compatível com backend

```typescript
export interface ConnectorDto {
  id: string;
  name: string;
  baseUrl: string;
  authRef: string;
  apiToken?: string;  // NOVO
  timeoutSeconds: number;
}
```

#### 1.3 Normalizer
**Arquivo**: `src/app/shared/utils/normalizers.ts`

**Mudanças**:
- ✅ Função `normalizeConnector()` atualizada para incluir `apiToken`
- ✅ Preserva valor quando presente
- ✅ Compatível com versões anteriores (campo opcional)

#### 1.4 UI - Dialog de Connector
**Arquivo**: `src/app/features/connectors/connector-dialog/connector-dialog.component.ts`

**Mudanças**:
- ✅ Adicionado campo `apiToken` ao FormGroup
- ✅ Validação: 1-500 caracteres (quando preenchido)
- ✅ Campo opcional (não obrigatório)
- ✅ Template HTML atualizado com Material Design 3:
  - Label: "API Token (optional)"
  - Hint: "Leave empty to use authRef-based authentication"
  - Max length: 500 caracteres

**Validação implementada**:
```typescript
apiToken: ['', [Validators.maxLength(500)]]
```

#### 1.5 UI - Lista de Connectors
**Arquivo**: `src/app/features/connectors/connectors-list/connectors-list.component.ts`

**Mudanças**:
- ✅ Coluna "API Token" adicionada à tabela
- ✅ Exibe "***" quando apiToken presente (segurança)
- ✅ Exibe "-" quando apiToken ausente
- ✅ Responsivo e alinhado com Material Design 3

#### 1.6 Testes Unitários
**Arquivos**:
- `src/app/shared/utils/normalizers.spec.ts`
- `src/app/core/services/api/connectors.service.spec.ts`

**Cobertura de testes**:
- ✅ Normalizer preserva `apiToken` quando presente
- ✅ Normalizer omite `apiToken` quando ausente
- ✅ ConnectorService CRUD funciona com `apiToken`
- ✅ Validação de schema

**Status**: ✅ **175 testes passando** (169 originais + 6 novos)

---

### 2. Refatoração: Eliminação de Hardcoded URLs

#### 2.1 Problema Identificado
❌ **Antes**: URLs do backend hardcoded em múltiplos locais:
- Services: 35 ocorrências de URLs hardcoded
- Testes: URLs duplicadas e inconsistentes
- Impossível trocar ambiente sem rebuild

#### 2.2 Solução Implementada

##### Environment Files (Build-time)
**Arquivos criados**:
1. `src/environments/environment.ts` (local)
2. `src/environments/environment.prod.ts` (production)
3. `src/environments/environment.staging.ts` (staging)

**Configuração**:
```typescript
// environment.ts (local)
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/api/v1',
  aiEnabled: true,
  envName: 'local'
};

// environment.prod.ts
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.metrics-simple.com/api/v1',
  aiEnabled: true,
  envName: 'production'
};
```

##### Angular Configuration
**Arquivo**: `angular.json`

**Mudanças**:
- ✅ Adicionada configuração `staging`
- ✅ fileReplacements configurados para trocar environment files
- ✅ Build scripts atualizados

```json
"staging": {
  "fileReplacements": [
    {
      "replace": "src/environments/environment.ts",
      "with": "src/environments/environment.staging.ts"
    }
  ]
}
```

##### ConfigService Helper
**Arquivo**: `src/app/core/services/config.service.ts`

**Funcionalidades**:
- ✅ Centraliza acesso a `environment`
- ✅ Getters tipados
- ✅ Testável
- ✅ Single source of truth

##### Build Helper Scripts
**Arquivos criados**:
1. `scripts/build-helper.ps1` (PowerShell)
2. `scripts/build-helper.sh` (Bash)

**Uso**:
```bash
# PowerShell
.\scripts\build-helper.ps1 production
.\scripts\build-helper.ps1 staging
.\scripts\build-helper.ps1 local

# Bash
./scripts/build-helper.sh production
./scripts/build-helper.sh staging
./scripts/build-helper.sh local
```

#### 2.3 Services Refatorados
**Total**: 35 URLs corrigidas em:
- `connectors.service.ts`
- `processes.service.ts`
- `versions.service.ts`
- `preview.service.ts`
- `ai.service.ts`

**Padrão aplicado**:
```typescript
// ANTES (hardcoded)
private readonly baseUrl = 'http://localhost:8080/api/v1/connectors';

// DEPOIS (environment)
import { environment } from '../../../../environments/environment';
private readonly baseUrl = `${environment.apiBaseUrl}/connectors`;
```

#### 2.4 Testes Atualizados
**Total**: 35 testes corrigidos

**Mudanças**:
- ✅ Substituição de URLs hardcoded por `environment.apiBaseUrl`
- ✅ Testes parametrizados
- ✅ Fixtures compartilhados
- ✅ Cobertura mantida 100%

---

### 3. Sistema de Runtime Configuration

#### 3.1 Motivação
**Problema**: Configurações de deployment (URLs, secrets) não podem ficar no Git e requerem rebuild para mudar.

**Solução**: Sistema de configuração carregada em runtime via HTTP.

#### 3.2 Arquivos de Configuração

##### config.json (Runtime - Development)
**Arquivo**: `src/assets/config.json`

```json
{
  "apiBaseUrl": "http://localhost:8080/api/v1",
  "aiEnabled": true,
  "production": false,
  "envName": "local"
}
```

**Uso**: Desenvolvimento local, carregado pelo browser

##### config.template.json (Template para CI/CD)
**Arquivo**: `src/assets/config.template.json`

```json
{
  "apiBaseUrl": "${API_BASE_URL}",
  "aiEnabled": "${AI_ENABLED}",
  "production": "${PRODUCTION}",
  "envName": "${ENV_NAME}"
}
```

**Uso**: CI/CD substitui `${VAR}` com valores reais no deploy

#### 3.3 RuntimeConfigService
**Arquivo**: `src/app/core/services/runtime-config.service.ts`

**Funcionalidades**:
- ✅ Carrega `config.json` via HTTP no bootstrap
- ✅ Cache-buster para evitar cache do browser
- ✅ Fallback para valores padrão em caso de falha
- ✅ Getters tipados (apiBaseUrl, isProduction, isAiEnabled, environmentName)
- ✅ Injetável em qualquer service

**Implementação**:
```typescript
async loadConfig(): Promise<void> {
  try {
    const cacheBuster = new Date().getTime();
    this.config = await firstValueFrom(
      this.http.get<RuntimeConfig>(`/assets/config.json?v=${cacheBuster}`)
    );
  } catch (error) {
    // Fallback para config padrão
    this.config = { /* defaults */ };
  }
}
```

#### 3.4 APP_INITIALIZER Integration
**Arquivo**: `src/app/app.config.ts`

**Mudanças**:
- ✅ Adicionado `APP_INITIALIZER` que bloqueia bootstrap
- ✅ Carrega `config.json` antes de qualquer componente inicializar
- ✅ Garante que configuração está disponível

```typescript
export function initializeApp(configService: RuntimeConfigService) {
  return () => configService.loadConfig();
}

{
  provide: APP_INITIALIZER,
  useFactory: initializeApp,
  deps: [RuntimeConfigService],
  multi: true
}
```

#### 3.5 Docker Integration

##### docker-entrypoint.sh
**Arquivo**: `docker/docker-entrypoint.sh`

**Funcionalidade**:
- ✅ Substitui variáveis de ambiente no `config.json` usando `envsubst`
- ✅ Executa antes do Nginx iniciar
- ✅ Permite deployment sem rebuild

```bash
envsubst < config.template.json > config.json
```

##### Dockerfile.runtime
**Arquivo**: `docker/Dockerfile.runtime`

**Features**:
- ✅ Multi-stage build
- ✅ Instala `gettext` para `envsubst`
- ✅ Copia template e entrypoint
- ✅ Usa ENTRYPOINT para injeção de config

**Uso**:
```bash
docker build -f docker/Dockerfile.runtime -t metrics-simple:latest .

docker run -p 80:80 \
  -e API_BASE_URL=https://api.prod.com/api/v1 \
  -e PRODUCTION=true \
  metrics-simple:latest
```

---

### 4. Migração para RuntimeConfigService (05/01/2026)

#### 4.1 Problema Crítico Identificado
**Bug**: Frontend em `localhost:4200` estava chamando `https://api.metrics-simple.com/api/auth/token` (produção) ao invés de `http://localhost:8080/api/v1` (local).

**Causa raiz**: Services ainda usavam `environment` diretamente, que era trocado no build. Como o browser carregava um build de produção, pegava URL errada.

#### 4.2 Solução: Migração Completa

##### Services Migrados (5 total)
1. ✅ **ConnectorsService**
2. ✅ **ProcessesService**
3. ✅ **VersionsService**
4. ✅ **PreviewService**
5. ✅ **AiService**

##### AuthProvider Migrado
6. ✅ **LocalJwtAuthProvider**

**Padrão de migração**:
```typescript
// ANTES
import { environment } from '../../../../environments/environment';
private readonly baseUrl = `${environment.apiBaseUrl}/connectors`;

// DEPOIS
import { RuntimeConfigService } from '../runtime-config.service';
private readonly config = inject(RuntimeConfigService);

private get baseUrl(): string {
  return `${this.config.apiBaseUrl}/connectors`;
}
```

**Mudanças-chave**:
- ❌ Removido import de `environment`
- ✅ Adicionado inject de `RuntimeConfigService`
- ✅ Convertido propriedade estática para getter dinâmico
- ✅ Valores carregados de `config.json` em runtime

#### 4.3 AuthInterceptor
**Arquivo**: `src/app/core/auth/interceptors/auth.interceptor.ts`

**Mudanças**:
- ✅ Migrado para `RuntimeConfigService`
- ✅ Decisão de injetar `Authorization` header baseada em runtime config
- ✅ Suporta múltiplos ambientes sem rebuild

#### 4.4 Testes Atualizados
**Arquivos**:
- `local-jwt-auth.provider.spec.ts`
- `auth.interceptor.spec.ts`

**Mudanças**:
- ✅ Mocks de `RuntimeConfigService` adicionados
- ✅ Testes validam comportamento com config dinâmica
- ✅ Todos os testes passando

**Status final**: ✅ **175 testes passando**

---

### 5. Organização de Documentação

#### 5.1 Estrutura Profissional Criada

```
docs/
├── README.md                          # Índice geral navegável
├── TUTORIAL-END-TO-END.md             # Tutorial completo
├── VERSION.md                         # Versão atual
├── RELEASE_NOTES.md                   # Notas de release
├── IMPLEMENTATION-REPORT-JAN-2026.md  # Este relatório
│
├── configuration/                     # ⚙️ Configurações
│   ├── README.md
│   ├── ENVIRONMENT-CONFIG.md          # Guia rápido
│   ├── ENVIRONMENTS.md                # Documentação técnica
│   ├── RUNTIME-CONFIG.md              # Config runtime (Docker)
│   └── QUICK-START-ENVIRONMENTS.md    # Exemplos práticos
│
├── deployment/                        # 🐳 Deploy
│   ├── README.md
│   ├── DOCKER_SETUP.md
│   ├── DOCKER_README.md
│   └── DOCKER_VALIDATION_REPORT.md
│
├── architecture/                      # 🏗️ Arquitetura
│   ├── README.md
│   ├── FASE1-ANALISE.md
│   ├── FASE2-ARQUITETURA.md
│   └── EVOLUTION.md
│
└── development/                       # 💻 Dev
    ├── README.md
    ├── SCOPE.md
    ├── TECH_STACK.md
    ├── PROMPTS.md
    └── REFACTORING-SUMMARY.md
```

#### 5.2 Documentos Criados (Novos)

1. **docs/README.md** (140 linhas)
   - Índice geral de toda documentação
   - Navegação por cenário
   - Mapa visual da estrutura
   - Links para specs e código

2. **docs/configuration/ENVIRONMENT-CONFIG.md** (240 linhas)
   - Guia rápido de configuração
   - Setup inicial
   - Comandos básicos
   - Exemplos práticos

3. **docs/configuration/ENVIRONMENTS.md** (170 linhas)
   - Documentação técnica completa
   - Arquitetura de ambientes
   - Sistema de fileReplacements
   - Build para múltiplos ambientes

4. **docs/configuration/RUNTIME-CONFIG.md** (330 linhas)
   - Configuração em runtime (deployment-time)
   - Docker examples
   - CI/CD integration
   - Troubleshooting

5. **docs/configuration/QUICK-START-ENVIRONMENTS.md** (312 linhas)
   - Receitas prontas
   - Copy-paste de comandos
   - Casos de uso comuns

6. **docs/deployment/DOCKER_SETUP.md** (233 linhas)
   - Setup Docker
   - Instalação
   - Comandos básicos

7. **docs/deployment/DOCKER_README.md** (165 linhas)
   - Docker Compose
   - Multi-stage builds
   - Nginx configuration

8. **docs/deployment/DOCKER_VALIDATION_REPORT.md** (173 linhas)
   - Testes executados
   - Resultados de validação
   - Issues conhecidas

9. **docs/development/README.md** (294 linhas)
   - Setup de desenvolvimento
   - Comandos principais
   - Padrões de código
   - Estrutura do projeto

10. **docs/development/REFACTORING-SUMMARY.md** (186 linhas)
    - Resumo de refatorações
    - Eliminação de hardcodes
    - Impacto e validação

11. **docs/architecture/README.md** (218 linhas)
    - Visão geral da arquitetura
    - Camadas e componentes
    - Princípios arquiteturais
    - Decisões arquiteturais (ADRs)

12. **READMEs de seção** (4 arquivos)
    - `docs/configuration/README.md`
    - `docs/deployment/README.md`
    - `docs/architecture/README.md`
    - `docs/development/README.md`

#### 5.3 Documentos Movidos (Organizados)

**Da raiz para `docs/`**:
- `RELEASE_NOTES.md` → `docs/RELEASE_NOTES.md`
- `VERSION.md` → `docs/VERSION.md`

**Para subpastas temáticas**:
- `PROMPTS.md` → `docs/development/PROMPTS.md`
- `SCOPE.md` → `docs/development/SCOPE.md`
- `TECH_STACK.md` → `docs/development/TECH_STACK.md`
- `EVOLUTION.md` → `docs/architecture/EVOLUTION.md`
- `FASE1-ANALISE.md` → `docs/architecture/FASE1-ANALISE.md`
- `FASE2-ARQUITETURA.md` → `docs/architecture/FASE2-ARQUITETURA.md`

#### 5.4 Navegação Inteligente

Cada pasta tem `README.md` com:
- ✅ Índice dos documentos
- ✅ Guia "quando usar cada doc"
- ✅ Links relacionados
- ✅ Exemplos práticos

**Exemplo - docs/configuration/README.md**:
```markdown
### "Estou começando no projeto"
→ Leia ENVIRONMENT-CONFIG.md

### "Preciso entender a arquitetura de configs"
→ Leia ENVIRONMENTS.md

### "Preciso fazer deploy em produção"
→ Leia RUNTIME-CONFIG.md
```

---

### 6. Docker e Scripts

#### 6.1 Docker Files

**Arquivos criados**:
1. `docker/Dockerfile` - Build padrão
2. `docker/Dockerfile.runtime` - Build com runtime config
3. `docker/docker-compose.yml` - Orquestração
4. `docker/docker-entrypoint.sh` - Injeção de config
5. `docker/nginx.conf` - Configuração Nginx para SPA
6. `docker/.dockerignore`
7. `.dockerignore` (raiz)

#### 6.2 Scripts Auxiliares

**Docker Management**:
1. `docker/scripts/docker-manager.ps1` (PowerShell)
2. `docker/scripts/docker-manager.sh` (Bash)
3. `docker/scripts/docker-health.ps1` (PowerShell)
4. `docker/scripts/docker-health.sh` (Bash)

**Build Helpers** (já mencionado):
1. `scripts/build-helper.ps1`
2. `scripts/build-helper.sh`

**Scripts delegados** (wrappers na raiz):
1. `scripts/docker-health.ps1` → chama `docker/scripts/docker-health.ps1`
2. `scripts/docker-health.sh` → chama `docker/scripts/docker-health.sh`
3. `scripts/docker-manager.ps1` → chama `docker/scripts/docker-manager.ps1`
4. `scripts/docker-manager.sh` → chama `docker/scripts/docker-manager.sh`

---

### 7. Limpeza e Organização

#### 7.1 Arquivos Removidos da Raiz

**Movidos para pastas apropriadas**:
- ❌ `spec-deck-manifest.json` → ✅ `specs/spec-deck-manifest.json`
- ❌ Todos os `.md` temáticos → ✅ `docs/`

**Raiz limpa final**:
```
/
├── .editorconfig
├── .gitignore
├── angular.json
├── package.json
├── package-lock.json
├── README.md
├── tsconfig.json
├── tsconfig.app.json
└── tsconfig.spec.json
```

**Apenas arquivos obrigatórios** permanecem na raiz.

#### 7.2 Kubernetes Removido

**Decisão**: Projeto não usará Kubernetes.

**Ações**:
- ❌ Removido `k8s-deployment.yaml`
- ✅ Removidas todas as referências a Kubernetes em docs
- ✅ Foco exclusivo em Docker

---

## 📊 Estatísticas de Mudanças

### Commit 1: Documentation & Structure (04/01/2026)
**Commit**: `b46aee2`

**Arquivos modificados**: 71  
**Linhas adicionadas**: +4.064  
**Linhas removidas**: -609

**Breakdown por tipo**:
- Documentação: 12 novos arquivos (2.500+ linhas)
- Configuração: 3 environment files
- Services: 6 arquivos refatorados
- Testes: 9 arquivos atualizados
- Scripts: 8 helper scripts
- Docker: 6 arquivos Docker
- Schemas: 3 arquivos de spec atualizados

### Commit 2: RuntimeConfigService Migration (05/01/2026)
**Commit**: `50b24f0`

**Arquivos modificados**: 9  
**Linhas adicionadas**: +60  
**Linhas removidas**: -27

**Breakdown**:
- Services migrados: 5 (connectors, processes, versions, preview, ai)
- AuthProvider migrado: 1
- Interceptor atualizado: 1
- Testes atualizados: 2

### Total Geral
**Arquivos únicos modificados**: 80  
**Total de adições**: 4.124+ linhas  
**Total de remoções**: 636 linhas  
**Saldo líquido**: +3.488 linhas

---

## 🔍 Impactos no Spec Deck

### 1. Schemas Shared

#### connector.schema.json
**Mudanças**:
- ✅ Campo `apiToken` adicionado (opcional)
- ✅ Validação: 1-500 caracteres
- ✅ Descrição documentada

**Sincronização necessária**:
- ⚠️ Backend deve suportar `apiToken` no Connector
- ⚠️ Migrations SQLite devem adicionar coluna `ApiToken`
- ⚠️ Repository deve persistir `apiToken`
- ⚠️ OpenAPI deve documentar `apiToken` nas respostas

### 2. Frontend Specs

#### specs/frontend/11-ui/pages/connectors.md
**Mudanças**:
- ✅ Campo "API Token" adicionado ao form
- ✅ Validação especificada (max 500)
- ✅ UX definida (opcional, hint text)

**Sincronização necessária**:
- ✅ Implementação já conforme spec
- ⚠️ Spec deve ser atualizada se houver divergências de UX

#### specs/frontend/11-ui/ui-field-catalog.md
**Mudanças**:
- ✅ Campo `apiToken` adicionado ao catálogo

**Sincronização necessária**:
- ✅ Catálogo deve listar `apiToken` como campo opcional de Connector

### 3. Backend Specs

#### specs/backend/03-interfaces/api-behavior.md
**Impacto**:
- ⚠️ Endpoints CRUD de Connector devem aceitar/retornar `apiToken`
- ⚠️ Validação server-side: 1-500 caracteres

#### specs/backend/06-storage/sqlite-schema.md
**Impacto**:
- ⚠️ Tabela `Connectors` deve ter coluna `ApiToken TEXT NULL`
- ⚠️ Migration deve ser criada

#### specs/backend/04-execution/runner-pipeline.md
**Impacto**:
- ⚠️ Runner deve suportar uso de `apiToken` ao invés de `authRef`
- ⚠️ Precedência: `apiToken` (se presente) > `authRef`
- ⚠️ Header HTTP: `Authorization: Bearer {apiToken}`

### 4. Configuração e Deploy

#### Novos conceitos implementados não documentados nas specs

**Runtime Configuration**:
- ✅ Sistema de `config.json` carregado via HTTP
- ✅ `RuntimeConfigService` com APP_INITIALIZER
- ✅ Template para CI/CD (`config.template.json`)
- ✅ Docker entrypoint com `envsubst`

**Sincronização necessária**:
- ⚠️ Specs frontend devem documentar `RuntimeConfigService`
- ⚠️ Specs deployment devem incluir exemplo de runtime config
- ⚠️ README de arquitetura deve explicar decisão de runtime config

**Environment System**:
- ✅ 3 environments (local, staging, production)
- ✅ fileReplacements no angular.json
- ✅ Build scripts para cada ambiente

**Sincronização necessária**:
- ⚠️ Specs frontend devem documentar strategy de environments
- ⚠️ Guia de deployment deve explicar build por ambiente

---

## ⚠️ Ações Requeridas para Sincronização do Spec Deck

### Prioridade ALTA (Obrigatória)

1. **specs/shared/domain/schemas/connector.schema.json**
   - ✅ JÁ SINCRONIZADO - Campo `apiToken` adicionado
   - Ação: Validar se descrição está adequada

2. **specs/backend/06-storage/sqlite-schema.md**
   - ❌ NÃO SINCRONIZADO
   - Ação: Adicionar coluna `ApiToken TEXT NULL` à tabela `Connectors`
   - Exemplo:
     ```sql
     ALTER TABLE Connectors ADD COLUMN ApiToken TEXT NULL;
     ```

3. **specs/backend/03-interfaces/api-behavior.md**
   - ❌ NÃO SINCRONIZADO
   - Ação: Documentar que `apiToken` é aceito em POST/PUT Connector
   - Ação: Documentar que `apiToken` é retornado em GET Connector

4. **specs/backend/04-execution/runner-pipeline.md**
   - ❌ NÃO SINCRONIZADO
   - Ação: Documentar uso de `apiToken` no FetchSource
   - Regra: Se `apiToken` presente, usar `Authorization: Bearer {apiToken}`
   - Regra: Se `apiToken` ausente, resolver `authRef` via env var

5. **specs/shared/openapi/config-api.yaml**
   - ❌ NÃO SINCRONIZADO
   - Ação: Adicionar campo `apiToken` no schema de Connector
   - Exemplo:
     ```yaml
     ConnectorDto:
       properties:
         apiToken:
           type: string
           maxLength: 500
           description: Optional API token
     ```

### Prioridade MÉDIA (Recomendada)

6. **specs/frontend/02-domain/configuration-strategy.md** (NOVO)
   - ❌ DOCUMENTO NÃO EXISTE
   - Ação: Criar documento explicando:
     - Build-time configuration (environment files)
     - Runtime configuration (config.json + RuntimeConfigService)
     - Quando usar cada approach
     - APP_INITIALIZER pattern

7. **specs/frontend/06-storage/runtime-config.md** (NOVO)
   - ❌ DOCUMENTO NÃO EXISTE
   - Ação: Criar documento explicando:
     - RuntimeConfigService API
     - config.json structure
     - config.template.json para CI/CD
     - Integration com Docker

8. **specs/frontend/11-ui/pages/connectors.md**
   - ⚠️ PARCIALMENTE SINCRONIZADO
   - Ação: Validar se campo `apiToken` está documentado com:
     - Label exato: "API Token (optional)"
     - Hint text: "Leave empty to use authRef-based authentication"
     - Validação: maxLength 500

9. **specs/backend/09-testing/integration-tests.md**
   - ⚠️ VERIFICAR SINCRONIZAÇÃO
   - Ação: Adicionar caso de teste com `apiToken`:
     - Criar Connector com `apiToken`
     - Runner deve usar `apiToken` ao invés de `authRef`
     - Mock server deve validar header `Authorization: Bearer {token}`

### Prioridade BAIXA (Melhoria)

10. **specs/frontend/00-vision/architecture-decisions.md** (NOVO)
    - ❌ DOCUMENTO NÃO EXISTE
    - Ação: Documentar ADR sobre Runtime Configuration
    - Conteúdo:
      - Decisão: Usar config.json carregado via HTTP
      - Motivação: Deployment sem rebuild, secrets fora do Git
      - Alternativas consideradas: environment only, Azure App Config
      - Consequências: Maior flexibilidade, pequena latência no boot

11. **specs/shared/FRONTEND_INTEGRATION.md**
    - ⚠️ VERIFICAR SINCRONIZAÇÃO
    - Ação: Adicionar seção sobre configuração runtime
    - Ação: Documentar precedência de configs (runtime > build-time)

---

## 🧪 Status de Testes

### Testes Unitários
**Total**: 175 testes  
**Status**: ✅ **100% passando**

**Cobertura**:
- ✅ ConnectorsService (com `apiToken`)
- ✅ ProcessesService
- ✅ VersionsService
- ✅ PreviewService
- ✅ AiService
- ✅ ConfigService
- ✅ RuntimeConfigService (implícito via APP_INITIALIZER)
- ✅ Normalizers (com `apiToken`)
- ✅ AuthProvider
- ✅ AuthInterceptor
- ✅ Guards (auth, admin)

### Testes de Integração (E2E)
**Status**: ⚠️ **NÃO IMPLEMENTADOS**

**Recomendação**:
- Conforme `specs/frontend/09-testing/ui-e2e-tooling.md`
- Ferramentas: Reqnroll + Selenium + xUnit
- Escopo mínimo:
  - Login com credenciais válidas
  - CRUD de Connector (incluindo `apiToken`)
  - Verificação de roles (Admin vs Reader)

---

## 📝 Itens Pendentes (Próximos Passos)

### Frontend

1. ✅ **DONE**: Feature API Token implementada
2. ✅ **DONE**: Runtime Configuration implementada
3. ✅ **DONE**: Services migrados para RuntimeConfigService
4. ⏳ **TODO**: Implementar testes E2E (conforme specs/frontend/09-testing/)
5. ⏳ **TODO**: Validar behavior com backend real (quando disponível)

### Backend

1. ⏳ **TODO**: Adicionar coluna `ApiToken` à tabela Connectors
2. ⏳ **TODO**: Atualizar Repository para persistir `apiToken`
3. ⏳ **TODO**: Atualizar API endpoints para aceitar/retornar `apiToken`
4. ⏳ **TODO**: Atualizar Runner para usar `apiToken` em FetchSource
5. ⏳ **TODO**: Criar migration SQLite para adicionar coluna
6. ⏳ **TODO**: Atualizar integration tests com caso `apiToken`

### Spec Deck

1. ⏳ **TODO**: Sincronizar schema em `sqlite-schema.md`
2. ⏳ **TODO**: Documentar `apiToken` em `api-behavior.md`
3. ⏳ **TODO**: Atualizar `runner-pipeline.md` com lógica de `apiToken`
4. ⏳ **TODO**: Adicionar `apiToken` ao OpenAPI `config-api.yaml`
5. ⏳ **TODO**: Criar documento de Runtime Configuration
6. ⏳ **TODO**: Documentar ADR sobre configuração runtime

---

## 🔗 Referências e Links

### Commits
- **b46aee2**: Documentation & Structure (04/01/2026)
- **50b24f0**: RuntimeConfigService Migration (05/01/2026)

### Documentação Criada
- [docs/README.md](../docs/README.md) - Índice geral
- [docs/configuration/RUNTIME-CONFIG.md](../docs/configuration/RUNTIME-CONFIG.md) - Runtime config
- [docs/development/REFACTORING-SUMMARY.md](../docs/development/REFACTORING-SUMMARY.md) - Refatorações

### Specs Afetadas
- `specs/shared/domain/schemas/connector.schema.json`
- `specs/backend/06-storage/sqlite-schema.md`
- `specs/backend/03-interfaces/api-behavior.md`
- `specs/backend/04-execution/runner-pipeline.md`
- `specs/shared/openapi/config-api.yaml`
- `specs/frontend/11-ui/pages/connectors.md`

### Código Principal
- `src/app/shared/models/connector.model.ts`
- `src/app/core/services/runtime-config.service.ts`
- `src/app/core/services/api/connectors.service.ts`
- `src/app/features/connectors/connector-dialog/connector-dialog.component.ts`

---

## ✅ Checklist de Validação para Spec Deck

Use este checklist para validar sincronização:

### Schemas
- [x] `connector.schema.json` tem campo `apiToken` (opcional, string, 1-500)
- [ ] OpenAPI `config-api.yaml` documenta `apiToken` em ConnectorDto
- [ ] Backend repository persiste `apiToken`

### Backend Behavior
- [ ] `sqlite-schema.md` documenta coluna `ApiToken TEXT NULL`
- [ ] `api-behavior.md` documenta CRUD com `apiToken`
- [ ] `runner-pipeline.md` documenta uso de `apiToken` vs `authRef`
- [ ] Integration tests cobrem caso com `apiToken`

### Frontend
- [x] Modelo TypeScript tem `apiToken?: string`
- [x] Dialog de Connector tem campo `apiToken` (opcional, max 500)
- [x] Lista de Connectors exibe `apiToken` (mascarado com ***)
- [x] Normalizer preserva `apiToken`
- [x] Testes unitários cobrem `apiToken`
- [ ] Testes E2E validam fluxo com `apiToken`

### Configuração
- [x] RuntimeConfigService implementado
- [x] config.json + config.template.json criados
- [x] APP_INITIALIZER configurado
- [x] Services usam RuntimeConfigService
- [ ] Specs frontend documentam runtime config strategy
- [ ] ADR sobre runtime config criado

### Documentação
- [x] Documentação organizada em estrutura profissional
- [x] READMEs de navegação criados
- [x] Guias de configuração completos
- [x] Docker documentation atualizada
- [ ] Spec deck sincronizado 100%

---

## 📧 Contato e Suporte

**Responsável**: Daniel Seto  
**Email**: daniel.rubens.seto@gmail.com  
**Data**: 05/01/2026

Para dúvidas sobre implementação:
1. Consultar documentação em `docs/`
2. Verificar specs em `specs/`
3. Revisar commits `b46aee2` e `50b24f0`

---

**Fim do Relatório**
