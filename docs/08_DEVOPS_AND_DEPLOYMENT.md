# DevOps & Deployment Guide

Configuration and operational guide for running Bookstore NestJS API in development and production environments.

---

## 1. Docker Compose Setup

A multi-container setup is defined in `docker-compose.yml`:
- **`api`**: Node.js NestJS application (exposed on port 3000).
- **`mysql`**: MySQL 8.0 database (exposed on port 3306).
- **`redis`**: Redis 7.0 cache and session store (exposed on port 6379).

```bash
# Start all containers in the background
docker compose up -d

# View container logs
docker compose logs -f api

# Stop all containers
docker compose down
```

---

## 2. Health Checks

The application exposes Terminus health probes at `/health`:

```bash
curl http://localhost:3000/health
```

Monitors:
- **MySQL database ping**: Confirms active connection.
- **Memory Heap**: Checks heap allocation does not exceed 150 MB.
- **Memory RSS**: Checks RSS memory allocation does not exceed 300 MB.

---

## 3. Environment Variables

Key variables defined in `.env.example`:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | API listening port | `3000` |
| `NODE_ENV` | Environment name | `development` / `production` |
| `DB_HOST` | MySQL hostname | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USERNAME` | MySQL user | `root` |
| `DB_PASSWORD` | MySQL password | `mysql` |
| `DB_NAME` | Database name | `bookstore-db` |
| `REDIS_URL` | Redis cache connection string | `redis://localhost:6379/0` |
| `REDIS_VIEWS_URL`| Redis view tracking connection string | `redis://localhost:6379/1` |
| `REDIS_SESSION_URL`| Redis session connection string | `redis://localhost:6379/2` |
| `SESSION_SECRET` | Secret key for express-session | `32+ characters secret` |
| `COOKIE_SECRET` | Secret key for signed cookies | `32+ characters secret` |
| `ADMIN_EMAIL` | Default admin email for seeder | `admin@hambaar.local` |
| `ADMIN_PASSWORD`| Default admin password for seeder | `SecurePassword123!` |

---

## 4. Continuous Integration (CI)

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push and pull request:
1. Spawns MySQL 8 and Redis 7 service containers.
2. Checks static typing via `npx tsc --noEmit --noUnusedLocals`.
3. Validates production compilation via `npm run build`.
4. Executes unit tests via `npm test`.
5. Executes Supertest E2E integration tests via `npm run test:e2e`.

---

## 5. Production Build

```bash
# Compile TypeScript to JavaScript
npm run build

# Start production server
npm run start:prod
```
