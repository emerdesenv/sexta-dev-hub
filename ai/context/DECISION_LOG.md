# DECISION LOG

Registro de decisões arquiteturais (ADR) do projeto.

## Template padrão de ADR
- **ID**:
- **Status**: proposta | aceita | substituída
- **Data**: YYYY-MM-DD
- **Contexto**:
- **Decisão**:
- **Alternativas consideradas**:
- **Consequências**:
- **Referências**:

---

## ADR 001 - Separação frontend e backend
- **Status**: aceita
- **Data**: 2026-03-23
- **Contexto**: necessidade de evolução independente de interface e API.
- **Decisão**: separar frontend e backend em serviços distintos.
- **Alternativas consideradas**: aplicação monolítica única.
- **Consequências**: comunicação obrigatória por API e gestão de contratos.
- **Referências**: `ai/context/ARCHITECTURE.md`

---

## ADR 002 - Padronização de ambiente com Docker
- **Status**: aceita
- **Data**: 2026-03-23
- **Contexto**: inconsistências entre ambientes locais e produção.
- **Decisão**: utilizar Docker e Docker Compose para padronizar execução.
- **Alternativas consideradas**: setup manual por sistema operacional.
- **Consequências**: dependência de containers e necessidade de manutenção dos compose files.
- **Referências**: `README.md`, `ai/context/PROJECT_MAP.md`