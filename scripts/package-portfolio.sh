#!/bin/bash
# Package the NEON NOIR portfolio as a portable zip for local VS Code development
set -euo pipefail

PROJ=/home/z/my-project
STAGE=$PROJ/scripts/zipstage
OUT=$PROJ/download/shorya-portfolio.zip

rm -rf "$STAGE" "$OUT"
mkdir -p "$STAGE"

# --- copy source files (no node_modules/.git/.next/build artifacts) ---
cp -r "$PROJ/src" "$PROJ/public" "$PROJ/prisma" "$STAGE/"
cp "$PROJ/package.json" "$PROJ/tsconfig.json" "$PROJ/next.config.ts" \
   "$PROJ/tailwind.config.ts" "$PROJ/postcss.config.mjs" \
   "$PROJ/eslint.config.mjs" "$PROJ/components.json" "$PROJ/.gitignore" "$STAGE/"

# --- patch package.json: cross-platform scripts + drop sandbox-only dep ---
node - <<'EOF'
const fs = require('fs');
const p = JSON.parse(fs.readFileSync('/home/z/my-project/scripts/zipstage/package.json', 'utf8'));
p.name = 'neon-noir-portfolio';
// Windows-cmd friendly scripts (no tee/cp/NODE_ENV= prefix)
p.scripts = {
  dev: 'next dev -p 3000',
  build: 'next build',
  start: 'next start',
  lint: 'eslint .',
  'db:push': 'prisma db push',
  'db:generate': 'prisma generate'
};
delete p.dependencies['z-ai-web-dev-sdk']; // unused + sandbox-internal
fs.writeFileSync('/home/z/my-project/scripts/zipstage/package.json', JSON.stringify(p, null, 2) + '\n');
EOF

# --- portable .env (relative path instead of sandbox absolute path) ---
echo 'DATABASE_URL=file:./db/custom.db' > "$STAGE/.env"

# --- zip it ---
mkdir -p "$PROJ/download"
cd "$STAGE"
zip -qr "$OUT" .
echo "=== zip created: $OUT ==="
ls -lh "$OUT"
echo "=== contents (top level) ==="
unzip -l "$OUT" | head -20
echo "=== total entries ==="
unzip -l "$OUT" | tail -2
