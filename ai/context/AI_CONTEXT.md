# AI Context

Owner: Architect
Status: active
Ultima revisao: 2026-03-31
Proxima revisao sugerida: 2026-04-30

## Propósito deste Documento

Este documento fornece o **contexto geral do projeto** para desenvolvedores e ferramentas de Inteligência Artificial.

Ele descreve:

- objetivo do sistema
- stack tecnológica
- estrutura geral da aplicação
- tipos de conteúdo gerenciados pela plataforma

Este documento deve ser utilizado como **referência inicial de entendimento do projeto**.

Outros documentos complementares incluem:

`/ai/context/ARCHITECTURE.md`  
`/ai/context/PROJECT_MAP.md`  
`/ai/context/DECISION_LOG.md`  

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

A aplicação é executada em ambiente containerizado com compose dev/prod.

Ferramentas utilizadas:

- Docker
- Docker Compose
- Reverse proxy e SSL configurados via Compose/infra do projeto

Responsabilidades:

- gerenciamento de containers
- roteamento de requisições
- configuração de HTTPS

---

## Hospedagem

Deploy em ambiente Linux com containers (cloud VM ou equivalente), conforme checklist em `README.md` e `DEPLOY_CHECKLIST.md`.

---

# Estrutura Geral do Projeto

Para estrutura real e atualizada do repositório, usar `ai/context/PROJECT_MAP.md`.

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

- **Simplicidade:** priorizar soluções claras e fáceis de manter.
- **Separação de responsabilidades:** frontend e backend devem possuir responsabilidades bem definidas.
- **Escalabilidade:** a arquitetura deve permitir evolução do sistema.
- **Clareza de código:** o código deve ser legível e organizado.
- **Experiência do usuário:** a interface deve ser intuitiva e acessível.

---

# Papel da Inteligência Artificial

Dentro deste projeto, ferramentas de IA podem auxiliar em:

- melhorias de interface
- geração de código
- revisão técnica
- identificação de bugs
- sugestões de arquitetura

As respostas devem respeitar os documentos definidos na pasta `/ai`.

## Referências obrigatórias

- `ai/governance/DOCUMENT_PRECEDENCE.md`
- `ai/governance/AI_RULES.md`
- `ai/context/ARCHITECTURE.md`
- `ai/context/PROJECT_MAP.md`
- `ai/context/DOMAIN_GLOSSARY.md`