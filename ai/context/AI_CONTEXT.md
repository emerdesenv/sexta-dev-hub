# AI_CONTEXT.md

## Propósito deste Documento

Este documento fornece o **contexto geral do projeto** para desenvolvedores e ferramentas de Inteligência Artificial.

Ele descreve:

- objetivo do sistema
- stack tecnológica
- estrutura geral da aplicação
- tipos de conteúdo gerenciados pela plataforma

Este documento deve ser utilizado como **referência inicial de entendimento do projeto**.

Outros documentos complementares incluem:

/ai/CONTEXT/ARCHITECTURE.md  
/ai/CONTEXT/PROJECT_MAP.md  
/ai/CONTEXT/DECISION_LOG.md  

---

# Informações Gerais do Projeto

**Nome do Projeto:** Sexta Dev Hub

**Tipo de Aplicação:**

Plataforma educacional web para distribuição de conteúdo técnico.

A aplicação funciona como um hub de conhecimento onde usuários podem acessar materiais técnicos em diferentes formatos.

---

# Objetivo da Plataforma

O Sexta Dev Hub tem como objetivo centralizar e distribuir conteúdos educacionais voltados à área de tecnologia.

A plataforma permite publicar e organizar conteúdos técnicos em diferentes formatos, facilitando o acesso para estudantes e profissionais.

Os conteúdos são disponibilizados de forma estruturada para leitura, audição ou visualização.

---

# Público-Alvo

A plataforma é voltada para:

- estudantes de tecnologia
- desenvolvedores iniciantes
- profissionais em atualização
- participantes de cursos e comunidades técnicas

---

# Contexto Atual de Desenvolvimento

O projeto pode passar por diferentes ciclos de evolução, incluindo:

- melhorias de interface
- novas funcionalidades
- manutenção do sistema
- otimizações de performance
- ajustes de experiência do usuário

Mudanças na interface devem priorizar:

- melhor organização visual
- navegação intuitiva
- responsividade
- experiência consistente entre dispositivos

---

# Stack Tecnológica

## Frontend

Tecnologias utilizadas na interface da aplicação.

- Vue.js
- Vite
- JavaScript
- CSS
- Componentização de UI

O frontend é responsável por:

- renderização das páginas
- navegação da aplicação
- consumo da API backend

---

## Backend

Responsável pela lógica de negócio da plataforma.

Tecnologias:

- Node.js
- Express

Responsabilidades:

- gestão de conteúdos
- controle de rotas
- integração com banco de dados
- regras de negócio

---

## Banco de Dados

Tecnologia utilizada:

- MySQL

Responsabilidades:

- armazenamento de conteúdos
- metadados dos materiais
- controle de registros da plataforma

---

## Infraestrutura

A aplicação é executada em ambiente containerizado.

Ferramentas utilizadas:

- Docker
- Docker Compose
- Traefik (reverse proxy)
- HTTPS com Let's Encrypt

Responsabilidades:

- gerenciamento de containers
- roteamento de requisições
- configuração de HTTPS

---

## Hospedagem

A aplicação pode ser hospedada em máquinas virtuais de provedores cloud.

Exemplo de ambiente utilizado:

- VM em provedor cloud (ex: Hetzner)

---

# Estrutura Geral do Projeto

## Frontend

Responsável pela interface do usuário.

Estrutura típica:

src/
components/
pages/
router/
services/
assets/

Principais responsabilidades:

- renderizar conteúdo
- exibir materiais
- gerenciar navegação

---

## Backend

Responsável pela API da aplicação.

Estrutura típica:

controllers/
services/
routes/
middlewares/

Principais responsabilidades:

- expor endpoints da API
- aplicar regras de negócio
- acessar banco de dados

---

# Tipos de Conteúdo da Plataforma

A aplicação trabalha com três tipos principais de conteúdo educacional.

## PDF

Material de leitura técnica.

Exemplos:

- artigos
- guias
- materiais didáticos

---

## Áudio

Versão narrada dos conteúdos.

Exemplos:

- podcast
- leitura de artigos
- explicações técnicas

---

## Vídeo

Conteúdos audiovisuais.

Exemplos:

- aulas
- explicações
- demonstrações técnicas

---

# Estrutura de um Conteúdo

Cada conteúdo pode possuir:

- título
- descrição
- categoria
- arquivo principal (PDF, áudio ou vídeo)
- data de publicação
- metadados adicionais

---

# Princípios do Projeto

O desenvolvimento da plataforma segue alguns princípios:

Simplicidade  
Priorizar soluções claras e fáceis de manter.

Separação de responsabilidades  
Frontend e backend devem possuir responsabilidades bem definidas.

Escalabilidade  
A arquitetura deve permitir evolução do sistema.

Clareza de código  
O código deve ser legível e organizado.

Experiência do usuário  
A interface deve ser intuitiva e acessível.

---

# Papel da Inteligência Artificial

Dentro deste projeto, ferramentas de IA podem auxiliar em:

- melhorias de interface
- geração de código
- revisão técnica
- identificação de bugs
- sugestões de arquitetura

As respostas devem respeitar os documentos definidos na pasta `/ai`.