# API Documentation Guide

Este projeto usa OpenAPI como fonte oficial da documentacao tecnica da API.

## Onde editar

- Especificacao: `backend/src/docs/openapi.js`
- UI interativa: `GET /api/docs`
- JSON bruto da spec: `GET /api/openapi.json`

## Padrao para novos endpoints

- Sempre documentar no mesmo PR em que a rota/controlador for criado.
- Manter `summary` curto, objetivo e orientado ao comportamento.
- Declarar:
  - seguranca (`bearerAuth` e/ou cookies),
  - parametros de path/query,
  - `requestBody` com campos obrigatorios,
  - respostas principais (`2xx`, `4xx`, `5xx`).
- Reaproveitar schemas existentes em `components.schemas` antes de criar novos.
- Quando payload for dinamico, usar `type: object` com `additionalProperties: true`.

## Convenções

- Paths sem prefixo `/api` (o `server.url` ja esta como `/api`).
- Nomes de schema em PascalCase.
- Evitar duplicacao de payloads iguais.
- Para upload de arquivos, usar `multipart/form-data` com `format: binary`.

## Checklist antes de subir

- `npm test` no backend
- abrir `/api/docs` e validar se as novas rotas aparecem
- testar pelo menos 1 request de sucesso e 1 de erro no Swagger UI
