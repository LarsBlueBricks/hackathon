# Blue Bricks Project Template

Standaard template voor Blue Bricks webapplicaties. Bevat documentatie, Claude Code configuratie en workflow beschrijvingen.

## Tech Stack

| Laag | Technologie |
|------|-------------|
| Frontend | React 19 + TypeScript 5 + Vite 7 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Backend | Node.js 22 LTS + Express 5 + TypeScript 5 |
| Database | PostgreSQL 17+ + Prisma 7 |
| Authenticatie | Supabase Auth (standalone) |
| Testing | Vitest + Testing Library |

## Prerequisites

- **Node.js 22 LTS** — [nodejs.org](https://nodejs.org/)
- **npm** — meegeleverd met Node.js
- **Git** — [git-scm.com](https://git-scm.com/)
- **PostgreSQL 17+** — [postgresql.org](https://www.postgresql.org/)
- **gh CLI** (optioneel) — [cli.github.com](https://cli.github.com/) — nodig voor `/pr` command

## Gebruik als Template

### 1. Repository aanmaken

Klik op **"Use this template"** in GitHub en kies een naam voor je nieuwe repository.

### 2. Clone en setup

```bash
git clone git@github.com:bluebricks-nl/<project-naam>.git
cd <project-naam>
bash scripts/setup.sh
```

Het setup script:
- Checkt prerequisites (Node.js, npm, git)
- Maakt de `backend/` en `frontend/` projectstructuur aan
- Initialiseert `package.json` met de juiste scripts
- Kopieert `.env.example` naar `.env` bestanden
- Maakt hook scripts executable
- Print een checklist voor handmatige configuratie (GitHub, Supabase, DigitalOcean)

### 3. Configureer environment

Vul de `.env` bestanden in met je project-specifieke waarden:
- `backend/.env` — database, Supabase server-side keys
- `frontend/.env` — Supabase client-side keys, API URL

Zie `.env.example` voor alle benodigde variabelen.

### 4. Installeer dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

## Documentatie

| Bestand | Beschrijving |
|---------|--------------|
| [CLAUDE.md](CLAUDE.md) | Kernregels en tech stack |
| [WORKFLOW.md](WORKFLOW.md) | Ontwikkelproces met Claude Code |
| [docs/](docs/) | Gedetailleerde conventies per domein |
| [.env.example](.env.example) | Alle environment variabelen |

### Docs

- [CI/CD](docs/ci-cd.md) — GitHub Actions pipelines

## Claude Code Configuratie

De `.claude/` directory bevat project-specifieke configuratie voor Claude Code:

- **settings.json** — Toestemmingen en hook configuratie
- **commands/** — Slash commands (`/commit`, `/pr`, `/catchup`, `/fix`, `/scaffold`)
- **agents/** — Custom subagent definities (code-reviewer, security-auditor, test-writer, debugger, docs-writer)
- **skills/** — Auto-invoked implementatiepatronen (22 skills)
- **hooks/** — Pre-commit guard en Prettier auto-formatter

## Git Workflow

```
feature/* → develop → staging → main
```

Branches `main`, `staging` en `develop` zijn protected en vereisen PR + review.
