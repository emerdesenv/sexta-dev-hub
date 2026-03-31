# ARCHITECTURE.md

Owner: Architect
Status: active
Ultima revisao: 2026-03-31
Proxima revisao sugerida: 2026-04-30

Este documento descreve a arquitetura técnica do sistema.

Seu objetivo é ajudar desenvolvedores e ferramentas de Inteligência Artificial a compreender:

- como os componentes da aplicação estão organizados
- como os serviços se comunicam
- quais são as responsabilidades de cada camada
- como a arquitetura pode evoluir ao longo do tempo

Este documento deve ser utilizado em conjunto com:

`/ai/context/AI_CONTEXT.md`  
`/ai/context/PROJECT_MAP.md`  
`/ai/context/DECISION_LOG.md`  

---

# Visão Geral da Arquitetura

O sistema segue uma arquitetura baseada em **separação de responsabilidades entre camadas**.

A aplicação é composta por:

- Frontend (interface do usuário)
- Backend (API e lógica de negócio)
- Banco de dados
- Infraestrutura de containers
- Proxy reverso

O modelo arquitetural utilizado é:

**SPA + API REST**

Onde:

- o frontend funciona como uma Single Page Application
- o backend expõe APIs REST
- o banco de dados realiza a persistência
- a infraestrutura containerizada gerencia os serviços

---

# Stack Tecnológica

## Frontend

Vue.js  
Vite  

Responsável pela interface da aplicação.

---

## Backend

Node.js  
Express  

Responsável pela lógica de negócio e APIs.

---

## Banco de Dados

MySQL

Responsável pela persistência de dados.

---

## Infraestrutura

Docker  
Docker Compose  

Responsável pela execução dos serviços em containers.

---

## Proxy Reverso

Traefik

Responsável pelo roteamento de requisições e gerenciamento de HTTPS.

---

# Diagrama de Arquitetura

Fluxo principal da aplicação:

Client (Browser)  
        ↓  
Traefik (Reverse Proxy)  
        ↓  
Frontend (Vue + Nginx)  
        ↓  
Backend API (Node + Express)  
        ↓  
MySQL Database

---

# Camadas da Aplicação

A arquitetura é dividida em camadas com responsabilidades bem definidas.

## Frontend

Responsável pela interface do usuário.

Tecnologias:

Vue.js  
Vite  
Nginx (servidor de arquivos estáticos)

Responsabilidades:

- renderizar a interface
- gerenciar navegação
- consumir APIs
- realizar validações básicas
- gerenciar estado da aplicação

O frontend **não deve conter lógica de negócio crítica**.

Toda regra de negócio deve estar no backend.

---

## Backend

Responsável pela lógica de negócio e APIs do sistema.

Tecnologias:

Node.js  
Express

Estrutura recomendada:

controllers  
services  
repositories  

Responsabilidades:

- processar regras de negócio
- validar dados
- controlar autenticação
- acessar banco de dados
- expor APIs REST

---

## Banco de Dados

Tecnologia:

MySQL

Responsabilidades:

- persistência de dados
- integridade dos dados
- execução de consultas

Boas práticas:

- uso de índices
- evitar queries pesadas
- evitar SELECT *
- uso correto de relacionamentos

---

# Infraestrutura

A aplicação é executada em ambiente containerizado.

Ferramentas:

Docker  
Docker Compose  

Containers principais:

frontend  
backend  
database  
traefik  

Benefícios:

- ambiente padronizado
- facilidade de deploy
- isolamento de serviços
- portabilidade entre ambientes

---

# Proxy Reverso

Tecnologia utilizada:

Traefik

Responsabilidades:

- roteamento de requisições
- gerenciamento automático de HTTPS
- balanceamento de carga
- ponto de entrada único da aplicação

---

# Comunicação entre Serviços

## Frontend → Backend

Comunicação realizada via:

HTTP REST API

O frontend consome endpoints expostos pelo backend.

---

## Backend → Database

Comunicação direta utilizando driver MySQL.

O backend é responsável por:

- validar dados
- executar queries
- garantir integridade das operações.

---

# Estrutura de Deploy

Ambientes previstos:

development  
staging  
production  

Deploy padrão:

Docker Compose

Fluxo típico:

1. build dos containers  
2. inicialização dos serviços  
3. configuração do proxy reverso  
4. disponibilização da aplicação  

---

# Escalabilidade

A arquitetura foi projetada para permitir evolução gradual conforme o crescimento do sistema.

Possíveis melhorias futuras:

- múltiplas instâncias do backend
- balanceamento de carga
- cache de aplicação (Redis)
- CDN para assets estáticos
- object storage para arquivos
- filas de processamento (RabbitMQ ou Redis Queue)

---

# Armazenamento de Arquivos

Conteúdos da plataforma incluem:

- PDFs
- áudios
- vídeos

Esses arquivos devem preferencialmente ser armazenados em **object storage**, evitando sobrecarregar o backend ou o sistema de arquivos local.

Possíveis soluções:

- S3 compatible storage
- MinIO
- serviços de object storage cloud

---

# Segurança

Práticas mínimas recomendadas:

- validação de input
- autenticação segura
- proteção contra SQL Injection
- gerenciamento seguro de secrets
- uso de HTTPS

Mais detalhes podem ser encontrados em:

`/ai/engineering/SECURITY_BASELINE.md`

---

# Observabilidade

O sistema deve permitir monitoramento da aplicação.

Métricas importantes:

- tempo de resposta da API
- taxa de erros
- uso de CPU e memória
- tempo de execução de queries

Ferramentas possíveis:

Prometheus  
Grafana  
logs estruturados

---

# Evolução Arquitetural

A arquitetura permite evolução progressiva.

Possível roadmap arquitetural:

1. aplicação monolítica containerizada  
2. escalabilidade horizontal do backend  
3. separação de serviços críticos  
4. adoção de arquitetura orientada a eventos  

---

# Princípios Arquiteturais

Toda decisão arquitetural deve priorizar:

simplicidade  
separação de responsabilidades  
escalabilidade  
segurança  
facilidade de manutenção  
clareza estrutural