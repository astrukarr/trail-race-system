# Trail Race System

Minimal, production‑ready microservices app for trail race management.

- Web app: Next.js 14 (TypeScript, Tailwind)
- Backend: Command Service (writes), Query Service (reads)
- Infra: PostgreSQL, RabbitMQ
- Auth: JWT (roles: Applicant, Administrator)

## Quick Start (Docker, recommended)

```bash
docker compose up --build -d
```

- Web: http://localhost:3000 (health: /api/health)
- Command: http://localhost:3001 (health: /health)
- Query: http://localhost:3002 (health: /health)
- RabbitMQ UI: http://localhost:15672 (user: trail_race_user / pass: trail_race_password)

Stop:
```bash
docker compose down
```

## Local Dev (without Docker)

- Prereqs: Node 18+, pnpm
```bash
# Command Service
cd command-service && pnpm install && pnpm dev
# Query Service
cd ../query-service && pnpm install && pnpm dev
# Web App
cd ../web-app && pnpm install && pnpm dev
```
Open http://localhost:3000

## Environment Variables

These are the effective variables used by services (Docker Compose sets sensible defaults for local).

- Command Service (port 3001)
  - DATABASE_URL: e.g. postgresql://user:pass@host:5432/trail_race_db
  - RABBITMQ_URL: e.g. amqp://user:pass@host:5672
  - JWT_SECRET: required in production
  - PORT (default 3001)
  - NODE_ENV (development|production)
  - CORS_ORIGIN (default http://localhost:3000)

- Query Service (port 3002)
  - DATABASE_URL
  - RABBITMQ_URL
  - JWT_SECRET: required in production (has a safe default for local)
  - PORT (default 3002)
  - NODE_ENV
  - CORS_ORIGIN (default http://localhost:3000)

- Web App (Next.js)
  - COMMAND_API_URL (default http://localhost:3001)
  - QUERY_API_URL (default http://localhost:3002)
  - Exposed to client as NEXT_PUBLIC_COMMAND_API_URL / NEXT_PUBLIC_QUERY_API_URL via `next.config.js`

For Docker local, the Compose file already provides:
- Postgres: `trail_race_db` / `trail_race_user` / `trail_race_password`
- RabbitMQ: `trail_race_user` / `trail_race_password`
- Service URLs: internal docker DNS (`postgres`, `rabbitmq`), ports mapped to host.

## Using the App

- Applicant: browse races, apply, manage your applications
- Administrator: manage races (CRUD), view all applications

## Health & Logs

- Health:
  - Web: GET http://localhost:3000/api/health
  - Command: GET http://localhost:3001/health
  - Query: GET http://localhost:3002/health
- Logs:
```bash
docker compose logs -f web-app
```

## Common Issues

- Ports in use: stop existing containers/processes and retry
- Services start before RabbitMQ: restart services after RabbitMQ is ready
- Web “unhealthy” in Docker: ensure `curl` is installed (already handled in Dockerfile)

## Deploy

- Vercel: host `web-app/` only; point env vars to hosted APIs
- Full stack (web + services + DB + MQ): Railway / DigitalOcean App Platform / AWS ECS + RDS

## Repo Structure

```
trail-race-system/
├─ command-service/
├─ query-service/
├─ web-app/
├─ docker-compose.yml
└─ docs/
```
