# UI E2E Tooling — Reqnroll + Selenium + xUnit

## Projeto de testes
Criar um projeto .NET 8 em:
`tests/ui-e2e/MetricsSimple.UiE2E.Tests.csproj`

### Pacotes NuGet (mínimo)
- `xunit`
- `xunit.runner.visualstudio`
- `Selenium.WebDriver`
- `Selenium.Support`
- `Reqnroll`
- `Reqnroll.XUnit`
- (opcional) `WireMock.Net` (mock de API)

> Observação: Selenium 4.6+ inclui Selenium Manager para baixar drivers automaticamente.

## Browsers suportados (v1.0)
- Chrome **ou** Edge (um deles obrigatório)
- Headless via configuração

## Variáveis de ambiente (contrato)
- `E2E_BASE_URL` (ex.: `http://localhost:4200`)
- `E2E_BROWSER` (`chrome`|`edge`)
- `E2E_HEADLESS` (`true`|`false`)
- `E2E_SLOWMO_MS` (opcional, ex.: 0/50/100)
- `E2E_ARTIFACTS_DIR` (ex.: `./artifacts/e2e`)
- `E2E_API_MODE` (`mock`|`real`) — padrão: `mock`
- `E2E_MOCK_API_URL` (ex.: `http://localhost:5099`) — quando `mock`

## Execução
1) Inicie o frontend em modo E2E:
- `npm run start:e2e`

2) Rode os testes:
- `dotnet test tests/ui-e2e/MetricsSimple.UiE2E.Tests.csproj`

## Artefatos em falha
Sempre gerar:
- screenshot `.png`
- html dump `.html`
- log textual `.log`

O caminho é controlado por `E2E_ARTIFACTS_DIR`.
