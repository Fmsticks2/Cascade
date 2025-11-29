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
  eval "$(linera net helper)"
  linera_spawn linera net up --with-faucet --faucet-port "$FAUCET_PORT"
  FAUCET_URL="http://localhost:$FAUCET_PORT"
else
  FAUCET_URL="https://faucet.testnet-conway.linera.net"
fi

linera wallet init --faucet "$FAUCET_URL"
linera wallet request-chain --faucet "$FAUCET_URL"

CONTRACT_WASM="/build/contract/target/wasm32-unknown-unknown/release/cascade_protocol.wasm"
SERVICE_WASM="$CONTRACT_WASM"

# Publish blobs and then create application to avoid missing blob errors
CONTRACT_BLOB=$(linera publish "$CONTRACT_WASM" 2>&1 | grep -Eo '[0-9a-fA-F]{64}' | tail -n 1)
SERVICE_BLOB=$(linera publish "$SERVICE_WASM" 2>&1 | grep -Eo '[0-9a-fA-F]{64}' | tail -n 1)

if [ -z "$CONTRACT_BLOB" ] || [ -z "$SERVICE_BLOB" ]; then
  # Fallback to publish-and-create if blob ids were not captured
  APP_OUT=$(linera publish-and-create "$CONTRACT_WASM" "$SERVICE_WASM" 2>&1)
else
  APP_OUT=$(linera create-application "$CONTRACT_BLOB" "$SERVICE_BLOB" 2>&1 || true)
fi

APP_ID=$(echo "$APP_OUT" | grep -Eo 'ApplicationId\{[^}]+\}|[0-9a-fA-F-]{16,}' | tail -n 1)
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
. ~/.nvm/nvm.sh
pnpm install
pnpm dev -- --host 0.0.0.0 --port "$WEB_PORT"
