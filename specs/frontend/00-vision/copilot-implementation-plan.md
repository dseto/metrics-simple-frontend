# GitHub Copilot — Plano de implementação (Frontend: Segurança + Auth)

> Roteiro para aplicar o delta no Angular existente.

## Prompt pronto (copiar/colar)
Você é um engenheiro sênior Angular.
Implemente o delta spec "Frontend: Segurança + Auth (LocalJwt agora, OIDC depois)" conforme:
`scripts/specs/frontend/` deste delta pack.

Requisitos:
1) Criar uma abstração `AuthProvider` (interface) com métodos:
   - login(), logout(), getAccessToken(), getUser(), isAuthenticated(), hasRole()
2) Implementar `LocalJwtAuthProvider`:
   - chama `POST /api/auth/token`
   - salva token em sessionStorage (key: `metrics_access_token`)
   - opcional: chama `GET /api/auth/me` para obter sub/roles (se o backend implementar)
   - não logar token nem senha
3) Implementar UI `/login`:
   - username/password
   - tratamento de 401/429
4) Implementar HttpInterceptor:
   - adiciona Bearer token para `environment.apiBaseUrl`
   - adiciona `X-Correlation-Id` (gerar por request, opcional mas recomendado)
   - handling:
     - 401 => logout + redirect /login
     - 403 => snackbar “Sem permissão”
     - 429 => snackbar “Muitas requisições”
5) Implementar Guards:
   - AuthGuard (token obrigatório)
   - AdminGuard (role Metrics.Admin)
6) UI role-gating:
   - esconder botões/menus admin para Reader (UX)
7) Testes:
   - unit: AuthProvider, interceptor, guards
   - e2e/smoke: login ok, bloqueio sem login, admin bloqueado para reader

Valide com `ng test` e execução local contra o backend.

## Checklist rápido
- [ ] /login funcional
- [ ] token salvo em sessionStorage
- [ ] interceptor injeta Bearer
- [ ] sem token => redirect /login
- [ ] 401 => logout automático
- [ ] 403 => mensagem
- [ ] rotas /admin bloqueadas para Reader
