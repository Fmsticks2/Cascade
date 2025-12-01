# Wave 3 Update — Cascade Protocol

## Deliverable
- Live frontend (Netlify): https://cascadeprotocol.netlify.app/

## Summary of Updates
- Frontend stability and startup flow improved (preview-only serving, port alignment, resilient Node activation).
- Linera local network orchestration hardened (faucet readiness, wallet/app provisioning guards, `.env` injection).
- Docker Compose made resilient (restart policy, dynamic port mapping, healthcheck bound to `WEB_PORT`).
- TypeScript and Vite configuration corrected for Node/Esm resolution in the config file.
- Documentation added (`README.md`, `about.md`) and deployment configuration for Netlify (`netlify.toml`).

## Frontend Stability
- Serve via preview-only to avoid watcher issues on Windows bind mounts:
  - Starts with build then `vite preview` bound to `WEB_PORT`.
  - Backgrounds the preview server and tails its log so PID 1 remains alive.
  - References: `run.bash:88–99`.
- Vite port reads from environment:
  - `const port = Number(process.env.WEB_PORT ?? env.WEB_PORT ?? 5173);`
  - References: `vite.config.ts:7–13`.
- Node activation and fallback runner logic:
  - Source NVM, `nvm use --lts`, prefer `pnpm`, fallback to `npx` or `npm` for install/build.
  - References: `run.bash:65–81`.

## Linera Integration
- Faucet readiness wait loop before wallet operations:
  - Polls `http://localhost:$FAUCET_PORT` up to 60s.
  - References: `run.bash:19–22`.
- Detached faucet with `nohup` to avoid termination on SIGHUP:
  - `nohup linera net up --with-faucet --faucet-port "$FAUCET_PORT" > /build/faucet.log 2>&1 &; disown`.
  - References: `run.bash:17–18`.
- Wallet init/request-chain guarded and idempotent:
  - References: `run.bash:28–33`.
- Publish and app creation hardened; blob IDs extracted; `.env` updated:
  - Publish blobs, fallback to `publish-and-create` if IDs missing; extract `APP_ID`.
  - Inject `VITE_LINERA_FAUCET_URL`, `VITE_LINERA_APPLICATION_ID` into `.env`.
  - References: `run.bash:39–50`, `run.bash:52–62`.

## Docker Orchestration
- Restart policy:
  - `restart: unless-stopped` to avoid permanent exit on transient failure.
  - References: `compose.yaml:4`.
- Dynamic port mapping:
  - Host and container ports both honor `WEB_PORT`.
  - References: `compose.yaml:9`.
- Healthcheck uses `WEB_PORT`:
  - `curl -s "http://localhost:$WEB_PORT" || exit 1`.
  - References: `Dockerfile:22`.

## TypeScript and Vite Config
- Node/Esm resolution and types for the Vite config:
  - `tsconfig.node.json` uses `module: "NodeNext"`, `moduleResolution: "NodeNext"`, and `types: ["node"]`.
  - References: `tsconfig.node.json:1–8`, `tsconfig.json:30–34`.
- Built-ins imported via Node ESM:
  - `import path from 'node:path';`
  - References: `vite.config.ts:1`.

## Netlify Deployment
- Configuration file:
  - `netlify.toml` with build command `npm run build`, publish `dist`, and template environment variables.
  - References: `netlify.toml:1–9`.
- Environment required in Netlify:
  - `VITE_LINERA_FAUCET_URL = https://faucet.testnet-conway.linera.net`
  - `VITE_LINERA_APPLICATION_ID = <your Testnet app id>`

## Known Caveats
- First run is heavy: Rust toolchain and contract build; Node install; Vite build.
- On Windows, avoid dev server file watching in containers; prefer `vite preview` or run dev locally.

## Docker Setup Guide
- Prerequisites:
  - Docker Desktop installed and running.
  - Ports available: `WEB_PORT` (default `5173`), `FAUCET_PORT` (default `18080`).
- Environment variables (optional):
  - `WEB_PORT`: frontend port (default `5173`).
  - `FAUCET_PORT`: faucet port (default `18080`).
  - `DEPLOY_MODE=local`: start local Linera network and faucet.
- Build (first time or after major changes):
  - `docker compose build --no-cache`
- Start:
  - `docker compose up`
  - Logs will print:
    - `Frontend: http://localhost:<WEB_PORT>`
    - `Faucet: http://localhost:<FAUCET_PORT>`
    - `Application ID: <id>`
- Verify:
  - Frontend: `http://localhost:5173` (or your `WEB_PORT`).
  - Faucet GraphiQL: `http://localhost:18080`.
  - Container status: `docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"`.
- Clean and rebuild if needed:
  - Stop and remove: `docker compose down -v --remove-orphans`.
  - Rebuild: `docker compose build --no-cache`.
- Reset local chain state (if wallet/db corrupted):
  - Delete `linera-cli` directory, then `docker compose up` to re-provision.
- Change port (if conflicts):
  - `WEB_PORT=5180 docker compose up --build`

## Next Steps
- Optional `DEPLOY_MODE=dev` branch to run `vite` dev server with a watchdog.
- Add test suites for contract logic and service queries; end-to-end UI verification.
- Expand market features, analytics, and live streaming updates.

