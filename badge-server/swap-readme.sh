#!/usr/bin/env bash
#
# Rewrites the badge URLs in the profile README to point at your self-hosted
# badge service. Run AFTER you have deployed badge-server to Vercel and know
# your domain.
#
# Usage:
#   ./swap-readme.sh my-badges.vercel.app
#   ./swap-readme.sh my-badges.vercel.app ../README.md
#
set -euo pipefail

DOMAIN="${1:-}"
README="${2:-../README.md}"

if [ -z "$DOMAIN" ]; then
  echo "Usage: $0 <vercel-domain> [path-to-README]" >&2
  echo "Example: $0 my-badges.vercel.app ../README.md" >&2
  exit 1
fi

# strip any scheme the user may have pasted
DOMAIN="${DOMAIN#https://}"
DOMAIN="${DOMAIN#http://}"
DOMAIN="${DOMAIN%/}"

if [ ! -f "$README" ]; then
  echo "README not found: $README" >&2
  exit 1
fi

cp "$README" "$README.bak"

# Both services use the identical /badge/<...> path + query grammar, so we only
# swap the host. logoColor, style, .svg suffix etc. all carry over unchanged.
sed -i \
  -e "s#https://img\.shields\.io/badge/#https://${DOMAIN}/badge/#g" \
  -e "s#https://custom-icon-badges\.demolab\.com/badge/#https://${DOMAIN}/badge/#g" \
  "$README"

echo "Done. Backup written to $README.bak"
echo "Remaining external badge hosts (should be none):"
grep -nE "img\.shields\.io|custom-icon-badges\.demolab\.com" "$README" || echo "  (none)"
