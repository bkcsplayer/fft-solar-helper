#!/bin/bash
# FFT Solar CRM - Deployment Script v3.0
# Usage: ./deploy.sh [pull|install|build|restart|full]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_PORT=6200
PROJECT_DIR="/www/wwwroot/fft-solar-helper"
PM2_APP_NAME="fft-solar-api"

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}FFT Solar CRM Deployment v3.0${NC}"
echo -e "${GREEN}================================${NC}"

# Function: Pull latest code
pull_code() {
    echo -e "${YELLOW}Pulling latest code...${NC}"
    git fetch --all
    git reset --hard origin/main
    echo -e "${GREEN}✓ Code updated${NC}"
}

# Function: Install dependencies
install_deps() {
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    npm install --production
    
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    cd client
    npm install
    cd ..
    echo -e "${GREEN}✓ Dependencies installed${NC}"
}

# Function: Build frontend
build_frontend() {
    echo -e "${YELLOW}Building frontend...${NC}"
    cd client
    npm run build
    cd ..
    echo -e "${GREEN}✓ Frontend built${NC}"
}

# Function: Restart PM2
restart_pm2() {
    echo -e "${YELLOW}Restarting PM2...${NC}"
    
    # Check if app exists
    if pm2 list | grep -q "$PM2_APP_NAME"; then
        pm2 restart $PM2_APP_NAME
    else
        pm2 start ecosystem.config.js --env production
    fi
    
    pm2 save
    echo -e "${GREEN}✓ PM2 restarted${NC}"
}

# Function: Run database migrations
run_migrations() {
    echo -e "${YELLOW}Running database migrations...${NC}"
    node database/migrate.js
    echo -e "${GREEN}✓ Migrations complete${NC}"
}

# Function: Health check
health_check() {
    echo -e "${YELLOW}Running health check...${NC}"
    sleep 5
    
    if curl -s http://localhost:${API_PORT}/health | grep -q "OK"; then
        echo -e "${GREEN}✓ API is healthy${NC}"
    else
        echo -e "${RED}✗ API health check failed${NC}"
        echo "Check logs: pm2 logs ${PM2_APP_NAME}"
    fi
}

# Function: Full deployment
full_deploy() {
    pull_code
    install_deps
    build_frontend
    run_migrations
    restart_pm2
    health_check
    
    echo ""
    echo -e "${GREEN}================================${NC}"
    echo -e "${GREEN}Deployment Complete!${NC}"
    echo -e "${GREEN}================================${NC}"
    echo -e "API running at: http://localhost:${API_PORT}"
    echo -e "PM2 status: pm2 status"
    echo -e "View logs: pm2 logs ${PM2_APP_NAME}"
}

# Main execution
case "$1" in
    pull)
        pull_code
        ;;
    install)
        install_deps
        ;;
    build)
        build_frontend
        ;;
    restart)
        restart_pm2
        ;;
    migrate)
        run_migrations
        ;;
    full)
        full_deploy
        ;;
    *)
        echo "Usage: $0 {pull|install|build|restart|migrate|full}"
        echo ""
        echo "Commands:"
        echo "  pull     - Pull latest code from git"
        echo "  install  - Install npm dependencies"
        echo "  build    - Build frontend for production"
        echo "  restart  - Restart PM2 process"
        echo "  migrate  - Run database migrations"
        echo "  full     - Full deployment (all steps)"
        exit 1
        ;;
esac

exit 0
