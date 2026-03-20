# AI_CONTEXT.md

## Informações Gerais do Projeto

**Nome do Projeto:** Sexta Dev Hub

**Descrição:**
O Sexta Dev Hub é uma plataforma educacional voltada à publicação de conteúdos técnicos semanais no formato de PDF, áudio e vídeo. O objetivo é centralizar materiais de aprendizado para estudantes e profissionais da área de tecnologia.

## Objetivo Atual

Realizar melhorias no layout e na experiência do usuário (UI/UX) sem alterar a lógica de negócio ou as integrações existentes do sistema.

O foco principal das mudanças é:

* modernizar a interface
* melhorar a organização visual das páginas
* tornar a navegação mais clara
* aprimorar a responsividade (mobile e desktop)

## Stack Tecnológica

### Frontend

* Vue.js
* Vite
* JavaScript
* CSS / UI Components

### Backend

* Node.js
* Express

### Banco de Dados

* MySQL

### Infraestrutura

* Docker
* Docker Compose
* Traefik (reverse proxy)
* HTTPS via Let's Encrypt

### Hospedagem

* VM em provedor cloud (ex: Hetzner)

## Estrutura Geral do Projeto

### Frontend

Responsável pela interface do usuário e navegação da aplicação.

Estrutura típica:

src/
components/
pages/
router/
services/
assets/

### Backend

API responsável pela gestão de conteúdos e regras de negócio.

Estrutura típica:

controllers/
services/
routes/
middlewares/

## Tipos de Conteúdo da Plataforma

A aplicação trabalha com três tipos principais de conteúdo:

* PDF (material de leitura)
* Áudio (podcast / versão narrada do conteúdo)
* Vídeo (aulas ou explicações)

Cada conteúdo pode possuir: