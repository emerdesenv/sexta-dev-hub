# Activate Project Context

Este documento instrui a Inteligência Artificial a carregar o contexto completo do projeto antes de responder qualquer tarefa.

O objetivo é garantir que respostas sejam baseadas nas regras, arquitetura e padrões definidos neste repositório.

---

# 1. Carregar contexto do projeto

Antes de responder qualquer tarefa, a IA deve considerar os seguintes arquivos como contexto prioritário:

## Contexto do projeto

/ai/CONTEXT/AI_CONTEXT.md  
/ai/CONTEXT/ARCHITECTURE.md  
/ai/CONTEXT/PROJECT_MAP.md  
/ai/CONTEXT/DECISION_LOG.md  

Esses arquivos descrevem:

- visão geral do sistema
- arquitetura da aplicação
- organização do projeto
- decisões técnicas importantes

---

## Governança e padrões

/ai/GOVERNANCE/AI_RULES.md  
/ai/GOVERNANCE/CODE_STYLE.md  
/ai/GOVERNANCE/CONSTRAINTS.md  
/ai/GOVERNANCE/DELIVERY_CHECKLIST.md  

Esses arquivos definem:

- regras obrigatórias
- padrões de código
- limitações técnicas
- critérios de entrega

---

## Engenharia

/ai/ENGINEERING/SECURITY_BASELINE.md  
/ai/ENGINEERING/TESTING_GUIDELINES.md  
/ai/ENGINEERING/PERFORMANCE_GUIDELINES.md  
/ai/ENGINEERING/DEBUG_PLAYBOOK.md  

Esses arquivos definem boas práticas relacionadas a:

- segurança
- testes
- performance
- investigação de problemas

---

# 2. Utilizar workflows de agentes

Quando a tarefa envolver múltiplas áreas do sistema, utilizar os seguintes documentos:

/ai/WORKFLOWS/AI_TASK_ROUTER.md  
/ai/WORKFLOWS/AI_AGENT_ORCHESTRATOR.md  
/ai/WORKFLOWS/AGENT_EXECUTION_FLOW.md  

Esses arquivos ajudam a:

- classificar a tarefa
- selecionar agentes adequados
- definir ordem de execução

---

# 3. Utilizar agentes especializados

Agentes disponíveis:

/ai/AGENTS

Principais agentes:

architect  
backend-engineer  
frontend-engineer  
debugger  
code-reviewer  
security-auditor  
test-engineer  
refactor-specialist  
product-designer  

Cada agente possui:

- responsabilidades
- limites
- arquivos de referência

---

# 4. Utilizar playbooks quando necessário

Para tarefas comuns de engenharia, consultar:

/ai/PLAYBOOKS

Playbooks disponíveis:

AI_FEATURE_DESIGN.md  
AI_BUG_INVESTIGATION.md  
AI_PR_REVIEW.md  
AI_PROJECT_BOOTSTRAP.md  
AI_REFACTOR_PLAN.md  

Eles fornecem processos padronizados para:

- criação de funcionalidades
- investigação de bugs
- revisão de código
- inicialização de projetos
- refatoração

---

# 5. Utilizar biblioteca de prompts

Prompts reutilizáveis estão em:

/ai/PROMPTS

Arquivos:

PROMPT_PATTERNS.md  
TASK_TEMPLATES.md  
FIGMA_PROMPTS.md  

Esses arquivos ajudam a padronizar solicitações feitas à IA.

---

# 6. Princípios de resposta

Ao responder tarefas relacionadas ao projeto, a IA deve:

- respeitar arquitetura definida
- seguir padrões de código
- considerar segurança e testes
- evitar mudanças desnecessárias
- propor soluções claras e executáveis

---

# 7. Estrutura recomendada de resposta

Quando apropriado, a resposta deve incluir:

1. entendimento da tarefa
2. análise técnica
3. proposta de solução
4. impacto arquitetural
5. riscos
6. passos de implementação

---

# 8. Regra principal

Nunca responder ignorando os arquivos do framework.

Sempre priorizar:

- contexto do projeto
- regras de governança
- workflows definidos
- agentes especializados