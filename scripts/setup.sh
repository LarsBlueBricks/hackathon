#!/bin/bash
# ===========================================
# Blue Bricks — Project Setup Script
# ===========================================
# Gebruik: bash scripts/setup.sh
#
# Dit script configureert een nieuw project vanuit het Blue Bricks template.
# Het maakt de projectstructuur aan, initialiseert packages en zet
# environment bestanden klaar.
#
# Toekomstige uitbreidingen:
# - GitHub repository + branch protection + environments
# - Supabase project aanmaken + keys ophalen
# - DigitalOcean App Platform configureren
# - Database provisioning

set -euo pipefail

# -------------------------------------------
# Kleuren en helpers
# -------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

info()  { echo -e "  ${BLUE}→${NC} $1"; }
ok()    { echo -e "  ${GREEN}✓${NC} $1"; }
warn()  { echo -e "  ${YELLOW}⚠${NC} $1"; }
fail()  { echo -e "  ${RED}✗${NC} $1"; }

PROJECT_ROOT=$(cd "$(dirname "$0")/.." && pwd)

echo ""
echo -e "${BOLD}🏗️  Blue Bricks — Project Setup${NC}"
echo "=================================="

# -------------------------------------------
# 1. Prerequisites checken
# -------------------------------------------
echo ""
echo -e "${BOLD}📋 Prerequisites${NC}"

MISSING=false

check_command() {
  if command -v "$1" &>/dev/null; then
    ok "$1 gevonden: $($1 --version 2>&1 | head -1)"
  else
    fail "$1 niet gevonden — installeer dit eerst"
    MISSING=true
  fi
}

check_command node
check_command npm
check_command git

# Optioneel: gh CLI (nodig voor PR workflow)
if command -v gh &>/dev/null; then
  ok "gh CLI gevonden: $(gh --version 2>&1 | head -1)"
else
  warn "gh CLI niet gevonden — optioneel, nodig voor /pr command"
fi

if [ "$MISSING" = true ]; then
  echo ""
  fail "Installeer ontbrekende prerequisites en probeer opnieuw."
  exit 1
fi

# Check Node.js versie
NODE_MAJOR=$(node -v | cut -d. -f1 | tr -d 'v')
if [ "$NODE_MAJOR" -lt 22 ]; then
  warn "Node.js 22 LTS aanbevolen (gevonden: $(node -v))"
else
  ok "Node.js versie OK: $(node -v)"
fi

# -------------------------------------------
# 2. Projectstructuur aanmaken
# -------------------------------------------
echo ""
echo -e "${BOLD}📁 Projectstructuur${NC}"

# Backend directories
mkdir -p "$PROJECT_ROOT/backend/src"/{config,middleware,routes,services,utils,types}
mkdir -p "$PROJECT_ROOT/backend/prisma"
ok "Backend directories aangemaakt"

# Frontend directories
mkdir -p "$PROJECT_ROOT/frontend/src"/{components/ui,pages,hooks,context,services,utils,types,styles}
ok "Frontend directories aangemaakt"

# -------------------------------------------
# 3. Backend initialiseren
# -------------------------------------------
echo ""
echo -e "${BOLD}📦 Backend${NC}"

if [ ! -f "$PROJECT_ROOT/backend/package.json" ]; then
  cd "$PROJECT_ROOT/backend"
  npm init -y > /dev/null 2>&1

  # Standard scripts toevoegen
  node -e "
    const pkg = require('./package.json');
    pkg.scripts = {
      'dev': 'tsx watch src/index.ts',
      'build': 'tsc',
      'start': 'node dist/index.js',
      'typecheck': 'tsc --noEmit',
      'lint': 'eslint src/',
      'lint:fix': 'eslint src/ --fix',
      'test:run': 'vitest run',
      'test:watch': 'vitest',
      'test:coverage': 'vitest run --coverage',
      'security:check': 'node -e \"const fs=require(\\\"fs\\\");const lock=fs.existsSync(\\\"package-lock.json\\\")?fs.readFileSync(\\\"package-lock.json\\\",\\\"utf8\\\"):\\\"\\\";const bad=[\\\"chalk@5.6.1\\\",\\\"debug@4.4.2\\\",\\\"ansi-styles@6.2.2\\\",\\\"supports-color@10.2.1\\\",\\\"strip-ansi@7.1.1\\\"];const found=bad.filter(p=>lock.includes(p));if(found.length){console.error(\\\"COMPROMISED:\\\",found);process.exit(1)}console.log(\\\"CLEAN\\\")\"'
    };
    require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
  "
  ok "Backend package.json aangemaakt met scripts"
else
  warn "Backend package.json bestaat al, overgeslagen"
fi

# -------------------------------------------
# 4. Frontend initialiseren
# -------------------------------------------
echo ""
echo -e "${BOLD}📦 Frontend${NC}"

if [ ! -f "$PROJECT_ROOT/frontend/package.json" ]; then
  cd "$PROJECT_ROOT/frontend"
  npm init -y > /dev/null 2>&1

  node -e "
    const pkg = require('./package.json');
    pkg.scripts = {
      'dev': 'vite',
      'build': 'tsc -b && vite build',
      'preview': 'vite preview',
      'typecheck': 'tsc --noEmit',
      'lint': 'eslint src/',
      'lint:fix': 'eslint src/ --fix',
      'test:run': 'vitest run',
      'test:watch': 'vitest',
      'test:coverage': 'vitest run --coverage',
      'security:check': 'node -e \"const fs=require(\\\"fs\\\");const lock=fs.existsSync(\\\"package-lock.json\\\")?fs.readFileSync(\\\"package-lock.json\\\",\\\"utf8\\\"):\\\"\\\";const bad=[\\\"chalk@5.6.1\\\",\\\"debug@4.4.2\\\",\\\"ansi-styles@6.2.2\\\",\\\"supports-color@10.2.1\\\",\\\"strip-ansi@7.1.1\\\"];const found=bad.filter(p=>lock.includes(p));if(found.length){console.error(\\\"COMPROMISED:\\\",found);process.exit(1)}console.log(\\\"CLEAN\\\")\"'
    };
    require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
  "
  ok "Frontend package.json aangemaakt met scripts"
else
  warn "Frontend package.json bestaat al, overgeslagen"
fi

# -------------------------------------------
# 5. Environment bestanden
# -------------------------------------------
echo ""
echo -e "${BOLD}🔐 Environment${NC}"

if [ -f "$PROJECT_ROOT/.env.example" ]; then
  for dir in backend frontend; do
    if [ ! -f "$PROJECT_ROOT/$dir/.env" ]; then
      cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/$dir/.env"
      ok "$dir/.env aangemaakt vanuit .env.example"
    else
      warn "$dir/.env bestaat al, overgeslagen"
    fi
  done
else
  warn ".env.example niet gevonden, sla environment setup over"
fi

# -------------------------------------------
# 6. Hook scripts executable maken
# -------------------------------------------
echo ""
echo -e "${BOLD}🔧 Hooks${NC}"

if [ -d "$PROJECT_ROOT/.claude/hooks" ]; then
  chmod +x "$PROJECT_ROOT"/.claude/hooks/*.sh 2>/dev/null || true
  ok "Hook scripts zijn executable"
else
  warn ".claude/hooks/ directory niet gevonden"
fi

# -------------------------------------------
# 7. Git setup
# -------------------------------------------
echo ""
echo -e "${BOLD}🌿 Git${NC}"

cd "$PROJECT_ROOT"

if [ ! -d ".git" ]; then
  git init > /dev/null 2>&1
  git checkout -b main > /dev/null 2>&1
  ok "Git repository geïnitialiseerd op main"
else
  ok "Git repository bestaat al"
  BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
  info "Huidige branch: $BRANCH"
fi

# -------------------------------------------
# Samenvatting
# -------------------------------------------
echo ""
echo "=================================="
echo -e "${GREEN}${BOLD}✅ Basic setup compleet!${NC}"
echo ""
echo -e "${BOLD}Volgende stappen:${NC}"
echo ""
echo "  1. Vul de .env bestanden in met je project configuratie:"
echo "     - backend/.env"
echo "     - frontend/.env"
echo ""
echo "  2. Installeer dependencies (als je de packages kent):"
echo "     cd backend && npm install"
echo "     cd frontend && npm install"
echo ""
echo -e "${BOLD}Handmatige setup (eenmalig per project):${NC}"
echo ""
echo "  GitHub:"
echo "    □ Repository aanmaken via 'Use this template'"
echo "    □ Branch protection rules op main, staging, develop"
echo "      → Require PR reviews"
echo "      → Require status checks (CI)"
echo "      → Include CODEOWNERS review"
echo "    □ Environments aanmaken: 'staging' en 'production'"
echo "      → Production: Required reviewers instellen"
echo "    □ CODEOWNERS team-namen aanpassen in .github/CODEOWNERS"
echo ""
echo "  Supabase:"
echo "    □ Nieuw project aanmaken op supabase.com"
echo "    □ Project URL en anon key → frontend/.env"
echo "    □ JWT secret → backend/.env"
echo "    □ Service role key → backend/.env (NOOIT client-side!)"
echo "    □ RLS policies activeren op alle tabellen"
echo ""
echo "  Database:"
echo "    □ PostgreSQL database aanmaken"
echo "    □ DATABASE_URL invullen in backend/.env"
echo "    □ npx prisma init (in backend/)"
echo "    □ Schema definiëren en npx prisma migrate dev"
echo ""
echo "  DigitalOcean (of andere hosting):"
echo "    □ App Platform app aanmaken"
echo "    □ DO_APP_NAME en DO_ACCESS_TOKEN als GitHub secrets"
echo "    □ Deploy stap configureren in .github/workflows/deploy-*.yml"
echo ""
echo "  Zie docs/ci-cd.md voor gedetailleerde CI/CD instructies."
echo ""
