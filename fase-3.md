# Fase 3 — Echte Data

## Doel

De app toont echte, actuele events uit Amsterdam in plaats van alleen seed data.

## Wat

- Een serverless function (`/api`) die events scrapt van een externe bron
- De frontend haalt data op van deze endpoint
- Opgehaalde events worden opgeslagen in localStorage als cache
- Bij een verse load: probeer nieuwe data op te halen, val terug op cache
- Seed data blijft als ultieme fallback (als zowel API als cache leeg zijn)
- Scraped events integreren naadloos met het bestaande datamodel

## Waarom serverless

Scraping vanuit de browser is geblokkeerd door CORS. Een Vercel serverless function is een simpel JS-bestand in de `/api` map — geen build tools, geen framework, past bij de constraints.

## Klaar wanneer

De app toont echte events uit Amsterdam. Als de scraper faalt, werkt de app nog steeds met gecachte of seed data. De gebruiker merkt geen verschil in ervaring.

## Commit

Na deze fase: commit met werkende scraper + data-integratie.
