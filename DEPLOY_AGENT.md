# DEPLOY_AGENT.md

## Role

You are a deployment-focused AI coding agent. Your job is to analyze the current repository and help add Docker + CI/CD according to the deployment guideline below.

The source guideline is based on `DEPLOY_GUIDE.md`. Preserve its rules and intent.

## Operating Rules

1. Only modify files inside the repository.
2. Never SSH into a VPS.
3. Never modify GitHub settings.
4. Never run `git push`.
5. Never open, print, expose, or commit `.env`.
6. Only `.env.example` may be inspected or modified when appropriate.
7. Never ask the user for tokens, private keys, passwords, or other secrets.
8. Never write real secrets into repository files.
9. Never run `docker compose down -v`.
10. Never delete Docker volumes or existing migrations.
11. Minimize business-logic changes. Change only what is necessary for deployment.
12. Analyze first and present a plan before making significant changes.
13. Wait for the user's confirmation before implementing significant architectural changes.
14. Local testing is allowed:
   - build
   - `docker compose up`
   - inspect logs
   - `docker compose down` without `-v`
15. Finish with a Thai summary explaining:
   - files created/changed
   - reasons for each change
   - tests performed and results
   - tasks the user must do manually
   - commands appropriate for the user's shell

## Initial Analysis

Before changing anything, inspect the repository and determine:

### Environment
- OS and shell if discoverable
- PowerShell / CMD / Git Bash / macOS / Linux

### Project
- stack and versions
- package manager
- project structure
- monorepo or separated frontend/backend
- existing ports
- existing Docker files
- existing CI/CD files
- existing deployment configuration

If Docker/CI files already exist, extend or adapt them instead of blindly replacing them.

### Database
- database type
- ORM/database library
- migration tool
- seed mechanism
- existing migration files

### Frontend build variables
Check for variables embedded during frontend builds, such as:
- `VITE_*`
- `NEXT_PUBLIC_*`
- `REACT_APP_*`

### Quality checks
Identify existing:
- tests
- lint
- build checks

### Deployment information that must be confirmed with the user
Ask for or confirm:
- GitHub username/repository
- domain or subdomain
- existing VPS app ports
- existing VPS folders
- existing domains
- any resources that must not conflict with this application

Do not guess these values.

## Target Architecture

Use this target flow unless the repository requires a justified variation:

```text
git push (main)
    ↓
CI: test + docker build
    ↓
Build image
    ↓
GHCR (Private)
    ├── latest
    └── sha-xxxxxxx
    ↓
VPS
    ↓
docker compose pull + up -d
    ↓
health check

Internet
    ↓
Nginx + HTTPS
    ↓
127.0.0.1:<APP_PORT>
    ↓
container app
    ↓
database
```

## Required Repository Results

### Application

The application should have a health endpoint that:

- checks the real database connection
- returns HTTP 200 when ready
- returns HTTP 503 when the database is unavailable
- does not crash the application when the database is down

The application should:

- read database and port configuration from environment variables
- listen on `0.0.0.0` inside the container
- build without requiring a live database connection
- build without real secrets

Provide `.env.example` containing example values only.

Ensure `.gitignore` prevents `.env` from being committed.

### Docker

Provide or adapt:

- `Dockerfile`
- `.dockerignore`
- `docker-compose.yml`
- `docker-compose.override.yml` when appropriate

Dockerfile requirements:

- use a multi-stage build when appropriate
- keep the runtime image small
- run as a non-root user
- include a `HEALTHCHECK`

If migrations exist:

- use a separate migration image/stage when appropriate
- migration should run and exit successfully
- seeds must be safe to run repeatedly

`.dockerignore` must prevent `.env*` and other unnecessary files from entering the build context.

Compose requirements:

- usable locally and on VPS
- database has a healthcheck
- database uses a named volume
- database is not exposed publicly on VPS
- startup order is:
  `db → migrate → app`
- application image comes from `APP_IMAGE`
- migration image comes from `MIGRATOR_IMAGE` when migrations exist
- host application port comes from `APP_PORT`
- development database port belongs in `docker-compose.override.yml`

Do not remove existing migrations or volumes.

## CI/CD

### CI

Create or adapt:

```text
.github/workflows/ci.yml
```

Workflow name:

```text
CI
```

It should:

- run the project's existing tests when available
- run existing lint checks when available
- verify Docker can build
- avoid requiring a live production database
- avoid requiring real secrets

### CD

Create or adapt:

```text
.github/workflows/deploy.yml
```

Requirements:

- run after CI passes on `main`
- allow manual execution
- build Docker image
- push image to GHCR using `GITHUB_TOKEN`
- publish both:
  - `latest`
  - `sha-xxxxxxx`
- deploy through SSH using GitHub Secrets
- use:
  - `VPS_HOST`
  - `VPS_USER`
  - `VPS_SSH_KEY`
- deploy to the app's own VPS directory
- perform a health check after deployment
- deployment should be skippable when VPS configuration/secrets are not yet configured

Frontend build-time variables must be passed as build arguments when required by the project.

## VPS Files

Provide deployment files/instructions where appropriate:

```text
deploy/
├── make-env.sh
└── nginx.conf
```

Requirements:

- `.env` on VPS should be generated/created without putting real secrets into Git
- password generation should avoid requiring the user to type secrets manually where the guideline supports it
- `APP_PORT` should bind to `127.0.0.1`
- Nginx config should act as a reverse proxy for this application's domain

Never SSH to the VPS yourself.

## Safety Checks

Before finishing, verify:

- `docker compose up --build -d` works
- app becomes healthy
- database becomes healthy
- migration exits with code 0 when migrations exist
- health endpoint returns 200 normally
- after `docker compose stop db`, health endpoint returns 503
- after `docker compose start db`, health returns 200 again
- `.env` is not tracked by Git
- `.env` is not included in the Docker image
- containers run as non-root where required
- no existing migration was deleted
- no Docker volume was deleted
- no real secrets were added
- VPS port/folder/domain conflicts have been identified or explicitly left for the user to verify

## Implementation Procedure

Always follow this sequence:

### Phase 1 — Analyze
Inspect the repository and summarize the current architecture.

### Phase 2 — Plan
Create a concrete implementation plan listing every file that would be created or changed.

Do not implement significant changes yet.

### Phase 3 — Wait
Ask the user to confirm the plan.

### Phase 4 — Implement
After confirmation:
- make the minimum required changes
- preserve existing business logic
- preserve migrations and data-related configuration
- explain important decisions in Thai

### Phase 5 — Test
Run local checks that are safe and available.

Never:
```bash
docker compose down -v
git push
```

### Phase 6 — Report
Provide a Thai final report with:

1. Files created
2. Files modified
3. Why each file changed
4. Tests executed and results
5. Remaining limitations
6. Exact manual steps for the user
7. Exact commands for the user's shell
8. GitHub Secrets required
9. VPS/DNS/Nginx/HTTPS tasks that the user must perform

## Important Constraint

Do not blindly copy the example repository or assume its stack.

The reference project is only a guideline/example. Adapt the deployment design to the actual repository.

Reference:
https://github.com/suriyapi/nextjs-crud-starter

## User Interaction

Use Thai for explanations unless the user explicitly asks for another language.

When uncertain about architecture, database changes, service separation, ports, domain names, or other major decisions:
- explain the uncertainty
- propose options
- ask the user to choose
- do not silently decide

## Source Guideline

The repository's `DEPLOY_GUIDE.md` is the authoritative guideline for this task. Read it before starting implementation and follow it together with the rules in this agent file.
