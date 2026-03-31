# DOCUMENT OWNERSHIP

Define responsabilidade, cadencia de revisao e status dos documentos da pasta `ai/`.

## Status permitidos

- `active`: valido e recomendado
- `draft`: em construcao, ainda instavel
- `deprecated`: manter apenas para historico, nao usar como referencia principal

## Cadencia de revisao

- Criticos (governanca, seguranca, testes, arquitetura): a cada 30 dias
- Operacionais (workflows, playbooks, agents): a cada 60 dias
- Referenciais (prompts, exemplos): a cada 90 dias

## Owners por area

- `ai/context/*`: Architect + Tech Lead Backend
- `ai/governance/*`: Tech Lead + Code Reviewer
- `ai/engineering/*`: Security Auditor + Test Engineer
- `ai/testing/*`: Test Engineer
- `ai/design/*`: Product Designer + Frontend Engineer
- `ai/workflows/*`: Architect + Code Reviewer
- `ai/playbooks/*`: Architect + respectivos especialistas
- `ai/agents/*`: Architect
- `ai/prompts/*`: Architect + Product Designer (Figma)
- `ai/docs/*`: Architect

## Regra obrigatoria

Sempre que um documento critico mudar de forma relevante:

1. atualizar "ultima revisao" no topo do arquivo
2. revisar links quebrados/referencias
3. validar consistencia com `DOCUMENT_PRECEDENCE.md`
