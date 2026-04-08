# Amsterdam Events — Specificatie

## Concept

Een persoonlijke webapp die laat zien welke events er in Amsterdam te doen zijn de komende maand. Events worden automatisch van het web opgehaald, lokaal gecacht, en getoond in een overzichtelijke kalender met zoek- en filterfunctionaliteit.

## Doelgroep

Persoonlijk gebruik — één gebruiker die snel wil zien wat er te doen is in Amsterdam.

## Schermen

### 1. Overzicht (hoofdpagina)

- Maandkalender als primaire weergave
- Elke dag toont het aantal events en/of titels
- Zoekbalk: vrije tekst zoeken door alle events
- Filters: categorie, gratis/betaald, datum
- Klikken op een event opent de detailweergave

### 2. Event Detail

- Titel, datum en tijd, locatie
- Beschrijving
- Categorie-label
- Gratis of prijs
- Link naar de originele bron (externe site)
- Terug-knop naar het overzicht

## Datamodel

Elk event bevat:

| Veld        | Beschrijving                                         |
| ----------- | ---------------------------------------------------- |
| id          | Unieke identifier                                    |
| title       | Naam van het event                                   |
| description | Korte beschrijving                                   |
| date        | Startdatum (ISO)                                     |
| endDate     | Einddatum indien meerdaags (optioneel)               |
| time        | Tijdstip als tekst                                   |
| location    | Locatienaam                                          |
| category    | Eén van: muziek, theater, kunst, food, sport, tech, uitgaan, overig |
| isFree      | Boolean                                              |
| price       | Prijsindicatie als tekst (optioneel)                  |
| imageUrl    | Afbeelding URL (optioneel)                           |
| sourceUrl   | Link naar originele pagina                           |
| source      | Naam van de bron (bijv. "eventbrite")                |

Opslag: localStorage als cache. De serverless function haalt verse data op.

## Scraping

- Minimaal 1 bron volledig werkend
- Serverless function op Vercel (`/api` map) omdat scraping niet vanuit de browser kan (CORS)
- Seed data als fallback zodat de app altijd gevuld is
- Architectuur maakt het makkelijk om later meer bronnen toe te voegen

## Design

- Kleurrijk en playful — Amsterdam-vibe
- Warme tinten (oranje, rood, warm geel)
- Speelse maar leesbare typografie via Google Fonts
- Responsive: werkt op desktop en mobiel

## Tech

- Frontend: HTML + CSS + JS (geen frameworks, geen build tools)
- Backend: Vercel serverless function voor scraping (JS bestand in `/api`)
- Data: localStorage
- Fonts: Google Fonts via CDN
- Deployment: Vercel vanuit GitHub

## MVP vs Nice-to-have

### MVP (moet af in 2 uur)

- [x] Maandkalender met events
- [x] Event detailweergave
- [x] Zoeken op tekst
- [x] Filteren op categorie en gratis/betaald
- [x] 1 werkende scraper
- [x] Seed data als fallback
- [x] Amsterdam-vibe design
- [x] Live op Vercel

### Nice-to-have (als er tijd over is)

- [ ] Week-weergave toggle
- [ ] 2e scraping-bron
- [x] Animaties/transities
- [x] "Vandaag" highlight en quick-jump
- [ ] Event delen (copy link)
