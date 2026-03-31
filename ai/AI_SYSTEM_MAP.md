# AI System Map

Mapa navegacional da pasta `ai/`.

## Papel deste documento
Este arquivo mostra onde cada artefato está e qual usar por objetivo.
Para princípios e modelo operacional, consultar `AI_OPERATING_SYSTEM.md`.
Para resolver conflitos entre documentos, consultar `governance/DOCUMENT_PRECEDENCE.md`.

---

# Estrutura (resumo)

- `ai/context/`: contexto técnico e mapa do sistema
- `ai/governance/`: regras obrigatórias e critérios de entrega
- `ai/engineering/`: segurança, testes, performance e debug
- `ai/testing/`: matriz executável de fluxos críticos
- `ai/design/`: padrões visuais e implementação de UI
- `ai/workflows/`: roteamento e orquestração de tarefas
- `ai/playbooks/`: execução prática por tipo de trabalho
- `ai/agents/`: papéis especializados
- `ai/prompts/`: templates e padrões de prompt
- `ai/docs/`: onboarding humano e templates documentais

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
TEST_STRATEGY.md  
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

Quick start humano.

## AI_SYSTEM_MAP.md

Este documento.

---

# Fluxo recomendado de uso (curto)

Ao trabalhar com IA no projeto, o fluxo ideal é:

1. Ativar contexto: `ACTIVATE_PROJECT_CONTEXT.md`
2. Roteamento: `workflows/AI_TASK_ROUTER.md`
3. Orquestração: `workflows/AI_AGENT_ORCHESTRATOR.md`
4. Execução: `workflows/AGENT_EXECUTION_FLOW.md`
5. Revisão de entrega: `governance/DELIVERY_CHECKLIST.md`

---

# Referências

- `/ai/AI_OPERATING_SYSTEM.md` (conceitos e princípios)
- `/ai/ACTIVATE_PROJECT_CONTEXT.md` (ativação de contexto)
- `/ai/docs/DOCUMENT_TEMPLATES.md` (padrão editorial)