# AI System Map

Este documento descreve a estrutura completa do AI Engineering Framework presente neste projeto.

O objetivo é ajudar desenvolvedores e ferramentas de Inteligência Artificial a entender rapidamente como o sistema de documentação e agentes está organizado.

## Papel deste documento
Este arquivo é o mapa navegacional do framework (estrutura e links).
Para princípios e modelo operacional, consultar `AI_OPERATING_SYSTEM.md`.

---

# Visão Geral

Este documento existe para mostrar **onde está cada parte** do framework em `/ai` e qual a função de cada área.

---

# Estrutura da Pasta /ai

/ai

CONTEXTO DO PROJETO  
GOVERNANÇA E REGRAS  
PRÁTICAS DE ENGENHARIA  
PROMPTS E TEMPLATES  
WORKFLOWS DE AGENTES  
PLAYBOOKS DE ENGENHARIA  
AGENTES ESPECIALIZADOS  
DOCUMENTAÇÃO DE USO  

Cada área possui uma responsabilidade específica.

---

# Context

Localização:

`/ai/context`

Contém informações estruturais do projeto.

Arquivos principais:

AI_CONTEXT.md  
ARCHITECTURE.md  
PROJECT_MAP.md  
DECISION_LOG.md  

Responsabilidade:

- explicar o projeto
- documentar arquitetura
- registrar decisões técnicas
- mostrar organização do código

---

# Governance

Localização:

`/ai/governance`

Define regras obrigatórias do projeto.

Arquivos principais:

AI_RULES.md  
CODE_STYLE.md  
CONSTRAINTS.md  
DELIVERY_CHECKLIST.md  

Responsabilidade:

- padronizar código
- definir regras de engenharia
- estabelecer critérios de entrega
- limitar decisões técnicas

---

# Engineering

Localização:

`/ai/engineering`

Define boas práticas operacionais de engenharia.

Arquivos principais:

SECURITY_BASELINE.md  
TESTING_GUIDELINES.md  
PERFORMANCE_GUIDELINES.md  
DEBUG_PLAYBOOK.md  

Responsabilidade:

- segurança
- testes
- performance
- diagnóstico de problemas

---

# Prompts

Localização:

`/ai/prompts`

Biblioteca de prompts reutilizáveis.

Arquivos principais:

PROMPT_PATTERNS.md  
TASK_TEMPLATES.md  
FIGMA_PROMPTS.md  

Responsabilidade:

- padronizar solicitações à IA
- acelerar tarefas comuns
- melhorar qualidade das respostas

---

# Workflows

Localização:

`/ai/workflows`

Define como agentes trabalham juntos.

Arquivos principais:

AI_TASK_ROUTER.md  
AI_AGENT_ORCHESTRATOR.md  
AGENT_EXECUTION_FLOW.md  
CURSOR_WORKFLOWS.md  

Responsabilidade:

- classificar tarefas
- selecionar agentes
- coordenar execução
- definir ordem de atuação

---

# Playbooks

Localização:

`/ai/playbooks`

Guia de processos de engenharia.

Arquivos principais:

PLAYBOOK_INDEX.md  
AI_FEATURE_DESIGN.md  
AI_BUG_INVESTIGATION.md  
AI_PR_REVIEW.md  
AI_PROJECT_BOOTSTRAP.md  
AI_REFACTOR_GUIDE.md  

Responsabilidade:

- definir processos padronizados
- orientar resolução de problemas
- padronizar desenvolvimento

---

# Agents

Localização:

`/ai/agents`

Define agentes especializados da IA.

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

Responsabilidade:

- representar papéis técnicos
- especializar respostas da IA
- simular colaboração de um time de engenharia

---

# Docs

Localização:

`/ai/docs`

Documentação de uso do framework.

Arquivos principais:

AI_SETUP_GUIDE.md  
HOW_TO_USE_AGENTS.md  
WORKFLOW_EXAMPLES.md  

Responsabilidade:

- ensinar como usar o framework
- orientar novos desenvolvedores
- fornecer exemplos de workflow

---

# Arquivos especiais

Alguns arquivos ficam diretamente na raiz da pasta `/ai`.

## ACTIVATE_PROJECT_CONTEXT.md

Instrui a IA a carregar o contexto completo do projeto antes de responder tarefas.

## README_AI.md

Introdução geral ao AI Engineering Framework.

## AI_SYSTEM_MAP.md

Este documento.

---

# Fluxo recomendado de uso

Ao trabalhar com IA no projeto, o fluxo ideal é:

1. Ativar contexto do projeto

Consultar:

`ACTIVATE_PROJECT_CONTEXT.md`

---

2. Classificar tarefa

Consultar:

`/ai/workflows/AI_TASK_ROUTER.md`

---

3. Escolher playbook

Consultar:

`/ai/playbooks/PLAYBOOK_INDEX.md`

---

4. Selecionar agentes

Consultar:

`/ai/workflows/AI_AGENT_ORCHESTRATOR.md`

---

5. Executar tarefa

Seguindo:

`/ai/workflows/AGENT_EXECUTION_FLOW.md`

---

# Referências

- `/ai/AI_OPERATING_SYSTEM.md` (conceitos e princípios)
- `/ai/ACTIVATE_PROJECT_CONTEXT.md` (ativação de contexto)
- `/ai/docs/DOCUMENT_TEMPLATES.md` (padrão editorial)