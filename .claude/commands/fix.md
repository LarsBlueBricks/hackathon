# Fix — Gestructureerd Debuggen en Fixen

Neem de foutbeschrijving hieronder als uitgangspunt en volg een gestructureerd debug-proces: analyseer de error, vind de root cause, implementeer een oplossing en verifieer dat het werkt.

**Foutbeschrijving:** $ARGUMENTS

## Stappen

### 1. Analyseer de error

- Als het een error message of stack trace is: zoek de exacte locatie in de codebase via grep
- Als het een beschrijving is: zoek naar relevante bestanden en functies
- Als het een issue-nummer is: lees de issue details

Bepaal welke laag het probleem zit:
- **Frontend:** React component, hook, state, routing
- **Backend:** Express route, middleware, service, Prisma query
- **Database:** Schema, migratie, relaties, constraints
- **Auth:** Supabase tokens, JWT validatie, RLS policies
- **Build:** TypeScript, Vite config, dependencies

### 2. Diagnose

Volg de data flow door de code:
1. Lees de relevante bestanden en begrijp de huidige implementatie
2. Identificeer waar het misgaat — vergelijk verwacht gedrag met werkelijk gedrag
3. Check imports, dependencies en configuratie
4. Vergelijk met de Blue Bricks patronen uit CLAUDE.md

Formuleer een hypothese over de root cause met bewijs uit de code.

### 3. Verificeer de hypothese

Run relevante checks om de hypothese te bevestigen:
- `npm run typecheck` — bij TypeScript fouten
- `npm run test:run` — bij falende tests of regressies
- `npm run lint` — bij code style issues
- `npx prisma validate` — bij database/schema issues

### 4. Implementeer de fix

Fix het probleem. Volg hierbij de Blue Bricks conventies:
- TypeScript strict (geen `any`, geen `@ts-ignore`)
- Prisma voor database queries (geen raw SQL)
- Zod voor input validatie
- `console.warn`/`console.error` (geen `console.log`)
- Tests naast de code (`*.test.ts`)

Als de fix meerdere bestanden raakt, leg kort uit waarom elke wijziging nodig is.

### 5. Verifieer de fix

Run alle relevante checks:
```bash
npm run typecheck   # Moet slagen
npm run lint        # Moet slagen
npm run test:run    # Moet slagen
```

Als een bestaande test faalt door de fix, update de test als het verwachte gedrag is veranderd. Voeg een nieuwe test toe als de bug nog niet gedekt was.

### 6. Rapporteer

Geef een korte samenvatting:
```
## Fix: [korte beschrijving]

**Root cause:** [wat het probleem veroorzaakte]
**Oplossing:** [wat je veranderd hebt]
**Verificatie:** [welke checks zijn geslaagd]
**Gewijzigde bestanden:** [lijst]
```
