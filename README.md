# Roommate Platform

Plataforma web para búsqueda y gestión de roommates y administración de gastos compartidos (Chile).

## Estructura inicial

- Ruby on Rails API
- PostgreSQL
- Redis
- Sidekiq
- JWT Auth
- Docker

## Desarrollo local rápido

```bash
git clone https://github.com/grsarabia/roommate-platform.git
cd roommate-platform
cp .env.example .env
# Instala docker y docker-compose
# Construye las imágenes y levanta los servicios:
docker-compose build
docker-compose up db redis
# En otra terminal:
docker-compose run web rails db:create db:migrate
docker-compose up web
```

## Features objetivo
- Gestión de usuarios y perfiles
- Publicación de habitaciones
- Matching inteligente entre roommates
- Chat interno y gastos compartidos

## Estructura inicial de ramas
- `develop`: Integración principal
- `feature/initial-setup`: Estructura base
- Crear nuevas features sobre ramas `feature/*`
