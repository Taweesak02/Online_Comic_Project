# Online Comic

React/Vite frontend, Express/Prisma backend, and PostgreSQL. Run all three services with the root `docker-compose.yml`.

## Setup

Install Docker Desktop with Linux containers (or Docker Engine with Compose). Run the following from this directory in PowerShell. Copy the examples only on first setup; keep existing `.env` files if already configured.

```powershell
Copy-Item BackEnd/.env.example BackEnd/.env
Copy-Item FrontEnd/.env.example FrontEnd/.env
```

Edit `BackEnd/.env`: set `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `JWT_SECRET`, and `SEED_ADMIN_PASSWORD`. Use a long random JWT secret and replace the example passwords. Database credentials containing URL special characters must be URL-encoded in connection strings; using URL-safe credentials avoids this requirement for the generated Docker connection string.

Keep backend secrets in `BackEnd/.env`. Keep `FRONTEND_PORT` and the public `VITE_API_URL` in `FrontEnd/.env`. Both apps ignore their actual `.env` files in Git; commit only placeholder `.env.example` files.

```powershell
docker compose --env-file BackEnd/.env --env-file FrontEnd/.env up -d --build
```

Use both `--env-file` arguments with every Compose command below. They supply Compose interpolation values; only the backend environment file is injected into the API container. The frontend receives its public API URL at build time.

| Service | Default address |
| --- | --- |
| Frontend | http://localhost:8080 |
| Backend API | http://localhost:3000/api |
| API documentation | http://localhost:3000/api-docs |
| API health | http://localhost:3000/api/health |
| PostgreSQL | localhost:5432 |

PostgreSQL becomes healthy first, then the backend deploys Prisma migrations, seeds the database, and starts. The frontend starts after the API health check succeeds. The seed creates `admin@example.com` with `SEED_ADMIN_PASSWORD`; changing that variable does not reset an existing admin password.

Inside Docker, the API connects to `db:5432`. Compose overrides the local-development `DATABASE_URL` and internal API port. `DB_HOST_PORT` and `PORT` control the database and API ports exposed on your computer.

The browser calls `VITE_API_URL`, so use an address reachable by the browser, such as `http://localhost:3000/api`, rather than a Docker service name. If you change `PORT`, update that URL too. For remote hosting, use the public API URL. Rebuild the frontend after changing it.

## Manage the stack

```powershell
docker compose --env-file BackEnd/.env --env-file FrontEnd/.env config --quiet
docker compose --env-file BackEnd/.env --env-file FrontEnd/.env ps
docker compose --env-file BackEnd/.env --env-file FrontEnd/.env logs -f app frontend
docker compose --env-file BackEnd/.env --env-file FrontEnd/.env down
```

Database data persists in the `backend_postgres-data` volume, and uploads persist in `BackEnd/public/uploads`. Normal `down` keeps this data. `down --volumes` deletes the database volume.

The Compose project name remains `backend` to reuse the previous backend stack's default database volume. If you previously used a custom project name, pass the same `-p` name to each command. Stop the old standalone frontend stack before starting the combined stack to avoid port conflicts. Its default project name was `frontend`; `docker stop frontend-frontend-1` stops its default container if it is still running.

## Local development

See [backend instructions](BackEnd/README.md) and [frontend instructions](FrontEnd/README.md) for running the apps outside Docker. Each app retains its own Dockerfile and environment file.

## Repository

This directory is one Git repository containing `FrontEnd/`, `BackEnd/`, and the shared Docker Compose setup. Run Git commands from this directory and clone the repository once to get both apps.

The previous app repositories are retained locally in `.git-backups/`, which is excluded from Git. Their history is available for recovery; the combined repository starts with a fresh history. Keep the backups until you no longer need the previous repositories.
