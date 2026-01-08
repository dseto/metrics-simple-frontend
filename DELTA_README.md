# Delta Spec Deck — Frontend alinhado ao backend (Auth + IR/PlanV1)

Data: 2026-01-08

Este *delta pack* atualiza a **spec do FRONTEND (Angular)** para refletir o que já foi alterado no backend:

1) **API versionada**: chamadas passam a usar `/api/v1/*` (exceto autenticação `/api/auth/token`).
2) **AI DSL Generate**: `dslProfile` agora é **fixo = `ir`** (IR/PlanV1). Não existe mais UI de `jsonata/jmespath`.
3) **Preview/Transform**: request passa a **incluir `plan`** quando disponível (ou derivado do `dsl.text`).
4) **Segurança mínima (LocalJwt)**: UI inclui **/login**, armazenamento de token e **Authorization: Bearer** para chamadas.
5) **Controle de acesso**: perfis **Admin** e **Reader** com guard + UX (backend é a autoridade final).

> Objetivo: eliminar tribal knowledge e deixar claro o que o frontend deve fazer para estar 100% compatível com o backend atual.

---

## Como aplicar

1. Faça backup do seu spec deck atual (recomendado).
2. Extraia este ZIP na raiz do repositório do spec deck.
3. **Sobrescreva** os arquivos existentes com os mesmos caminhos.

---

## O que tem neste delta

- Atualizações em docs existentes do frontend (rotas, AI Assistant, API client, preview).
- Novos docs (auth domain/flow, token storage, login UX, testes).
- Prompt pronto para GitHub Copilot implementar as mudanças no **código Angular**.

---

## Próximo passo sugerido

Abra `specs/PROMPTS.md` e use o prompt **“Implementar ajustes no FRONTEND (Angular)”** no GitHub Copilot.

