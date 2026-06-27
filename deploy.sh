#!/bin/bash
# HVAS Deployment Script
# Usage: bash deploy.sh

set -e

echo "=== HVAS Deployment Script ==="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "[1/7] Installing Docker..."
    sudo apt update
    sudo apt install -y docker.io docker-compose-plugin
    sudo systemctl enable --now docker
else
    echo "[1/7] Docker sudah terinstall"
fi

# Check if docker compose is available
if ! docker compose version &> /dev/null; then
    echo "Error: docker compose tidak tersedia"
    exit 1
fi

# Clone or update repository
REPO_DIR="/opt/hvas"
if [ -d "$REPO_DIR" ]; then
    echo "[2/7] Update repository..."
    cd $REPO_DIR
    git pull origin main
else
    echo "[2/7] Clone repository..."
    sudo mkdir -p $REPO_DIR
    sudo chown $USER:$USER $REPO_DIR
    git clone https://github.com/YOUR_USERNAME/ta-hvas.git $REPO_DIR
    cd $REPO_DIR
fi

# Setup .env files if not exist
echo "[3/7] Setup environment files..."

setup_env() {
    local service=$1
    local env_file="backend/$service/.env"
    local example_file="backend/$service/.env.example"
    
    if [ ! -f "$env_file" ] && [ -f "$example_file" ]; then
        cp "$example_file" "$env_file"
        echo "  - Buat $env_file dari template"
        echo "  - WARNING: Edit $env_file dengan values yang benar!"
    fi
}

setup_env "auth-service"
setup_env "telemetry-service"
setup_env "control-service"
setup_env "api-gateway"

# Generate SSL certificate if not exist
echo "[4/7] Setup SSL certificate..."
mkdir -p backend/certs
if [ ! -f "backend/certs/hvas.crt" ]; then
    echo "  - Generating SSL certificate..."
    read -p "  - Masukkan IP Server (contoh: 192.168.1.100): " SERVER_IP
    openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
        -keyout backend/certs/hvas.key \
        -out backend/certs/hvas.crt \
        -subj "/O=BSPJI/OU=Lab Udara/CN=$SERVER_IP" \
        -addext "subjectAltName=IP:$SERVER_IP"
    echo "  - SSL certificate berhasil dibuat"
else
    echo "  - SSL certificate sudah ada"
fi

# Build frontend
echo "[5/7] Build frontend..."
if [ -d "frontend/node_modules" ]; then
    cd frontend
    npm run build
    cd ..
else
    cd frontend
    npm install
    npm run build
    cd ..
fi

# Build and start Docker containers
echo "[6/7] Build dan start Docker containers..."
docker compose up -d --build

# Check status
echo "[7/7] Cek status containers..."
sleep 5
docker compose ps

echo ""
echo "=== Deployment Selesai ==="
echo ""
echo "Aplikasi tersedia di: https://$SERVER_IP"
echo ""
echo "Untuk melihat logs:"
echo "  docker compose logs -f"
echo ""
echo "Untuk stop:"
echo "  docker compose down"
echo ""
echo "Untuk restart:"
echo "  docker compose restart"
