# AI AGENT ORCHESTRATOR

Este documento define como a IA deve coordenar agentes especializados dentro do projeto.

O objetivo é permitir que tarefas complexas sejam tratadas como um fluxo de trabalho colaborativo entre papéis técnicos diferentes.

---

# Objetivo

Quando uma tarefa envolver múltiplas áreas do projeto, a IA não deve responder de forma genérica.

Ela deve:

1. identificar a natureza da tarefa
2. escolher os agentes adequados
3. definir a ordem de atuação
4. consolidar a resposta final

---

# Princípio Geral

A IA deve se comportar como um coordenador técnico.

Em vez de tentar resolver tudo sob uma única perspectiva, ela deve decompor a tarefa em especialidades.

Exemplo:

Uma funcionalidade de upload de PDF pode envolver:

- arquitetura
- backend
- frontend
- segurança
- testes
- revisão

---

# Responsabilidades do Orquestrador

O orquestrador deve:

- entender o objetivo da tarefa
- detectar complexidade técnica
- selecionar agentes adequados
- evitar agentes desnecessários
- organizar a ordem lógica de execução
- consolidar uma resposta final coerente

---

# Quando usar múltiplos agentes

Usar múltiplos agentes quando a tarefa envolver:

- mais de uma camada do sistema
- impacto arquitetural
- riscos de segurança
- necessidade de testes relevantes
- mudanças de UI + backend
- refatoração com risco de regressão

---

# Quando usar apenas um agente

Usar um único agente quando a tarefa for claramente especializada e restrita.

Exemplos:

- revisar um componente Vue → frontend-engineer ou code-reviewer
- investigar erro 502 no proxy → debugger
- revisar autenticação → security-auditor
- melhorar legibilidade de uma função → refactor-specialist

---

# Agentes Disponíveis

- architect
- frontend-engineer
- backend-engineer
- code-reviewer
- debugger
- security-auditor
- refactor-specialist
- test-engineer
- product-designer

---

# Regras de Orquestração

## Regra 1 — Arquitetura antes de implementação
Se a tarefa impactar estrutura, fluxo entre serviços, escalabilidade ou divisão de responsabilidades, consultar o architect antes de implementar.

## Regra 2 — Segurança antes de finalizar
Se houver autenticação, upload, manipulação de arquivos, dados sensíveis ou inputs externos, incluir o security-auditor antes da conclusão.

## Regra 3 — Testes antes de entrega
Toda alteração relevante deve passar por validação do test-engineer, mesmo que apenas com cenários sugeridos.

## Regra 4 — Revisão ao final
Sempre que a tarefa gerar código novo, considerar revisão final com o code-reviewer.

## Regra 5 — Refatoração não é feature
Quando o foco for melhoria estrutural sem alterar comportamento, priorizar refactor-specialist em vez de backend/frontend-engineer.

## Regra 6 — Bugs exigem diagnóstico primeiro
Para bugs, o debugger deve atuar antes de qualquer implementação corretiva.

---

# Estrutura de Resposta do Orquestrador

Ao coordenar múltiplos agentes, a IA deve responder com:

1. Tipo da tarefa
2. Agentes selecionados
3. Motivo da seleção
4. Ordem de atuação
5. Plano consolidado
6. Entrega final

---

# Exemplo de Orquestração

## Tarefa
Implementar upload de PDF com validação e tela de envio.

## Agentes selecionados
- architect
- backend-engineer
- security-auditor
- frontend-engineer
- test-engineer
- code-reviewer

## Ordem sugerida
1. architect
2. backend-engineer
3. security-auditor
4. frontend-engineer
5. test-engineer
6. code-reviewer

---

# Critérios de Qualidade

A orquestração deve buscar:

- clareza
- mínima complexidade necessária
- boa separação de responsabilidades
- segurança
- testabilidade
- consistência com os arquivos da pasta /ai

---

# Regra Final

O orquestrador nunca deve ignorar:

- AI_RULES.md
- CONSTRAINTS.md
- ARCHITECTURE.md
- PROJECT_MAP.md

Esses documentos têm precedência sobre preferências ad hoc de implementação.