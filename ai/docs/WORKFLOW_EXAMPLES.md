# Workflow Examples

Exemplos curtos e objetivos de uso do framework com evidência mínima.

## Exemplo 1 - Feature completa (backend + frontend)

### Entrada
"Criar upload de PDF com tela de envio e validação de segurança."

### Fluxo
1. Router: `ai/workflows/AI_TASK_ROUTER.md`
2. Orquestrador: `ai/workflows/AI_AGENT_ORCHESTRATOR.md`
3. Execução: `architect -> backend-engineer -> security-auditor -> frontend-engineer -> test-engineer -> code-reviewer`

### Evidência esperada
- OpenAPI atualizado
- testes executados + resultado
- risco residual registrado

## Exemplo 2 - Bug em produção

### Entrada
"Após login, tela inicial fica em branco."

### Fluxo
1. `debugger` identifica causa raiz
2. especialista de camada corrige (`frontend-engineer` ou `backend-engineer`)
3. `test-engineer` valida regressão
4. `code-reviewer` fecha revisão

### Evidência esperada
- causa raiz explícita
- correção com teste de regressão
- impacto/riscos documentados

## Exemplo 3 - Refatoração sem mudar comportamento

### Entrada
"Reduzir duplicação no service de autenticação."

### Fluxo
1. `refactor-specialist`
2. `test-engineer`
3. `code-reviewer`

### Evidência esperada
- comportamento preservado
- testes de regressão executados
- sem mudança funcional não planejada