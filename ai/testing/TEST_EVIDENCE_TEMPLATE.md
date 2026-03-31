# TEST EVIDENCE TEMPLATE

Template padrao para registrar evidencia de testes em entregas e revisoes.

## Bloco minimo obrigatorio

### Escopo validado
- Fluxos/rotas/telas testados:

### Comandos executados
- Ex.: `npm test`
- Ex.: `npm run test:integration`

### Resultado
- Status: (passou/falhou/parcial)
- Observacoes relevantes:

### Risco residual
- O que nao foi coberto:
- Motivo:
- Mitigacao proposta:

## Exemplo rapido

### Escopo validado
- `POST /api/auth/login` (sucesso + credencial invalida)
- `POST /api/auth/refresh` (token valido/invalido)

### Comandos executados
- `npm test`

### Resultado
- Status: passou
- Observacoes: 31/31 testes backend aprovados

### Risco residual
- Nao coberto: teste E2E cross-browser
- Motivo: fora do escopo do PR
- Mitigacao proposta: validar no ciclo de release UI
