# CONSTRAINTS

Owner: Tech Lead + Architect
Status: active
Ultima revisao: 2026-03-31
Proxima revisao sugerida: 2026-04-30

Este documento define restrições técnicas do projeto.

A IA não deve violar estas regras sem justificativa explícita.

---

# Stack Obrigatória

Frontend
Vue.js + Vite

Backend
Node.js + Express

Banco
MySQL

Infraestrutura
Docker
Docker Compose
Traefik

---

# Regras Arquiteturais

- manter separação frontend/backend
- não misturar lógica de negócio na camada de apresentação
- rotas devem ser organizadas por domínio
- serviços devem conter lógica de negócio

---

# Dependências

Evitar adicionar novas dependências.

Antes de adicionar qualquer pacote:

1. verificar se já existe solução interna
2. avaliar impacto na manutenção
3. registrar justificativa técnica na entrega

---

# Performance

Evitar:

- queries N+1
- loops desnecessários
- operações bloqueantes

Evidência mínima de validação:

- identificar o endpoint/fluxo impactado
- comparar comportamento antes/depois da mudança
- registrar risco residual quando não houver medição automatizada

---

# Código

Sempre priorizar:

- simplicidade
- legibilidade
- modularidade