# CONSTRAINTS

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

1 verificar se já existe solução interna
2 avaliar impacto na manutenção

---

# Performance

Evitar:

- queries N+1
- loops desnecessários
- operações bloqueantes

---

# Código

Sempre priorizar:

- simplicidade
- legibilidade
- modularidade