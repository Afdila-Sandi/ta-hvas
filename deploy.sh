#!/bin/bash
# HVAS Auto-Deploy Script for AWS EC2
# Usage: bash deploy.sh

set -e

REPO="https://github.com/Afdila-Sandi/ta-hvas.git"
REPO_DIR="/opt/ta-hvas"

echo "=== HVAS Auto-Deploy for AWS EC2 ==="
echo ""

# Step 1: Install dependencies
echo "[1/8] Installing dependencies..."
sudo apt update -y
sudo apt install -y docker.io docker-compose-plugin git curl openssl

# Install Node.js if not exists
if ! command -v node &> /dev/null; then
    echo "  - Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi
echo "  - Node.js: $(node --version)"
echo "  - npm: $(npm --version)"

# Enable Docker
sudo systemctl enable --now docker

# Step 2: Get server IP automatically
echo "[2/8] Detecting server IP..."
SERVER_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "34.198.219.249")
echo "  - Server IP: $SERVER_IP"

# Step 3: Clone or update repo
echo "[3/8] Setup repository..."
if [ -d "$REPO_DIR" ]; then
    cd $REPO_DIR
    git pull origin main
else
    sudo git clone $REPO $REPO_DIR
    sudo chown -R $USER:$USER $REPO_DIR
    cd $REPO_DIR
fi

# Step 4: Generate secrets
echo "[4/8] Generating secrets..."
JWT_SECRET=$(openssl rand -hex 64)
JWT_REFRESH_SECRET=$(openssl rand -hex 64)
DB_PASSWORD=$(openssl rand -base64 32)
TOKEN_ESP=$(openssl rand -hex 32)

# Step 5: Create .env files
echo "[5/8] Creating .env files..."

# auth-service/.env
cat > backend/auth-service/.env << EOF
PORT=5001
HOST=0.0.0.0
FRONTEND_URL=https://$SERVER_IP
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
DB_USER=auth_user
DB_HOST=postgres-auth
DB_NAME=db_auth
DB_PASSWORD=$DB_PASSWORD
POSTGRES_USER=auth_user
POSTGRES_PASSWORD=$DB_PASSWORD
POSTGRES_DB=db_auth
EOF

# telemetry-service/.env
cat > backend/telemetry-service/.env << EOF
PORT=5002
HOST=0.0.0.0
DB_HOST=postgres-telemetry
DB_USER=telemetry_user
DB_PASSWORD=$DB_PASSWORD
DB_NAME=db_telemetry
MQTT_BROKER=mqtts://mosquitto:8000
POSTGRES_USER=telemetry_user
POSTGRES_PASSWORD=$DB_PASSWORD
POSTGRES_DB=db_telemetry
TOKEN_ESP=$TOKEN_ESP
JWT_SECRET=$JWT_SECRET
EOF

# control-service/.env
cat > backend/control-service/.env << EOF
PORT=5003
HOST=0.0.0.0
JWT_SECRET=$JWT_SECRET
MQTT_BROKER=mqtts://mosquitto:8000
TOKEN_ESP=$TOKEN_ESP
EOF

# api-gateway/.env
cat > backend/api-gateway/.env << EOF
FRONTEND_URL=https://$SERVER_IP
EOF

echo "  - Semua .env files berhasil dibuat"

# Step 6: Generate SSL
echo "[6/8] Generating SSL certificate..."
mkdir -p backend/certs
if [ ! -f "backend/certs/hvas.crt" ]; then
    openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
        -keyout backend/certs/hvas.key \
        -out backend/certs/hvas.crt \
        -subj "/O=BSPJI/OU=Lab Udara/CN=$SERVER_IP" \
        -addext "subjectAltName=IP:$SERVER_IP"
    echo "  - SSL certificate generated for $SERVER_IP"
else
    echo "  - SSL certificate already exists"
fi

# Step 7: Build frontend
echo "[7/8] Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Step 8: Start Docker
echo "[8/8] Starting Docker containers..."
docker compose up -d --build

# Wait and check
sleep 10
docker compose ps

echo ""
echo "=== DEPLOYMENT COMPLETE ==="
echo ""
echo "URL: https://$SERVER_IP"
echo ""
echo "Secrets generated (save these!):"
echo "  JWT_SECRET: $JWT_SECRET"
echo "  JWT_REFRESH_SECRET: $JWT_REFRESH_SECRET"
echo "  DB_PASSWORD: $DB_PASSWORD"
echo "  TOKEN_ESP: $TOKEN_ESP"
echo ""
echo "Commands:"
echo "  docker compose logs -f    # View logs"
echo "  docker compose down       # Stop"
echo "  docker compose restart    # Restart"
