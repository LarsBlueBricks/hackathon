# Blue Bricks Commands

```bash
# Development
cd backend && npm run dev       # Start backend
cd frontend && npm run dev      # Start frontend

# Database
npx prisma migrate dev          # Nieuwe migratie
npx prisma generate             # Client regenereren
npx prisma studio               # Database GUI

# Checks (run voor commit!)
npm run typecheck               # TypeScript check — MOET slagen
npm run lint                    # Linting — MOET slagen
npm run build                   # Build — MOET slagen

# Testing
npm run test:run                # Tests (single run)
npm run test:coverage           # Met coverage rapport

# Security
npm run security:check          # Supply chain check
npm audit                       # Kwetsbaarheden
```
