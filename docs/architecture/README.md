# 🏗️ Arquitetura - Metrics Simple Frontend

Documentação de arquitetura, análise e evolução do projeto.

---

## 📋 Documentos Disponíveis

### 📊 [FASE1-ANALISE.md](FASE1-ANALISE.md)
**Análise inicial do projeto**
- Requisitos levantados
- Análise de domínio
- Casos de uso identificados
- Ideal para: entender contexto inicial

### 🏛️ [FASE2-ARQUITETURA.md](FASE2-ARQUITETURA.md)
**Definição de arquitetura**
- Estrutura de camadas
- Componentes principais
- Padrões adotados
- Decisões arquiteturais
- Ideal para: entender decisões técnicas

### 📈 [EVOLUTION.md](EVOLUTION.md)
**Histórico de evolução**
- Mudanças ao longo do tempo
- Refatorações realizadas
- Lições aprendidas
- Ideal para: entender evolução do sistema

---

## 🎯 Visão Geral da Arquitetura

### Camadas

```
┌─────────────────────────────────┐
│         UI Layer (Angular)      │
│  - Components (standalone)      │
│  - Material Design 3            │
│  - Reactive Forms               │
└─────────────────────────────────┘
               ↓
┌─────────────────────────────────┐
│       Services Layer            │
│  - API Services                 │
│  - State Management             │
│  - Runtime Config               │
└─────────────────────────────────┘
               ↓
┌─────────────────────────────────┐
│       Core Layer                │
│  - HTTP Interceptors            │
│  - Error Handling               │
│  - Type Definitions             │
└─────────────────────────────────┘
               ↓
┌─────────────────────────────────┐
│       Backend API               │
│  - REST API (OpenAPI)           │
│  - JSON Schemas validation      │
└─────────────────────────────────┘
```

### Estrutura de Diretórios

```
src/
├── app/
│   ├── core/                  # Serviços core e config
│   │   ├── interceptors/      # HTTP interceptors
│   │   ├── models/            # Type definitions
│   │   └── services/          # API + Runtime Config
│   │
│   ├── features/              # Features modulares
│   │   ├── connectors/        # Gestão de conectores
│   │   └── processes/         # Gestão de processos
│   │
│   ├── shared/                # Componentes compartilhados
│   │   ├── components/        # UI components
│   │   └── pipes/             # Pipes reutilizáveis
│   │
│   └── layout/                # Layout e navegação
│
├── assets/                    # Assets estáticos
│   ├── config.json            # Runtime config
│   └── config.template.json   # Template para CI/CD
│
└── environments/              # Build-time configs
    ├── environment.ts
    ├── environment.prod.ts
    └── environment.staging.ts
```

---

## 🔑 Princípios Arquiteturais

### 1. **Spec-Driven Development**
- Contratos definidos em `specs/`
- OpenAPI para APIs
- JSON Schemas para validação
- Frontend implementa specs shared

### 2. **Standalone Components**
- Angular 17+ standalone pattern
- Sem NgModules
- Tree-shakeable
- Lazy loading nativo

### 3. **Separation of Concerns**
- UI separada de lógica de negócio
- Services encapsulam APIs
- Models definem tipos
- Interceptors tratam cross-cutting

### 4. **Configuration Flexibility**
- Build-time: environments (development)
- Runtime: config.json (production)
- Permite deploy sem rebuild

### 5. **Type Safety**
- TypeScript strict mode
- Interfaces para DTOs
- Type guards onde necessário

---

## 🔄 Fluxo de Dados

### Requisição API
```
Component
    ↓ (injeta)
API Service
    ↓ (usa)
Runtime Config Service (URL base)
    ↓
HTTP Client + Interceptors
    ↓
Backend API
    ↓
Response | ApiError
    ↓
Component (atualiza UI)
```

### Configuração Runtime
```
App Bootstrap
    ↓
APP_INITIALIZER
    ↓
RuntimeConfigService.loadConfig()
    ↓
HTTP GET /assets/config.json
    ↓
Config carregado em memória
    ↓
App inicia (components podem usar config)
```

---

## 📐 Padrões Adotados

### Design Patterns
- **Dependency Injection**: Angular DI system
- **Observer**: RxJS Observables
- **Singleton**: Services (providedIn: 'root')
- **Factory**: APP_INITIALIZER
- **Adapter**: Normalizers (DTO → Model)

### Angular Patterns
- **Smart/Dumb Components**: Containers vs Presentational
- **Reactive Forms**: FormGroup + FormControl
- **HTTP Interceptors**: Cross-cutting concerns
- **Standalone Components**: Composition over inheritance

### API Patterns
- **REST**: CRUD operations
- **OpenAPI Contract**: spec/shared/openapi/
- **Error Handling**: ApiError schema
- **Correlation IDs**: Request tracking

---

## 🔍 Decisões Arquiteturais (ADRs)

### ADR-001: Angular Standalone Components
**Decisão:** Usar standalone components (Angular 17+)  
**Motivo:** Simplificação, tree-shaking, composição  
**Documento:** [FASE2-ARQUITETURA.md](FASE2-ARQUITETURA.md)

### ADR-002: Runtime Configuration
**Decisão:** Adicionar config.json carregado via APP_INITIALIZER  
**Motivo:** Deploy sem rebuild, secrets fora do Git  
**Documento:** [EVOLUTION.md](EVOLUTION.md), [../configuration/RUNTIME-CONFIG.md](../configuration/RUNTIME-CONFIG.md)

### ADR-003: Material Design 3
**Decisão:** Usar Angular Material  
**Motivo:** Componentes prontos, acessibilidade, consistência  
**Documento:** [../development/TECH_STACK.md](../development/TECH_STACK.md)

### ADR-004: Spec-Driven Contracts
**Decisão:** Implementar baseado em specs/ (OpenAPI + JSON Schemas)  
**Motivo:** Contrato único backend/frontend, validação automática  
**Documento:** [FASE1-ANALISE.md](FASE1-ANALISE.md)

---

## 🔗 Links Relacionados

- [Tech Stack](../development/TECH_STACK.md)
- [Scope](../development/SCOPE.md)
- [Runtime Config](../configuration/RUNTIME-CONFIG.md)
- [Refactoring Summary](../development/REFACTORING-SUMMARY.md)
