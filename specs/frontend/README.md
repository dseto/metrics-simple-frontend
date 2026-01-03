# Frontend Specs — Delta Pack: Segurança + Auth (compatível com LocalJwt e Okta/Entra no futuro)

**Data:** 2026-01-03  
**Stack:** Angular

Este delta pack ajusta o **Frontend** para suportar as melhorias de segurança do backend:
- Login local (username/password) via `POST /api/auth/token` (modo `LocalJwt`)
- Uso de **Bearer token** em todas as chamadas à API
- Guards de rota e gating de UI por roles (`app_roles`)
- Tratamento consistente de 401/403/429
- Preparação para migração futura para **Okta** ou **Entra ID** (modo OIDC) com baixo impacto

## Estrutura (alinhada ao padrão do delta pack original)
- `00-vision/`
- `02-domain/`
- `03-interfaces/`
- `04-execution/`
- `05-ui/`
- `06-storage/`
- `07-observability/`
- `08-ai-assist/`
- `09-testing/`

Comece por: `00-vision/security-auth-delta-frontend.md`
