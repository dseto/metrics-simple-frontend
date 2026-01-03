# Delta — Interfaces: Cliente de Auth (Frontend -> Backend)

## Endpoints usados
### POST /api/auth/token (LocalJwt)
Request:
```json
{ "username": "daniel", "password": "secret" }
```
Response:
```json
{ "access_token": "...", "token_type": "Bearer", "expires_in": 3600 }
```

### GET /api/auth/me (opcional)
Se implementado no backend:
Response:
```json
{ "sub": "daniel", "roles": ["Metrics.Admin"], "displayName": "Daniel", "email": "..." }
```

## Headers
- `Authorization: Bearer <token>` para chamadas protegidas
- `X-Correlation-Id` (opcional, recomendado):
  - gerar um id por request para facilitar troubleshooting
  - o backend também pode gerar, mas enviar do frontend ajuda a correlacionar com logs do browser.

## Não enviar / não logar
- Nunca logar `access_token`.
- Nunca logar password.
