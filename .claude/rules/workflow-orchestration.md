# Workflow Orchestration

## Plan Mode

- Verplicht voor taken met 3+ stappen of architectuurbeslissingen
- Itereer op het plan tot de developer het goedkeurt, dan pas implementeren
- Als iets misgaat: STOP en re-plan — niet doorduwen op een falende aanpak
- Na 2 mislukte correcties: `/clear` en herstart met een betere prompt
- Skip planning voor triviale taken (typo, rename, 1-file fix)

## Subagent Strategie

- Gebruik subagents voor onderzoek — houdt de hoofdcontext schoon
- Eén taak per subagent voor gefocuste uitvoering
- Parallelliseer onafhankelijke onderzoekstaken
- Gebruik voor: codebase exploratie, code reviews, complexe analyse
- Subagent resultaten samenvatten, niet 1-op-1 doorsturen

## Verificatie

- NOOIT een taak als klaar markeren zonder bewijs dat het werkt
- Run altijd relevante checks: `npm run typecheck`, `npm run lint`, `npm run test:run`
- Diff gedrag tussen voor en na je wijzigingen wanneer relevant
- Vraag jezelf: "Zou een senior engineer dit goedkeuren?"
- Bij UI changes: beschrijf wat er visueel veranderd is

## Autonoom Werken

- Bij een bug report: analyseer en fix direct, niet vragen "wat wil je dat ik doe?"
- Wijs naar logs, errors, failing tests — los ze op
- Minimale context-switching voor de developer
- Bij failing CI: ga fixen zonder dat het gevraagd wordt
- Gebruik `/fix` voor gestructureerd debuggen bij complexe bugs

## Core Principles

- **Simpliciteit**: maak elke wijziging zo simpel mogelijk, impact minimale code
- **Root Causes**: vind de echte oorzaak, geen tijdelijke fixes of workarounds
- **Minimal Impact**: raak alleen aan wat nodig is, vermijd het introduceren van bugs
- **Elegantie (gebalanceerd)**: pauzeer bij non-triviale changes en vraag "is er een elegantere oplossing?" — maar over-engineer niet voor simpele fixes

## Self-Improvement

- Na ELKE correctie van de developer: reflecteer, abstraheer, en schrijf de learning naar `tasks/lessons.md`
- Lees `tasks/lessons.md` aan het begin van elke sessie
- Herhaal geen fouten die al in lessons staan
