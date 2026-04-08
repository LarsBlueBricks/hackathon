# Catchup — Laad de huidige context

Lees alle relevante git state en geef een beknopte samenvatting zodat je direct weer productief kunt werken. Dit command wijzigt NIETS — het is puur informatief.

Ideaal na `/clear` wanneer je context window vol raakt en je een schone sessie start.

## Verzamel de volgende informatie

### 1. Branch en status

- Huidige branch (`git branch --show-current`)
- Hoe ver voor/achter remote (`git status -sb`)
- Actieve branch in relatie tot de workflow (`feature/*`, `develop`, `staging`, `main`)

### 2. Uncommitted changes

- Staged changes: `git diff --staged --stat` (en lees de inhoud met `git diff --staged`)
- Unstaged changes: `git diff --stat` (en lees de inhoud met `git diff`)
- Untracked bestanden: `git ls-files --others --exclude-standard`

### 3. Recente commits

- Laatste 10 commits op de huidige branch: `git log --oneline -10`
- Als je op een feature branch zit: commits sinds de base branch (`git log develop..HEAD --oneline` of `git log main..HEAD --oneline`)

### 4. Lees gewijzigde bestanden

Lees de inhoud van de gewijzigde bestanden (zowel staged als unstaged) om te begrijpen waar aan gewerkt wordt.

## Output

Geef een beknopte samenvatting in dit format:

```
## Catchup: [branch naam]

**Branch:** [naam] — [X commits voor/achter remote]
**Workflow positie:** [feature development / ready for PR / etc.]

### Waar je mee bezig was
[1-3 zinnen over wat de wijzigingen doen, gebaseerd op de code]

### Openstaande wijzigingen
- [X bestanden staged / X unstaged / X untracked]
- [Korte beschrijving per gewijzigd bestand]

### Volgende stap
[Suggestie: verder coderen / tests schrijven / committen / PR maken]
```
