#!/usr/bin/env sh
set -eu

: "${APP_DIR:=/opt/online-comic}"
: "${POSTGRES_DB:=webproject}"
: "${POSTGRES_USER:=webproject}"
: "${APP_PORT:=3000}"
: "${FRONTEND_PORT:=8080}"
: "${VITE_API_URL:?Set VITE_API_URL before running this script}"

umask 077
mkdir -p "$APP_DIR"

if [ ! -f "$APP_DIR/.env" ]; then
  POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-$(openssl rand -hex 24)}"
  JWT_SECRET="${JWT_SECRET:-$(openssl rand -hex 32)}"
  SEED_ADMIN_PASSWORD="${SEED_ADMIN_PASSWORD:-$(openssl rand -hex 16)}"
  cat > "$APP_DIR/.env" <<EOF
POSTGRES_DB=$POSTGRES_DB
POSTGRES_USER=$POSTGRES_USER
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
APP_PORT=$APP_PORT
FRONTEND_PORT=$FRONTEND_PORT
VITE_API_URL=$VITE_API_URL
JWT_SECRET=$JWT_SECRET
SEED_ADMIN_EMAIL=${SEED_ADMIN_EMAIL:-admin@example.com}
SEED_ADMIN_PASSWORD=$SEED_ADMIN_PASSWORD
EOF
fi

chmod 600 "$APP_DIR/.env"
echo "Created $APP_DIR/.env"
