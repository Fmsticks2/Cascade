FROM rust:1.86-slim

SHELL ["bash", "-c"]

RUN apt-get update && apt-get install -y \
    pkg-config \
    protobuf-compiler \
    clang \
    make

RUN cargo install --locked linera-service@0.15.5 linera-storage-service@0.15.5
RUN rustup target add wasm32-unknown-unknown

RUN apt-get install -y curl
RUN curl https://raw.githubusercontent.com/creationix/nvm/v0.40.3/install.sh | bash \
    && . ~/.nvm/nvm.sh \
    && nvm install lts/krypton \
    && npm install -g pnpm

WORKDIR /build

HEALTHCHECK CMD curl -s "http://localhost:$WEB_PORT" || exit 1

ENTRYPOINT bash /build/run.bash
