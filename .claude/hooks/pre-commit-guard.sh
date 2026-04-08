#!/bin/bash
# .claude/hooks/pre-commit-guard.sh
# Block-at-submit strategy: laat Claude vrij werken, maar blokkeer commits
# als de checks niet slagen. Dit voorkomt dat Claude "gefrustreerd" raakt
# door mid-plan blokkeringen.

set -euo pipefail

# Lees tool input van stdin
INPUT=$(cat)

# Controleer of dit een git commit command is
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null)

if ! echo "$COMMAND" | grep -q '^git commit'; then
  exit 0
fi

echo "🔍 Pre-commit checks starten..." >&2

ERRORS=""

# Detecteer welke directory we checken (frontend/backend/beide)
STAGED_FILES=$(git diff --cached --name-only 2>/dev/null || true)

CHECK_BACKEND=false
CHECK_FRONTEND=false

if echo "$STAGED_FILES" | grep -q '^backend/'; then
  CHECK_BACKEND=true
fi

if echo "$STAGED_FILES" | grep -q '^frontend/'; then
  CHECK_FRONTEND=true
fi

# Backend checks
if [ "$CHECK_BACKEND" = true ] && [ -f "backend/package.json" ]; then
  echo "  → Backend typecheck..." >&2
  if ! (cd backend && npm run typecheck --silent 2>&1); then
    ERRORS="${ERRORS}\n❌ Backend TypeScript errors gevonden"
  fi

  echo "  → Backend lint..." >&2
  if ! (cd backend && npm run lint --silent 2>&1); then
    ERRORS="${ERRORS}\n❌ Backend lint errors gevonden"
  fi
fi

# Frontend checks
if [ "$CHECK_FRONTEND" = true ] && [ -f "frontend/package.json" ]; then
  echo "  → Frontend typecheck..." >&2
  if ! (cd frontend && npm run typecheck --silent 2>&1); then
    ERRORS="${ERRORS}\n❌ Frontend TypeScript errors gevonden"
  fi

  echo "  → Frontend lint..." >&2
  if ! (cd frontend && npm run lint --silent 2>&1); then
    ERRORS="${ERRORS}\n❌ Frontend lint errors gevonden"
  fi
fi

# Supply chain check
COMPROMISED="chalk@5\.6\.1|debug@4\.4\.2|ansi-styles@6\.2\.2|supports-color@10\.2\.1|strip-ansi@7\.1\.1|color@5\.0\.1|color-convert@3\.1\.1|color-name@2\.0\.1|color-string@2\.1\.1|duckdb@1\.3\.3"

if [ -f "backend/package-lock.json" ]; then
  if grep -qE "$COMPROMISED" backend/package-lock.json 2>/dev/null; then
    ERRORS="${ERRORS}\n🚨 Gecompromitteerde packages gevonden in backend lockfile!"
  fi
fi

if [ -f "frontend/package-lock.json" ]; then
  if grep -qE "$COMPROMISED" frontend/package-lock.json 2>/dev/null; then
    ERRORS="${ERRORS}\n🚨 Gecompromitteerde packages gevonden in frontend lockfile!"
  fi
fi

# Als er errors zijn, blokkeer de commit (exit code 2)
if [ -n "$ERRORS" ]; then
  echo -e "\n⛔ Commit geblokkeerd. Fix deze problemen eerst:${ERRORS}" >&2
  echo -e "\nRun 'npm run typecheck' en 'npm run lint' om de fouten te zien." >&2
  exit 2
fi

echo "✅ Alle pre-commit checks geslaagd" >&2
exit 0
