#!/bin/sh
set -e

case "$1" in
  --worker)
    exec node worker.js
    ;;
  --migrate)
    exec npx drizzle-kit migrate
    ;;
  "")
    exec node server.js
    ;;
  *)
    echo "Error: Invalid argument '$1'" >&2
    echo "Valid options: --worker, --migrate, or no argument for server" >&2
    exit 1
    ;;
esac
