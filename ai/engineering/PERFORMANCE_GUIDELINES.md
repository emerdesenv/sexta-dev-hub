# PERFORMANCE GUIDELINES

Owner: Architect + Backend Engineer
Status: active
Ultima revisao: 2026-03-31
Proxima revisao sugerida: 2026-05-30

Este documento define boas práticas para manter o sistema performático.

---

# Princípios

Priorizar:

- simplicidade
- eficiência
- escalabilidade

Evitar otimização prematura.

---

# Backend

Boas práticas:

- evitar queries desnecessárias
- utilizar índices no banco
- limitar dados retornados
- utilizar paginação

---

# Banco de Dados

Regras:

- utilizar índices para colunas de busca
- evitar SELECT *
- evitar queries dentro de loops

---

# Frontend

Boas práticas:

- lazy loading de rotas
- componentes leves
- evitar re-renderizações desnecessárias

---

# APIs

Recomendações:

- compressão de respostas
- cache quando possível
- limitar tamanho de payload

---

# Upload de Arquivos

Arquivos grandes devem ser:

- armazenados em object storage
- não no banco de dados

---

# Escalabilidade

Arquitetura deve permitir:

- múltiplas instâncias
- balanceamento de carga
- separação de serviços

---

# Monitoramento

Monitorar:

- uso de CPU
- uso de memória
- tempo de resposta
- taxa de erro

Critérios mínimos recomendados:

- registrar p95 de resposta nos endpoints críticos
- evitar aumento de payload sem justificativa
- validar impacto de performance em mudanças que afetam queries ou renderização