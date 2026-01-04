# ⚙️ Configuração - Metrics Simple Frontend

Documentação centralizada sobre configuração de ambientes e runtime.

---

## 📋 Documentos Disponíveis

### 🚀 [ENVIRONMENT-CONFIG.md](ENVIRONMENT-CONFIG.md)
**Guia rápido de configuração de ambiente**
- Setup inicial
- Comandos básicos
- Configuração de URLs da API
- Ideal para: primeiros passos

### 📖 [ENVIRONMENTS.md](ENVIRONMENTS.md)
**Documentação técnica completa**
- Arquitetura de ambientes (local/staging/production)
- Sistema de fileReplacements
- Build para múltiplos ambientes
- Ideal para: entender como funciona

### 🔒 [RUNTIME-CONFIG.md](RUNTIME-CONFIG.md)
**Configuração em runtime (deploy-time)**
- Injeção de configurações via Docker
- Configurações que não podem ficar no Git
- Secrets e variáveis de ambiente
- Ideal para: produção e deploys

### 💡 [QUICK-START-ENVIRONMENTS.md](QUICK-START-ENVIRONMENTS.md)
**Exemplos práticos**
- Receitas prontas
- Copy-paste de comandos
- Casos de uso comuns
- Ideal para: resolver problemas rápido

---

## 🎯 Escolha o Documento Certo

### "Estou começando no projeto"
→ Leia [ENVIRONMENT-CONFIG.md](ENVIRONMENT-CONFIG.md)

### "Preciso entender a arquitetura de configs"
→ Leia [ENVIRONMENTS.md](ENVIRONMENTS.md)

### "Preciso fazer deploy em produção"
→ Leia [RUNTIME-CONFIG.md](RUNTIME-CONFIG.md)

### "Preciso mudar a URL da API agora"
→ Leia [QUICK-START-ENVIRONMENTS.md](QUICK-START-ENVIRONMENTS.md)

---

## 📊 Comparação: Build Time vs Runtime

| Aspecto | Build Time | Runtime |
|---------|------------|---------|
| **Arquivo** | `environment.ts` | `config.json` |
| **Quando** | Durante `ng build` | No startup do app |
| **Mudança** | Requer rebuild | Apenas restart |
| **Docs** | [ENVIRONMENTS.md](ENVIRONMENTS.md) | [RUNTIME-CONFIG.md](RUNTIME-CONFIG.md) |
| **Uso** | Configs fixas | Configs dinâmicas |

---

## 🔗 Links Relacionados

- [Tutorial End-to-End](../TUTORIAL-END-TO-END.md)
- [Docker Setup](../deployment/DOCKER_SETUP.md)
- [Tech Stack](../development/TECH_STACK.md)
