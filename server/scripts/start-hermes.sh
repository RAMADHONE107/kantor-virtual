#!/usr/bin/env bash
# Jalankan Hermes Agent sebagai gateway OpenAI-compatible untuk agen affiliate.
# Default memakai model gratis (Pollinations) agar langsung berjalan tanpa API key.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
HERMES_ROOTFS="${HERMES_ROOTFS:-/data/data/com.termux/files/usr/var/lib/proot-distro/containers/ubuntu2404/rootfs}"
HERMES_APP_HOME="${HERMES_APP_HOME:-$HOME/hermes-app-runtime}"
API_SERVER_PORT="${API_SERVER_PORT:-8643}"
API_SERVER_KEY="${API_SERVER_KEY:-app-local-hermes-key-2026}"

mkdir -p "$HERMES_APP_HOME"
if [ ! -f "$HERMES_APP_HOME/config.yaml" ]; then
  cp "$HERE/../config/hermes.config.yaml" "$HERMES_APP_HOME/config.yaml"
fi

env HOME=/data HERMES_HOME=/data \
  API_SERVER_ENABLED=true \
  API_SERVER_KEY="$API_SERVER_KEY" \
  API_SERVER_PORT="$API_SERVER_PORT" \
  API_SERVER_HOST=127.0.0.1 \
  PYTHONUNBUFFERED=1 \
  proot -R "$HERMES_ROOTFS" \
  -b "$HERMES_APP_HOME":/data \
  -b /dev:/dev -b /proc:/proc -b /sys:/sys \
  -w /data \
  /usr/local/bin/hermes-start.sh
