#!/usr/bin/env bash
set -euo pipefail

MODE="${DEPLOY_MODE:-${1:-local}}"
WEB_PORT="${WEB_PORT:-5173}"
FAUCET_PORT="${FAUCET_PORT:-18080}"

export LINERA_WALLET="/build/linera-cli/wallet.json"
export LINERA_KEYSTORE="/build/linera-cli/keystore.json"
export LINERA_STORAGE="rocksdb:/build/linera-cli/linera.db"

cd /build/contract
rustup target add wasm32-unknown-unknown >/dev/null 2>&1 || true
cargo build --release --target wasm32-unknown-unknown

if [ "$MODE" = "local" ]; then
  linera net up --with-faucet --faucet-port "$FAUCET_PORT" &
  # Wait for faucet to respond before any wallet operations
  for i in $(seq 1 60); do
    curl -sf "http://localhost:$FAUCET_PORT" >/dev/null && break || sleep 1
  done
  FAUCET_URL="http://localhost:$FAUCET_PORT"
else
  FAUCET_URL="https://faucet.testnet-conway.linera.net"
fi

if [ ! -f "$LINERA_KEYSTORE" ]; then
  linera wallet init --faucet "$FAUCET_URL"
fi
if [ ! -f "$LINERA_WALLET" ] || ! grep -q '"default"' "$LINERA_WALLET"; then
  linera wallet request-chain --faucet "$FAUCET_URL" || true
fi

CONTRACT_WASM="/build/contract/target/wasm32-unknown-unknown/release/cascade_protocol.wasm"
SERVICE_WASM="$CONTRACT_WASM"

# Publish blobs and then create application to avoid missing blob errors
CONTRACT_BLOB=$(linera publish "$CONTRACT_WASM" 2>&1 | grep -Eo '[0-9a-fA-F]{64}' | tail -n 1 || true)
SERVICE_BLOB=$(linera publish "$SERVICE_WASM" 2>&1 | grep -Eo '[0-9a-fA-F]{64}' | tail -n 1 || true)

if [ -z "$CONTRACT_BLOB" ] || [ -z "$SERVICE_BLOB" ]; then
  # Fallback to publish-and-create if blob ids were not captured
  APP_OUT=$(linera publish-and-create "$CONTRACT_WASM" "$SERVICE_WASM" 2>&1 || true)
else
  APP_OUT=$(linera create-application "$CONTRACT_BLOB" "$SERVICE_BLOB" 2>&1 || true)
fi

APP_ID=$(echo "$APP_OUT" | grep -Eo 'ApplicationId\{[^}]+\}|[0-9a-fA-F-]{16,}' | tail -n 1 || true)
[ -n "$APP_ID" ] || APP_ID=$(echo "$APP_OUT" | tail -n 1)

if grep -q '^VITE_LINERA_FAUCET_URL=' /build/.env 2>/dev/null; then
  sed -i "s#^VITE_LINERA_FAUCET_URL=.*#VITE_LINERA_FAUCET_URL=$FAUCET_URL#" /build/.env
else
  echo "VITE_LINERA_FAUCET_URL=$FAUCET_URL" >> /build/.env
fi

if grep -q '^VITE_LINERA_APPLICATION_ID=' /build/.env 2>/dev/null; then
  sed -i "s#^VITE_LINERA_APPLICATION_ID=.*#VITE_LINERA_APPLICATION_ID=$APP_ID#" /build/.env
else
  echo "VITE_LINERA_APPLICATION_ID=$APP_ID" >> /build/.env
fi

cd /build
export NVM_DIR="/root/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" || true
PNPM_BIN=$(command -v pnpm || true)
[ -z "$PNPM_BIN" ] && PNPM_BIN=$(find "$NVM_DIR" -type f -name pnpm | head -n 1 || true)
NPX_BIN=$(command -v npx || true)
if [ -n "$PNPM_BIN" ]; then
  "$PNPM_BIN" install || true
else
  if [ -n "$NPX_BIN" ]; then
    "$NPX_BIN" --yes pnpm install || npm install || true
  else
    npm install || true
  fi
fi
for i in $(seq 1 30); do curl -sf "$FAUCET_URL" >/dev/null && break || sleep 1; done
echo "Frontend: http://localhost:$WEB_PORT"
echo "Faucet: $FAUCET_URL"
echo "Application ID: $APP_ID"
if [ -n "$PNPM_BIN" ]; then
  exec "$PNPM_BIN" dev -- --host 0.0.0.0 --port "$WEB_PORT"
else
  if [ -n "$NPX_BIN" ]; then
    exec "$NPX_BIN" --yes vite -- --host 0.0.0.0 --port "$WEB_PORT"
  else
    exec node node_modules/vite/bin/vite.js --host 0.0.0.0 --port "$WEB_PORT"
  fi
fi
