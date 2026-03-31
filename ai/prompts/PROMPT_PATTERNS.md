# PROMPT PATTERNS

Owner: Architect
Status: active
Ultima revisao: 2026-03-31
Proxima revisao sugerida: 2026-06-30

Padroes de prompt reutilizaveis para tarefas recorrentes.

## Template base recomendado

- Contexto: `<contexto>`
- Tarefa: `<tarefa>`
- Restrições: `<restricoes>`
- Critérios de aceite: `<criterios_aceite>`
- Validação/Testes: `<validacao>`
- Saída esperada: `<saida_esperada>`

## 1) Criar nova feature

Prompt sugerido:

"Use `ai/ACTIVATE_PROJECT_CONTEXT.md` e implemente a feature abaixo.
Restrições: seguir `ai/governance/AI_RULES.md`, `ai/context/ARCHITECTURE.md` e `ai/context/PROJECT_MAP.md`.
Se alterar endpoint, atualizar OpenAPI.
Entregar com evidência de testes."

## 2) Refatorar código

Prompt sugerido:

"Refatore este trecho sem alterar comportamento externo.
Objetivo: legibilidade, redução de duplicação e manutenção.
Restrições: não alterar API pública e respeitar `ai/governance/CONSTRAINTS.md`.
Ao final, listar riscos e testes recomendados."

## 3) Gerar componente UI

Prompt sugerido:

"Crie componente Vue reutilizável baseado no contexto abaixo.
Obrigatório: estados `loading/empty/error/success`, responsividade e acessibilidade mínima.
Seguir `ai/design/DESIGN_SYSTEM.md` e `ai/design/UI_IMPLEMENTATION_GUIDE.md`.
Explicar props, eventos e estratégia de teste."

## 4) Revisar código

Prompt sugerido:

"Faça code review com foco em riscos e regressões.
Classifique achados por severidade (alta/média/baixa), cite impacto e recomendação.
Validar aderência a `ai/governance/AI_RULES.md`, `ai/engineering/SECURITY_BASELINE.md` e `ai/engineering/TEST_STRATEGY.md`."