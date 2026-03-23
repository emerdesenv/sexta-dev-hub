# DELIVERY CHECKLIST

## Objetivo
Estabelecer critérios mínimos e verificáveis para considerar uma tarefa concluída.

## Código
- [ ] segue `ai/governance/CODE_STYLE.md`
- [ ] sem duplicação relevante no escopo alterado
- [ ] sem código morto no escopo alterado

## Funcionalidade
- [ ] comportamento validado contra o requisito da tarefa
- [ ] sem erros novos em runtime no fluxo principal
- [ ] sem regressão evidente nos fluxos impactados

## Arquitetura
- [ ] aderente a `ai/context/ARCHITECTURE.md`
- [ ] estrutura de arquivos coerente com `ai/context/PROJECT_MAP.md`
- [ ] decisões estruturais relevantes registradas em `ai/context/DECISION_LOG.md` (quando aplicável)

## Segurança
- [ ] entradas externas validadas/sanitizadas
- [ ] nenhum segredo embutido em código ou documentação
- [ ] endpoints e ações sensíveis com controles compatíveis com `ai/engineering/SECURITY_BASELINE.md`

## Testes e validação
- [ ] testes automatizados do escopo executados (quando existirem)
- [ ] ao menos um teste de fluxo principal validado manualmente
- [ ] plano de validação documentado na entrega (o que foi testado e como)

## Critério de pronto
Uma entrega só deve ser considerada concluída quando todos os itens aplicáveis estiverem marcados e com evidência de validação no contexto da tarefa.