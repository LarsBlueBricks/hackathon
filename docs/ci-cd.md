# GitHub Actions CI/CD

## Workflows

| Workflow | Trigger | Bestand |
|----------|---------|---------|
| CI | PR + push naar develop/staging/main | `.github/workflows/ci.yml` |
| Deploy Staging | Na CI success op staging | `.github/workflows/deploy-staging.yml` |
| Deploy Production | Na CI success op main | `.github/workflows/deploy-production.yml` |

## Pipeline Volgorde

1. **Security check** — controleert op gecompromitteerde packages
2. **Backend + Frontend** (parallel) — install, audit, typecheck, lint, build, test
3. **Deploy** — automatisch na succesvolle CI op `staging` of `main` (via `workflow_run`)

## Setup

### GitHub Environments

Maak twee environments aan in GitHub Settings > Environments:

1. **staging** — geen extra beperkingen
2. **production** — met "Required reviewers" ingesteld

### Secrets

Configureer op repository of organisatie level:

| Secret | Environment | Beschrijving |
|--------|-------------|--------------|
| `DO_APP_NAME` | staging, production | DigitalOcean App Platform naam |
| `DO_ACCESS_TOKEN` | staging, production | DigitalOcean API token |

### Dependabot

Dependabot is geconfigureerd in `.github/dependabot.yml` en maakt wekelijks PRs voor:
- Backend npm dependencies
- Frontend npm dependencies
- GitHub Actions versies

PRs worden aangemaakt richting `develop` branch.

### CODEOWNERS

`.github/CODEOWNERS` definieert verplichte reviewers per pad.
Pas de team-namen (`@bluebricks-nl/developers`, `@bluebricks-nl/leads`) aan naar je eigen GitHub organisatie.

### Branch Protection Rules

Stel branch protection in voor `main`, `staging` en `develop`:
- Require pull request reviews
- Require status checks (CI) to pass
- Require branches to be up to date
- Include CODEOWNERS review
