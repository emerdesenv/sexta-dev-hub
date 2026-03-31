# AI Operating System

Este documento define o conceito de **AI Operating System** utilizado neste projeto.

O AI Operating System é um conjunto estruturado de documentos que orienta o comportamento da Inteligência Artificial durante o desenvolvimento de software.

Ele funciona como uma camada de governança e contexto que permite que ferramentas de IA atuem de forma consistente, previsível e alinhada à arquitetura do projeto.

## Fonte de verdade
Este é o documento conceitual canônico do framework (princípios, objetivos e modelo operacional).
Para navegação por arquivos e localização de artefatos, consultar `AI_SYSTEM_MAP.md`.
Para resolver conflitos entre documentos, consultar `governance/DOCUMENT_PRECEDENCE.md`.

---

# O que é o AI Operating System

O AI Operating System é composto por:

- contexto do projeto
- regras de engenharia
- padrões de código
- workflows de desenvolvimento
- agentes especializados
- playbooks operacionais
- prompts reutilizáveis

Esses elementos juntos criam um ambiente onde a IA pode atuar como parte de um time de engenharia.

---

# Objetivo

O objetivo do AI Operating System é:

- reduzir respostas genéricas da IA
- melhorar qualidade técnica das sugestões
- padronizar decisões de engenharia
- aumentar produtividade no desenvolvimento
- simular colaboração de um time de software

---

# Componentes principais (visão conceitual)

## Contexto

Localização:

`/ai/context`

Responsável por explicar o sistema.

Inclui:

AI_CONTEXT.md  
ARCHITECTURE.md  
PROJECT_MAP.md  
DECISION_LOG.md  

---

## Governança

Localização:

`/ai/governance`

Define regras obrigatórias do projeto.

Inclui:

AI_RULES.md  
CODE_STYLE.md  
CONSTRAINTS.md  
DELIVERY_CHECKLIST.md  

---

## Engenharia

Localização:

`/ai/engineering`

Define práticas técnicas recomendadas.

Inclui:

SECURITY_BASELINE.md  
TEST_STRATEGY.md  
PERFORMANCE_GUIDELINES.md  
DEBUG_PLAYBOOK.md  

---

## Prompts

Localização:

`/ai/prompts`

Biblioteca de prompts reutilizáveis.

Inclui:

PROMPT_PATTERNS.md  
TASK_TEMPLATES.md  
FIGMA_PROMPTS.md  

---

## Workflows

Localização:

`/ai/workflows`

Define como tarefas devem ser executadas.

Inclui:

AI_TASK_ROUTER.md  
AI_AGENT_ORCHESTRATOR.md  
AGENT_EXECUTION_FLOW.md  
CURSOR_WORKFLOWS.md  

---

## Playbooks

Localização:

`/ai/playbooks`

Define processos para resolver tarefas comuns de engenharia.

Inclui:

AI_FEATURE_DESIGN.md  
AI_BUG_INVESTIGATION.md  
AI_PR_REVIEW.md  
AI_PROJECT_BOOTSTRAP.md  
AI_REFACTOR_GUIDE.md  

---

## Agentes

Localização:

`/ai/agents`

Define papéis especializados da IA.

Exemplos:

architect  
backend-engineer  
frontend-engineer  
debugger  
code-reviewer  
security-auditor  
test-engineer  
refactor-specialist  
product-designer  

Cada agente possui responsabilidades específicas.

---

## Documentação

Localização:

`/ai/docs`

Explica como utilizar o framework.

Inclui:

AI_SETUP_GUIDE.md  
HOW_TO_USE_AGENTS.md  
WORKFLOW_EXAMPLES.md  

---

# Como o sistema funciona

O fluxo operacional recomendado é:

1. ativar contexto (`/ai/ACTIVATE_PROJECT_CONTEXT.md`)
2. classificar tarefa (`/ai/workflows/AI_TASK_ROUTER.md`)
3. selecionar playbook (`/ai/playbooks/PLAYBOOK_INDEX.md`)
4. orquestrar agentes (`/ai/workflows/AI_AGENT_ORCHESTRATOR.md`)
5. executar fluxo (`/ai/workflows/AGENT_EXECUTION_FLOW.md`)

Para detalhes de localização e navegação por arquivos, usar `/ai/AI_SYSTEM_MAP.md`.

---

# Princípios do AI Operating System

O sistema segue alguns princípios fundamentais:

Consistência  
As respostas da IA devem seguir padrões definidos.

Especialização  
Agentes possuem responsabilidades específicas.

Governança  
Regras e limitações são respeitadas.

Arquitetura primeiro  
Decisões devem respeitar a arquitetura do sistema.

Segurança e testes  
Toda implementação deve considerar segurança e validação.

---

# Benefícios

Utilizar este sistema permite:

- desenvolvimento mais estruturado
- decisões técnicas mais consistentes
- melhor colaboração entre humanos e IA
- maior previsibilidade nas respostas
- maior qualidade no código gerado

---

# Papel da Inteligência Artificial

Dentro deste framework, a IA atua como:

- arquiteto
- desenvolvedor
- revisor
- investigador de bugs
- especialista em segurança
- especialista em testes

Esses papéis são ativados através dos agentes definidos na pasta `/ai/agents`.

---

# Evolução do sistema

O AI Operating System pode evoluir com o projeto.

Novos elementos podem ser adicionados, como:

- novos agentes
- novos playbooks
- novos workflows
- novas práticas de engenharia

O objetivo é que o sistema evolua junto com o projeto.

---

# Referências

- `/ai/AI_SYSTEM_MAP.md`
- `/ai/ACTIVATE_PROJECT_CONTEXT.md`
- `/ai/docs/DOCUMENT_TEMPLATES.md`