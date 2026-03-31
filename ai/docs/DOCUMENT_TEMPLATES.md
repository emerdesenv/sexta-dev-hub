# Document Templates

## Objetivo
Definir um padrão único de estrutura para os documentos do AI Engineering Framework.

## Metadados obrigatórios (topo do arquivo)

Todo documento novo deve começar com:

- `Owner: <papel/time>`
- `Status: active|draft|deprecated`
- `Ultima revisao: YYYY-MM-DD`
- `Proxima revisao sugerida: YYYY-MM-DD`

Referência de governança: `ai/governance/DOCUMENT_OWNERSHIP.md`.

## Como usar
- ao criar novo arquivo, usar o template da categoria correspondente
- ao revisar arquivo existente, ajustar seções para este padrão
- manter conteúdo curto, objetivo e verificável

## Template: Contexto (`ai/context/*`)
- `# Título`
- `## Objetivo`
- `## Quando usar`
- `## Conteúdo principal`
- `## Referências`

## Template: Governança (`ai/governance/*`)
- `# Título`
- `## Objetivo`
- `## Regras obrigatórias`
- `## Regras recomendadas`
- `## Critérios verificáveis`
- `## Referências`

## Template: Engenharia (`ai/engineering/*`)
- `# Título`
- `## Objetivo`
- `## Quando usar`
- `## Procedimento ou diretrizes`
- `## Evidências de validação`
- `## Referências`

## Template: Workflow (`ai/workflows/*`)
- `# Título`
- `## Objetivo`
- `## Quando usar`
- `## Entradas`
- `## Passos`
- `## Saída esperada`
- `## Critérios de conclusão`
- `## Referências`

## Template: Playbook (`ai/playbooks/*`)
- `# Título`
- `## Objetivo`
- `## Quando usar`
- `## Pré-condições`
- `## Passo a passo`
- `## Critérios de conclusão`
- `## Referências`

## Template: Agent (`ai/agents/*`)
- `# AGENT: <ROLE>`
- `## Missão`
- `## Objetivo`
- `## Quando usar`
- `## Deve consultar primeiro`
- `## Responsabilidades`
- `## Não deve`
- `## Formato esperado de resposta`
- `## Critérios de qualidade`

## Template: Prompt (`ai/prompts/*`)
- `# Título`
- `## Objetivo`
- `## Quando usar`
- `## Template base`
- `## Variáveis obrigatórias`
- `## Critérios de saída`
- `## Exemplos`
- `## Referências`
