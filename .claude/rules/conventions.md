# Blue Bricks Conventies

## API

- Routes: `GET|POST|PUT|PATCH|DELETE /api/[resource]/:id`
- Success: `res.json({ data: { ... } })`
- Error: `res.status(4xx).json({ error: { code: 'SCREAMING_SNAKE', message: '...' } })`
- Status codes: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 429 Rate Limit, 500 Server Error
- HTTP client: axios (niet fetch)
- Validatie: Zod schemas, types afleiden met `z.infer<typeof schema>`

## Folder Structuur

- Frontend: `components/` (ui/, [feature]/), `pages/`, `hooks/`, `context/`, `services/`, `utils/`, `types/`, `styles/`
- Backend: `config/`, `middleware/` (auth, errorHandler, rateLimit), `routes/`, `services/`, `utils/`, `types/`
- Tests naast de code: `*.test.ts`, niet in `__tests__/`
- shadcn/ui in `components/ui/` — NIET handmatig aanpassen

## Code Style

- Import volgorde: 1) React/extern 2) Intern via `@/` 3) Types 4) Relatief
- Named exports voor componenten, default exports alleen voor pages
- Props interface direct boven component
- Functionele componenten (geen class components)

## Auth

- Supabase Auth standalone (niet als database)
- Frontend: direct naar Supabase voor login/signup/logout
- Backend: JWT middleware valideert tokens via SUPABASE_JWT_SECRET

## Environment Variables

- Frontend env vars beginnen met `VITE_`
- `.env` in `.gitignore`, `.env.example` committen (zonder echte waarden)
