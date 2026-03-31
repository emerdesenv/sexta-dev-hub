# Activate Project Context

Checklist operacional para ativar contexto antes de executar tarefas no projeto.

---

## 1) Carregamento minimo obrigatorio

Leia nesta ordem:

1. `ai/governance/DOCUMENT_PRECEDENCE.md`
2. `ai/context/AI_CONTEXT.md`
3. `ai/governance/AI_RULES.md`
4. `ai/context/ARCHITECTURE.md`
5. `ai/context/PROJECT_MAP.md`

## 2) Carregamento por tipo de tarefa

- **Mudanca funcional**: `ai/product/BUSINESS_RULES.md`
- **Mudanca de seguranca**: `ai/engineering/SECURITY_BASELINE.md` + `ai/engineering/SECURITY_PLAYBOOK.md`
- **Mudanca de testes**: `ai/engineering/TEST_STRATEGY.md` + `ai/testing/CRITICAL_FLOWS_TEST_MATRIX.md`
- **Mudanca de UI**: `ai/design/DESIGN_SYSTEM.md` + `ai/design/UI_IMPLEMENTATION_GUIDE.md`

## 3) Execucao com workflows/agentes

- Classificar tarefa: `ai/workflows/AI_TASK_ROUTER.md`
- Orquestrar agentes: `ai/workflows/AI_AGENT_ORCHESTRATOR.md`
- Executar fluxo: `ai/workflows/AGENT_EXECUTION_FLOW.md`
- Validar entrega: `ai/governance/DELIVERY_CHECKLIST.md`

## Regra principal

Nao executar tarefa ignorando contexto e precedencia documental.