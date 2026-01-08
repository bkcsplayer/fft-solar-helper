# FFT Solar CRM - Docker 部署指南

## 🐳 Docker 容器化部署

本项目已完全容器化，前端、后端和数据库都运行在 Docker 容器中。

---

## 📋 端口配置

| 服务 | 容器端口 | 主机端口 | 访问地址 |
|------|----------|----------|----------|
| 前端（React + Nginx） | 3201 | 3201 | http://localhost:3201 |
| 后端（Node.js + Express） | 3200 | 3200 | http://localhost:3200 |
| 数据库（PostgreSQL） | 5432 | 3202 | localhost:3202 |

---

## 🚀 快速开始

### 前置要求

- ✅ Windows 10/11 或 Windows Server
- ✅ Docker Desktop for Windows 已安装并运行
- ✅ 至少 4GB 可用内存
- ✅ 至少 10GB 可用磁盘空间

### 方法 1：一键部署（推荐）

**步骤 1：双击运行**
```
docker-deploy.bat
```

**步骤 2：等待部署完成**
- 首次部署需要 5-10 分钟（下载镜像 + 构建）
- 后续部署只需 1-2 分钟

**步骤 3：访问系统**
- 浏览器打开：http://localhost:3201
- 登录账号：admin / admin123

### 方法 2：手动部署

```bash
# 1. 构建镜像
docker-compose build

# 2. 启动服务
docker-compose up -d

# 3. 查看状态
docker-compose ps

# 4. 查看日志
docker-compose logs -f
```

---

## 📦 Docker 架构

### 容器组成

```
┌─────────────────────────────────────────┐
│         Docker Network (Bridge)         │
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │   Frontend   │  │   Backend    │   │
│  │   (Nginx)    │──│  (Node.js)   │   │
│  │   Port 3201  │  │  Port 3200   │   │
│  └──────────────┘  └──────┬───────┘   │
│                            │           │
│                     ┌──────▼───────┐   │
│                     │  PostgreSQL  │   │
│                     │  Port 3202   │   │
│                     └──────────────┘   │
└─────────────────────────────────────────┘
```

### 数据持久化

使用 Docker Volumes 持久化数据：

- `postgres_data` - 数据库数据
- `backend_uploads` - 上传文件

数据不会因容器重启而丢失。

---

## 🛠 常用命令

### 启动和停止

```bash
# 启动所有服务
docker-compose up -d

# 停止所有服务
docker-compose down

# 重启所有服务
docker-compose restart

# 重启单个服务
docker-compose restart backend
docker-compose restart frontend
```

### 查看状态

```bash
# 查看运行状态
docker-compose ps

# 查看实时日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f database

# 查看最近100条日志
docker-compose logs --tail=100
```

### 进入容器

```bash
# 进入后端容器
docker exec -it fft-solar-backend sh

# 进入数据库容器
docker exec -it fft-solar-db psql -U postgres -d fft_solar_crm

# 查看数据库表
docker exec -it fft-solar-db psql -U postgres -d fft_solar_crm -c "\dt"
```

### 清理和重置

```bash
# 停止并删除容器（保留数据）
docker-compose down

# 停止并删除容器和数据卷（完全清理）
docker-compose down -v

# 重新构建镜像
docker-compose build --no-cache

# 清理未使用的镜像
docker image prune -a
```

---

## 📁 Docker 文件说明

### 核心配置文件

| 文件 | 说明 |
|------|------|
| `docker-compose.yml` | Docker Compose 配置文件 |
| `server/Dockerfile` | 后端镜像构建文件 |
| `client/Dockerfile` | 前端镜像构建文件 |
| `client/nginx.conf` | Nginx 配置文件 |
| `.env.docker` | Docker 环境变量 |

### 辅助脚本

| 脚本 | 功能 |
|------|------|
| `docker-deploy.bat` | 一键部署（构建+启动） |
| `docker-start.bat` | 启动服务 |
| `docker-stop.bat` | 停止服务 |
| `docker-logs.bat` | 查看日志 |

---

## 🔧 配置说明

### 环境变量

所有环境变量在 `docker-compose.yml` 中配置：

```yaml
environment:
  # 数据库配置
  DB_HOST: database
  DB_PORT: 5432
  DB_NAME: fft_solar_crm
  DB_USER: postgres
  DB_PASSWORD: postgres

  # JWT 配置
  JWT_SECRET: fft_solar_crm_secret_key_2025_docker

  # 服务器配置
  PORT: 3200
  NODE_ENV: production
```

### 修改配置

1. 编辑 `docker-compose.yml`
2. 重启服务：`docker-compose restart`

### 修改端口

编辑 `docker-compose.yml` 中的 `ports` 配置：

```yaml
services:
  frontend:
    ports:
      - "3201:3201"  # 主机端口:容器端口

  backend:
    ports:
      - "3200:3200"

  database:
    ports:
      - "3202:5432"
```

---

## 🔍 健康检查

所有服务都配置了健康检查：

### 后端健康检查
```bash
curl http://localhost:3200/health
```

### 前端健康检查
```bash
curl http://localhost:3201
```

### 数据库健康检查
```bash
docker exec fft-solar-db pg_isready -U postgres
```

---

## 🐛 故障排查

### 问题 1：容器无法启动

**检查步骤：**
```bash
# 1. 查看 Docker Desktop 是否运行
# 打开 Docker Desktop 应用

# 2. 查看容器状态
docker-compose ps

# 3. 查看错误日志
docker-compose logs backend
docker-compose logs frontend
docker-compose logs database

# 4. 检查端口占用
netstat -ano | findstr :3200
netstat -ano | findstr :3201
netstat -ano | findstr :3202
```

**解决方法：**
```bash
# 完全清理后重新部署
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### 问题 2：数据库初始化失败

**检查数据库日志：**
```bash
docker-compose logs database
```

**重新初始化数据库：**
```bash
# 删除数据卷
docker-compose down -v

# 重新启动（会自动初始化）
docker-compose up -d
```

### 问题 3：前端无法连接后端

**检查网络连接：**
```bash
# 进入前端容器
docker exec -it fft-solar-frontend sh

# 测试后端连接
wget http://backend:3200/health
```

**检查 nginx 配置：**
```bash
# 查看 nginx 配置
docker exec fft-solar-frontend cat /etc/nginx/conf.d/default.conf

# 重新加载 nginx
docker exec fft-solar-frontend nginx -s reload
```

### 问题 4：端口被占用

**查找占用端口的进程：**
```bash
# Windows
netstat -ano | findstr :3200
taskkill /PID <进程ID> /F

# 或修改 docker-compose.yml 中的端口
```

### 问题 5：镜像构建失败

**清理缓存重新构建：**
```bash
# 删除旧镜像
docker-compose down --rmi all

# 清理构建缓存
docker builder prune -a

# 重新构建
docker-compose build --no-cache
```

---

## 📊 监控和日志

### 实时监控

```bash
# 查看容器资源使用
docker stats

# 查看特定容器资源
docker stats fft-solar-backend
```

### 日志管理

```bash
# 实时查看所有日志
docker-compose logs -f

# 查看最近的日志
docker-compose logs --tail=50

# 只看错误日志
docker-compose logs | grep -i error

# 导出日志到文件
docker-compose logs > docker-logs.txt
```

---

## 🔐 安全配置

### 生产环境建议

1. **修改默认密码**
   - 修改 `docker-compose.yml` 中的 `POSTGRES_PASSWORD`
   - 修改 JWT_SECRET

2. **启用 HTTPS**
   - 配置 SSL 证书
   - 更新 nginx 配置

3. **限制网络访问**
   - 使用防火墙规则
   - 只暴露必要的端口

4. **定期备份**
   ```bash
   # 备份数据库
   docker exec fft-solar-db pg_dump -U postgres fft_solar_crm > backup.sql

   # 恢复数据库
   docker exec -i fft-solar-db psql -U postgres fft_solar_crm < backup.sql
   ```

---

## 📈 性能优化

### 资源限制

在 `docker-compose.yml` 中添加：

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          memory: 256M
```

### 数据库优化

```bash
# 进入数据库容器
docker exec -it fft-solar-db psql -U postgres -d fft_solar_crm

# 查看慢查询
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;

# 分析表
ANALYZE;
```

---

## 🔄 更新和维护

### 更新代码

```bash
# 1. 拉取最新代码
git pull

# 2. 重新构建镜像
docker-compose build

# 3. 重启服务
docker-compose up -d

# 4. 验证更新
docker-compose logs -f
```

### 数据迁移

```bash
# 1. 备份数据
docker exec fft-solar-db pg_dump -U postgres fft_solar_crm > backup.sql

# 2. 停止服务
docker-compose down

# 3. 更新配置

# 4. 启动服务
docker-compose up -d

# 5. 如需恢复
docker exec -i fft-solar-db psql -U postgres fft_solar_crm < backup.sql
```

---

## 🎯 最佳实践

1. **定期备份数据**
   - 每天备份数据库
   - 保存重要文件

2. **监控容器状态**
   - 使用 `docker-compose ps` 检查状态
   - 查看日志发现问题

3. **及时更新镜像**
   - 使用最新的基础镜像
   - 修复安全漏洞

4. **资源管理**
   - 限制容器资源使用
   - 定期清理未使用的镜像

---

## 📞 获取帮助

### 检查系统状态

```bash
# 查看所有容器
docker-compose ps

# 查看网络
docker network ls

# 查看数据卷
docker volume ls

# 查看镜像
docker images | grep fft-solar
```

### 常用诊断命令

```bash
# 完整的健康检查
docker-compose ps
docker-compose logs --tail=20
docker stats --no-stream

# 测试连接
curl http://localhost:3201
curl http://localhost:3200/health
```

---

## 🎉 总结

Docker 部署的优势：

- ✅ 环境一致性 - 开发、测试、生产环境完全一致
- ✅ 快速部署 - 一键启动所有服务
- ✅ 易于维护 - 容器化管理，独立更新
- ✅ 资源隔离 - 每个服务独立运行
- ✅ 可扩展性 - 轻松扩展到多实例

**准备好了吗？** 🚀

👉 双击运行 `docker-deploy.bat` 开始部署！

---

**最后更新**：2025年1月5日
**Docker 版本**：1.0.0
**支持平台**：Windows 10/11 + Docker Desktop
