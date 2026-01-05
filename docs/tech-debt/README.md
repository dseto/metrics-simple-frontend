# Technical Debt & Melhorias Futuras

Registro centralizado de débitos técnicos, possíveis refatorações e melhorias identificadas durante o desenvolvimento.

## Propósito

Este diretório mantém no radar:
- **Débitos técnicos**: compromissos temporários feitos para entregar features mais rápido
- **Melhorias estruturais**: refatorações propostas que não são críticas agora
- **Otimizações**: performance, UX, DX que podem ser priorizadas depois
- **Dependências técnicas**: tech debt em libs/frameworks/patterns

## Como contribuir

1. Crie um novo arquivo: `YYYY-MM-DD-{titulo-curto}.md` ou edite um existente
2. Siga o template abaixo
3. Marque com `[RESOLVIDO]` quando concluído

## Template

```markdown
# [TITULO] - {DATA}

**Status:** Aberto / Em Progresso / Resolvido  
**Prioridade:** Baixa / Média / Alta / Crítica  
**Área:** Backend / Frontend / Infra / Compartilhado  
**Owner:** @usuario (opcional)  

## Descrição
Que é o débito/melhoria? Por que foi necessário?

## Impacto
- Onde afeta (código, performance, teste, etc)
- Como afeta os usuários/developers

## Próximos passos
- [ ] Action 1
- [ ] Action 2

## Notas
Observações adicionais, referências a issues, PRs, etc.
```

## Índice de Débitos Abertos
Arquivos neste diretório listados por data (mais recentes primeiro).
