# Delta — Domain: Auth (Frontend)

## Modelos (contratos internos de UI)
### AuthUser
Representa o usuário autenticado no frontend (independente do provedor).

Campos mínimos:
- `sub: string` (id do usuário)
- `roles: string[]` (sempre roles normalizadas do app: `app_roles`)
- `displayName?: string`
- `email?: string`

### AuthSession
Representa a sessão atual.
- `accessToken: string`
- `expiresAtUtc?: string` (opcional; derivado do JWT ou do backend)
- `user?: AuthUser` (populado via /auth/me ou via parse do JWT)

## Invariantes
1) O frontend deve trabalhar somente com roles normalizadas:
   - `Metrics.Admin`
   - `Metrics.Reader`
2) O frontend nunca valida assinatura do JWT (isso é responsabilidade do backend).
3) O frontend nunca persiste senha.
4) O frontend não deve logar tokens.

## Fonte de roles
Preferência:
1) `GET /api/auth/me` (se existir) => `{ sub, roles }`
Fallback:
2) parse do JWT para extrair `sub` e `app_roles`
