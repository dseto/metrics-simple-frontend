# Delta — Execução: Fluxo de autenticação e interceptors

## Fluxo LocalJwt (agora)
1) Usuário acessa rota protegida sem token
2) AuthGuard redireciona `/login`
3) Login envia `POST /api/auth/token`
4) Em sucesso:
   - salvar token em sessionStorage
   - carregar `AuthUser` (preferência via `/api/auth/me`, fallback parse JWT)
   - navegar para rota inicial
5) Interceptor injeta Bearer em todas as chamadas ao backend

## Interceptor order (recomendado)
1) CorrelationInterceptor (gera X-Correlation-Id por request)
2) AuthInterceptor (Bearer)
3) ErrorInterceptor (401/403/429 handling)

> Pode ser um único interceptor combinando tudo, mas manter separação ajuda testes.

## Migração futura (OIDC)
Quando trocar para OIDC:
- substituir implementação do AuthProvider
- manter Interceptor/Guards consumindo `getAccessToken()` e `getUser()` da interface
