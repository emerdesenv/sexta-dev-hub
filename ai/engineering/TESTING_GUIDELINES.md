# TESTING GUIDELINES

Este documento define como testes devem ser pensados no projeto.

---

# Tipos de Teste

Unit Test

testa função isolada

Integration Test

testa interação entre módulos

E2E Test

testa fluxo completo

---

# Prioridade

1. lógica de negócio
2. endpoints críticos
3. fluxos principais

---

# Critérios de Teste

Testes devem validar:

- comportamento esperado
- erros
- casos extremos

---

# Testes Manuais

Fluxos mínimos:

- login
- cadastro
- upload de arquivos
- APIs principais

Política mínima:

- toda alteração deve incluir validação do fluxo principal impactado
- mudanças com risco de regressão devem incluir teste automatizado quando possível
- registrar evidências de teste na entrega (automatizado e/ou manual)