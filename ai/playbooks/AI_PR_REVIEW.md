# AI PR Review

Este playbook define como realizar revisão técnica de código.

O objetivo é garantir qualidade, segurança e consistência.

---

# 1. Entender o objetivo do PR

Antes de revisar o código, identificar:

- qual problema está sendo resolvido
- qual funcionalidade foi adicionada
- quais arquivos foram modificados

---

# 2. Avaliar arquitetura

Consultar:

/ai/CONTEXT/ARCHITECTURE.md  
/ai/CONTEXT/PROJECT_MAP.md  

Verificar:

- se responsabilidades estão corretas
- se a estrutura do projeto foi respeitada

---

# 3. Avaliar qualidade do código

Consultar:

/ai/GOVERNANCE/CODE_STYLE.md  

Verificar:

- nomes claros
- funções pequenas
- legibilidade
- ausência de duplicação

---

# 4. Avaliar segurança

Consultar:

/ai/ENGINEERING/SECURITY_BASELINE.md  

Verificar:

- validação de inputs
- exposição de dados
- autenticação e autorização

---

# 5. Avaliar testes

Consultar:

/ai/ENGINEERING/TESTING_GUIDELINES.md  

Verificar:

- cobertura adequada
- cenários principais
- testes de erro

---

# 6. Avaliar performance

Consultar:

/ai/ENGINEERING/PERFORMANCE_GUIDELINES.md  

Verificar:

- queries eficientes
- evitar loops desnecessários
- evitar operações pesadas

---

# 7. Resultado da revisão

A revisão deve produzir:

- problemas encontrados
- riscos identificados
- sugestões de melhoria
- veredito final