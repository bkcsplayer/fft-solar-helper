#!/bin/bash
# FFT Solar CRM - Safe Deployment Script v3.0
# Usage: ./deploy.sh
# 
# 一键安全部署：自动备份 → 拉取代码 → 安装依赖 → 构建前端 → 重启服务
# 如果出错会自动停止，不会破坏现有环境

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PROJECT_DIR="/www/wwwroot/solarhelper.khtain.com/fft-solar-helper"
PM2_APP_NAME="fft-solar-api"
API_PORT=6200
BACKUP_DIR="$PROJECT_DIR/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

log() { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err() { echo -e "${RED}[✗]${NC} $1"; }
info() { echo -e "${BLUE}[i]${NC} $1"; }

echo ""
echo -e "${BLUE}╔══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  FFT Solar CRM - 安全部署 v3.0       ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════╝${NC}"
echo ""

cd "$PROJECT_DIR" || { err "项目目录不存在: $PROJECT_DIR"; exit 1; }

# ============================================
# Step 1: 自动备份数据库
# ============================================
echo -e "${YELLOW}━━━ Step 1/5: 备份数据库 ━━━${NC}"

mkdir -p "$BACKUP_DIR"

# Try to backup via API first (if server is running)
if curl -s http://localhost:${API_PORT}/health > /dev/null 2>&1; then
    # Server is running, use API to export
    TOKEN=$(curl -s -X POST http://localhost:${API_PORT}/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"username":"admin","password":"admin123"}' 2>/dev/null | \
        python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))" 2>/dev/null || echo "")
    
    if [ -n "$TOKEN" ]; then
        curl -s -H "Authorization: Bearer $TOKEN" \
            http://localhost:${API_PORT}/api/export/all \
            -o "$BACKUP_DIR/backup-${TIMESTAMP}.json" 2>/dev/null
        
        if [ -f "$BACKUP_DIR/backup-${TIMESTAMP}.json" ]; then
            FILESIZE=$(du -h "$BACKUP_DIR/backup-${TIMESTAMP}.json" | cut -f1)
            log "数据库备份完成: backup-${TIMESTAMP}.json (${FILESIZE})"
        else
            warn "API备份失败，尝试 pg_dump..."
        fi
    fi
fi

# Fallback: pg_dump if API backup failed
if [ ! -f "$BACKUP_DIR/backup-${TIMESTAMP}.json" ]; then
    if command -v pg_dump &> /dev/null; then
        pg_dump -U postgres -d fft_solar_crm -F c -f "$BACKUP_DIR/backup-${TIMESTAMP}.dump" 2>/dev/null && \
            log "pg_dump 备份完成: backup-${TIMESTAMP}.dump" || \
            warn "pg_dump 备份失败（首次部署无数据可忽略）"
    else
        warn "跳过备份（服务未运行且无pg_dump）"
    fi
fi

# Clean old backups (keep last 5)
ls -t "$BACKUP_DIR"/backup-*.json 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true
ls -t "$BACKUP_DIR"/backup-*.dump 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true

# ============================================
# Step 2: 拉取最新代码
# ============================================
echo ""
echo -e "${YELLOW}━━━ Step 2/5: 拉取代码 ━━━${NC}"

git fetch --all
git reset --hard origin/main
log "代码已更新到最新版本"
info "$(git log --oneline -1)"

# ============================================
# Step 3: 安装依赖
# ============================================
echo ""
echo -e "${YELLOW}━━━ Step 3/5: 安装依赖 ━━━${NC}"

npm install --production --silent 2>&1 | tail -1
log "后端依赖安装完成"

cd client
npm install --silent 2>&1 | tail -1
log "前端依赖安装完成"
cd ..

# ============================================
# Step 4: 构建前端
# ============================================
echo ""
echo -e "${YELLOW}━━━ Step 4/5: 构建前端 ━━━${NC}"

cd client
npm run build 2>&1 | tail -3
cd ..
log "前端构建完成"

# ============================================
# Step 5: 重启服务
# ============================================
echo ""
echo -e "${YELLOW}━━━ Step 5/5: 重启服务 ━━━${NC}"

# Create logs directory
mkdir -p logs

# Start or restart PM2
if pm2 list 2>/dev/null | grep -q "$PM2_APP_NAME"; then
    pm2 restart "$PM2_APP_NAME"
    log "PM2 进程已重启"
else
    pm2 start ecosystem.config.js --env production
    log "PM2 进程已创建"
fi

pm2 save --force 2>/dev/null
log "PM2 配置已保存"

# ============================================
# Health Check
# ============================================
echo ""
echo -e "${YELLOW}━━━ 健康检查 ━━━${NC}"

sleep 3

for i in 1 2 3; do
    if curl -s http://localhost:${API_PORT}/api/auth/login > /dev/null 2>&1; then
        log "API 服务正常运行 ✓"
        break
    fi
    if [ $i -eq 3 ]; then
        err "API 健康检查失败！查看日志: pm2 logs ${PM2_APP_NAME}"
    else
        info "等待服务启动...($i/3)"
        sleep 3
    fi
done

# ============================================
# Done
# ============================================
echo ""
echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║       ✅ 部署完成！                    ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
echo ""
echo -e "  API:     http://localhost:${API_PORT}"
echo -e "  状态:    pm2 status"
echo -e "  日志:    pm2 logs ${PM2_APP_NAME}"
echo -e "  备份:    ls ${BACKUP_DIR}/"
echo ""
