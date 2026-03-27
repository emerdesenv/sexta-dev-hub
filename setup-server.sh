#!/usr/bin/env bash
#
# Bootstrap inicial de VPS (Ubuntu) para o projeto sexta-dev-hub:
# Docker, UFW, clone do repositório, .env de raiz + backend, acme stub, compose prod.
#
# Uso:
#   export SETUP_DOMAIN=app.momentodev.com
#   export SETUP_SSL_EMAIL=voce@dominio.com
#   export SETUP_GIT_REPO=https://github.com/emerdesenv/sexta-dev-hub.git
#   sudo -E bash setup-server.sh
#
# Repositório privado: use URL SSH e garanta chave em /root/.ssh antes.
#
set -euo pipefail

echo "==> Setup inicial do servidor (sexta-dev-hub)"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Execute como root, por exemplo: sudo -E bash setup-server.sh"
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

# ---------------------------------------------------------------------------
# Configuração (override com variáveis de ambiente antes de rodar)
# ---------------------------------------------------------------------------
APP_DIR="${SETUP_APP_DIR:-/root/apps}"
APP_NAME="${SETUP_APP_NAME:-sexta-dev-hub}"
APP_PATH="${APP_DIR}/${APP_NAME}"

SETUP_GIT_REPO="${SETUP_GIT_REPO:-https://github.com/emerdesenv/sexta-dev-hub.git}"

DOMAIN="${SETUP_DOMAIN:-app.momentodev.com}"
SSL_EMAIL="${SETUP_SSL_EMAIL:-}"

TIMEZONE="${SETUP_TIMEZONE:-America/Sao_Paulo}"

DB_NAME="${SETUP_DB_NAME:-sextadev}"
DB_USER="${SETUP_DB_USER:-sextadev}"
DB_PASSWORD="${SETUP_DB_PASSWORD:-$(openssl rand -hex 16)}"
DB_ROOT_PASSWORD="${SETUP_DB_ROOT_PASSWORD:-$(openssl rand -hex 16)}"

if [[ -z "${SETUP_JWT_SECRET:-}" ]]; then
  JWT_SECRET="$(openssl rand -hex 32)"
else
  JWT_SECRET="${SETUP_JWT_SECRET}"
fi

ADMIN_USERNAME="${SETUP_ADMIN_USERNAME:-professor}"
ADMIN_PASSWORD="${SETUP_ADMIN_PASSWORD:-$(openssl rand -hex 8)}"

MYSQL_CONTAINER="${SETUP_MYSQL_CONTAINER:-sexta_dev_mysql}"

COMPOSE_BASE=(docker compose -f docker-compose.yml -f docker-compose.prod.yml)

# ---------------------------------------------------------------------------
if [[ -z "${SSL_EMAIL}" ]]; then
  echo "AVISO: SETUP_SSL_EMAIL vazio. Informe um e-mail válido para Let's Encrypt:"
  echo "  export SETUP_SSL_EMAIL=voce@dominio.com"
  echo "Continuando com placeholder (ajuste em ${APP_PATH}/.env depois)."
  SSL_EMAIL="admin@${DOMAIN}"
fi

# ---------------------------------------------------------------------------
# Sistema
# ---------------------------------------------------------------------------
echo "==> Atualizando sistema..."
apt-get update -qy
apt-get upgrade -qy

echo "==> Pacotes base..."
apt-get install -qy \
  ca-certificates \
  curl \
  gnupg \
  lsb-release \
  git \
  ufw \
  openssl \
  apt-transport-https \
  software-properties-common \
  cron

echo "==> Timezone: ${TIMEZONE}"
timedatectl set-timezone "${TIMEZONE}" || true

# ---------------------------------------------------------------------------
# Docker (repositório oficial — Ubuntu)
# ---------------------------------------------------------------------------
echo "==> Docker..."
install -m 0755 -d /etc/apt/keyrings

if [[ ! -f /etc/apt/keyrings/docker.gpg ]]; then
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
fi
chmod a+r /etc/apt/keyrings/docker.gpg

ARCH="$(dpkg --print-architecture)"
CODENAME="$(. /etc/os-release && echo "${VERSION_CODENAME}")"

echo "deb [arch=${ARCH} signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu ${CODENAME} stable" \
  >/etc/apt/sources.list.d/docker.list

apt-get update -qy
apt-get install -qy docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

systemctl enable docker
systemctl start docker

docker --version
docker compose version

# ---------------------------------------------------------------------------
# Firewall
# ---------------------------------------------------------------------------
echo "==> UFW (22, 80, 443)..."
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# ---------------------------------------------------------------------------
# Diretórios
# ---------------------------------------------------------------------------
mkdir -p "${APP_DIR}" /root/backups /root/scripts

# ---------------------------------------------------------------------------
# Repositório
# ---------------------------------------------------------------------------
echo "==> Código em ${APP_PATH}..."
if [[ -d "${APP_PATH}/.git" ]]; then
  git -C "${APP_PATH}" pull --ff-only
else
  git clone "${SETUP_GIT_REPO}" "${APP_PATH}"
fi

cd "${APP_PATH}"

git config --global --add safe.directory "${APP_PATH}" 2>/dev/null || true

# ---------------------------------------------------------------------------
# Traefik — acme.json válido (JSON mínimo + permissão)
# ---------------------------------------------------------------------------
echo "==> traefik/letsencrypt..."
mkdir -p traefik/letsencrypt
if [[ ! -s traefik/letsencrypt/acme.json ]] || [[ "$(wc -c <traefik/letsencrypt/acme.json)" -lt 4 ]]; then
  printf '%s\n' '{}' >traefik/letsencrypt/acme.json
fi
chmod 600 traefik/letsencrypt/acme.json

# ---------------------------------------------------------------------------
# .env raiz (MySQL + Traefik/Vite)
# ---------------------------------------------------------------------------
echo "==> .env (raiz)..."
cat >.env <<EOF
MYSQL_ROOT_PASSWORD=${DB_ROOT_PASSWORD}
MYSQL_DATABASE=${DB_NAME}
MYSQL_USER=${DB_USER}
MYSQL_PASSWORD=${DB_PASSWORD}

DOMAIN=${DOMAIN}
SSL_EMAIL=${SSL_EMAIL}

VITE_API_URL=/api
VITE_GITHUB_URL=${SETUP_VITE_GITHUB_URL:-https://github.com/emerdesenv/sexta-dev-hub}
VITE_ENABLE_VLIBRAS=true
VITE_ENABLE_PDF_PREVIEW=true
EOF

chmod 600 .env

# ---------------------------------------------------------------------------
# backend/.env
# ---------------------------------------------------------------------------
echo "==> backend/.env..."
mkdir -p backend
PUBLIC_ORIGIN="https://${DOMAIN}"

cat >backend/.env <<EOF
NODE_ENV=production
PORT=3000

DB_HOST=mysql
DB_PORT=3306
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}

JWT_SECRET=${JWT_SECRET}
AUTH_COOKIE_NAME=sdh_auth_token
AUTH_REFRESH_COOKIE_NAME=sdh_refresh_token
AUTH_ACCESS_EXPIRES_IN=15m
AUTH_REFRESH_TTL_MS=2592000000

FRONTEND_URL=${PUBLIC_ORIGIN},http://localhost,http://localhost:5173,http://127.0.0.1:5173
STUDENT_REQUIRE_APPROVAL=true
STUDENT_INVITE_CODE=${SETUP_STUDENT_INVITE_CODE:-}
ACCOUNT_PURGE_DAYS=30
ACCOUNT_PURGE_INTERVAL_MS=21600000
RATE_LIMIT_COMMUNITY_TOPICS_MAX=8
RATE_LIMIT_COMMUNITY_REPLIES_MAX=20
RATE_LIMIT_COMMUNITY_REPORTS_MAX=20
RATE_LIMIT_COMMUNITY_VOTES_MAX=50

ADMIN_USERNAME=${ADMIN_USERNAME}
ADMIN_PASSWORD=${ADMIN_PASSWORD}
EOF

chmod 600 backend/.env

# ---------------------------------------------------------------------------
# Backup MySQL em /root/backups (além do serviço db_backup no compose, que grava no volume Docker)
# ---------------------------------------------------------------------------
echo "==> Script de backup diário (host)..."
cat >/root/scripts/backup_mysql.sh <<'EOS'
#!/usr/bin/env bash
set -euo pipefail
DATE=$(date +%F_%H-%M-%S)
BACKUP_DIR="/root/backups"
FILE="${BACKUP_DIR}/sextadev_${DATE}.sql"
mkdir -p "${BACKUP_DIR}"
# Root password vem do .env na raiz do projeto — carregar se existir
ROOT_PW=""
if [[ -f __APP_PATH__/.env ]]; then
  ROOT_PW=$(grep '^MYSQL_ROOT_PASSWORD=' __APP_PATH__/.env | cut -d= -f2-)
fi
if [[ -z "${ROOT_PW}" ]]; then
  echo "Defina MYSQL_ROOT_PASSWORD em __APP_PATH__/.env" >&2
  exit 1
fi
docker exec __MYSQL_CONTAINER__ mysqldump -uroot -p"${ROOT_PW}" __DB_NAME__ >"${FILE}"
find "${BACKUP_DIR}" -type f -name '*.sql' -mtime +7 -delete
EOS
sed -i \
  -e "s|__APP_PATH__|${APP_PATH}|g" \
  -e "s|__MYSQL_CONTAINER__|${MYSQL_CONTAINER}|g" \
  -e "s|__DB_NAME__|${DB_NAME}|g" \
  /root/scripts/backup_mysql.sh
chmod +x /root/scripts/backup_mysql.sh

( crontab -l 2>/dev/null | grep -v backup_mysql.sh; echo "0 2 * * * /root/scripts/backup_mysql.sh >> /var/log/backup_mysql.log 2>&1" ) | crontab -
systemctl enable cron
systemctl restart cron

# ---------------------------------------------------------------------------
# Stack produção
# ---------------------------------------------------------------------------
echo "==> Subindo stack (docker-compose.yml + docker-compose.prod.yml)..."
"${COMPOSE_BASE[@]}" down --remove-orphans 2>/dev/null || true
"${COMPOSE_BASE[@]}" up -d --build

# ---------------------------------------------------------------------------
# Resumo (guardar em lugar seguro — contém senhas geradas)
# ---------------------------------------------------------------------------
CREDS_FILE="/root/backups/${APP_NAME}-bootstrap-credentials.txt"
{
  echo "Gerado em $(date -Iseconds)"
  echo "DOMAIN=${DOMAIN}"
  echo "MYSQL_ROOT_PASSWORD=${DB_ROOT_PASSWORD}"
  echo "MYSQL_USER=${DB_USER} MYSQL_PASSWORD=${DB_PASSWORD}"
  echo "JWT_SECRET=${JWT_SECRET}"
  echo "ADMIN_USERNAME=${ADMIN_USERNAME} ADMIN_PASSWORD=${ADMIN_PASSWORD}"
} >"${CREDS_FILE}"
chmod 600 "${CREDS_FILE}"

echo
echo "==> Concluído."
echo "  Site:   https://${DOMAIN}/"
echo "  Health: https://${DOMAIN}/api/health"
echo "  Credenciais geradas: ${CREDS_FILE} (apague depois de anotar)."
echo "  Próximos passos: ${APP_PATH}/DEPLOY_CHECKLIST.md"
echo
echo "Comandos:"
echo "  cd ${APP_PATH}"
echo "  docker compose -f docker-compose.yml -f docker-compose.prod.yml ps"
