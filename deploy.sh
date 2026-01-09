#!/bin/bash

# FFT Solar CRM v2.0 一键部署脚本
# 用于从v1升级到v2.0

set -e  # 遇到错误立即退出

echo "=================================="
echo "FFT Solar CRM v2.0 自动部署"
echo "=================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目目录
PROJECT_DIR="/www/wwwroot/fft-solar-helper"
BACKUP_DIR="/www/wwwroot/backups"

# 步骤1: 检查当前目录
echo -e "${YELLOW}[1/10]${NC} 检查项目目录..."
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ 错误：项目目录不存在: $PROJECT_DIR${NC}"
    exit 1
fi
cd "$PROJECT_DIR"
echo -e "${GREEN}✅ 项目目录确认${NC}"

# 步骤2: 创建备份
echo -e "${YELLOW}[2/10]${NC} 备份当前版本..."
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/fft-solar-v1-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
tar -czf "$BACKUP_FILE" .
echo -e "${GREEN}✅ 备份完成: $BACKUP_FILE${NC}"

# 步骤3: 停止服务
echo -e "${YELLOW}[3/10]${NC} 停止当前服务..."
docker-compose down
echo -e "${GREEN}✅ 服务已停止${NC}"

# 步骤4: 保存配置
echo -e "${YELLOW}[4/10]${NC} 保存配置文件..."
cp .env .env.backup || echo "警告: .env文件不存在"
if [ -d "uploads" ]; then
    cp -r uploads/ uploads-backup/
fi
echo -e "${GREEN}✅ 配置文件已保存${NC}"

# 步骤5: 拉取最新代码
echo -e "${YELLOW}[5/10]${NC} 拉取v2.0代码..."
git fetch --all
git checkout main
git pull origin main
git checkout v2.0
echo -e "${GREEN}✅ v2.0代码已拉取${NC}"

# 步骤6: 恢复配置
echo -e "${YELLOW}[6/10]${NC} 恢复配置文件..."
if [ -f ".env.backup" ]; then
    cp .env.backup .env
fi
if [ -d "uploads-backup" ]; then
    rm -rf uploads/
    mv uploads-backup/ uploads/
fi
echo -e "${GREEN}✅ 配置文件已恢复${NC}"

# 步骤7: 构建并启动服务
echo -e "${YELLOW}[7/10]${NC} 构建并启动服务..."
docker system prune -f
docker-compose up -d --build
echo -e "${GREEN}✅ 服务正在启动...${NC}"

# 步骤8: 等待服务启动
echo -e "${YELLOW}[8/10]${NC} 等待服务启动（30秒）..."
sleep 30
echo -e "${GREEN}✅ 服务启动等待完成${NC}"

# 步骤9: 数据库迁移
echo -e "${YELLOW}[9/10]${NC} 执行数据库迁移..."
docker-compose exec -T database psql -U postgres -d fft_solar_crm -c "ALTER TABLE projects ADD COLUMN IF NOT EXISTS installation_date DATE;" || echo "迁移可能已执行"
echo -e "${GREEN}✅ 数据库迁移完成${NC}"

# 步骤10: 验证部署
echo -e "${YELLOW}[10/10]${NC} 验证部署..."
echo ""
echo "容器状态:"
docker-compose ps
echo ""

# 测试后端
if curl -s http://localhost:5200/health | grep -q "OK"; then
    echo -e "${GREEN}✅ 后端API正常${NC}"
else
    echo -e "${RED}❌ 后端API异常${NC}"
fi

# 测试前端
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5201 | grep -q "200"; then
    echo -e "${GREEN}✅ 前端服务正常${NC}"
else
    echo -e "${RED}❌ 前端服务异常${NC}"
fi

echo ""
echo "=================================="
echo -e "${GREEN}🎉 部署完成！${NC}"
echo "=================================="
echo ""
echo "访问地址: https://fftsolaradmin.khtain.com"
echo ""
echo "下一步："
echo "1. 访问网站并登录"
echo "2. 进入Settings配置SMTP和Telegram"
echo "3. 测试新功能"
echo ""
echo "如果遇到问题，查看日志："
echo "  docker-compose logs"
echo ""
echo "回滚到v1："
echo "  cd $PROJECT_DIR"
echo "  docker-compose down"
echo "  cd /www/wwwroot"
echo "  tar -xzf $BACKUP_FILE"
echo "  cd $PROJECT_DIR"
echo "  docker-compose up -d"
echo ""
