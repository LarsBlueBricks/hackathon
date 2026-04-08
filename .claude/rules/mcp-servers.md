# MCP Servers

MCP servers zijn geconfigureerd in `.mcp.json` en worden automatisch beschikbaar bij het klonen van dit project.

| Server       | Type       | Doel                                     | Setup                                  |
| ------------ | ---------- | ---------------------------------------- | -------------------------------------- |
| Supabase     | HTTP/OAuth | Auth config, users, database queries     | Login via `/mcp` in Claude Code        |
| Sentry       | HTTP/OAuth | Error monitoring, issues bekijken        | Login via `/mcp` in Claude Code        |
| PostgreSQL   | stdio      | Direct database access, schema inspectie | Zet `DATABASE_URL` in `.env`           |
| DigitalOcean | stdio      | Apps, databases, droplets beheren        | Zet `DIGITALOCEAN_API_TOKEN` in `.env` |

## Eerste keer setup

1. Start Claude Code in het project
2. Run `/mcp` om de servers te activeren
3. Supabase en Sentry: login via browser (OAuth)
4. PostgreSQL: zorg dat `DATABASE_URL` in je `.env` staat
5. DigitalOcean: zorg dat `DIGITALOCEAN_API_TOKEN` in je `.env` staat
