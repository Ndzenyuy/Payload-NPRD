#!/usr/bin/env bash
# Install prerequisites for running payload + PostgreSQL in containers.
# Skips any tool that is already installed. Safe to run multiple times.
# Target: Linux (Ubuntu/Debian, WSL2).

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info() { echo -e "${GREEN}[INFO]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
err()  { echo -e "${RED}[ERROR]${NC} $*"; }

# --- Docker ---
install_docker() {
  if command -v docker &>/dev/null && docker --version &>/dev/null; then
    info "Docker already installed: $(docker --version). Skipping."
    return 0
  fi
  info "Installing Docker..."
  if command -v apt-get &>/dev/null; then
    export DEBIAN_FRONTEND=noninteractive
    sudo apt-get update -qq
    sudo apt-get install -y -qq ca-certificates curl
    if ! command -v docker &>/dev/null; then
      curl -fsSL https://get.docker.com | sudo sh
      sudo usermod -aG docker "$USER" 2>/dev/null || true
    fi
  else
    err "Only apt-based install is supported. Install Docker manually and re-run."
    return 1
  fi
  info "Docker installed: $(docker --version)."
}

# --- Run Docker without sudo (add user to docker group) ---
fix_docker_socket_permissions() {
  if ! command -v docker &>/dev/null; then
    return 0
  fi
  if docker ps &>/dev/null 2>&1; then
    info "Docker socket: current user can run docker without sudo."
    return 0
  fi
  warn "Docker requires sudo. Adding $USER to the 'docker' group..."
  if sudo usermod -aG docker "$USER" 2>/dev/null; then
    info "Added $USER to group 'docker'."
    echo ""
    echo "  To run docker without sudo, do ONE of:"
    echo "    1. Log out and log back in, or"
    echo "    2. Run:  newgrp docker"
    echo "  Then run:  docker ps"
    echo ""
  else
    err "Could not add user to docker group. Run manually: sudo usermod -aG docker $USER"
  fi
}

# --- Docker Compose (v2 plugin) ---
install_docker_compose() {
  if docker compose version &>/dev/null 2>&1; then
    info "Docker Compose already available: $(docker compose version --short 2>/dev/null || docker compose version). Skipping."
    return 0
  fi
  if command -v docker-compose &>/dev/null && docker-compose --version &>/dev/null; then
    info "Docker Compose (standalone) already installed. Skipping."
    return 0
  fi
  info "Installing Docker Compose plugin..."
  if command -v apt-get &>/dev/null; then
    export DEBIAN_FRONTEND=noninteractive
    sudo apt-get update -qq
    sudo apt-get install -y -qq docker-compose-plugin || sudo apt-get install -y -qq docker-compose
  else
    err "Only apt-based install is supported. Install Docker Compose manually and re-run."
    return 1
  fi
  info "Docker Compose available."
}

# --- Node.js (optional) ---
install_node() {
  if command -v node &>/dev/null && node --version &>/dev/null; then
    info "Node.js already installed: $(node --version). Skipping."
    return 0
  fi
  info "Installing Node.js (optional, for local dev)..."
  if command -v apt-get &>/dev/null; then
    export DEBIAN_FRONTEND=noninteractive
    sudo apt-get update -qq
    sudo apt-get install -y -qq nodejs npm 2>/dev/null || {
      warn "Node.js not in apt; try NodeSource or nvm. Skipping Node install."
      return 0
    }
  else
    warn "Skipping Node.js (install manually if needed)."
    return 0
  fi
  info "Node.js installed: $(node --version)."
}

# --- pnpm (optional) ---
install_pnpm() {
  if command -v pnpm &>/dev/null && pnpm --version &>/dev/null; then
    info "pnpm already installed: $(pnpm --version). Skipping."
    return 0
  fi
  if ! command -v npm &>/dev/null && ! command -v node &>/dev/null; then
    warn "Node/npm not found; skipping pnpm."
    return 0
  fi
  info "Installing pnpm (optional)..."
  npm install -g pnpm 2>/dev/null || sudo npm install -g pnpm 2>/dev/null || {
    warn "Could not install pnpm globally. Skip or install manually."
    return 0
  }
  info "pnpm installed: $(pnpm --version)."
}

# --- main ---
main() {
  echo "Checking prerequisites (will skip already-installed tools)..."
  install_docker
  fix_docker_socket_permissions
  install_docker_compose
  install_node
  install_pnpm
  echo "Done."
}

main "$@"
