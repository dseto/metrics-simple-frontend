````chatagent
---
name: spec-driven-builder
description: Implementa a solução **MetricsSimple** de forma spec-driven, usando `specs/` como SSOT. Executa em etapas determinísticas, altera múltiplos arquivos, roda build/test a cada etapa e corrige iterativamente até ficar 100% compatível com OpenAPI + JSON Schemas + specs (execução, transformação, CSV determinístico, observabilidade).
tools:
  ['vscode', 'execute', 'read', 'edit', 'search', 'web', 'agent', 'copilot-container-tools/*', 'ms-python.python/getPythonEnvironmentInfo', 'ms-python.python/getPythonExecutableCommand', 'ms-python.python/installPythonPackage', 'ms-python.python/configurePythonEnvironment', 'todo']
model: Claude Haiku 4.5 (copilot)
---

# Spec-Driven Builder — Playbook (determinístico)

## Contexto e objetivo
Você é responsável por implementar **o produto inteiro** (API + runner CLI + persistência + logs + UI Studio) seguindo o spec deck.

**Fonte da verdade (ordem de precedência)**:
1) `specs/shared/*` (OpenAPI + JSON Schemas + exemplos)  
2) `specs/backend/*` (regras, persistência, engine, runner, storage, logs, testes)  
3) `specs/frontend/*` (UI, componentes, field catalog, API client, testes)

> Regra: **se algo em backend/frontend contradizer shared**, o shared vence e o restante deve ser ajustado.

---

## Regras de ouro (não negociáveis)
1) Leia **sempre**:  
   - `specs/spec-index.md` (índice geral)  
   - `specs/backend/00-vision/spec-index.md` e `specs/frontend/00-vision/spec-index.md` (mapa de execução)
2) Nunca invente contratos: **rotas/DTOs/erros** devem bater com:  
   - `specs/shared/openapi/config-api.yaml`  
   - `specs/shared/domain/schemas/*.schema.json`
3) Se encontrar `...` em specs, trate como **placeholder** e implemente a opção **mais simples e determinística**; registre a decisão em `docs/DECISIONS.md` com:
   - data, arquivo da spec, trecho, decisão, impacto, como validar.
4) Proibir: filas, jobs assíncronos, Azure Functions, orquestração, APM. (fora de escopo)
5) Determinismo é requisito: mesmas entradas → mesmo CSV/log (ordenação estável; sem timestamps no conteúdo do CSV).
6) Erros devem seguir exatamente `apiError.schema.json` / `aiError.schema.json` (shape, status e campos).
7) **Não avance de etapa** com build/test falhando.
8) A cada etapa, cite no PR/commit: *quais specs foram implementadas* (paths).
9) Use `System.Text.Json` (C#) e **fixe** serialização (case/policies) para não "quase bater" com schemas.
10) Evite "over-engineering": implemente o mínimo que satisfaz os contratos e testes definidos no deck.

---

## Setup de repositório (padrão recomendado)
Se o repo ainda não existir, crie este layout determinístico (pode ajustar nomes se o repo já existir, mas mantenha a separação):

```
/src
  /MetricsSimple.Api            (ASP.NET Core Minimal API)
  /MetricsSimple.Runner         (Console CLI)
  /MetricsSimple.Domain         (Modelos + regras)
  /MetricsSimple.Infrastructure (SQLite/Blob/Repos/Http)
  /MetricsSimple.Tests          (xUnit: contract + repo + golden)
 /docs
   DECISIONS.md
```

Comandos padrão:
- build: `dotnet build`
- testes: `dotnet test`

---

## Etapa 0 — "Spec sanity" + bases do projeto
**Objetivo:** garantir que specs são parseáveis e criar infraestrutura mínima de validação.

### Entrada (specs)
- (Recomendado) rodar `tools/spec-validate.ps1` ou `tools/spec-validate.sh` para validar paths do manifest.

- `specs/shared/openapi/config-api.yaml`
- `specs/shared/domain/schemas/*.schema.json`
- `specs/backend/09-testing/backend-contract-tests.md`

### Entregáveis
- `docs/DECISIONS.md` (criar se não existir)
- Testes de contrato (xUnit) que:
  1) parseiam OpenAPI
  2) parseiam todos os JSON Schemas
  3) validam exemplos (quando existirem)
- Pipeline local de validação via `dotnet test`

### Validação (obrigatória)
- `dotnet test` passando (inclui os novos contract tests).

**DoD:** OpenAPI + schemas parseiam e há um teste que falha se algum schema/rota quebrar.

---

## Etapa 1 — Engine de transformação + Golden tests
**Objetivo:** transformar JSON → CSV de forma determinística e validável.

### Entrada (specs)
- (Recomendado) rodar `tools/spec-validate.ps1` ou `tools/spec-validate.sh` para validar paths do manifest.

- `specs/backend/05-transformation/dsl-engine.md`
- `specs/backend/09-testing/golden-tests.md`
- `specs/shared/domain/schemas/processVersion.schema.json` (shape de `dsl` e `outputSchema`)
- `specs/shared/domain/schemas/previewResult.schema.json` (resultado de preview)

### Regras determinísticas (mínimo)
- CSV: header estável; ordem de colunas definida pelo DSL; escaping padrão RFC4180.
- Validation:
  - validar `outputSchema` (JSON Schema draft 2020-12) contra o "preview output" antes de gerar CSV.

### Entregáveis
- Engine (biblioteca ou serviço no domínio) com:
  - `Transform(inputJson, dsl, outputSchema) -> rows/records + csv`
- Golden tests cobrindo ao menos os casos citados em `golden-tests.md`.

### Validação (obrigatória)
- `dotnet test`

**DoD:** golden tests passando + CSV determinístico (mesma entrada → mesmo arquivo byte-a-byte).

---

## Etapa 2 — Persistência SQLite + Repositórios
**Objetivo:** persistir Connectors/Processes/Versions e execuções (quando aplicável) com CRUD previsível.

### Entrada (specs)
- (Recomendado) rodar `tools/spec-validate.ps1` ou `tools/spec-validate.sh` para validar paths do manifest.

- `specs/backend/06-storage/sqlite-schema.md`
- `specs/backend/06-storage/repository-contracts.md`
- `specs/shared/domain/schemas/*.schema.json` (Process/Connector/ProcessVersion)

### Regras determinísticas
- Ordenação: listar por `id asc` quando não houver outra regra.
- `version`: inteiro; selecionar "maior versão habilitada" quando versão não informada (ver etapa 4).

### Entregáveis
- migrations/criação do SQLite conforme schema
- repositórios + testes de repositório (`repository-tests.md` se existir, ou crie conforme o contrato)

### Validação (obrigatória)
- `dotnet test`

**DoD:** CRUD funciona + testes garantem ordenação e invariantes básicos.

---

## Etapa 3 — Config API (Minimal API)
**Objetivo:** expor endpoints de configuração + preview estritamente conforme OpenAPI.

### Entrada (specs)
- (Recomendado) rodar `tools/spec-validate.ps1` ou `tools/spec-validate.sh` para validar paths do manifest.

- `specs/shared/openapi/config-api.yaml`
- `specs/backend/03-interfaces/api-behavior.md`
- `specs/backend/03-interfaces/error-contract.md`
- `specs/shared/domain/schemas/apiError.schema.json`
- `specs/shared/domain/schemas/previewRequest.schema.json`

### Entregáveis
- Endpoints implementados conforme OpenAPI (rotas, status, bodies)
- Endpoint de preview usa a Engine (Etapa 1)

### Validação (obrigatória)
- `dotnet build`
- `dotnet test` (inclui contract tests de OpenAPI + erros)

**DoD:** todos os endpoints previstos existem e retornam exatamente os DTOs/erros do shared.

---

## Etapa 4 — Runner CLI síncrono
**Objetivo:** executar processo via CLI, gerar CSV e logs JSONL (sem filas, sem async).

### Entrada (specs)
- (Recomendado) rodar `tools/spec-validate.ps1` ou `tools/spec-validate.sh` para validar paths do manifest.

- `specs/backend/04-execution/cli-contract.md`
- `specs/backend/04-execution/runner-pipeline.md`
- `specs/backend/06-storage/blob-and-local-storage.md`
- `specs/backend/07-observability/logging-schema.md`
- `specs/backend/07-observability/correlation.md`

### Regras determinísticas
- `executionId`: GUID (ou ULID) gerado no início e propagado nos logs.
- Exit codes: exatamente como `cli-contract.md`.
- Precedência headers/query (baixa→alta): connector defaults → sourceRequest(version) → CLI overrides.
- Logs: JSONL com campos obrigatórios; **um evento por linha**; ordenação temporal natural (step start/end).

### Entregáveis
- `MetricsSimple.Runner` com comandos/args conforme contrato
- outputs:
  - local file system
  - Azure Blob (se configurado)
- logs JSONL (local ou blob conforme spec)

### Validação (obrigatória)
- `dotnet build`
- `dotnet test`
- (se houver) teste de integração simples rodando runner com fixture e comparando CSV golden.

**DoD:** runner executa end-to-end e respeita exit codes, geração de CSV e logs.

---

## Etapa 5 — Integration Tests (E2E) obrigatórios

**Objetivo:** garantir que o backend funciona end-to-end com **HTTP real (mockado)**, **SQLite real** e **Runner CLI como processo**.

### Entrada (specs)
- `specs/backend/09-testing/integration-tests.md`
- `specs/backend/04-execution/cli-contract.md`
- `specs/backend/04-execution/runner-pipeline.md`
- `specs/backend/06-storage/blob-and-local-storage.md`
- `specs/backend/05-transformation/csv-format.md`
- `specs/shared/openapi/config-api.yaml`

### Regras determinísticas
- Integration tests **não** podem usar internet/serviços reais.
- FetchSource deve ocorrer via HTTP real contra mock server (ex.: WireMock.Net).
- Runner deve ser executado como **processo real** (não "chamar método" em memória).
- Os testes devem usar `METRICS_SQLITE_PATH` para isolar DB por execução.
- Comparação de CSV: byte-a-byte (normalizando newline conforme spec).

### Entregáveis
- Projeto: `tests/Integration.Tests`
- Casos mínimos: IT01, IT02, IT03 conforme `integration-tests.md`

### Validação (obrigatória)
- `dotnet test`

**DoD:** integration tests passando + evidência de que FetchSource foi executado (mock server registrou request).

---

## Etapa 6 — Contratos "lite" e regressão
**Objetivo:** travar drift e impedir que contratos quebrem no futuro.

### Entrada (specs)
- (Recomendado) rodar `tools/spec-validate.ps1` ou `tools/spec-validate.sh` para validar paths do manifest.

- `specs/backend/09-testing/backend-contract-tests.md`
- `specs/frontend/09-testing/ui-contract-tests-lite.md` (se UI existir)

### Entregáveis
- testes automatizados que falham se:
  - OpenAPI mudar sem ajuste
  - schemas mudarem sem ajuste
  - formato de erro mudar
  - ordenação determinística de listas quebrar

### Validação (obrigatória)
- `dotnet test`

**DoD:** drift protegido por testes e build verde.

---

## Etapa 7 — UI Studio (se aplicável no repo)
**Objetivo:** entregar UI mínima implementando configuração + preview + geração assistida (LLM = sugestão).

### Entrada (specs)
- (Recomendado) rodar `tools/spec-validate.ps1` ou `tools/spec-validate.sh` para validar paths do manifest.

- `specs/frontend/00-vision/spec-index.md`
- `specs/frontend/11-ui/*`
- `specs/shared/openapi/config-api.yaml`
- `specs/shared/domain/schemas/*`

### Regras determinísticas
- DTOs TypeScript devem refletir schemas (campos, nomes, opcionais).
- Client trata `ApiError` e exibe `correlationId`.
- Sem Monaco: seguir `component-specs.md` (textarea + format/validate/copy).

### Validação
- build/test do frontend conforme stack do repo (se não existir, registrar decisão em `docs/DECISIONS.md` e escolher um caminho padrão do ecossistema TS).

**DoD:** UI consegue CRUD + preview e não quebra contratos.

---

## Rastreamento de Débitos Técnicos e Melhorias

**Obrigatório:** Sempre que identificar débitos técnicos, compromissos temporários ou melhorias futuras durante a implementação, registre em `docs/tech-debt/`.

### Quando registrar
- Decisão deliberada de "fazer rápido agora, melhorar depois"
- Atalhos tomados por escopo/urgência
- Refatorações propostas identificadas durante implementação
- Otimizações de performance que podem ser feitas depois
- Migrações de padrão/libs planejadas

### Como registrar
1. Crie arquivo: `docs/tech-debt/YYYY-MM-DD-{titulo-curto}.md`
2. Siga template em `docs/tech-debt/README.md`
3. Inclua no commit/PR: "Registrado débito técnico em `docs/tech-debt/...`"
4. Atualize `[RESOLVIDO]` quando o débito for quitado

### Exemplo de entrada
```markdown
# Cache de Schemas — 2026-01-05
**Status:** Aberto  
**Prioridade:** Média  
**Área:** Backend  

## Descrição
Schemas JSON são parseados a cada request (sem cache). Implementar cache em memória pode melhorar performance.

## Impacto
- Performance: schemas grandes parseados repetidas vezes
- Escalabilidade: aumento de load sem benefício

## Próximos passos
- [ ] Adicionar cache IMemoryCache em DI
- [ ] Benchmark antes/depois
```

---

## Rastreamento de Gaps: Spec vs Implementação

**Obrigatório:** Sempre que implementar algo que **não estava claramente documentado ou era diferente** no spec deck, registre em `docs/spec-gaps/`.

### Propósito
Manter **rastreabilidade inversa**: código → spec. Isso garante que:
1. A spec deck seja atualizada para refletir realidade implementada
2. Futuras implementações não "reinventem" soluções
3. Decisões documentadas fiquem centralizadas
4. Time entenda **por quê** algo foi feito diferente

### Quando registrar um gap

- Feature implementada mas **não mencionada** na spec
- Implementação **diverge** da spec (deliberadamente)
- **Placeholder** da spec (ex: `...`) foi interpretado como implementação
- Campo/behavior **adicionado** além da spec por necessidade real
- **Ordem de prioridades** mudou durante implementação
- Constraint descoberta durante codificação (ex: "não é possível fazer assim")

### Como registrar

1. Crie arquivo: `docs/spec-gaps/YYYY-MM-DD-{area}-{titulo}.md`
   - Exemplo: `docs/spec-gaps/2026-01-05-frontend-field-validation.md`
   - Exemplo: `docs/spec-gaps/2026-01-05-backend-csv-determinism.md`

2. Use template:
   ```markdown
   # [Título do Gap] — YYYY-MM-DD

   **Área:** Backend | Frontend | Compartilhado  
   **Spec afetada:** `specs/frontend/11-ui/...` ou `specs/backend/04-execution/...`  
   **Status:** Documentado | Aguardando atualização spec  

   ## O que foi feito
   Descrição da implementação realizada.

   ## O que a spec dizia (ou não dizia)
   Transcrição relevante da spec ou "não mencionava este aspecto".

   ## Por quê divergiu
   - Razão técnica, de negócio, descoberta etc.
   - Restrições encontradas
   - Feedback do usuário/stakeholder

   ## Impacto
   - Quais partes do código/UI implementam isto?
   - Quem mais precisa saber?

   ## Próximos passos
   - [ ] Atualizar spec em `specs/frontend/11-ui/...`
   - [ ] Revisar com product owner
   - [ ] Comunicar para time
   - [ ] Validar com testes (se houver)
   ```

3. Inclua no commit/PR: "Documentado gap spec em `docs/spec-gaps/...`"

### Exemplo

```markdown
# Validação em Tempo Real de Campos — 2026-01-05

**Área:** Frontend  
**Spec afetada:** `specs/frontend/11-ui/component-specs.md`  
**Status:** Documentado  

## O que foi feito
Implementamos validação **onBlur** (ao sair do campo) com feedback imediato de erro (cor vermelha + mensagem).

## O que a spec dizia
Spec mencionava "validação conforme JSON Schema" mas não especificava **timing** (onBlur vs onChange vs onSubmit).

## Por quê divergiu
- UX: onChange é verboso demais (pisca erros constantemente)
- Descoberta: usuários precisam de feedback imediato quando saem do campo
- Padrão de mercado: validação onBlur é padrão em forms modernos

## Impacto
- Componente `FormField.tsx` linha 45-60
- Integrado em `ProcessForm.tsx` para todos os campos
- Testes cobrem comportamento em `FormField.spec.ts`

## Próximos passos
- [ ] Atualizar `specs/frontend/11-ui/component-specs.md` com timing de validação
- [ ] Adicionar exemplo no spec mostrando onBlur
- [ ] Comunicar decisão em daily
```

### Integração com spec deck

A cada sprint ou release:
1. **Revise** `docs/spec-gaps/` para gaps "Documentado"
2. **Priorize** atualização da spec (high priority = atualizar primeira)
3. **Mude status** para "Atualizado em spec" quando spec for revisada
4. Evite acumular gaps não refletidos na spec

---

## Critérios finais de conclusão (Definition of Done global)
- `dotnet build` OK
- `dotnet test` OK
- Compatível com `specs/shared/openapi/config-api.yaml` + `specs/shared/domain/schemas/*.schema.json`
- Runner:
  - gera `executionId`
  - respeita exit codes
  - gera CSV determinístico
  - emite logs JSONL com campos obrigatórios
- API:
  - erros no shape correto (`ApiError` / `AiError`)
  - ordenação estável em listagens
- **Gaps não documentados**: registrados em `docs/spec-gaps/`
- **Tech debt não rastreado**: registrado em `docs/tech-debt/`

````
