# CURSOR_WORKFLOWS.md

Owner: Architect
Status: active
Ultima revisao: 2026-03-31
Proxima revisao sugerida: 2026-05-30

## Objetivo

Este documento define fluxos de trabalho e prompts recomendados para utilizar **Cursor AI** dentro do projeto **Sexta Dev Hub**.

O objetivo é padronizar o uso de IA no desenvolvimento para:

* executar tarefas recorrentes com contexto correto
* reduzir prompts genéricos
* manter consistência com regras do projeto

---

# Contexto Sempre Utilizado

Ao trabalhar com IA no Cursor, sempre considerar os seguintes arquivos:

* `/ai/ACTIVATE_PROJECT_CONTEXT.md`
* `/ai/governance/DOCUMENT_PRECEDENCE.md`
* `/ai/governance/AI_RULES.md`

Esses documentos contêm o contexto necessário para a IA compreender o projeto.

---

# Workflow 1 — Analisar Arquitetura do Projeto

Utilizar quando abrir o projeto pela primeira vez ou ao iniciar uma refatoração.

Prompt:

@/ai/context/AI_CONTEXT.md
@/ai/context/PROJECT_MAP.md

Analyze the architecture of this project and explain:

* frontend structure
* backend structure
* main components
* main services
* how the frontend communicates with the backend

---

# Workflow 2 — Mapear Estrutura do Frontend

Prompt:

@/ai/context/PROJECT_MAP.md
@/ai/context/AI_CONTEXT.md

Analyze the frontend structure and list:

* all pages
* reusable components
* services used for API calls
* router structure

Explain how the UI is currently organized.

---

# Workflow 3 — Criar Novo Componente

Utilizar para gerar componentes reutilizáveis.

Prompt:

@/ai/design/DESIGN_SYSTEM.md
@/ai/governance/AI_RULES.md

Create a reusable Vue component for this project.

Requirements:

* follow the design system
* keep the component simple and reusable
* avoid inline styles
* maintain responsive layout

Explain the structure of the component after generating it.

---

# Workflow 4 — Refatorar Interface

Utilizar ao melhorar layout de páginas existentes.

Prompt:

@/ai/context/AI_CONTEXT.md
@/ai/governance/AI_RULES.md
@/ai/design/DESIGN_SYSTEM.md
@/ai/playbooks/AI_REFACTOR_GUIDE.md

Refactor this UI while preserving existing logic and API integrations.

Focus on:

* layout organization
* readability
* responsiveness
* reusable components

Do not modify backend integration.

---

# Workflow 5 — Converter Layout do Figma para Código

Utilizar após gerar interface no Figma.

Prompt:

@/ai/design/DESIGN_SYSTEM.md
@/ai/governance/AI_RULES.md

Implement a Vue component based on this layout.

Requirements:

* follow the design system
* break layout into reusable components
* maintain responsive behavior
* avoid unnecessary complexity

Explain the component structure before generating code.

---

# Workflow 6 — Criar Nova Página

Prompt:

@/ai/context/AI_CONTEXT.md
@/ai/design/DESIGN_SYSTEM.md
@/ai/governance/AI_RULES.md

Create a new Vue page for this project.

Requirements:

* follow existing router structure
* use reusable components
* maintain consistent layout
* respect the design system

Explain which components should be created or reused.

---

# Workflow 7 — Revisar Código

Utilizar antes de commits importantes.

Prompt:

@/ai/governance/AI_RULES.md

Review this code and check:

* readability
* architecture consistency
* potential bugs
* performance improvements
* security concerns

Provide improvement suggestions.

---

# Workflow 8 — Refatorar Código

Prompt:

@/ai/governance/AI_RULES.md

Refactor this code to improve:

* readability
* maintainability
* simplicity

Do not change behavior.

---

# Workflow 9 — Criar Endpoint Backend

Prompt:

@/ai/context/AI_CONTEXT.md
@/ai/governance/AI_RULES.md
@/ai/context/PROJECT_MAP.md

Create a new backend endpoint following the existing architecture.

Ensure separation between:

* routes
* controllers
* services

Explain where each part should be placed.

---

# Workflow 10 — Analisar Impacto de Mudanças

Utilizar antes de grandes refatorações.

Prompt:

@/ai/context/PROJECT_MAP.md

Analyze how modifying this file may impact:

* other components
* services
* routes
* backend integrations

Explain potential risks.

---

# Workflow 11 — Preparar Deploy

Prompt:

Analyze the project and ensure it is ready for deployment.

Check:

* environment variables
* Docker configuration
* potential runtime errors
* build process

Provide recommendations before deployment.

---

# Boas Práticas ao Usar Cursor

1. Sempre fornecer contexto.
2. Preferir mudanças pequenas e controladas.
3. Revisar código gerado antes de aplicar.
4. Evitar refatorações massivas automáticas.
5. Registrar evidência mínima de testes quando houver mudança de comportamento.

---

# Fluxo de Trabalho Recomendado

1. Ativar contexto (`ACTIVATE_PROJECT_CONTEXT.md`)
2. Classificar tarefa (`AI_TASK_ROUTER.md`)
3. Orquestrar quando necessário (`AI_AGENT_ORCHESTRATOR.md`)
4. Executar e validar (`AGENT_EXECUTION_FLOW.md`)
5. Registrar evidência de testes (`ai/testing/TEST_EVIDENCE_TEMPLATE.md`)

Integração com o framework:

1. Classificar tarefa com `/ai/workflows/AI_TASK_ROUTER.md`
2. Selecionar agentes com `/ai/workflows/AI_AGENT_ORCHESTRATOR.md`
3. Executar com `/ai/workflows/AGENT_EXECUTION_FLOW.md`

---

# Objetivo Final

O uso de Cursor neste projeto deve:

* acelerar desenvolvimento
* manter qualidade do código
* respeitar arquitetura existente
* melhorar a experiência de desenvolvimento.
