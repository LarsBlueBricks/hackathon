# Blue Bricks Project

> **Stack versie:** 2.5 | **Laatst bijgewerkt:** Februari 2026

Blue Bricks bouwt webapplicaties met een vaste, bewezen stack. Dit is het standaard-template. Bij conflicten tussen documenten geldt altijd CLAUDE.md.

## Tech Stack

| Laag          | Technologie                               |
| ------------- | ----------------------------------------- |
| Frontend      | React 19 + TypeScript 5 + Vite 7          |
| Styling       | Tailwind CSS 4 + shadcn/ui                |
| Backend       | Node.js 22 LTS + Express 5 + TypeScript 5 |
| Database      | PostgreSQL 17+ + Prisma 7                 |
| Authenticatie | Supabase Auth (standalone)                |
| Testing       | Vitest + Testing Library                  |

Commands, conventies en MCP setup staan in `.claude/rules/` (auto-loaded).

## Strikte Regels

- **Strict TypeScript:** geen `any`, geen `@ts-ignore`, geen `var`
- **Prisma only:** geen raw SQL queries
- **Geen secrets in code:** alle credentials via `.env`
- **Tailwind only:** geen CSS/SCSS bestanden, geen aparte stylesheets
- **Exacte versies:** geen caret (^) dependencies zonder reden
- **Geen verboden libraries:** geen moment, lodash, jquery, async, underscore, request, Bluebird, Q, requirejs, Backbone — gebruik native ES2023+ of date-fns
- **Geen `console.log`:** alleen `console.warn` en `console.error`
- **Lockfile check:** run `npm run security:check` bij nieuwe packages

## Ask Before Acting

Vraag de developer voordat je:

- Een nieuwe npm package installeert
- Afwijkt van de folder structuur
- Raw SQL queries schrijft
- Een nieuw API response format introduceert
- Security middleware aanpast of verwijdert
- TypeScript strict mode uitschakelt
- ESLint regels disabled

## Plan Mode

Gebruik ALTIJD plan mode (Shift+Tab 2x) voor taken die meer dan 2 bestanden raken.
Start in plan mode, laat de developer het plan goedkeuren, implementeer daarna.
Zie `.claude/rules/workflow-orchestration.md` voor uitgebreide orchestratie regels.

## Self-Improvement

Na ELKE correctie van de developer: reflecteer op de fout, abstraheer de learning, en schrijf het naar `tasks/lessons.md`. Lees dit bestand aan het begin van elke sessie.

## Git Workflow

```
feature/* → develop → staging → main
hotfix/*  → main (+ cherry-pick naar develop)
```

Branches `main`, `staging` en `develop` zijn protected en vereisen PR + review.

## Slash Commands

| Command               | Beschrijving                                                                          |
| --------------------- | ------------------------------------------------------------------------------------- |
| `/commit`             | Slimme commit check (test artifacts, debug code, TODOs) + conventional commit message |
| `/pr`                 | Checks runnen, PR beschrijving schrijven, PR aanmaken via `gh`                        |
| `/catchup`            | Git status + changes samenvatten na `/clear`                                          |
| `/fix <beschrijving>` | Gestructureerd debuggen: analyseer, fix en verifieer                                  |
| `/scaffold <feature>` | Volledige feature boilerplate genereren (backend + frontend + tests)                  |

## Documentatie

```
CLAUDE.md (dit bestand)     ← Kernregels en routing
WORKFLOW.md                 ← Werkwijze en prompts
spec.md (per project)       ← Project-specifieke specs
tasks/lessons.md            ← Learnings per project (groeit automatisch)
.claude/rules/              ← Conventies, commands, workflow, MCP setup (auto-loaded)
.claude/skills/             ← Auto-invoked implementatiepatronen
.mcp.json                   ← MCP server configuratie
docs/ci-cd.md               ← GitHub Actions pipelines
```

## Compaction

When compacting, always preserve: the full list of modified files, the current git branch, any failing test commands, the active task from spec.md, and recent learnings from tasks/lessons.md.
