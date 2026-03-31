# Playbook Index

Owner: Architect
Status: active
Ultima revisao: 2026-03-31
Proxima revisao sugerida: 2026-05-30

Este documento funciona como índice central dos playbooks disponíveis no AI Engineering Framework.

Playbooks são guias operacionais que descrevem como resolver tipos comuns de tarefas de engenharia.

Eles ajudam a garantir consistência nas decisões técnicas e no processo de desenvolvimento.

Em caso de conflito com outros documentos, seguir `ai/governance/DOCUMENT_PRECEDENCE.md`.

---

# O que é um Playbook

Um playbook define:

- quando usar
- qual processo seguir
- quais documentos consultar
- quais agentes envolver

Isso permite que a Inteligência Artificial e os desenvolvedores sigam um fluxo padronizado para resolver problemas.

---

# Lista de Playbooks

## Feature Design

Arquivo:

`/ai/playbooks/AI_FEATURE_DESIGN.md`

Usar quando:

- criar nova funcionalidade
- adicionar novos fluxos no sistema
- introduzir novos endpoints
- criar novas telas ou módulos

Objetivo:

Planejar corretamente a implementação de uma feature antes de começar a programar.

Agentes recomendados:

architect  
backend-engineer  
frontend-engineer  
test-engineer  
code-reviewer  

---

## Bug Investigation

Arquivo:

`/ai/playbooks/AI_BUG_INVESTIGATION.md`

Usar quando:

- ocorre erro no sistema
- comportamento inesperado
- falha de integração
- erro em produção

Objetivo:

Identificar a causa raiz de um problema antes de implementar uma correção.

Agentes recomendados:

debugger  
backend-engineer  
frontend-engineer  
test-engineer  
code-reviewer  

---

## PR Review

Arquivo:

`/ai/playbooks/AI_PR_REVIEW.md`

Usar quando:

- revisar Pull Requests
- avaliar código novo
- validar mudanças antes de merge

Objetivo:

Garantir qualidade, segurança e consistência no código.

Agentes recomendados:

code-reviewer  
security-auditor  
test-engineer  

---

## Project Bootstrap

Arquivo:

`/ai/playbooks/AI_PROJECT_BOOTSTRAP.md`

Usar quando:

- iniciar um novo projeto
- criar estrutura inicial de software
- definir stack e arquitetura

Objetivo:

Garantir que novos projetos comecem com arquitetura, padrões e boas práticas.

Agentes recomendados:

architect  
backend-engineer  
frontend-engineer  

---

## Refactor Guide

Arquivo:

`/ai/playbooks/AI_REFACTOR_GUIDE.md`

Usar quando:

- melhorar estrutura do código
- reduzir complexidade
- remover duplicação
- melhorar manutenção do sistema

Objetivo:

Executar refatorações seguras sem alterar comportamento funcional.

Agentes recomendados:

refactor-specialist  
test-engineer  
code-reviewer  

---

# Como escolher o playbook correto

Se a tarefa envolver:

Criar algo novo → Feature Design  
Investigar erro → Bug Investigation  
Revisar código → PR Review  
Criar projeto → Project Bootstrap  
Melhorar código existente → Refactor Guide  

Mapeamento tipo -> playbook:

- Feature -> `AI_FEATURE_DESIGN.md`
- Bug -> `AI_BUG_INVESTIGATION.md`
- PR Review -> `AI_PR_REVIEW.md`
- Bootstrap -> `AI_PROJECT_BOOTSTRAP.md`
- Refactor -> `AI_REFACTOR_GUIDE.md`

Fallback para tipos sem playbook dedicado (segurança, performance, UI/UX, testes):

- usar `AI_TASK_ROUTER.md` + `AI_AGENT_ORCHESTRATOR.md` + `AGENT_EXECUTION_FLOW.md`
- aplicar checklist final em `ai/governance/DELIVERY_CHECKLIST.md`

---

# Integração com Workflows

Os playbooks funcionam em conjunto com:

`/ai/workflows/AI_TASK_ROUTER.md`  
`/ai/workflows/AI_AGENT_ORCHESTRATOR.md`  
`/ai/workflows/AGENT_EXECUTION_FLOW.md`  

Fluxo recomendado:

1. Classificar tarefa com `AI_TASK_ROUTER`  
2. Selecionar playbook apropriado  
3. Executar fluxo com `AI_AGENT_ORCHESTRATOR`  
4. Utilizar agentes especializados  

---

# Boas práticas

Sempre que possível:

- selecionar o playbook antes de começar
- seguir as etapas definidas
- envolver agentes adequados
- validar resultado com revisão e testes

---

# Objetivo do Playbook Index

Este índice existe para:

- facilitar navegação no framework
- ajudar a IA a escolher o processo correto
- padronizar resolução de problemas
- tornar o desenvolvimento mais consistente