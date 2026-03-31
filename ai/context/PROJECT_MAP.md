# Project Map

Owner: Architect
Status: active
Ultima revisao: 2026-03-31
Proxima revisao sugerida: 2026-04-30

## Propósito deste Documento

Este documento descreve a **estrutura do repositório do projeto**.

Seu objetivo é ajudar desenvolvedores e ferramentas de Inteligência
Artificial a entender:

-   onde cada parte do sistema está localizada
-   qual a responsabilidade de cada diretório
-   como o projeto está organizado

Este documento deve ser utilizado em conjunto com:

`/ai/context/AI_CONTEXT.md`  
`/ai/context/ARCHITECTURE.md`  
`/ai/AI_SYSTEM_MAP.md`

---

# Visão Geral do Projeto

O **Sexta Dev Hub** é uma plataforma educacional utilizada para
centralizar conteúdos técnicos semanais em diferentes formatos de mídia.

A aplicação permite disponibilizar materiais como:

- PDF (leituras rápidas)
- Áudio (versões narradas dos conteúdos)
- Vídeo (explicações e aulas)

O sistema é dividido em duas partes principais:

- Frontend: interface do usuário
- Backend: API responsável pela lógica e dados

---

# Arquitetura Simplificada

Fluxo principal da aplicação:

Frontend (Vue.js) -> Backend API (Node.js + Express) -> Banco de Dados (MySQL)

Infraestrutura:

- Docker
- Docker Compose
- Traefik (reverse proxy)
- HTTPS (Let's Encrypt)
- VM cloud

Mais detalhes podem ser encontrados em:

`/ai/context/ARCHITECTURE.md`

---

# Estrutura do Repositório

Estrutura geral do projeto:

    sexta-dev-hub/
    │
    ├ .github/
    ├ ai/
    ├ backend/
    ├ frontend/
    ├ backup/
    ├ docker-compose.yml
    ├ docker-compose.dev.yml
    ├ docker-compose.prod.yml
    ├ DEPLOY_CHECKLIST.md
    └ README.md

Cada diretório possui responsabilidades específicas.

---

# Frontend

Localização:

    frontend/

Tecnologias utilizadas:

- Vue.js
- Vite
- JavaScript

Responsável por:

-   interface do usuário
-   navegação da aplicação
-   renderização de conteúdos
-   comunicação com API backend

Estrutura relevante:

    frontend/
    src/
    public/
    nginx.conf
    vite.config.js

---

# Components

Localização:

    frontend/src/components

Responsáveis por:

-   elementos reutilizáveis da interface
-   cards de conteúdo
-   elementos de layout
-   componentes visuais

Exemplos:

- Header
- Footer
- EpisodeCard
- ContentList
- Badge
- Button

---

# Pages

Localização:

    frontend/src/pages

Cada página corresponde a uma rota da aplicação.

Exemplos:

- Home
- ContentList
- ContentDetail
- Dashboard

---

# Router

Localização:

    frontend/src/router

Responsável por:

-   definição das rotas
-   navegação entre páginas
-   controle de acesso

---

# Services (Frontend)

Localização:

    frontend/src/services

Responsável por:

-   comunicação com API backend
-   chamadas HTTP
-   tratamento de respostas da API

Exemplo:

contentService.js

---

# Backend

Localização:

    backend/

Tecnologias:

- Node.js
- Express

Responsável por:

-   lógica de negócio
-   gerenciamento de conteúdos
-   autenticação (se implementada)
-   integração com banco de dados

Estrutura relevante:

    backend/
    src/controllers/
    src/services/
    src/routes/
    src/middleware/
    src/models/
    src/docs/openapi.js
    docs/API_DOCUMENTATION_GUIDE.md

---

# Controllers

Responsáveis por:

-   receber requisições HTTP
-   validar dados
-   chamar serviços
-   retornar respostas da API

---

# Services

Responsáveis por:

-   regras de negócio
-   manipulação de dados
-   integração com banco

---

# Routes

Responsáveis por:

-   definir endpoints da API
-   mapear requisições para controllers

---

# Banco de Dados

Banco principal utilizado:

MySQL

Responsável por armazenar:

-   conteúdos
-   metadados
-   informações de publicação
-   referências de mídia

---

# Tipos de Conteúdo

O sistema trabalha com três categorias principais de conteúdo:

- PDF
- Áudio
- Vídeo

Cada conteúdo pode possuir:

-   título
-   descrição
-   tipo de mídia
-   data de publicação
-   arquivo ou link associado

---

# Infraestrutura

A aplicação roda em containers Docker.

Componentes principais:

- Docker
- Docker Compose
- Workflows GitHub Actions em `.github/workflows/`

Hospedagem:

Ambiente Linux com containers e reverse proxy conforme checklist de deploy.

---

# Fluxo da Aplicação

Fluxo típico de uso da aplicação:

Usuário acessa frontend -> Frontend chama API -> Backend processa requisição -> Banco retorna dados -> Frontend renderiza conteúdo

---

# Integração com IA

Este projeto utiliza um **AI Engineering Framework** localizado na pasta
`/ai`.

Esse framework fornece:

-   contexto do projeto
-   regras de engenharia
-   workflows de agentes
-   playbooks de desenvolvimento
-   prompts reutilizáveis

Ele permite que ferramentas de IA compreendam melhor o sistema e
auxiliem no desenvolvimento.

---

# Possíveis Atividades no Projeto

Durante o ciclo de desenvolvimento, tarefas comuns incluem:

-   melhorias de interface
-   criação de novos conteúdos
-   manutenção do backend
-   refatoração de componentes
-   melhorias de performance
-   evolução arquitetural
