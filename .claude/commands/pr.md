# Pull Request Voorbereiden

Bereid een pull request voor: run alle checks, schrijf een PR beschrijving en maak de PR aan.

## Stappen

### 1. Bepaal de context

- Welke branch zit je op? (`git branch --show-current`)
- Wat is de base branch? (meestal `develop`, anders `main`)
- Zijn er uncommitted changes? Zo ja, meld dit — die moeten eerst gecommit worden
- Hoeveel commits zitten er op deze branch? (`git log <base>..HEAD --oneline`)

### 2. Run alle verplichte checks

Run de checks in de juiste directory (backend/, frontend/, of beide — afhankelijk van welke bestanden gewijzigd zijn):

```bash
npm run typecheck   # MOET slagen
npm run lint        # MOET slagen
npm run build       # MOET slagen
npm run test:run    # MOET slagen
```

**Als een check faalt:** Fix het probleem, commit de fix, en run de checks opnieuw. Ga pas door als alles slaagt.

### 3. Analyseer de wijzigingen

Lees alle commits op de branch:
- `git log <base>..HEAD` voor commit messages
- `git diff <base>..HEAD` voor de volledige diff

Begrijp de scope: is dit een feature, bugfix, refactor, of iets anders?

### 4. Push naar remote

Als de branch nog niet remote bestaat:
```bash
git push -u origin <branch-naam>
```

Anders:
```bash
git push
```

### 5. Schrijf de PR beschrijving

Gebruik dit format:

```markdown
## Summary
- [1-3 bullets die de kern van de wijziging beschrijven]

## Changes
- [Per module/bestand wat er gewijzigd is]

## Test plan
- [ ] [Automated tests die de wijzigingen dekken]
- [ ] [Handmatige test stappen]
```

### 6. Maak de PR aan

```bash
gh pr create --title "<type>(<scope>): <beschrijving>" --body "<beschrijving>" --base <base-branch>
```

De PR title volgt hetzelfde conventional commit format als commits.

Geef de PR URL terug aan de gebruiker.
