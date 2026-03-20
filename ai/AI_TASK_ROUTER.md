# AI TASK ROUTER

Este documento define como classificar tarefas e quais agentes devem ser acionados.

O objetivo é reduzir ambiguidade e tornar o uso dos agentes previsível.

---

# Objetivo

Antes de iniciar qualquer execução, a IA deve identificar o tipo principal da tarefa.

Com base nisso, deve selecionar o agente mais adequado ou um conjunto de agentes.

---

# Tipos de Tarefa

## 1. Nova funcionalidade
Quando o usuário pede criação de algo novo.

Exemplos:
- criar tela
- criar endpoint
- integrar API
- adicionar upload
- criar dashboard

Agentes mais comuns:
- architect
- frontend-engineer
- backend-engineer
- security-auditor
- test-engineer
- code-reviewer

---

## 2. Bug ou falha
Quando o usuário relata erro, comportamento inesperado ou quebra de fluxo.

Exemplos:
- erro 500
- erro 502
- tela não carrega
- container sobe mas API não responde
- login falha

Agentes mais comuns:
- debugger
- backend-engineer
- frontend-engineer
- security-auditor
- code-reviewer
- test-engineer

Regra:
o debugger deve atuar primeiro

---

## 3. Refatoração
Quando o objetivo é melhorar estrutura sem mudar comportamento funcional.

Exemplos:
- reduzir duplicação
- melhorar nomes
- quebrar função grande
- reorganizar camadas

Agentes mais comuns:
- refactor-specialist
- code-reviewer
- test-engineer

---

## 4. Revisão de código
Quando o usuário quer análise crítica de código existente.

Exemplos:
- revise esse componente
- avalie esse endpoint
- o que acha desse controller?

Agentes mais comuns:
- code-reviewer
- security-auditor
- architect

---

## 5. Segurança
Quando a tarefa é voltada a riscos, proteção, autenticação ou validação.

Exemplos:
- revisar upload
- validar login
- proteger rota
- avaliar vulnerabilidades

Agentes mais comuns:
- security-auditor
- backend-engineer
- architect
- code-reviewer

---

## 6. Performance
Quando o foco é reduzir lentidão, consumo ou gargalos.

Exemplos:
- melhorar tempo de resposta
- otimizar consulta
- reduzir payload
- escalar backend

Agentes mais comuns:
- architect
- backend-engineer
- frontend-engineer
- debugger
- code-reviewer

---

## 7. UI/UX
Quando o foco é interface, layout, experiência do usuário ou Figma.

Exemplos:
- criar tela
- adaptar design
- melhorar responsividade
- transformar Figma em componente

Agentes mais comuns:
- product-designer
- frontend-engineer
- code-reviewer
- test-engineer

---

## 8. Testes
Quando o foco principal é validação, cenários, automação ou cobertura.

Exemplos:
- criar testes
- sugerir casos de teste
- montar checklist de QA

Agentes mais comuns:
- test-engineer
- backend-engineer
- frontend-engineer
- code-reviewer

---

# Regras de Priorização

## Regra 1
Se a tarefa mencionar erro, falha, bug ou comportamento inesperado, classificar primeiro como bug.

## Regra 2
Se a tarefa mencionar melhorar sem mudar regra de negócio, classificar como refatoração.

## Regra 3
Se a tarefa envolver telas + APIs, tratar como nova funcionalidade multidisciplinar.

## Regra 4
Se a tarefa envolver arquivos, autenticação, permissões ou dados sensíveis, incluir security-auditor.

## Regra 5
Se houver risco de regressão, incluir test-engineer.

## Regra 6
Se houver impacto estrutural, incluir architect.

---

# Estrutura de Saída do Router

Ao classificar uma tarefa, a IA deve informar:

1. tipo principal da tarefa
2. agentes recomendados
3. justificativa curta
4. ordem sugerida

---

# Exemplo

## Entrada
Criar tela de upload de PDF com endpoint backend e validação de segurança.

## Saída esperada
Tipo da tarefa:
nova funcionalidade multidisciplinar

Agentes:
- architect
- backend-engineer
- security-auditor
- frontend-engineer
- test-engineer
- code-reviewer

Motivo:
envolve arquitetura, backend, frontend, segurança e validação

Ordem:
1. architect
2. backend-engineer
3. security-auditor
4. frontend-engineer
5. test-engineer
6. code-reviewer