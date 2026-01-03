# Delta — Storage: Armazenamento do token (Frontend)

## Padrão (recomendado)
- `sessionStorage`
  - key: `metrics_access_token`
  - key opcional: `metrics_user` (cache de AuthUser; pode derivar de /auth/me ou JWT)

Vantagens:
- some ao fechar o browser
- simples de implementar

Riscos:
- vulnerável a XSS (aceito no delta). Mitigações sugeridas:
  - depender o mínimo de HTML dinâmico
  - sanitização Angular (default) + revisão de dependências
  - CSP se possível no ambiente

## Alternativas
- memória apenas (mais seguro, perde no refresh)
- localStorage (não recomendado)

## Regras
- nunca armazenar senha
- não armazenar refresh tokens (não existe no delta)
