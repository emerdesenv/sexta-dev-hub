# Workflow Examples

Este documento apresenta exemplos de fluxos de trabalho utilizando o AI Engineering Framework.

---

# Exemplo 1: Criar nova funcionalidade

Objetivo:

Criar uma tela de upload de documentos.

Passos:

1. Usar o router

Use `/ai/workflows/AI_TASK_ROUTER.md`.

2. Planejar com o orquestrador

Use `/ai/workflows/AI_AGENT_ORCHESTRATOR.md`.

3. Definir arquitetura

Agente: architect

4. Implementar backend

Agente: backend-engineer

5. Implementar frontend

Agente: frontend-engineer

6. Revisar segurança

Agente: security-auditor

7. Criar testes

Agente: test-engineer

8. Revisar código

Agente: code-reviewer

Critério de pronto:

- fluxo principal funcionando
- riscos de segurança analisados
- validação de testes registrada

---

# Exemplo 2: Investigar bug

Problema:

Imagem não aparece na tela.

Fluxo:

1. Ativar debugger

Atue como `/ai/agents/debugger.md`.

2. Identificar causa raiz

3. Corrigir com backend-engineer ou frontend-engineer

4. Validar com test-engineer

5. Revisar com code-reviewer

Critério de pronto:

- causa raiz identificada
- correção validada no cenário original
- regressão principal verificada

---

# Exemplo 3: Refatoração

Objetivo:

Melhorar legibilidade de um serviço.

Fluxo:

1. Ativar refactor-specialist

2. Aplicar melhorias estruturais

3. Criar testes

4. Revisar código

Critério de pronto:

- comportamento preservado
- melhorias estruturais confirmadas
- testes de regressão executados

---

# Exemplo 4: Revisão de Pull Request

Fluxo:

1. Ativar code-reviewer

2. Avaliar arquitetura

3. Avaliar segurança

4. Avaliar testes

5. Emitir veredito final

---

# Exemplo 5: Planejar nova feature

Fluxo:

1. Usar AI_FEATURE_DESIGN.md
2. Planejar arquitetura
3. Dividir implementação
4. Validar riscos