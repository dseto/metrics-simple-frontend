# Gaps: Spec Deck vs Implementação

Registro centralizado de **divergências** entre o que foi especificado e o que foi implementado.

## Propósito

Este diretório mantém rastreabilidade **inversa** (código → spec):
- **Feature implementada mas não spec'ed**: documentar para que spec seja atualizada
- **Implementação diferente da spec**: explicar a razão e validar com stakeholders
- **Placeholder da spec**: registrar como foi interpretado
- **Descobertas durante codificação**: gaps na spec que precisam ser preenchidos

## Por que existe

1. **Specs não são perfeitas**: sempre há gaps ou ambiguidades
2. **Realidade muda**: requisitos descobertos durante implementação
3. **Comunicação**: documentar **por quê** divergiu evita retrabalho
4. **Atualização da spec**: priorizar o que precisa ser spec'ed com base no implementado

## Como contribuir

1. Crie arquivo: `YYYY-MM-DD-{area}-{titulo}.md`
   - Exemplo: `2026-01-05-frontend-form-validation.md`
   - Use kebab-case no título

2. Siga o template abaixo rigorosamente

3. Inclua no commit/PR: "Documentado gap spec em `docs/spec-gaps/...`"

## Template obrigatório

```markdown
# [Título do Gap] — YYYY-MM-DD

**Área:** Backend | Frontend | Compartilhado  
**Spec afetada:** `specs/frontend/11-ui/component-specs.md` ou caminho específico  
**Status:** Documentado | Aguardando atualização spec | Atualizado em spec  
**Owner:** @usuario (opcional)  

## O que foi feito
Descrição clara da implementação realizada:
- O que foi construído?
- Como funciona?
- Arquivo/componente principal?

## O que a spec dizia (ou não dizia)
Transcrição **exata** da spec relevante, ou:
- "Não mencionava este aspecto"
- "Dizia apenas: 'validação conforme JSON Schema' sem especificar timing"

## Por quê divergiu
Razões claras para a divergência:
- **Técnica**: restrição descoberta durante implementação
- **Negócio**: feedback de usuário/stakeholder
- **UX**: padrão de mercado ou usabilidade
- **Escopo**: feature extra por necessidade real
- **Clareza**: placeholder da spec foi interpretado

## Impacto
- Quais partes do código implementam isto?
- Quem mais precisa saber (backend, frontend, ops)?
- Dependências com outras features?

## Próximos passos
- [ ] Atualizar spec em `specs/frontend/11-ui/component-specs.md`
- [ ] Revisar decisão com product owner
- [ ] Comunicar para time (daily/standup)
- [ ] Validar com testes automatizados (se aplicável)

## Notas (opcional)
- Observações adicionais
- Links para issues/PRs relacionados
- Sugestões de como atualizar a spec
```

## Exemplo preenchido

```markdown
# Validação em Tempo Real — Feedback onBlur — 2026-01-05

**Área:** Frontend  
**Spec afetada:** `specs/frontend/11-ui/component-specs.md`  
**Status:** Documentado  
**Owner:** @alice  

## O que foi feito
Implementamos validação de formulário com feedback **onBlur** (ao sair do campo):
- Campo fica com border vermelha se inválido
- Mensagem de erro aparece abaixo do campo
- Implementado em `src/app/shared/components/form-field.component.ts`
- Aplicado em `ProcessForm.tsx` para todos os campos

## O que a spec dizia
Spec mencionava:
> "Validar campos conforme `outputSchema` (JSON Schema draft 2020-12)"

Mas **não especificava timing**: onBlur vs onChange vs onSubmit.

## Por quê divergiu
- **UX**: onChange causava "pisca" de erros enquanto usuário digita (ruim para experiência)
- **Padrão**: validação onBlur é padrão em forms modernos (Material Design, Bootstrap, etc)
- **Descoberta**: usuários precisam clicar fora para ter feedback, não enquanto digitam
- **Performance**: onChange geraria validação a cada keystroke

## Impacto
- `src/app/shared/components/form-field.component.ts` (45-60): lógica principal
- `ProcessForm.tsx`: integração em todos os campos
- `FormField.spec.ts`: testes cobrem onBlur behavior
- Frontend inteiro usa este padrão agora

## Próximos passos
- [ ] Atualizar `specs/frontend/11-ui/component-specs.md` seção "Validação"
- [ ] Adicionar exemplo mostrando onBlur no spec
- [ ] Comunicar em daily que decidimos validar onBlur
- [ ] Revisar com PO se está alinhado com expectativa

## Notas
Relacionado à PR #156 (Implementação FormField).
Backend também poderia beneficiar: validação onBlur em API preview endpoint?
```

---

## Rastreamento e revisão

**A cada sprint ou release**:

1. **Revise** `docs/spec-gaps/` para itens com status "Documentado"
2. **Priorize** quais gaps precisam atualizar a spec agora
3. **Divida** para o time:
   - High: atualizar spec na próxima iteração
   - Medium: considerar para próximo release
   - Low: pode ficar como está
4. **Mude status** para "Atualizado em spec" quando done
5. **Evite acumular**: não deixe gaps pendentes por muito tempo

### Status possíveis

- **Documentado**: gap registrado, aguardando decisão
- **Aguardando atualização spec**: aprovado para atualizar, mas ainda não feito
- **Atualizado em spec**: spec foi revisada e incorporou a mudança

---

## Integração com agente

O agente `spec-driven-builder` **obriga** a registrar gaps sempre que:
- Implementar algo não mencionado na spec
- Divergir deliberadamente da spec
- Descobrir constraint durante codificação
- Receber feedback que muda a implementação

Comando no commit: "Documentado gap spec em `docs/spec-gaps/2026-01-05-example.md`"
