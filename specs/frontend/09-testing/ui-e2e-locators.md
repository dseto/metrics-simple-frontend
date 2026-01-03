# UI E2E Locators — data-testid Contract (MANDATORY)

## Regra de ouro
Todos os elementos usados por testes E2E devem ter `data-testid` estável.

### Proibido
- CSS baseado em classes do Angular Material (`mat-mdc-*`)
- XPath longo
- Seletores por texto para interação
- Seletores por ordem/posição (nth-child etc.)

## Padrão de `data-testid`
Basear em `ui-field-catalog.md` (`id/path`):
- Inputs: `data-testid="<id/path>"`
- Botões: `data-testid="<id/path>"`

Exemplos:
- `connectors.form.name`
- `versions.editor.dsl`
- `preview.run`
- `aiAssistant.generate`

## Requisito de manutenção
Mudanças em `ui-field-catalog.md` que afetem ids devem atualizar:
- `data-testid` do frontend
- testes E2E correspondentes
