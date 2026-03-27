# Checklist de deploy (produção) — anti-incidente

Use antes e depois de cada release na VPS. Objetivo: evitar 404, ACME quebrado, CORS e rate limit desnecessário.

## Antes do deploy

1. **Domínio único** — Produção usa só `https://app.momentodev.com` (sem `www` no Traefik). Raiz `.env`: `DOMAIN=app.momentodev.com` (sem typo).
2. **GitHub Actions** — Secret `APP_DOMAIN` = `app.momentodev.com` (mesmo host do healthcheck).
3. **Backend** — Em `backend/.env` na VPS: `FRONTEND_URL` inclui `https://app.momentodev.com` e **não** deixa só `momentodev.com` / `www.momentodev.com` (CORS).
4. **JWT (produção)** — `NODE_ENV=production` e `JWT_SECRET` forte (24+ caracteres, não usar valores de exemplo).
5. **Let’s Encrypt** — Não apagar `traefik/letsencrypt/acme.json` à toa. Não forçar vários `up --force-recreate traefik` seguidos (rate limit).
6. **Arquivo ACME válido** — Se o Traefik logar `unexpected end of JSON input` ou `permissions 644`:  
   `mkdir -p traefik/letsencrypt && echo '{}' > traefik/letsencrypt/acme.json && chmod 600 traefik/letsencrypt/acme.json`  
   Depois recrie o Traefik (ou stack inteira).

## Comando de subida (VPS)

```bash
cd /caminho/do/projeto
git pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Opcional após mudança de rede ou labels: `docker compose ... down` e depois `up -d --build`.

## Depois do deploy

1. `curl -fI https://app.momentodev.com/` e `curl -fI https://app.momentodev.com/api/health` — esperado HTTP 200.
2. `docker compose -f docker-compose.yml -f docker-compose.prod.yml ps` — `traefik`, `frontend`, `backend`, `mysql` estáveis.
3. `docker logs sexta_dev_traefik --tail 80 | grep -Ei 'error|acme|429'` — sem erro persistente de resolver / rate limit.
4. `ls -la traefik/letsencrypt/acme.json` — permissão `600` e tamanho crescente após primeira emissão ok.

## Se algo quebrar

- **404 só no `/`:** frontend/labels ou ACME com `certresolver` inválido — ver logs Traefik e `acme.json`.
- **API 200, site 404:** regra `Host` ≠ URL aberta ou `DOMAIN` errado.
- **curl / navegador SSL:** ver `acme.json`, DNS apontando para a VPS e portas 80/443 liberadas.
- **CORS:** conferir `FRONTEND_URL` no backend em produção.

## Referência rápida de arquivos

| Onde | O quê |
|------|--------|
| `.env` (raiz) | `DOMAIN`, `SSL_EMAIL`, `VITE_*` |
| `backend/.env` | `FRONTEND_URL`, `JWT_SECRET`, `NODE_ENV`, DB |
| `docker-compose.prod.yml` | Traefik + labels (sem `www` no frontend) |
| `.github/workflows/deploy.yml` | Deploy via SSH + healthcheck |
