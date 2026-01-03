# Delta — UI: Login e controle de acesso

## Rota /login
### Campos
- username
- password

### Ações
- submit chama `POST /api/auth/token`
- sucesso: salvar token, navegar para home
- 401: exibir “Usuário ou senha inválidos”
- 429: exibir “Muitas tentativas, tente mais tarde”

### Regras
- não persistir senha
- limpar campo senha em falha
- não logar senha/token

## Controle de acesso (UX)
### Admin-only UI
- Menus/ações de CRUD (create/edit/delete) devem ficar visíveis somente para `Metrics.Admin`.
- Reader deve conseguir navegar/usar apenas telas de leitura/preview.

> Nota: isto é apenas UX. O backend é a autoridade final (403).

## Tratamento de erros
- 401 em qualquer request: logout automático + redirect /login
- 403: snackbar e não desmontar a sessão
- 429: snackbar

## Estados de tela
- Exibir usuário logado (sub/displayName) no header.
- Botão Logout.
