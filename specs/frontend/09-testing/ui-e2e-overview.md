# UI E2E Overview — Selenium + xUnit + Reqnroll (v1.0)

## Objetivo
Adicionar uma suíte de **testes automatizados de UI** para o frontend (Angular 17 + Material 3), com foco em:
- Fluxos críticos do Studio (CRUD + Preview + AI Assistant)
- Validações de formulário
- Estados de loading/erro/empty
- Resiliência (fallback quando IA estiver desabilitada ou falhar)

> Estes testes são **black-box** (caixa-preta) do ponto de vista da UI, mas podem usar mock de API para obter determinismo.

## Stack obrigatória
- **.NET 8**
- **xUnit**
- **Selenium WebDriver 4.6+**
- **Reqnroll** (Gherkin/BDD) + integração xUnit

## Escopo mínimo (v1.0)
### Smoke (rápida, < 5 min)
- Abrir shell + navegar por menus
- Criar Connector (happy path) e listar
- Criar Process e Version (happy path)
- Executar Preview (happy path)
- AI Assistant **desabilitada** → banner + edição manual continua funcionando

### Regression (completa, < 20 min)
- CRUD completo (Create/Edit/Delete) para:
  - Connectors
  - Processes
  - Versions
- Validações (required/pattern/min/max)
- Erros de API (400/409/500) com mensagens previsíveis
- AI Assistant (enabled) → Generate → Apply → campos populados
- Preview com erros (schema/DSL) e exibição correta

## Fora de escopo (v1.0)
- Visual regression (pixel perfect)
- Performance tests
- Acessibilidade automatizada
- Cross-browser completo (suportar **Chrome ou Edge** é suficiente)

## Critérios de aceite (Definition of Done)
- [ ] Suíte Smoke executa em < 5 min (local)
- [ ] Suíte Regression executa em < 20 min (local)
- [ ] Flakiness < 2% (com mitigação por waits e locators estáveis)
- [ ] Em falha: salvar screenshot + HTML + log da execução
- [ ] Testes usam **data-testid** (nunca CSS frágil)
- [ ] Testes rodam via `dotnet test` com variáveis de ambiente configuráveis

## Princípios anti-flake (não negociáveis)
- Nunca usar `Thread.Sleep`
- Sempre usar `WebDriverWait` e condições explícitas
- Page Object Model obrigatório
- Locators por `data-testid` obrigatório
