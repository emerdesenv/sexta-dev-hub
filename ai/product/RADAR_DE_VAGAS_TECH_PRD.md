# Radar de Vagas Tech (PRD enxuto + contrato API)

Owner: Product + Architect
Status: draft
Ultima revisao: 2026-04-01
Proxima revisao sugerida: 2026-05-01

## Objetivo

Definir a feature "Radar de Vagas Tech" para conectar estudantes ao mercado com vagas atualizadas automaticamente a partir de fontes externas, sem operação manual de cadastro por professor.

## Quando usar

- Planejar e implementar backlog de vagas no backend/frontend.
- Alinhar decisões entre agentes (`architect`, `backend-engineer`, `frontend-engineer`, `security-auditor`, `test-engineer`, `code-reviewer`).
- Definir contrato API e critérios de aceite para entregas incrementais.

## Problema e oportunidade

- Estudantes precisam de uma ponte objetiva entre conteúdo estudado e oportunidades reais.
- Cadastro manual de vagas não escala e aumenta custo operacional.
- Agregação externa com cache interno reduz fricção e melhora disponibilidade.

## Transparência e expectativa do usuário

- As listagens são um **índice agregado** de anúncios públicos (uma ou mais APIs/parceiros), não um cadastro curado pela instituição nem uma oferta de emprego da plataforma.
- **Metadados** (título, local, stack, salário) podem estar **incompletos, genéricos ou defasados** em relação ao anúncio oficial.
- O aluno deve **sempre confirmar** requisitos, benefícios e prazos no **site da empresa** ou no destino do link de candidatura.
- Filtros e deduplicação **reduzem ruído** (especialmente em agregadores amplos), mas **não garantem** 100% de aderência a TI nem que a vaga siga aberta.
- A UI deve deixar explícita a **fonte** (`source`) e um **aviso curto** de que os dados são de terceiros.

## Escopo funcional (MVP)

- Exibir vagas no site em uma área dedicada "Radar de Vagas Tech".
- Consumir dados de 1 ou mais APIs externas no backend.
- Normalizar e salvar em cache interno (persistente) para leitura rápida.
- Atualizar vagas automaticamente a cada 1 hora.
- Expor apenas anúncios cuja data de publicação está na **última semana** (janela configurável no backend).
- Aplicar **filtro de foco em TI** na ingestão (reduz vagas fora do radar; configurável via env).
- Permitir filtros por:
  - vagas júnior
  - vagas remotas
  - vagas para alunos ADS
  - vagas por stack (Node, Vue, Java, etc.)

## Fora de escopo (MVP)

- Publicação/edição manual de vagas por professor.
- Fluxo completo de candidatura dentro da plataforma.
- Match com IA baseada em trilha do aluno (fase posterior).

## Arquitetura proposta

### Visão geral

1. `jobs provider client`: consulta API externa.
2. `jobs normalizer`: converte payload externo para formato interno.
3. `jobs classifier`: aplica regras de segmentação (`junior`, `remote`, `ads`, `stack`).
4. `jobs repository`: faz upsert no cache interno.
5. `jobs sync scheduler`: dispara sincronização horária.
6. `jobs public api`: expõe listagem/detalhe para frontend.

### Estratégia de cache

- Cache persistente em banco (Sequelize + MySQL), para suportar restart e auditoria.
- Chave de deduplicação recomendada: `source + external_id`.
- Estado de validade:
  - `is_active = true` quando a vaga aparece na última sincronização e não expirou.
  - `is_active = false` quando não aparece mais na origem ou está fora da validade.

### Modelo de dados sugerido

`external_job_postings`

- `id` (pk)
- `source` (string)
- `external_id` (string)
- `title` (string)
- `company_name` (string, nullable)
- `location` (string, nullable)
- `work_model` (`remote|hybrid|onsite|unknown`)
- `seniority` (`intern|junior|mid|senior|unknown`)
- `contract_type` (`clt|pj|internship|freelance|other|unknown`)
- `stacks` (json array de strings)
- `target_audience` (json array; ex.: `["ads"]`)
- `description` (text, nullable)
- `apply_url` (string)
- `source_url` (string, nullable)
- `published_at` (datetime, nullable)
- `expires_at` (datetime, nullable)
- `last_seen_at` (datetime)
- `is_active` (boolean)
- `raw_payload` (json, nullable)
- `created_at` / `updated_at`

Índices recomendados:

- único: (`source`, `external_id`)
- busca/filtro: (`is_active`, `published_at`), (`seniority`), (`work_model`)

## Contrato API (backend -> frontend)

Base path: `/api/jobs`

### GET `/api/jobs/public`

Lista vagas ativas com filtros.

Query params:

- `q` (string): busca por título/empresa/stack
- `seniority` (string): `intern|junior|mid|senior`
- `workModel` (string): `remote|hybrid|onsite`
- `stack` (string): ex.: `node`, `vue`, `java`
- `target` (string): ex.: `ads`
- `page` (number, default `1`)
- `pageSize` (number, default `5`, max `5`)
- `sort` (string, default `recent`): `recent|relevance`

Resposta 200 (exemplo):

```json
{
  "items": [
    {
      "id": 1021,
      "title": "Desenvolvedor Node.js Júnior",
      "companyName": "Tech Labs",
      "location": "Brasil",
      "workModel": "remote",
      "seniority": "junior",
      "stacks": ["node", "javascript"],
      "targetAudience": ["ads"],
      "applyUrl": "https://fonte.com/vaga/abc",
      "source": "example-source",
      "publishedAt": "2026-04-01T08:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 5,
    "total": 245,
    "hasNext": true
  }
}
```

### GET `/api/jobs/public/:id`

Retorna detalhes da vaga ativa.

Resposta 200 (exemplo):

```json
{
  "id": 1021,
  "title": "Desenvolvedor Node.js Júnior",
  "companyName": "Tech Labs",
  "location": "Brasil",
  "workModel": "remote",
  "seniority": "junior",
  "contractType": "clt",
  "stacks": ["node", "javascript"],
  "targetAudience": ["ads"],
  "description": "Atuar com APIs, testes e observabilidade.",
  "applyUrl": "https://fonte.com/vaga/abc",
  "source": "example-source",
  "sourceUrl": "https://fonte.com",
  "publishedAt": "2026-04-01T08:00:00.000Z"
}
```

### POST `/api/jobs/public/:id/click` (opcional no MVP)

Registra clique de candidatura para métricas.

Resposta 202:

```json
{ "message": "click_registered" }
```

## Contrato interno de sincronização

### Agendamento

- Frequência: `0 * * * *` (1h)
- Execução extra no boot (com lock para evitar concorrência entre instâncias)

### Resultado esperado por execução

- `fetched_count`
- `normalized_count`
- `upserted_count`
- `deactivated_count`
- `error_count`
- `duration_ms`
- `finished_at`

## Regras de classificação (inicial)

### Júnior

- `seniority = junior` quando:
  - origem já informa nível júnior, ou
  - título/descrição contém padrões normalizados de entrada (`junior`, `jr`, `iniciante`) e não contém termos de exclusão (`senior`, `staff`, `lead`).

### Remota

- `work_model = remote` quando:
  - origem informa remoto, ou
  - descrição/título contém `remote`, `remoto`, `home office`, `anywhere`.

### ADS

- incluir `ads` em `target_audience` quando:
  - vaga é de entrada (`intern`/`junior`) e
  - stack associada ao foco do curso/plataforma (ex.: Node, Vue, Java, SQL, QA inicial).

### Stack

- normalizar aliases para taxonomia única:
  - `node.js`, `nodejs` -> `node`
  - `vue.js` -> `vue`
  - `java se` -> `java`

## Segurança e compliance

- Validar URL de candidatura (`apply_url`) e bloquear protocolos inválidos.
- Limitar taxa em endpoints públicos para evitar scraping abusivo.
- Respeitar termos das APIs externas (licença, redistribuição e limites).
- Não expor segredos de integração no frontend.

## Plano de execução com agentes do projeto

1. `architect`
   - validar desenho técnico e limites do MVP.
2. `backend-engineer`
   - implementar model, serviço de sync, scheduler e endpoints públicos.
3. `frontend-engineer`
   - criar páginas `Radar de Vagas` com filtros e navegação.
4. `security-auditor`
   - revisar consumo externo, validação de links e rate limiting.
5. `test-engineer`
   - cobrir normalização, filtros, paginação e regressão dos fluxos públicos.
6. `code-reviewer`
   - revisão final com foco em riscos e consistência de contrato.

## Critérios de aceite (MVP)

- Vagas aparecem em `/vagas` com atualização horária funcional.
- Filtros `junior`, `remote`, `ads`, `stack` retornam resultados consistentes.
- Frontend não depende diretamente da API externa.
- Logs de sincronização disponíveis com contadores por execução.
- OpenAPI atualizado para os endpoints públicos de vagas.

## Evidências de validação esperadas

- Teste de sincronização manual (execução on-demand) com resultado e contadores.
- Teste dos endpoints públicos com filtros (caso feliz + erro).
- Teste de UI para fluxo principal de descoberta e redirecionamento de candidatura.
- Registro de risco residual quando a fonte externa estiver indisponível.

## Referências

- `ai/playbooks/AI_FEATURE_DESIGN.md`
- `ai/agents/README.md`
- `ai/product/BUSINESS_RULES.md`
- `backend/src/docs/openapi.js`
