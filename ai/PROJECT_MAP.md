# PROJECT_MAP.md

## Visão Geral do Projeto

O **Sexta Dev Hub** é uma plataforma educacional utilizada para centralizar conteúdos técnicos semanais em diferentes formatos de mídia.

A aplicação permite disponibilizar materiais como:

* PDF (leituras rápidas)
* Áudio (versões narradas dos conteúdos)
* Vídeo (explicações e aulas)

O sistema é dividido em duas partes principais:

* **Frontend** → interface do usuário
* **Backend** → API responsável pela lógica e dados

---

# Arquitetura Geral

```text
Frontend (Vue.js)
      ↓
Backend API (Node.js + Express)
      ↓
Banco de Dados (MySQL)
```

Infraestrutura:

```
Docker
Docker Compose
Traefik (reverse proxy)
HTTPS (Let's Encrypt)
VM cloud
```

---

# Estrutura do Repositório

Estrutura geral do projeto:

```
sexta-dev-hub/
├ frontend/
├ backend/
├ docker/
├ AI_CONTEXT.md
├ AI_RULES.md
├ AI_REFACTOR_PLAN.md
├ PROJECT_MAP.md
└ README.md
```

---

# Frontend

Tecnologias:

* Vue.js
* Vite
* JavaScript

Responsável por:

* interface do usuário
* navegação
* renderização de conteúdos
* comunicação com API backend

Estrutura típica:

```
frontend/
src/
components/
pages/
router/
services/
assets/
```

---

# Componentes

Localização:

```
src/components
```

Responsáveis por:

* elementos reutilizáveis da interface
* cards de conteúdo
* elementos de layout
* componentes visuais

Exemplos de componentes:

```
Header
Footer
EpisodeCard
ContentList
Badge
Button
```

---

# Páginas

Localização:

```
src/pages
```

Cada página corresponde a uma rota da aplicação.

Exemplos de páginas:

```
Home
ContentList
ContentDetail
Dashboard
```

---

# Router

Localização:

```
src/router
```

Responsável por:

* definição das rotas
* navegação entre páginas
* controle de acesso

---

# Services (Frontend)

Localização:

```
src/services
```

Responsável por:

* comunicação com API backend
* chamadas HTTP
* tratamento de dados retornados

Exemplo:

```
contentService.js
```

---

# Backend

Tecnologias:

* Node.js
* Express

Responsável por:

* lógica de negócio
* gerenciamento de conteúdos
* autenticação (se existir)
* integração com banco de dados

Estrutura típica:

```
backend/
controllers/
services/
routes/
middlewares/
```

---

# Controllers

Responsáveis por:

* receber requisições HTTP
* validar dados
* chamar serviços
* retornar respostas da API

---

# Services

Responsáveis por:

* regras de negócio
* manipulação de dados
* integração com banco

---

# Routes

Responsáveis por:

* definir endpoints da API
* mapear requisições para controllers

---

# Banco de Dados

Banco principal:

```
MySQL
```

Armazena:

* conteúdos
* metadados
* informações de publicação
* links ou arquivos de mídia

---

# Tipos de Conteúdo

O sistema trabalha com três categorias principais:

```
PDF
Áudio
Vídeo
```

Cada conteúdo pode possuir:

* título
* descrição
* tipo de mídia
* data de publicação
* arquivo ou link

---

# Infraestrutura

A aplicação roda em containers Docker.

Componentes principais da infraestrutura:

```
Docker
Docker Compose
Traefik (reverse proxy)
HTTPS via Let's Encrypt
```

Hospedagem:

```
VM cloud (ex: Hetzner)
```

---

# Fluxo da Aplicação

Fluxo típico de uso da aplicação:

```
Usuário acessa frontend
        ↓
Frontend chama API
        ↓
Backend processa requisição
        ↓
Banco retorna dados
        ↓
Frontend renderiza conteúdo
```

---

# Integração com IA

Este projeto utiliza arquivos de contexto para orientar agentes de IA.

Arquivos utilizados:

```
AI_CONTEXT.md
AI_RULES.md
AI_REFACTOR_PLAN.md
PROJECT_MAP.md
```

Esses arquivos ajudam ferramentas como Cursor e agentes MCP a compreender melhor o projeto.

---

# Objetivo Atual do Projeto

O objetivo atual é realizar uma **refatoração visual do frontend**, melhorando:

* layout
* experiência do usuário
* organização de componentes
* responsividade

Sem alterar:

* lógica de negócio
* contratos de API
* estrutura principal do backend.