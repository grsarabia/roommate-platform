#!/usr/bin/env bash
set -e

# Usa DATABASE_URL si está definida, si no usa el host por defecto "db"
: "${DATABASE_URL:=postgres://postgres:postgres@db:5432/roommates_dev}"

# Extrae host y user desde DATABASE_URL
DB_HOST=$(echo "$DATABASE_URL" | sed -E 's#.*@([^:/]+).*#\1#')
DB_USER=$(echo "$DATABASE_URL" | sed -E 's#.*//([^:]+):.*@.*#\1#' || echo "postgres")

echo "Waiting for Postgres at $DB_HOST..."
until pg_isready -h "$DB_HOST" -p 5432 -U "$DB_USER" >/dev/null 2>&1; do
  echo "Postgres not ready, retrying in 1s..."
  sleep 1
done

echo "Postgres is ready. Executing: $*"
exec "$@"