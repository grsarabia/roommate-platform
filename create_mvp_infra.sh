#!/usr/bin/env bash
set -e

echo "Creando estructura inicial para infra MVP..."

# Directorios
mkdir -p backend config backend/db/migrate frontend .github/workflows

# docker-compose.yml
cat > docker-compose.yml <<'YAML'
version: "3.8"
services:
  db:
    image: postgres:14
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: roommates_dev
    volumes:
      - db-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:6
    ports:
      - "6379:6379"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    command: bash -lc "bundle exec rails db:create db:migrate && bundle exec puma -C config/puma.rb"
    volumes:
      - ./backend:/app
    ports:
      - "3000:3000"
    environment:
      RAILS_ENV: development
      DATABASE_URL: postgres://postgres:postgres@db:5432/roommates_dev
      REDIS_URL: redis://redis:6379/0
    depends_on:
      - db
      - redis

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    volumes:
      - ./frontend:/app
    ports:
      - "3009:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3000/api/v1

volumes:
  db-data:
YAML

# backend Dockerfile
cat > backend/Dockerfile <<'DOCKER'
FROM ruby:3.1
RUN apt-get update -qq && apt-get install -y nodejs postgresql-client yarn
WORKDIR /app
COPY Gemfile* ./
RUN bundle install
COPY . .
CMD ["bash", "-lc", "bundle exec rails s -b 0.0.0.0 -p 3000"]
DOCKER

# frontend Dockerfile
cat > frontend/Dockerfile <<'DOCKERF'
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
DOCKERF

# backend .env.example
cat > backend/.env.example <<'ENV'
RAILS_ENV=development
DATABASE_URL=postgres://postgres:postgres@db:5432/roommates_dev
REDIS_URL=redis://redis:6379/0
SECRET_KEY_BASE=changeme
JWT_SECRET=changeme_jwt
S3_BUCKET=
S3_REGION=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
MERCADOPAGO_ACCESS_TOKEN=
ENV

# Rails migration example
cat > backend/db/migrate/20260522_create_users_profiles_listings.rb <<'MIG'
class CreateUsersProfilesListings < ActiveRecord::Migration[7.0]
  def change
    create_table :users do |t|
      t.string :email, null:false, index: { unique: true }
      t.string :encrypted_password
      t.string :phone
      t.boolean :verified_email, default: false
      t.boolean :verified_id, default: false
      t.string :role, default: 'user'
      t.timestamps
    end

    create_table :profiles do |t|
      t.references :user, null:false, foreign_key: true
      t.string :name
      t.integer :age
      t.string :photo_url
      t.string :occupation
      t.string :institution
      t.text :bio
      t.integer :budget_min
      t.integer :budget_max
      t.string :comuna
      t.jsonb :habits, default: {}
      t.boolean :smoker, default: false
      t.boolean :pets, default: false
      t.jsonb :social_links, default: {}
      t.float :reputation_score, default: 0.0
      t.timestamps
    end

    create_table :listings do |t|
      t.references :owner, null:false, foreign_key: { to_table: :users }
      t.string :title
      t.text :description
      t.integer :price
      t.boolean :gastos_incluidos, default: false
      t.string :address_text
      t.float :lat
      t.float :lng
      t.string :comuna
      t.jsonb :rules, default: {}
      t.jsonb :services, default: {}
      t.jsonb :availability, default: {}
      t.jsonb :photos, default: []
      t.timestamps
    end
  end
end
MIG

# seeds
cat > backend/db/seeds.rb <<'SEEDS'
User.create!(email: "owner@example.com", encrypted_password: "password")
u = User.create!(email: "roomie@example.com", encrypted_password: "password")
Profile.create!(user: u, name: "Guido", age: 30, bio: "Busco roomie tranquilo", comuna: "Providencia", budget_min: 200000, budget_max: 350000)
Listing.create!(owner_id: 1, title: "Habitación en depto 3D", description: "Cerca metro, gastos incluidos", price: 300000, comuna: "Providencia", photos: [])
SEEDS

# GitHub Actions CI
cat > .github/workflows/ci.yml <<'CI'
name: CI

on: [push, pull_request]

jobs:
  backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: roommates_test
        ports: ['5432:5432']
        options: >-
          --health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: ruby/setup-ruby@v1
        with:
          ruby-version: 3.1
      - name: Install dependencies
        run: |
          cd backend
          bundle install --jobs 4 --retry 3
      - name: Setup DB and run tests
        env:
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/roommates_test
        run: |
          cd backend
          bundle exec rails db:create db:migrate RAILS_ENV=test
          bundle exec rspec

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 18
      - name: Install and build
        run: |
          cd frontend
          npm ci
          npm run build
CI

echo "Archivos creados. Revisa backend/ y frontend/ y ajusta según tu stack."
echo "Recuerda añadir Gemfile, package.json y el resto del código de app."
