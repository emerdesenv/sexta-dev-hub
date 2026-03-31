# AGENT EXECUTION FLOW

Owner: Architect
Status: active
Ultima revisao: 2026-03-31
Proxima revisao sugerida: 2026-05-30

Este documento define fluxos recomendados de execução entre agentes.

O objetivo é padronizar a ordem de atuação dos agentes para reduzir retrabalho e melhorar qualidade.

---

# Princípio

A ordem importa.

Nem toda tarefa deve começar implementando código.

Em muitos casos, primeiro é necessário:

- entender estrutura
- validar arquitetura
- diagnosticar problema
- revisar segurança
- definir testes

Precedência: conflitos devem seguir `ai/governance/DOCUMENT_PRECEDENCE.md`.

---

# Fluxos Recomendados

## 1. Fluxo para nova funcionalidade simples

Usar quando:
- a mudança é localizada
- não altera arquitetura
- baixo risco

Ordem:
1. frontend-engineer ou backend-engineer
2. test-engineer
3. code-reviewer

---

## 2. Fluxo para nova funcionalidade completa

Usar quando:
- envolve backend + frontend
- pode impactar arquitetura
- há risco funcional

Ordem:
1. architect
2. backend-engineer
3. security-auditor
4. frontend-engineer
5. test-engineer
6. code-reviewer

---

## 3. Fluxo para correção de bug

Usar quando:
- existe falha já observada
- causa ainda não está clara

Ordem:
1. debugger
2. backend-engineer ou frontend-engineer
3. test-engineer
4. code-reviewer

Se houver risco de segurança:
- inserir security-auditor antes da revisão final

---

## 4. Fluxo para refatoração

Usar quando:
- objetivo é melhoria interna
- sem mudança de comportamento

Ordem:
1. refactor-specialist
2. test-engineer
3. code-reviewer

Se houver impacto estrutural:
- consultar architect antes da refatoração

---

## 5. Fluxo para revisão de segurança

Usar quando:
- o foco é autenticação
- permissões
- upload
- dados sensíveis
- exposição de endpoints

Ordem:
1. security-auditor
2. backend-engineer
3. test-engineer
4. code-reviewer

Se houver impacto arquitetural:
- inserir architect no início

---

## 6. Fluxo para UI/UX a partir de Figma

Usar quando:
- o foco é layout
- tela nova
- componentização visual

Ordem:
1. product-designer
2. frontend-engineer
3. test-engineer
4. code-reviewer

---

## 7. Fluxo para performance

Usar quando:
- o foco é gargalo
- lentidão
- escalabilidade

Ordem:
1. debugger ou architect
2. backend-engineer ou frontend-engineer
3. security-auditor se necessário
4. test-engineer
5. code-reviewer

---

# Critérios para Inserir o Architect

Consultar o architect quando houver:

- alteração de fluxo entre serviços
- nova integração relevante
- mudança de estrutura de módulos
- preocupação com escalabilidade
- decisão técnica de longo prazo

---

# Critérios para Inserir o Security Auditor

Consultar o security-auditor quando houver:

- upload de arquivos
- autenticação
- autorização
- inputs externos relevantes
- dados sensíveis
- endpoints públicos
- integração com terceiros

---

# Critérios para Inserir o Test Engineer

Consultar o test-engineer quando houver:

- feature nova
- correção de bug
- risco de regressão
- regra de negócio relevante
- fluxo crítico de usuário

---

# Critérios para Inserir o Code Reviewer

Consultar o code-reviewer ao final quando houver:

- código novo
- refatoração relevante
- mudança sensível
- necessidade de validação de padrão

---

# Saída Esperada

Ao seguir um fluxo, a IA deve informar:

1. fluxo escolhido
2. motivo
3. agentes envolvidos
4. ordem de execução
5. entrega consolidada

## Critério adicional de conclusão

- evidência de testes registrada conforme `ai/testing/TEST_EVIDENCE_TEMPLATE.md`