# AGENTS README

Owner: Architect
Status: active
Ultima revisao: 2026-03-31
Proxima revisao sugerida: 2026-05-30

## Objetivo
Esta pasta contém agentes especializados para uso com IA no projeto.

Cada agente possui:
- missão
- escopo
- arquivos de referência
- responsabilidades
- limites
- formato esperado de resposta

## Agentes disponíveis
- architect
- frontend-engineer
- backend-engineer
- code-reviewer
- debugger
- security-auditor
- refactor-specialist
- test-engineer
- product-designer

## Seleção rápida por tipo de tarefa

- Arquitetura/decisão estrutural -> `architect`
- API/regra de negócio -> `backend-engineer`
- UI/componente/layout -> `frontend-engineer` (+ `product-designer` quando necessário)
- Bug/falha sem causa clara -> `debugger`
- Segurança/permissão/upload/auth -> `security-auditor`
- Testes/cobertura/regressão -> `test-engineer`
- Refatoração sem mudança funcional -> `refactor-specialist`
- Revisão final -> `code-reviewer`

## Regras de negócio
Papéis que envolvem fluxo do produto devem considerar `/ai/product/BUSINESS_RULES.md` (além dos arquivos listados no próprio agente).

## Regra geral
Antes de responder, o agente deve consultar os arquivos listados em sua seção "Deve consultar primeiro".

Em conflito de instruções, seguir `ai/governance/DOCUMENT_PRECEDENCE.md`.

## Quando usar
Usar quando a tarefa exigir especialização por papel técnico (arquitetura, backend, frontend, segurança, testes, revisão, debug, refatoração ou design).

## Referências
- `/ai/workflows/AI_TASK_ROUTER.md`
- `/ai/workflows/AI_AGENT_ORCHESTRATOR.md`
- `/ai/docs/DOCUMENT_TEMPLATES.md`