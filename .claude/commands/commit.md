# Slimme Commit

Analyseer de staged changes en maak een commit. Je checkt op problemen die een linter niet vangt — typecheck, lint en supply chain worden al afgehandeld door de pre-commit hook.

## Stappen

### 1. Bekijk wat er gecommit wordt

Run `git diff --staged` om alle staged changes te zien. Als er niets staged is, run `git diff` en meld dat er eerst changes gestaged moeten worden.

### 2. Analyseer op problemen

Scan de staged changes op deze categorieeen. Dit zijn zaken die alleen een LLM kan detecteren:

**Test artifacts in productie code:**
- `test.only`, `describe.only`, `it.only`, `.skip` — vergeten test focus/skip flags
- `vi.mock` of `vi.fn()` in niet-test bestanden
- Hardcoded test data in productie code (fake emails zoals `test@test.com`, `user123`, `localhost:` URLs, `example.com`)

**Debug rommel:**
- `console.log` statements (verboden per CLAUDE.md — alleen `console.warn` en `console.error` zijn toegestaan)
- `debugger` statements
- `alert()` calls
- Uitgecommente code blokken (meer dan 2 aaneengesloten regels)

**Markers en TODOs:**
- `TODO`, `FIXME`, `HACK`, `XXX` markers in nieuw toegevoegde regels
- Tijdelijke workarounds zonder context

**Mogelijke secrets:**
- Strings die eruitzien als API keys, tokens of passwords (lange hex/base64 strings)
- Hardcoded connection strings of URLs met credentials

**Onbedoelde bestanden:**
- `.env` bestanden, `node_modules`, build artifacts, `.DS_Store`

### 3. Rapporteer of ga door

**Als er problemen zijn:**
Rapporteer elk probleem met:
- Bestand en regelnummer
- Wat het probleem is
- Een suggestie om het te fixen

Vraag de gebruiker: "Wil je dat ik deze issues fix voordat we committen?"

**Als alles schoon is:** Ga door naar stap 4.

### 4. Schrijf een commit message

Analyseer de inhoud van de changes en schrijf een conventional commit message:

```
<type>(<scope>): <korte beschrijving in het Engels>

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`
**Scope:** de module of feature die geraakt wordt (bijv. `auth`, `users`, `api`)

De beschrijving moet:
- In het Engels zijn
- Uitleggen WAT er veranderd is en WAAROM
- Maximaal 72 karakters op de eerste regel

### 5. Commit

Voer de commit uit met de geschreven message. De pre-commit hook zal automatisch typecheck, lint en supply chain checks draaien.
