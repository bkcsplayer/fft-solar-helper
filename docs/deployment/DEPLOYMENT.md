# FFT Solar CRM 部署指南

## 部署前准备

### 1. 服务器要求
- Ubuntu 20.04 或更高版本（推荐）
- Node.js 16.x 或更高
- PostgreSQL 12.x 或更高
- Nginx（用于反向代理）
- 至少 2GB RAM
- 至少 20GB 磁盘空间

### 2. 域名和 SSL
- 准备域名（例如：crm.fftsolar.com）
- 配置 DNS A 记录指向服务器 IP
- 使用 Let's Encrypt 获取 SSL 证书

## 部署步骤

### 步骤 1: 安装 Node.js

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version
npm --version
```

### 步骤 2: 安装 PostgreSQL

```bash
# 安装 PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# 启动 PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 创建数据库和用户
sudo -u postgres psql

# 在 PostgreSQL 命令行中执行：
CREATE DATABASE fft_solar_crm;
CREATE USER fft_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE fft_solar_crm TO fft_user;
\q
```

### 步骤 3: 部署应用

```bash
# 创建应用目录
sudo mkdir -p /var/www/fft-solar-crm
sudo chown -R $USER:$USER /var/www/fft-solar-crm

# 上传代码到服务器
# 方法 1: 使用 git
cd /var/www/fft-solar-crm
git clone <your-repo-url> .

# 方法 2: 使用 scp
# 在本地执行：
# scp -r fft-solar-help/* user@server:/var/www/fft-solar-crm/

# 安装依赖
npm install
cd client && npm install && cd ..

# 导入数据库结构
psql -U fft_user -d fft_solar_crm -f database/schema.sql

# 生成管理员密码 hash
node database/init-admin.js
# 复制生成的 hash 并更新数据库
```

### 步骤 4: 配置环境变量

```bash
# 创建 .env 文件
nano /var/www/fft-solar-crm/.env
```

添加以下内容：

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fft_solar_crm
DB_USER=fft_user
DB_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_very_long_and_secure_random_string_here
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=production

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=FFT Solar CRM <noreply@fftsolar.com>

# Upload
UPLOAD_DIR=/var/www/fft-solar-crm/uploads
MAX_FILE_SIZE=10485760
```

### 步骤 5: 构建前端

```bash
cd /var/www/fft-solar-crm/client
npm run build
```

### 步骤 6: 配置 PM2（进程管理）

```bash
# 安装 PM2
sudo npm install -g pm2

# 启动应用
cd /var/www/fft-solar-crm
pm2 start server/index.js --name fft-solar-crm

# 设置开机自启
pm2 startup
pm2 save

# 查看状态
pm2 status
pm2 logs fft-solar-crm
```

### 步骤 7: 配置 Nginx

```bash
# 安装 Nginx
sudo apt install nginx -y

# 创建配置文件
sudo nano /etc/nginx/sites-available/fft-solar-crm
```

添加以下内容：

```nginx
server {
    listen 80;
    server_name crm.fftsolar.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name crm.fftsolar.com;

    # SSL 证书（使用 Let's Encrypt）
    ssl_certificate /etc/letsencrypt/live/crm.fftsolar.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/crm.fftsolar.com/privkey.pem;

    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 前端静态文件
    location / {
        root /var/www/fft-solar-crm/client/build;
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 文件上传
    location /uploads {
        alias /var/www/fft-solar-crm/uploads;
        expires 30d;
    }

    # 文件上传大小限制
    client_max_body_size 20M;
}
```

启用站点：

```bash
# 创建符号链接
sudo ln -s /etc/nginx/sites-available/fft-solar-crm /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 步骤 8: 配置 SSL（Let's Encrypt）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取证书
sudo certbot --nginx -d crm.fftsolar.com

# 自动续期（Certbot 会自动配置）
sudo certbot renew --dry-run
```

### 步骤 9: 配置防火墙

```bash
# 允许 SSH
sudo ufw allow OpenSSH

# 允许 HTTP 和 HTTPS
sudo ufw allow 'Nginx Full'

# 启用防火墙
sudo ufw enable

# 查看状态
sudo ufw status
```

### 步骤 10: 设置日志轮转

```bash
# 创建日志轮转配置
sudo nano /etc/logrotate.d/fft-solar-crm
```

添加：

```
/var/www/fft-solar-crm/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
```

## 数据库备份

### 自动备份脚本

```bash
# 创建备份目录
sudo mkdir -p /var/backups/fft-solar-crm

# 创建备份脚本
sudo nano /usr/local/bin/backup-fft-crm.sh
```

添加内容：

```bash
#!/bin/bash

# 配置
DB_NAME="fft_solar_crm"
DB_USER="fft_user"
BACKUP_DIR="/var/backups/fft-solar-crm"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/fft_crm_${DATE}.sql.gz"

# 创建备份
pg_dump -U ${DB_USER} ${DB_NAME} | gzip > ${BACKUP_FILE}

# 删除 30 天前的备份
find ${BACKUP_DIR} -name "fft_crm_*.sql.gz" -mtime +30 -delete

echo "Backup completed: ${BACKUP_FILE}"
```

设置权限并添加到 cron：

```bash
# 设置执行权限
sudo chmod +x /usr/local/bin/backup-fft-crm.sh

# 添加到 cron（每天凌晨 2 点执行）
sudo crontab -e

# 添加以下行：
0 2 * * * /usr/local/bin/backup-fft-crm.sh >> /var/log/fft-crm-backup.log 2>&1
```

## 监控和维护

### PM2 监控

```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs fft-solar-crm

# 查看详细信息
pm2 show fft-solar-crm

# 重启应用
pm2 restart fft-solar-crm

# 查看资源使用
pm2 monit
```

### 更新应用

```bash
# 拉取最新代码
cd /var/www/fft-solar-crm
git pull

# 更新依赖
npm install
cd client && npm install && cd ..

# 重新构建前端
cd client && npm run build && cd ..

# 重启应用
pm2 restart fft-solar-crm
```

### 查看日志

```bash
# Nginx 访问日志
sudo tail -f /var/log/nginx/access.log

# Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# 应用日志
pm2 logs fft-solar-crm
```

## 安全最佳实践

1. **更改默认密码**
   - 立即更改管理员密码
   - 使用强密码策略

2. **数据库安全**
   - 不要使用 postgres 用户
   - 限制数据库访问权限
   - 定期备份

3. **服务器安全**
   - 禁用 root SSH 登录
   - 使用 SSH 密钥认证
   - 保持系统更新

4. **应用安全**
   - 使用 HTTPS
   - 定期更新依赖
   - 启用 CORS 限制

5. **监控**
   - 设置磁盘空间监控
   - 设置性能监控
   - 设置错误告警

## 故障排除

### 应用无法启动

```bash
# 检查 PM2 日志
pm2 logs fft-solar-crm --err

# 检查端口是否被占用
sudo netstat -tuln | grep 5000

# 检查数据库连接
psql -U fft_user -d fft_solar_crm
```

### Nginx 错误

```bash
# 测试配置
sudo nginx -t

# 查看错误日志
sudo tail -f /var/log/nginx/error.log

# 重启 Nginx
sudo systemctl restart nginx
```

### 数据库连接失败

```bash
# 检查 PostgreSQL 状态
sudo systemctl status postgresql

# 检查连接
psql -U fft_user -d fft_solar_crm

# 查看日志
sudo tail -f /var/log/postgresql/postgresql-*.log
```

## 性能优化

1. **启用 Nginx 缓存**
2. **使用 CDN 加速静态资源**
3. **数据库索引优化**
4. **启用 Gzip 压缩**
5. **使用 Redis 缓存**

## 支持

如遇问题，请检查：
- PM2 日志
- Nginx 日志
- 数据库日志
- 系统资源使用情况

---

部署完成后，访问 https://crm.fftsolar.com 开始使用系统。
