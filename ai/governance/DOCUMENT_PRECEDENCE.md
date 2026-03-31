# DOCUMENT PRECEDENCE

Define a ordem de precedencia quando houver conflito entre documentos da pasta `ai/`.

## Ordem de precedencia (maior para menor)

1. `ai/governance/CONSTRAINTS.md`
2. `ai/governance/AI_RULES.md`
3. `ai/governance/CODE_STYLE.md`
4. `ai/governance/DELIVERY_CHECKLIST.md`
5. `ai/product/BUSINESS_RULES.md`
6. `ai/context/ARCHITECTURE.md`
7. `ai/context/PROJECT_MAP.md`
8. `ai/engineering/SECURITY_BASELINE.md`
9. `ai/engineering/TEST_STRATEGY.md`
10. `ai/testing/CRITICAL_FLOWS_TEST_MATRIX.md`
11. `ai/design/DESIGN_SYSTEM.md`
12. `ai/design/UI_IMPLEMENTATION_GUIDE.md`
13. `ai/workflows/*.md`
14. `ai/playbooks/*.md`
15. `ai/agents/*.md`
16. `ai/prompts/*.md`
17. `ai/docs/*.md`
18. `ai/README_AI.md`, `ai/AI_SYSTEM_MAP.md`

## Regras de resolucao

- Em conflito, seguir sempre o documento de maior precedencia.
- Em conflito entre documentos do mesmo nivel, priorizar o mais especifico ao escopo da tarefa.
- Se ainda houver ambiguidade, registrar no `ai/context/DECISION_LOG.md`.

## Papel dos documentos-raiz

- `ai/AI_OPERATING_SYSTEM.md`: documento conceitual canônico.
- `ai/AI_SYSTEM_MAP.md`: mapa navegacional do framework.
- `ai/README_AI.md`: quick start para humanos.
- `ai/ACTIVATE_PROJECT_CONTEXT.md`: checklist operacional para ativacao de contexto.
