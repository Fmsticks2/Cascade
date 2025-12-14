#!/usr/bin/env bash
set +e

MODE="${DEPLOY_MODE:-${1:-local}}"
WEB_PORT="${WEB_PORT:-4173}"
FAUCET_PORT="${FAUCET_PORT:-18080}"

if [ "$MODE" = "local" ]; then
  export LINERA_WALLET="/build/linera-cli/wallet.json"
  export LINERA_KEYSTORE="/build/linera-cli/keystore.json"
  export LINERA_STORAGE="rocksdb:/build/linera-cli/linera.db"
else
  export LINERA_TMP_DIR="/tmp/linera-cli"
  mkdir -p "$LINERA_TMP_DIR"
  export LINERA_WALLET="$LINERA_TMP_DIR/wallet.json"
  export LINERA_KEYSTORE="$LINERA_TMP_DIR/keystore.json"
  export LINERA_STORAGE="rocksdb:$LINERA_TMP_DIR/linera.db"
fi

cd /build/contract
rustup target add wasm32-unknown-unknown >/dev/null 2>&1 || true
cargo build --release --target wasm32-unknown-unknown --features contract
cp target/wasm32-unknown-unknown/release/cascade_protocol.wasm target/wasm32-unknown-unknown/release/cascade_protocol_contract.wasm
cargo build --release --target wasm32-unknown-unknown --features service
cp target/wasm32-unknown-unknown/release/cascade_protocol.wasm target/wasm32-unknown-unknown/release/cascade_protocol_service.wasm

if [ "$MODE" = "local" ]; then
  nohup linera net up --with-faucet --faucet-port "$FAUCET_PORT" > /build/faucet.log 2>&1 &
  disown
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
echo "Wallet initialized and default chain ensured"

CONTRACT_WASM="/build/contract/target/wasm32-unknown-unknown/release/cascade_protocol_contract.wasm"
SERVICE_WASM="/build/contract/target/wasm32-unknown-unknown/release/cascade_protocol_service.wasm"
echo "Publishing contract and service blobs"

# Publish blobs and then create application to avoid missing blob errors
CONTRACT_BLOB=$(linera publish "$CONTRACT_WASM" 2>&1 | grep -Eo '[0-9a-fA-F]{64}' | tail -n 1 || true)
SERVICE_BLOB=$(linera publish "$SERVICE_WASM" 2>&1 | grep -Eo '[0-9a-fA-F]{64}' | tail -n 1 || true)

if [ -z "$CONTRACT_BLOB" ] || [ -z "$SERVICE_BLOB" ]; then
  # Fallback to publish-and-create if blob ids were not captured
  APP_OUT=$(linera publish-and-create "$CONTRACT_WASM" "$SERVICE_WASM" 2>&1 || true)
else
  APP_OUT=$(linera create-application "$CONTRACT_BLOB" "$SERVICE_BLOB" 2>&1 || true)
fi
echo "Application creation output captured"

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
echo ".env updated with faucet and application id"

cd /build
echo "Entered /build directory"
export NVM_DIR="/root/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" || true
nvm --version >/dev/null 2>&1 || echo "NVM not found; continuing"
nvm use --lts >/dev/null 2>&1 || nvm use lts/krypton >/dev/null 2>&1 || nvm use default >/dev/null 2>&1 || true
echo "Starting frontend dependency install"
npm install || true
for i in $(seq 1 30); do curl -sf "$FAUCET_URL" >/dev/null && break || sleep 1; done
echo "Starting frontend build and preview"
echo "Frontend: http://localhost:$WEB_PORT"
echo "Faucet: $FAUCET_URL"
echo "Application ID: $APP_ID"
# Always serve via preview for stability on bind-mounted volumes
npm run build || node node_modules/vite/bin/vite.js build || true
nohup node node_modules/vite/bin/vite.js preview --port "$WEB_PORT" --host 0.0.0.0 > /build/preview.log 2>&1 &
disown
touch /build/preview.log
tail -F /build/preview.log
