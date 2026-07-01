#!/bin/sh
set -e

# Initialise DB on persistent volume (Railway)
if [ ! -f /data/dev.db ]; then
  echo "Initialising database at /data/dev.db"
  cp /app/seed.db /data/dev.db
fi

exec node server.js
