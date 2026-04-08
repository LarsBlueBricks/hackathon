#!/bin/bash
# .claude/hooks/post-edit-format.sh
# Draait Prettier op elk bestand dat Claude bewerkt.
# Dit is een non-blocking hint hook (exit 0 altijd).

INPUT=$(cat)

# Haal het bestandspad op
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Alleen formatteren voor relevante bestandstypes
if [[ "$FILE_PATH" =~ \.(ts|tsx|js|jsx|json|css|md|html)$ ]]; then
  # Check of prettier beschikbaar is zonder interactieve npx prompt
  if npx --no-install prettier --version &>/dev/null 2>&1; then
    npx prettier --write "$FILE_PATH" 2>/dev/null || true
  fi
fi

exit 0
