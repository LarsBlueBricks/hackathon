# Workflow — Ontwikkelproces met Claude Code

> Dit document beschrijft de werkwijze bij het bouwen van features. Zie `CLAUDE.md` voor de technische stack en regels.

## Per Feature Cyclus

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ 1. Code  │───▶│ 2. Tests │───▶│ 3. Checks│───▶│ 4. Hand- │───▶│ 5. Commit│───▶│ 6. PR    │───▶│ 7. Review│───▶│ 8. Merge │
│ schrijven│    │ schrijven│    │ runnen   │    │ matig    │    │ + push   │    │ aanmaken │    │ + fixes  │    │          │
└──────────┘    └──────────┘    └──────────┘    │ testen   │    └──────────┘    └──────────┘    └──────────┘    └──────────┘
                                                └──────────┘
                                                     │
                                                bugs? ──▶ terug naar stap 1
```

1. **Code schrijven** → Claude Code implementeert de feature
2. **Tests schrijven** → Tests naast de code (`*.test.ts`)
3. **Checks runnen** → typecheck, lint, build, tests (zie "Checks" sectie)
4. **Handmatig testen** → Ontwikkelaar test op localhost of de feature werkt zoals verwacht. Bugs gevonden? Terug naar stap 1
5. **Commit + push** → Feature branch aanmaken, committen, pushen
6. **PR aanmaken** → PR naar main/develop met summary en test plan
7. **Review + fixes** → Agent team reviewt de PR op security, performance en conformance. Fixes worden als follow-up commits op de PR branch gepusht
8. **Merge** → Na goedkeuring mergen

### Waarom review NA de PR?

- Je reviewt exact wat er gemerged gaat worden
- Findings zijn traceerbaar als PR comments of follow-up commits
- Fixes op dezelfde branch houden de audit trail compleet
- Als fixes weer issues introduceren, vang je dat in een re-review

## Review met Agent Team

Voor uitgebreide reviews gebruik de ingebouwde agents:

```
Start een review team op voor de PR:
- Code reviewer: code kwaliteit, patronen, Blue Bricks conventies
- Security auditor: auth, injection, SSRF, secrets, AVG/BIO compliance
```

Optioneel na de review:

- **Test writer**: schrijf ontbrekende tests bij
- **Debugger**: analyseer fouten met root cause rapport
- **Docs writer**: update documentatie bij nieuwe features

Het team levert een rapport per severity (CRITICAL, HIGH, MEDIUM, LOW). Findings worden daarna gefixed door een fix team met gescheiden bestanden per agent (geen merge conflicten).

**Review → Fix flow:**

1. Review team identificeert findings met severity
2. CRITICAL/HIGH: blokkeren merge, moeten gefixed worden
3. MEDIUM: aanbevolen voor merge
4. LOW: backlog
5. Fix team lost findings op, typecheck + tests moeten slagen
6. Follow-up commit(s) op dezelfde PR branch

## Claude Code Prompts

### Implementeren

```
Implementeer [feature/fix beschrijving].
Volg de bestaande code patterns in het project.
```

### Tests Schrijven

```
Schrijf tests voor de wijzigingen op deze branch:
1. Unit/integration tests voor nieuwe of gewijzigde functionaliteit
2. Plaats tests naast de code (bijv. `distanceCalculator.test.ts`)
3. Run de tests en fix eventuele failures

Focus op business logic en edge cases, skip triviale code.
```

### PR Review (na PR aanmaken)

```
Review PR #[nummer] met de code-reviewer en security-auditor agents.
Lever een rapport per agent met severity (CRITICAL/HIGH/MEDIUM/LOW).
```

### Review Fixes

```
Fix alle HIGH/CRITICAL findings uit de review.
Verdeel over agents per bestandsgroep om conflicten te voorkomen.
Run typecheck en tests na afloop.
```

## Context Management

- Gebruik `/clear` tussen verschillende taken om het contextvenster schoon te houden
- Scope een chat naar één feature of fix
- Bij complexe taken: laat Claude een plan maken in Plan Mode (Shift+Tab 2x) voordat je implementeert
- Gebruik subagents voor onderzoek: "use a subagent to investigate how [X] works in our codebase"
- Na correcties: Claude schrijft automatisch learnings naar `tasks/lessons.md`
- Bij sessiestart: Claude leest `tasks/lessons.md` om eerder gemaakte fouten te voorkomen

## Checks

```bash
npm run typecheck   # MOET slagen
npm run lint        # MOET slagen
npm run build       # MOET slagen
npm run test:run    # MOET slagen
```
