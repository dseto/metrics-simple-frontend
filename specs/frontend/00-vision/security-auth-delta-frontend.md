# Delta — Frontend: Segurança + Auth (LocalJwt agora, OIDC depois)

## Objetivos
1) Implementar **login** e **sessão** para consumo do backend protegido por Bearer:
   - `POST /api/auth/token` (LocalJwt)
2) Injetar `Authorization: Bearer <token>` automaticamente nas chamadas à API.
3) Aplicar **controle de acesso**:
   - bloquear rotas sem autenticação
   - restringir rotas/ações de Admin
4) Tratar respostas de segurança:
   - 401 => logout + redirect para `/login`
   - 403 => mensagem “Sem permissão”
   - 429 => mensagem de rate limit
5) Preparar arquitetura de Auth para **trocar o provedor** sem refactor:
   - Hoje: `LocalJwtAuthProvider`
   - Futuro: `OidcAuthProvider` (Okta/Entra)
6) Evitar vazamento de informações sensíveis:
   - não logar tokens
   - não persistir senha
   - storage de token com risco aceito (sessionStorage)

## Não objetivos
- Implementar OIDC completo agora (Okta/Entra).
- Implementar refresh token.
- Implementar UI administrativa de usuários.

## Riscos aceitos
- Token em sessionStorage é vulnerável a XSS (mitigação: higiene de dependências + CSP se possível).
- Login local é transitório até IdP corporativo.

## Princípios de design
- **AuthProvider** com interface estável para permitir migração para OIDC.
- UI não “confia” em CORS: a proteção real é backend.
- UI aplica role-gating apenas para UX; o backend é a autoridade final.

## Entradas do delta (arquivos)
- Domain: `../02-domain/auth-domain.md`
- Interfaces: `../03-interfaces/auth-api-client.md`, `../03-interfaces/security-error-handling.md`
- Execution: `../04-execution/auth-flow-and-interceptors.md`
- UI: `../05-ui/login-and-access-control.md`
- Storage: `../06-storage/token-storage.md`
- Observability: `../07-observability/frontend-observability.md`
- Testing: `../09-testing/security-auth-tests.md`
- Plano Copilot: `copilot-implementation-plan.md`
