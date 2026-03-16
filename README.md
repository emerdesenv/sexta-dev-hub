# Sexta Dev Hub

Projeto full stack desenvolvido para centralizar aplicações e experimentos do **Sexta Dev**, utilizando uma arquitetura moderna baseada em **Docker, Traefik, Vue.js, Node.js e MySQL**.

A aplicação é composta por:

- **Frontend:** Vue.js + Vite
- **Backend:** Node.js + Express
- **Banco de Dados:** MySQL
- **Proxy reverso:** Traefik
- **Infraestrutura:** Docker + Docker Compose
- **HTTPS automático:** Let's Encrypt

---

# Arquitetura da Aplicação

A aplicação segue uma arquitetura baseada em containers:

Internet
↓
Traefik (Reverse Proxy + SSL)
↓
├── Frontend (Vue + Nginx)
└── Backend (Node.js + Express)
↓
MySQL


O **Traefik** é responsável por:

- gerenciamento automático de certificados SSL
- redirecionamento HTTP → HTTPS
- roteamento das requisições entre frontend e backend

---

# Requisitos

Antes de iniciar o projeto é necessário ter instalado:

- Docker
- Docker Compose
- Git

Verifique se o Docker está funcionando:

```bash
docker -v
docker compose version
---

# Para iniciar toda a infraestrutura:

```bash
docker compose up -d --build

# Acesso à Aplicação

Frontend:

```bash
https://momentodev.com

API:

```bash
https://momentodev.com/api

Healthcheck da API:

```bash
https://momentodev.com/health