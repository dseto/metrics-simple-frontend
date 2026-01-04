# FASE 1 — Análise do Spec Deck

**Data:** 2026-01-02  
**Projeto:** MetricsSimple Frontend v1.0  
**Fonte:** metrics-simple-spec-deck-v1.2.0

---

## 1. Resumo Executivo

O **MetricsSimple** é uma plataforma de geração de métricas onde regras determinísticas (DSL) são criadas, validadas e executadas. A geração da DSL pode ser assistida por LLM, mas o runtime é 100% determinístico.

Este documento apresenta a análise completa do Spec Deck para o desenvolvimento do **frontend** em Angular 17+ com Material Design 3.

---

## 2. Páginas Identificadas

| Rota | Página | Propósito |
|------|--------|-----------|
| `/` ou `/dashboard` | Dashboard | Visão rápida de processos, atalhos para criação/edição |
| `/processes` | ProcessesList | Listagem, busca e ações (create/edit/delete) de processos |
| `/processes/new` | ProcessEditor (create) | Criar novo Process |
| `/processes/:id` | ProcessEditor (edit) | Editar Process existente |
| `/processes/:id/versions/new` | VersionEditor (create) | Criar nova ProcessVersion |
| `/processes/:id/versions/:version` | VersionEditor (edit) | Editar ProcessVersion existente |
| `/connectors` | Connectors | CRUD de Connectors |
| `/preview` | PreviewTransform | Tela dedicada para testar transformação |
| `/runner` | RunnerHelp | Documentação do CLI Runner |

---

## 3. Componentes Identificados

### 3.1 Shell / Layout
- **MsAppShell**: Layout global (drawer + top bar + container)
- **MsPageHeader**: Cabeçalho de página com título, breadcrumbs, ações

### 3.2 Data / Lists
- **MsStatusChip**: Chip de status (Draft/Active/Disabled)
- **MsProcessTable**: Tabela de processos
- **MsConnectorTable**: Tabela de connectors
- **MsProcessListCompact**: Lista compacta para mobile

### 3.3 Forms
- **MsFormFooter**: Rodapé de formulário com ações
- **MsProcessForm**: Formulário de Process
- **MsProcessVersionForm**: Formulário de ProcessVersion
- **MsKeyValueEditor**: Editor de pares chave-valor (headers/queryParams)
- **MsJsonEditorLite**: Editor JSON simplificado (textarea monospace)

### 3.4 Preview
- **MsPreviewPanel**: Painel de preview com tabs (JSON/CSV/Errors)
- **MsPreviewWorkbench**: Workbench completo de preview

### 3.5 Feedback
- **MsErrorBanner**: Banner de erro com retry
- **MsSnackbar**: Notificações toast
- **MsConfirmDialog**: Dialog de confirmação
- **MsEmptyState**: Estado vazio com CTA
- **MsSkeletonList**: Skeleton para listas
- **MsSkeletonForm**: Skeleton para formulários

### 3.6 AI Assistant
- **MsAiAssistantPanel**: Painel de geração assistida de DSL/Schema

---

## 4. Contratos de API

### 4.1 Endpoints

| Recurso | Método | Endpoint | Descrição |
|---------|--------|----------|-----------|
| Connectors | GET | `/api/connectors` | Listar connectors |
| Connectors | POST | `/api/connectors` | Criar connector |
| Connectors | GET | `/api/connectors/{id}` | Obter connector |
| Connectors | PUT | `/api/connectors/{id}` | Atualizar connector |
| Connectors | DELETE | `/api/connectors/{id}` | Deletar connector |
| Processes | GET | `/api/processes` | Listar processes |
| Processes | POST | `/api/processes` | Criar process |
| Processes | GET | `/api/processes/{id}` | Obter process |
| Processes | PUT | `/api/processes/{id}` | Atualizar process |
| Processes | DELETE | `/api/processes/{id}` | Deletar process |
| Versions | GET | `/api/processes/{id}/versions` | Listar versions |
| Versions | POST | `/api/processes/{id}/versions` | Criar version |
| Versions | GET | `/api/processes/{id}/versions/{v}` | Obter version |
| Versions | PUT | `/api/processes/{id}/versions/{v}` | Atualizar version |
| Versions | DELETE | `/api/processes/{id}/versions/{v}` | Deletar version |
| Preview | POST | `/api/preview/transform` | Preview de transformação |
| AI | POST | `/api/ai/dsl/generate` | Gerar DSL via LLM |

### 4.2 DTOs Principais

**ProcessDto**
```typescript
type ProcessDto = {
  id: string;
  name: string;
  description?: string | null;
  status: 'Draft' | 'Active' | 'Disabled';
  connectorId: string;
  tags?: string[] | null;
  outputDestinations: OutputDestination[];
};
```

**ProcessVersionDto**
```typescript
type ProcessVersionDto = {
  processId: string;
  version: number;
  enabled: boolean;
  sourceRequest: SourceRequestDto;
  dsl: DslDto;
  outputSchema: any;
  sampleInput?: any;
};
```

**ConnectorDto**
```typescript
type ConnectorDto = {
  id: string;
  name: string;
  baseUrl: string;
  authRef: string;
  timeoutSeconds: number;
  enabled?: boolean;
};
```

---

## 5. Estados de UI

### 5.1 PageState (comum)
```typescript
type PageState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'ready'; dirty: boolean }
  | { kind: 'saving'; dirty: boolean }
  | { kind: 'deleting'; dirty: boolean }
  | { kind: 'error'; dirty: boolean; error: UiError }
  | { kind: 'navigating'; dirty: boolean };
```

### 5.2 UiError
```typescript
type UiError = {
  title: string;
  message: string;
  code?: string;
  details?: string;
  requestId?: string;
  canRetry?: boolean;
};
```

### 5.3 AI Assistant States
- `idle`: Aguardando input
- `generating`: Chamando API
- `generated`: Sucesso com resultado
- `failed`: Erro na geração
- `disabled`: IA desabilitada

---

## 6. Fluxos Principais

### 6.1 CRUD de Processes
1. Listar processes (`GET /processes`)
2. Criar process (`POST /processes`)
3. Editar process (`GET + PUT /processes/{id}`)
4. Deletar process (`DELETE /processes/{id}`)

### 6.2 CRUD de Connectors
1. Listar connectors (`GET /connectors`)
2. Criar connector via dialog (`POST /connectors`)
3. (Edit/Delete se disponível)

### 6.3 Versionamento
1. Listar versions de um process
2. Criar version (`POST /processes/{id}/versions`)
3. Editar version (`GET + PUT /processes/{id}/versions/{v}`)

### 6.4 Preview Transform
1. Preencher sampleInput, DSL, outputSchema
2. Validar JSON client-side
3. Chamar `POST /preview/transform`
4. Exibir resultado (JSON/CSV/Errors)

### 6.5 AI Assistant
1. Colar sampleInput (JSON)
2. Descrever objetivo (goalText)
3. Selecionar dslProfile
4. Clicar "Generate"
5. API retorna DSL + Schema sugeridos
6. Usuário clica "Apply" para preencher campos
7. Salvar version normalmente

### 6.6 Fallback de IA
- Se 503 `AI_DISABLED`: Banner "IA desabilitada nesta instalação"
- Se 503 `AI_PROVIDER_UNAVAILABLE`: Banner "Serviço de IA indisponível"
- Usuário pode preencher manualmente

---

## 7. Validações Client-Side

### 7.1 Process
- `id`: obrigatório (create), trim
- `name`: obrigatório, trim
- `connectorId`: obrigatório
- `outputDestinations`: mínimo 1 item
- LocalFileSystem: `basePath` obrigatório
- AzureBlobStorage: `connectionStringRef` + `container` obrigatórios

### 7.2 ProcessVersion
- `version`: obrigatório (create), inteiro >= 1
- `sourceRequest.method`: obrigatório
- `sourceRequest.path`: obrigatório
- `dsl.profile`: obrigatório
- `dsl.text`: obrigatório
- `outputSchema`: JSON válido obrigatório
- `sampleInput`: se preenchido, JSON válido

### 7.3 Connector
- `id`: obrigatório (create), trim
- `name`: obrigatório, trim
- `baseUrl`: obrigatório, URL válida (http/https)
- `authRef`: obrigatório, trim
- `timeoutSeconds`: obrigatório, inteiro >= 1

---

## 8. Design System

### 8.1 Cores (Material 3 Roles)
- Primary: `#003DA5`
- On Primary: `#FFFFFF`
- Error: `#E81828`
- Background: `#F5F5F5`
- Surface: `#FFFFFF`

### 8.2 Tipografia
- Font Family: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif`
- Base: 16px
- Escala: bodySm(14), bodyMd(16), bodyLg(18), titleSm(20), titleMd(24), titleLg(28)

### 8.3 Spacing
- xs: 4px, sm: 8px, md: 12px, lg: 16px, xl: 24px, 2xl: 32px, 3xl: 40px

### 8.4 Breakpoints
- sm: 600px, md: 960px, lg: 1280px, xl: 1920px

---

## 9. Acessibilidade (A11y)

- Teclado 100%: Tab/Shift+Tab, Enter/Space
- Foco visível sempre
- Labels explícitos em inputs
- `aria-describedby` para mensagens de erro
- Dialog com focus trap
- Tabelas com `scope="col"` em headers
- Contraste garantido via tokens

---

## 10. Testes Requeridos

### 10.1 Unitários
- MsJsonEditorLite: parse ok/erro, format
- MsKeyValueEditor: dedupe, trim, remove empty
- MsPreviewPanel: bloqueia se JSON inválido
- MsProcessForm: validações mínimas
- MsProcessVersionForm: validações + prefill preview

### 10.2 Integração (HttpClientTesting)
- ProcessDto normalize/validate
- ProcessVersionDto normalize/validate
- Preview: bloqueia se JSON inválido
- Error mapping: 400/409/500/network

---

## 11. Confirmação de Entendimento

Confirmo que:

1. ✅ Li todo o spec deck anexado (versão 1.2.0)
2. ✅ Identifiquei 9 páginas/rotas
3. ✅ Identifiquei ~20 componentes reutilizáveis
4. ✅ Mapeei 16 endpoints de API
5. ✅ Documentei estados de UI e máquinas de estados
6. ✅ Listei validações client-side por entidade
7. ✅ Extraí tokens de design (cores, tipografia, spacing)
8. ✅ Documentei requisitos de acessibilidade
9. ✅ Listei casos de teste obrigatórios

**Próximo passo:** FASE 2 — Arquitetura Frontend
