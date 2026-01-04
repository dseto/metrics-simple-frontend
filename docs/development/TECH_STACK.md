# Frontend Technology Stack — MetricsSimple v1.02

Este documento define **a stack tecnológica obrigatória do frontend** para o projeto **MetricsSimple v1.2**.  
Qualquer desvio destas definições é considerado **fora de escopo**.

---

## 1. Linguagem

- **TypeScript (obrigatório)**
- Target ECMAScript: **ES2022** ou superior

🚫 Proibido:
- JavaScript puro
- CoffeeScript
- Linguagens alternativas/transpiladas fora do ecossistema TypeScript

---

## 2. Framework de Aplicação

- **Angular 17+**

Justificativas (normativas):
- Tipagem forte e previsibilidade
- Arquitetura opinionada (adequada a spec-driven)
- Excelente integração com Material Design
- Aderência a padrões enterprise

🚫 Proibido:
- React
- Vue
- Svelte
- Web Components sem framework
- Micro-frontends (fora do escopo v1.0)

---

## 3. Design System

### Biblioteca de componentes
- **Angular Material**
- **Material Design 3 (M3)**

Regras obrigatórias:
- Utilizar tokens de design do Material 3
- Preferir componentes oficiais sempre que existirem
- Componentes customizados devem seguir rigorosamente os guidelines do M3

---

## 4. Arquitetura do Frontend

- **SPA (Single Page Application)**
- Organização feature-based (`core`, `shared`, `features`)

---

## 5. Componentes Angular

- Standalone Components
- Lazy loading por feature quando aplicável

---

## 6. Gerenciamento de Estado

- Estado local por componente
- Serviços Angular como fonte de verdade

🚫 Proibido:
- NgRx, Redux, MobX

---

## 7. Formulários

- **Reactive Forms (obrigatório)**
- Guiados pelo `ui-field-catalog.md`

---

## 8. Comunicação com Backend

- REST
- OpenAPI do deck shared
- HttpClient Angular

---

## 9. Integração com IA

- Apenas invocação de API
- Aplicação manual pelo usuário
- Fallback obrigatório

---

## 10. Roteamento

- Angular Router
- Rotas definidas no spec deck

---

## 11. Build e Deploy

- Angular CLI
- Hosting em IIS
- Static files

---

## 12. Testes

- Testes unitários (Jasmine/Karma ou Jest)
- Sem E2E automatizado

---

## 13. Princípios Não-Negociáveis

- UI determinística
- Sem lógica de negócio no frontend
- Compatível com Copilot Agent
