FROM rust:1.86-slim

SHELL ["bash", "-c"]

RUN apt-get update && apt-get install -y \
    pkg-config \
    protobuf-compiler \
    clang \
    make \
    git \
    curl \
 && rm -rf /var/lib/apt/lists/*

# Build Linera CLI and services from the upstream repository.
# so we compile the CLI and services from the official source instead.
RUN git clone https://github.com/linera-io/linera-protocol.git /linera \
 && cd /linera \
 && cargo build -p linera-storage-service -p linera-service --bins \
 && cp target/debug/linera* /usr/local/cargo/bin/
RUN rustup target add wasm32-unknown-unknown

RUN curl https://raw.githubusercontent.com/creationix/nvm/v0.40.3/install.sh | bash \
    && . ~/.nvm/nvm.sh \
    && nvm install lts/krypton \
    && npm install -g pnpm

WORKDIR /build

HEALTHCHECK CMD curl -s "http://localhost:$WEB_PORT" || exit 1

ENTRYPOINT bash /build/run.bash
