# AI Bug Investigation

Este playbook define o processo padrão para investigar e corrigir bugs.

O foco é encontrar a causa raiz antes de implementar qualquer correção.

---

# 1. Identificar o sintoma

Descrever claramente o problema.

Exemplos:

- erro 500
- erro 404
- comportamento inesperado
- tela não carrega
- integração falhando

---

# 2. Reproduzir o erro

Confirmar que o problema pode ser reproduzido.

Registrar:

- passos para reproduzir
- ambiente
- condições específicas

---

# 3. Consultar o Debug Playbook

Consultar:

/ai/ENGINEERING/DEBUG_PLAYBOOK.md  

Esse documento contém estratégias para investigação técnica.

---

# 4. Levantar hipóteses

Possíveis causas:

- erro de lógica
- problema de integração
- erro de configuração
- falha de rede
- erro no banco de dados

---

# 5. Identificar causa raiz

Evitar correções superficiais.

Buscar a origem real do problema.

---

# 6. Implementar correção mínima

A correção deve:

- resolver a causa raiz
- alterar o mínimo possível do sistema
- evitar introduzir novos riscos

---

# 7. Validar correção

Consultar:

/ai/ENGINEERING/TESTING_GUIDELINES.md  

Verificar:

- fluxo original
- cenários relacionados
- possíveis regressões

---

# 8. Revisão final

Após a correção:

- realizar code review
- validar impacto arquitetural