# FFT Solar CRM v3.0 - Traditional Deployment Guide

This guide explains how to deploy FFT Solar CRM without Docker, using PM2 for process management.

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Nginx (for reverse proxy)
- PM2 (process manager)

## Initial Setup (First Deploy)

### 1. Clone Repository

```bash
cd /www/wwwroot
git clone https://github.com/bkcsplayer/fft-solar-helper.git
cd fft-solar-helper
```

### 2. Create Database

Using 宝塔 (Baota Panel):
1. Go to Database → PostgreSQL
2. Create database: `fft_solar_crm`
3. Username: `postgres`
4. Note the password

Or via command line:
```bash
sudo -u postgres psql
CREATE DATABASE fft_solar_crm;
\q
```

### 3. Initialize Schema

```bash
psql -U postgres -d fft_solar_crm -f database/schema.sql
```

### 4. Configure Environment

```bash
cp .env.example .env
nano .env
```

Edit the following:
```env
PORT=6200
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fft_solar_crm
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_random_secret
```

### 5. Install Dependencies

```bash
npm install --production
cd client && npm install && npm run build && cd ..
```

### 6. Install PM2 and Start

```bash
npm install -g pm2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 7. Configure Nginx

Create `/www/server/panel/vhost/nginx/fftsolaradmin.khtain.com.conf`:

```nginx
server {
    listen 80;
    server_name fftsolaradmin.khtain.com;
    
    # Frontend static files
    location / {
        root /www/wwwroot/fft-solar-helper/client/build;
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy
    location /api {
        proxy_pass http://127.0.0.1:6200;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Uploads
    location /uploads {
        alias /www/wwwroot/fft-solar-helper/uploads;
    }
}
```

Reload Nginx:
```bash
nginx -t && nginx -s reload
```

## Update Deployment

```bash
cd /www/wwwroot/fft-solar-helper
chmod +x deploy.sh
./deploy.sh full
```

Or step by step:
```bash
./deploy.sh pull      # Pull latest code
./deploy.sh install   # Install dependencies
./deploy.sh build     # Build frontend
./deploy.sh migrate   # Run database migrations
./deploy.sh restart   # Restart PM2
```

## Common Commands

```bash
# View logs
pm2 logs fft-solar-api

# View status
pm2 status

# Restart
pm2 restart fft-solar-api

# Stop
pm2 stop fft-solar-api
```

## Troubleshooting

### 502 Bad Gateway
```bash
pm2 logs fft-solar-api --lines 50
```

### Database Connection Error
```bash
# Test connection
psql -U postgres -d fft_solar_crm -c "SELECT 1"

# Check environment
cat .env | grep DB_
```

### Missing Columns
```bash
node database/migrate.js
```
