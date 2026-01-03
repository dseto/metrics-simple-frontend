# Delta — Interfaces: Tratamento de erros de segurança (Frontend)

## Regras por status code
### 401 Unauthorized
Cenários: token ausente/expirado/inválido.
Ação:
- limpar sessão (token)
- redirecionar para `/login`
- opcional: mensagem “Sessão expirada”

### 403 Forbidden
Cenários: token válido, mas sem permissão.
Ação:
- manter sessão
- exibir mensagem “Sem permissão”
- opcional: navegar para página segura (ex.: dashboard)

### 429 Too Many Requests
Cenários: rate limiting / lockout.
Ação:
- manter sessão (se foi uma chamada normal)
- exibir mensagem de rate limit
- se foi no login: mostrar mensagem “Muitas tentativas, tente mais tarde”

## Mensagens (copy sugerido)
- 401: “Sua sessão expirou. Faça login novamente.”
- 403: “Você não tem permissão para essa ação.”
- 429: “Muitas requisições. Aguarde um pouco e tente novamente.”
