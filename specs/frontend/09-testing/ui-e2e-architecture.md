# UI E2E Architecture — Page Objects + Reqnroll

## Estrutura de pastas (obrigatória)
```
tests/ui-e2e/
  Features/
  Steps/
  Pages/
  Support/
  Hooks/
```

## Padrão: Page Object Model (POM)
- Steps chamam Pages (não chamam Selenium diretamente).
- Pages expõem métodos de alto nível e reutilizáveis.

## Padrão: Esperas explícitas
- Toda interação com elemento deve ser precedida por `WebDriverWait`.

## Hooks
- `BeforeScenario`: cria WebDriver e (opcional) inicia Mock API
- `AfterScenario`: em falha salvar artefatos e encerrar recursos

## Paralelismo
- v1.0: desabilitar paralelismo (evita conflitos de porta/mocks)
