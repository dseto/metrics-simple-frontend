# Exemplo Template — Como Registrar Débitos Técnicos

## Estrutura de arquivo

```
docs/tech-debt/
├── README.md                          (este arquivo — instruções)
├── 2026-01-05-cache-schemas.md        (exemplo de débito aberto)
├── 2025-12-20-async-validation.md     (exemplo resolvido)
└── ...
```

## Como criar um novo registro

1. **Nomeação**: `YYYY-MM-DD-{titulo-descritivo}.md`
   - Exemplo: `2026-01-05-lazy-load-configs.md`
   - Use kebab-case no título
   
2. **Localização**: Salve em `docs/tech-debt/`

3. **Conteúdo**: Siga o template abaixo rigorosamente

## Template obrigatório

```markdown
# [TÍTULO DO DÉBITO] — YYYY-MM-DD

**Status:** Aberto | Em Progresso | Resolvido  
**Prioridade:** Baixa | Média | Alta | Crítica  
**Área:** Backend | Frontend | Infra | Compartilhado | DevOps  
**Owner:** @usuario (opcional, se houver responsável)  

## Descrição
Uma ou duas linhas explicando claramente:
- O que é o débito?
- Por que foi necessário fazer agora?
- Qual era a alternativa "correta"?

## Impacto
Lista de áreas/metricas afetadas:
- Performance
- Manutenibilidade
- Testes
- Deploy
- Experiência do usuário
- Escalabilidade

## Contexto (opcional)
- Link para a issue/PR que criou o débito
- Razão do compromisso
- Timing proposto para resolver

## Próximos passos
- [ ] Action 1 (específica, realizável)
- [ ] Action 2
- [ ] Validação (como saber que está resolvido?)

## Notas
- Observações importantes
- Dependências
- Riscos conhecidos
- Sugestões de solução
```

## Exemplo preenchido

```markdown
# Cache de Schemas JSON — 2026-01-05

**Status:** Aberto  
**Prioridade:** Média  
**Área:** Backend  
**Owner:** @alice  

## Descrição
Esquemas JSON são parseados a cada request em tempo real, sem cache. 
Para MVP, aceitamos o overhead; em produção, isso pode impactar latência.

## Impacto
- Latência: +5ms por request (com schemas grandes)
- CPU: parseamento repetido de mesmos arquivos
- Escalabilidade: sob carga, impacto é cumulativo

## Contexto
Criado em primeiro release (2025-12-15).
Decisão: focar em correto primeiro, otimizar depois.

## Próximos passos
- [ ] Benchmark com load test (100+ req/s)
- [ ] Implementar `IMemoryCache` com TTL de 1h
- [ ] Comparar latência antes/depois
- [ ] Validação: latência < 2ms com esquemas cached

## Notas
Schemas mudam raramente em runtime; cache de 1h é seguro.
Considerar invalidação se schema for alterado via API.
```

---

## Quando marcar como [RESOLVIDO]

1. Mude `**Status:**` para `Resolvido`
2. Adicione data de resolução: `Resolvido em: 2026-02-01`
3. Inclua no commit/PR: "Quitado débito técnico: `docs/tech-debt/...`"
4. Opcionalmente, mova arquivo para pasta `resolved/` (ou apenas deixe com status no arquivo)

### Exemplo de arquivo resolvido

```markdown
# Cache de Schemas JSON — 2026-01-05

**Status:** Resolvido  
**Resolvido em:** 2026-01-25  
...
```

---

## Rastreamento e revisão

A cada sprint ou monthly:
1. Revise `docs/tech-debt/` para itens críticos/vencidos
2. Considere priorizar alta/crítica para próximas sprints
3. Feche resolvidos (marque `[RESOLVIDO]`)
4. Discuta novos débitos descobertos

## Integração com agente

O agente `spec-driven-builder` **obriga** a registrar débitos sempre que:
- Fazer trade-off: "rápido agora, correto depois"
- Atalho intencional por escopo
- Refatoração identificada mas não crítica
- Otimização deixada para iteração futura

Comando no commit: "Registrado débito técnico em `docs/tech-debt/2026-01-05-example.md`"
