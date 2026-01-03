# Delta — Observability: Frontend (mínimo)

## Objetivos
- Ajudar troubleshooting correlacionando requests do browser com logs do backend.

## Correlation
- Gerar `X-Correlation-Id` por request (uuid/ulid curto), anexar em chamadas ao backend.
- Registrar em console apenas em modo dev (sem dados sensíveis).

## Logs do frontend (regras)
- Nunca logar `Authorization` nem token.
- Nunca logar senha.
- Erros 401/403/429: logar apenas status + correlationId + endpoint (sem payload sensível).

## Telemetria opcional
Se o projeto já tem App Insights ou similar:
- medir taxa de 401/403/429
- medir navegação /login e falhas de login (sem username/senha)
