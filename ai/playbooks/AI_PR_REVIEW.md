# AI PR Review

Owner: Code Reviewer
Status: active
Ultima revisao: 2026-03-31
Proxima revisao sugerida: 2026-05-30

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

`/ai/context/ARCHITECTURE.md`  
`/ai/context/PROJECT_MAP.md`  

Verificar:

- se responsabilidades estão corretas
- se a estrutura do projeto foi respeitada

---

# 3. Avaliar qualidade do código

Consultar:

`/ai/governance/CODE_STYLE.md`  

Verificar:

- nomes claros
- funções pequenas
- legibilidade
- ausência de duplicação

---

# 4. Avaliar segurança

Consultar:

`/ai/engineering/SECURITY_BASELINE.md`  

Verificar:

- validação de inputs
- exposição de dados
- autenticação e autorização

---

# 5. Avaliar testes

Consultar:

`/ai/engineering/TESTING_GUIDELINES.md`  

Verificar:

- cobertura adequada
- cenários principais
- testes de erro

---

# 6. Avaliar performance

Consultar:

`/ai/engineering/PERFORMANCE_GUIDELINES.md`  

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

Formato mínimo do resultado:

- severidade por item: Alta, Média ou Baixa
- evidência: arquivo/trecho afetado e motivo técnico
- decisão final: Aprovar, Aprovar com ressalvas ou Bloquear
- plano de ação para itens de severidade Alta