# AI Refactor Guide

Este playbook define como realizar refatorações seguras no sistema.

Refatoração significa melhorar o código sem alterar comportamento funcional.

---

# 1. Identificar problema estrutural

Possíveis problemas:

- duplicação de código
- funções muito longas
- responsabilidades misturadas
- nomes confusos
- acoplamento excessivo

---

# 2. Definir objetivo da refatoração

Exemplos:

- melhorar legibilidade
- reduzir complexidade
- separar responsabilidades
- facilitar manutenção

---

# 3. Avaliar impacto

Consultar:

`/ai/context/ARCHITECTURE.md`  

Verificar se a refatoração afeta:

- arquitetura
- integrações
- fluxos críticos

Se houver impacto estrutural relevante, consultar o agente `architect` antes da implementação.

---

# 4. Planejar refatoração incremental

Evitar mudanças grandes de uma vez.

Preferir pequenas melhorias progressivas.

---

# 5. Garantir preservação de comportamento

Consultar:

`/ai/engineering/TESTING_GUIDELINES.md`  

Garantir que testes validem o comportamento original.

---

# 6. Executar refatoração

Aplicar melhorias estruturais sem alterar lógica funcional.

---

# 7. Revisão final

Após refatoração:

- revisar código
- validar testes
- confirmar que comportamento foi preservado
- executar ao menos um teste de regressão no fluxo principal impactado