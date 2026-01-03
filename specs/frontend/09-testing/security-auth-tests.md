# Delta — Testing (Frontend): Segurança + Auth

## Unit tests (obrigatórios)
1) AuthProvider (LocalJwt)
- login sucesso salva token
- login 401 mostra erro
- login 429 mostra rate limit
- logout limpa token

2) Interceptor
- injeta Authorization quando token existe
- não injeta para URLs fora do apiBaseUrl
- adiciona X-Correlation-Id
- em 401: chama logout e redireciona /login
- em 403: exibe snackbar (mock)
- em 429: exibe snackbar (mock)

3) Guards
- AuthGuard bloqueia sem token
- AdminGuard bloqueia sem Metrics.Admin

## E2E / smoke (recomendados)
- acessar rota protegida sem login => vai para /login
- login como Reader => CRUD admin invisível e rota /admin bloqueada
- login como Admin => CRUD acessível
