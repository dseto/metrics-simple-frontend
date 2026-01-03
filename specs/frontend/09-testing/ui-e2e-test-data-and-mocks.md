# UI E2E Test Data & API Strategy (Determinism)

## Estratégia padrão (v1.0): API Mock
- Mock server via `WireMock.Net` no processo de teste
- Frontend em modo E2E aponta para `E2E_MOCK_API_URL`
- Fixtures versionadas em JSON

## Endpoints a mockar (mínimo)
- Connectors CRUD
- Processes CRUD
- Versions (list/create)
- Preview
- AI generate

## Estratégia alternativa
Backend real somente quando `E2E_API_MODE=real`
