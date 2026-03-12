# Sexta Dev Hub V4

Plataforma fullstack para microaulas em formato de podcast educacional, com área pública para alunos e área administrativa para professor.

## O que esta versão entrega
- Área do aluno pública em `/`
- Área do professor em `/professor`
- Login JWT para professor
- CRUD completo de episódios
- Upload de capa, PDF e áudio
- Suporte a `mp3`, `ogg`, `wav` e `m4a`
- MySQL 8 com acesso via MySQL Workbench
- Nginx reverso para produção
- Estrutura pronta para Oracle Cloud Free
- Healthcheck em `/health` e `/api/health`
- Respostas de erro mais claras para debug

## Stack
- Frontend: Vue 3 + Vite + Pinia + Vue Router
- Backend: Node.js + Express + Sequelize + JWT
- Banco: MySQL 8
- Reverse proxy: Nginx
- Containers: Docker Compose

## Rotas principais
- Área do aluno: `http://IP/`
- Login professor: `http://IP/professor`
- Dashboard professor: `http://IP/professor/dashboard`
- Healthcheck direto: `http://IP/health`
- Healthcheck API: `http://IP/api/health`

## Credenciais iniciais
- usuário: `professor`
- senha: `prof123`

Troque essas credenciais antes de produção.

## Como rodar localmente com Docker
```bash
cd sexta-dev-hub-v4
docker compose up --build
```

Acesse:
- app: `http://localhost:8080`
- professor: `http://localhost:8080/professor`
- api: `http://localhost:3000/api/health`

## Como rodar sem Docker
### Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Acesse:
- frontend: `http://localhost:5173`
- backend: `http://localhost:3000`

## MySQL Workbench
Se estiver usando Docker local, use:
- Hostname: `127.0.0.1`
- Port: `3306`
- Username: `sextadev`
- Password: `sextadev123`
- Database/Schema: `sextadev`

## Estrutura de produção recomendada na Oracle Cloud
### VM 1 - aplicação pública
- Nginx
- Frontend
- Backend
- uploads

### VM 2 - banco de dados
- MySQL
- backup do banco
- acesso restrito somente à VM 1 e ao seu IP de administração

## Portas recomendadas
### VM pública
- `80` HTTP
- `443` HTTPS
- `22` SSH

### VM do banco
- `3306` MySQL, restrita ao IP privado da VM 1 e ao seu IP administrativo
- `22` SSH

## Fluxo básico de deploy na Oracle
1. criar as duas VMs
2. liberar regras de entrada nas portas corretas
3. apontar o domínio para a VM pública
4. subir containers da aplicação na VM 1
5. configurar o backend para conectar no MySQL da VM 2
6. validar `/health`, `/api/health` e `/professor`
7. configurar HTTPS com Nginx + Certbot

## Variáveis importantes
Arquivo base: `backend/.env.example`

Em produção, ajuste principalmente:
- `JWT_SECRET`
- `ADMIN_PASSWORD`
- `DB_HOST`
- `DB_PASSWORD`
- `FRONTEND_URL`
- `NODE_ENV=production`

## Diagnóstico rápido
### Ver logs do ambiente Docker
```bash
docker compose logs backend -f
docker compose logs mysql -f
docker compose logs nginx -f
```

### Validar saúde da API
```bash
curl http://localhost:3000/api/health
curl http://localhost:8080/api/health
```

### Erro 500 no upload
Nesta V4 já foi adicionada compatibilidade com `audio/x-m4a`, `audio/m4a` e arquivos cujo navegador envia `application/octet-stream`.

## Próximos passos sugeridos
- HTTPS automático com Certbot
- recuperação de senha
- auditoria de ações do professor
- categorias fixas e trilhas
- dashboard com métricas
- armazenamento externo compatível com S3
- CI/CD com GitHub Actions
