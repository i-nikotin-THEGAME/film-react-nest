#!/bin/bash

# Setup script for server deployment
# This script prepares the server for automated deployments

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🔧 Setting up server for automated deployment...${NC}"

# Create directories if not exist
echo "📁 Creating required directories..."
mkdir -p ~/film-react-nest/logs
mkdir -p ~/.ssh
mkdir -p ~/backups

# Create log file
touch ~/deployment.log
chmod 644 ~/deployment.log

# Create backup directory for docker-compose.yml
echo "💾 Setting up backups..."
if [ -f ~/film-react-nest/docker-compose.yml ]; then
    cp ~/film-react-nest/docker-compose.yml ~/backups/docker-compose.$(date +%s).yml
fi

# Set proper permissions
chmod 755 ~/film-react-nest/scripts/deploy.sh
chmod 755 ~/film-react-nest/scripts/setup-server.sh

# Create .env file template if not exists
if [ ! -f ~/film-react-nest/.env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating template...${NC}"
    cat > ~/film-react-nest/.env << 'EOF'
# Backend configuration
PORT=3000
LOGGER_TYPE=json

# Frontend configuration
FRONTEND_URL=https://inikotinthegame.nomorepartiessbs.ru

# Database configuration (if using)
DATABASE_URL=postgresql://user:password@localhost:5432/film_db

# Any other environment variables
EOF
    echo -e "${GREEN}✅ .env template created at ~/film-react-nest/.env${NC}"
    echo -e "${YELLOW}⚠️  Please update the .env file with actual values${NC}"
fi

# Add SSH key permissions check
if [ ! -f ~/.ssh/id_rsa ]; then
    echo -e "${YELLOW}⚠️  SSH private key not found at ~/.ssh/id_rsa${NC}"
    echo "    You need to add the GitHub Actions SSH key manually"
else
    chmod 600 ~/.ssh/id_rsa
    echo -e "${GREEN}✅ SSH key permissions set correctly${NC}"
fi

# Create systemd service for automatic startup (optional)
if [ "$1" == "--systemd" ]; then
    echo -e "${GREEN}🔧 Creating systemd service...${NC}"
    sudo tee /etc/systemd/system/film-app.service > /dev/null << 'EOF'
[Unit]
Description=Film App Docker Compose Service
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
WorkingDirectory=/home/appuser/film-react-nest
ExecStart=/usr/bin/docker-compose -f docker-compose.yml up -d
ExecStop=/usr/bin/docker-compose -f docker-compose.yml down
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
EOF
    sudo systemctl daemon-reload
    echo -e "${GREEN}✅ Systemd service created${NC}"
fi

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✅ Server setup completed!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Next steps:"
echo "1. Update ~/film-react-nest/.env with actual values"
echo "2. Ensure Docker daemon is running: systemctl status docker"
echo "3. Test deployment: bash ~/film-react-nest/scripts/deploy.sh"
echo ""
