# 🚀 Sexta Dev Hub

O **Sexta Dev Hub** é um projeto full stack desenvolvido para
centralizar aplicações, experimentos e ferramentas utilizadas no projeto
**Sexta Dev**.

A aplicação utiliza uma arquitetura moderna baseada em **containers
Docker**, com **Traefik como reverse proxy**, permitindo gerenciamento
automático de HTTPS e roteamento entre os serviços.

------------------------------------------------------------------------

# 🧱 Tecnologias Utilizadas

O projeto é composto pelas seguintes tecnologias:

| Camada | Tecnologia |
|------|------|
| Frontend | Vue.js + Vite |
| Backend | Node.js + Express |
| Banco de Dados | MySQL |
| Reverse Proxy | Traefik |
| Infraestrutura | Docker + Docker Compose |
| HTTPS | Let's Encrypt |
| Colaboração com IA | Agentes especializados (orquestração em `ai/`) |

------------------------------------------------------------------------

# 🏗 Arquitetura da Aplicação

A aplicação segue uma arquitetura baseada em **containers isolados**,
onde cada serviço possui sua responsabilidade específica.

    Internet
    ↓
    Traefik (Reverse Proxy + SSL)
    ↓
    ├── Frontend (Vue + Nginx)
    └── Backend (Node.js + Express)
    ↓
    MySQL

### Função de cada serviço

**Traefik** - gerenciamento automático de certificados SSL (Let's
Encrypt) - redirecionamento HTTP → HTTPS - roteamento entre frontend e
backend

**Frontend** - aplicação Vue.js buildada com Vite - servida via Nginx em
produção

**Backend** - API REST construída com Node.js + Express - responsável
pela lógica de negócio

**MySQL** - banco de dados principal da aplicação - armazenamento
persistente via volume Docker

------------------------------------------------------------------------

# 📦 Estrutura do Projeto

    sexta-dev-hub
    │
    ├── backend
    │   ├── src
    │   ├── Dockerfile
    │   └── package.json
    │
    ├── frontend
    │   ├── src
    │   ├── Dockerfile
    │   ├── nginx.conf
    │   └── package.json
    │
    ├── traefik
    │   └── letsencrypt
    │
    ├── backup
    │   └── backup.sh
    │
    ├── docker-compose.yml
    ├── docker-compose.prod.yml
    ├── docker-compose.dev.yml
    └── README.md

------------------------------------------------------------------------

# ⚙️ Requisitos

Antes de iniciar o projeto é necessário ter instalado:

-   Docker
-   Docker Compose
-   Git

Verifique se o Docker está funcionando:

``` bash
docker -v
docker compose version
```

------------------------------------------------------------------------

# 🧪 Ambiente de Desenvolvimento

Para iniciar o ambiente de desenvolvimento execute:

``` bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

Serviços disponíveis:

  Serviço                      URL
  ---------------------------- -----------------------
  Frontend (Vite Dev Server)   http://localhost:5173
  Backend API                  http://localhost:3000
  MySQL                        localhost:3306

### Variáveis de ambiente (frontend)

As variáveis do frontend seguem o padrão `VITE_*`:

- `VITE_API_URL`: base da API consumida pelo frontend (ex.: `/api`)
- `VITE_GITHUB_URL`: URL pública do repositório para exibição no site (hero e footer)
- `VITE_ENABLE_VLIBRAS`: habilita/desabilita plugin VLibras no frontend (`true`/`false`)
- `VITE_ENABLE_PDF_PREVIEW`: habilita/desabilita pré-visualização de PDF no detalhe do episódio (`true`/`false`)

Defina no `.env` da raiz e, em produção, também no build do frontend via `docker-compose.prod.yml`.

### Acessibilidade

O frontend possui integração com o **VLibras** para ampliar acessibilidade em Libras.

- integração global no app (SPA), com proteção contra inicialização duplicada
- habilitação por variável de ambiente (`VITE_ENABLE_VLIBRAS`)

### Características do ambiente de desenvolvimento

-   Hot reload para frontend e backend
-   Código montado via volumes Docker
-   Sem Traefik
-   Sem HTTPS
-   Banco acessível localmente

------------------------------------------------------------------------

# 🚀 Ambiente de Produção

Para iniciar o ambiente de produção execute:

``` bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Esse comando irá:

-   buildar as imagens do frontend e backend
-   iniciar todos os containers
-   configurar o Traefik
-   emitir automaticamente certificados SSL

------------------------------------------------------------------------

# 🌐 Acesso à Aplicação

**Frontend:** https://momentodev.com

**API:** https://momentodev.com/api/health

**Healthcheck da API:** https://momentodev.com/health

------------------------------------------------------------------------

# 🛠 Comandos Úteis

### Ver containers em execução

``` bash
docker ps
```

### Ver logs da aplicação

``` bash
docker compose logs -f
```

Logs de um serviço específico:

``` bash
docker compose logs -f backend
```

------------------------------------------------------------------------

# 💾 Backup do Banco de Dados

O projeto possui um container dedicado para **backup automático do
MySQL**.

Os backups são armazenados em:

    /backup

Para restaurar um backup manualmente:

``` bash
docker exec -i sexta_dev_mysql mysql -u root -p SEU_BANCO < backup.sql
```

------------------------------------------------------------------------

# 🧪 Healthcheck da API

A API possui um endpoint de verificação utilizado para monitoramento da
aplicação:

    /health

Esse endpoint é utilizado para:

-   verificar se a API está ativa
-   validar se o container está saudável
-   monitoramento automatizado

------------------------------------------------------------------------

# 🔐 Segurança

A infraestrutura possui algumas práticas de segurança:

-   HTTPS automático via Let's Encrypt
-   MySQL acessível apenas via localhost na VPS
-   containers isolados por rede Docker
-   proxy reverso centralizado via Traefik

------------------------------------------------------------------------

# 📌 Observações

Este projeto foi desenvolvido com foco em:

-   arquitetura moderna baseada em containers
-   separação clara entre frontend, backend e infraestrutura
-   facilidade de deploy em ambientes cloud
-   escalabilidade futura

------------------------------------------------------------------------

# 🤖 Uso de Agentes de IA no Projeto

O projeto foi estruturado para uso de IA com **papéis especializados** e **orquestração por tipo de tarefa**.

Documentos principais:

- `ai/workflows/AI_AGENT_ORCHESTRATOR.md`: define quando usar múltiplos agentes, ordem de atuação e consolidação final
- `ai/agents/README.md`: índice de agentes e responsabilidades de cada papel
- `ai/context/ARCHITECTURE.md`: referência obrigatória para decisões técnicas e limites arquiteturais

Exemplo de comando no Cursor:

```text
Act as the Product Designer agent and improve hover states, spacing and visual hierarchy on the homepage.
```

Fluxo recomendado:

1. identificar tipo da tarefa
2. selecionar agentes necessários (sem excesso)
3. implementar por especialidade
4. validar com revisão e testes
5. consolidar entrega final

------------------------------------------------------------------------

# 👨‍💻 Autor

Projeto desenvolvido por **Emerson Amancio**.
