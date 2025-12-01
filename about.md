# About Cascade Protocol

## What it does
- Delivers a decentralized prediction market built on Linera microchains.
- Combines an on‑chain Rust contract with a GraphQL service to expose state for a modern React frontend.
- Lets users explore markets, outcomes, liquidity, and resolution status through a fast UI.

## The problem it solves
- Removes centralized gatekeepers by enforcing market rules on‑chain.
- Provides transparent settlement and verifiable state via Linera.
- Improves UX performance compared to monolithic chains using Linera’s scalable microchain model.

## Challenges I ran into
- Local dev stability on Windows and Docker (file watching, Node toolchain resolution inside containers).
- Faucet and wallet provisioning race conditions during startup causing premature exits.
- TypeScript and Node ESM resolution for the Vite config (`vite.config.ts`) and Node typings.
- Ensuring environment variables (`VITE_*`) are correctly injected for both local and Testnet builds.

## Technologies I used
- Smart contracts and service: Rust, `linera_sdk`, `async-graphql`.
- Frontend: React 19, Vite 6, TypeScript 5.
- UI/visuals: `lucide-react`, `d3`.
- Tooling: Docker Compose for local orchestration, Netlify for static hosting of the frontend.

## How we built it
- Contract: Rust with `linera_sdk`, defining state, messages, and operations; compiled to WASM.
- Service: GraphQL schema exposes read APIs for application state.
- Frontend: React + Vite consumes Linera endpoints via environment variables:
  - `VITE_LINERA_FAUCET_URL` (faucet/base URL)
  - `VITE_LINERA_APPLICATION_ID` (deployed app ID on the target network)
- Dev flow: compile contract, start local Linera network with faucet, provision wallet/chain, publish application, write `.env`, serve the UI.

## What we learned
- Make startup resilient (wait for faucet, guard publish/create, handle first‑run build times).
- Drive config from environment to switch cleanly between local and Testnet.
- Prefer static hosting for the UI when possible; only Linera endpoints need to be correct.

## What's next for Cascade Protocol
- Deploy the frontend to Netlify targeting Conway Testnet and supply the Application ID in Netlify env.
- Expand market types, liquidity models, and resolution mechanisms.
- Add tests for contract logic and UI queries; integrate wallet flows and live updates.
- Harden scripts and cross‑platform DX for Windows/macOS/Linux.
