# AI System Map

Este documento descreve a estrutura completa do AI Engineering Framework presente neste projeto.

O objetivo é ajudar desenvolvedores e ferramentas de Inteligência Artificial a entender rapidamente como o sistema de documentação e agentes está organizado.

---

# Visão Geral

A pasta `/ai` contém todos os arquivos responsáveis por orientar o comportamento da IA no projeto.

Ela define:

- contexto do sistema
- padrões de engenharia
- workflows de desenvolvimento
- agentes especializados
- playbooks operacionais
- prompts reutilizáveis

Esse conjunto forma o **AI Engineering Framework**.

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

# CONTEXT

Localização:

/ai/CONTEXT

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

# GOVERNANCE

Localização:

/ai/GOVERNANCE

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

# ENGINEERING

Localização:

/ai/ENGINEERING

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

# PROMPTS

Localização:

/ai/PROMPTS

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

# WORKFLOWS

Localização:

/ai/WORKFLOWS

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

# PLAYBOOKS

Localização:

/ai/PLAYBOOKS

Guia de processos de engenharia.

Arquivos principais:

PLAYBOOK_INDEX.md  
AI_FEATURE_DESIGN.md  
AI_BUG_INVESTIGATION.md  
AI_PR_REVIEW.md  
AI_PROJECT_BOOTSTRAP.md  
AI_REFACTOR_PLAN.md  

Responsabilidade:

- definir processos padronizados
- orientar resolução de problemas
- padronizar desenvolvimento

---

# AGENTS

Localização:

/ai/AGENTS

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

# DOCS

Localização:

/ai/DOCS

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

1 Ativar contexto do projeto

Consultar:

ACTIVATE_PROJECT_CONTEXT.md

---

2 Classificar tarefa

Consultar:

WORKFLOWS/AI_TASK_ROUTER.md

---

3 Escolher playbook

Consultar:

PLAYBOOKS/PLAYBOOK_INDEX.md

---

4 Selecionar agentes

Consultar:

WORKFLOWS/AI_AGENT_ORCHESTRATOR.md

---

5 Executar tarefa

Seguindo:

WORKFLOWS/AGENT_EXECUTION_FLOW.md

---

# Objetivo do AI Engineering Framework

Este framework existe para:

- melhorar qualidade de código
- padronizar decisões técnicas
- reduzir respostas genéricas da IA
- facilitar onboarding de desenvolvedores
- simular colaboração de um time de engenharia

---

# Benefícios

Utilizar esse framework permite:

- respostas mais consistentes da IA
- maior controle sobre arquitetura
- melhor organização do projeto
- maior produtividade no desenvolvimento