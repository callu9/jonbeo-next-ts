#!/usr/bin/env bash

set -euo pipefail

npm run build
npm run start > /tmp/jonbeo-next.log 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT

for _ in {1..30}; do
  if curl --fail --silent http://127.0.0.1:3000/api/portfolio > /dev/null; then
    npx lhci autorun --config=lighthouserc.json
    exit 0
  fi
  sleep 1
done

echo "Next.js server did not become ready" >&2
exit 1
