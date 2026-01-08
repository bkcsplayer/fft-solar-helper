# FFT Solar CRM - 快速启动指南

## 5分钟快速上手

### 前置要求

确保已安装：
- ✅ Node.js 16+ ([下载](https://nodejs.org/))
- ✅ PostgreSQL 12+ ([下载](https://www.postgresql.org/download/))

### Step 1: 安装依赖 (1分钟)

```bash
# 打开终端，进入项目目录
cd fft-solar-help

# 安装所有依赖
npm run install-all
```

### Step 2: 创建数据库 (1分钟)

```bash
# 方式 1: 使用命令行
createdb fft_solar_crm

# 方式 2: 使用 pgAdmin
# 1. 打开 pgAdmin
# 2. 右键 Databases -> Create -> Database
# 3. 名称：fft_solar_crm
```

### Step 3: 导入数据库结构 (30秒)

```bash
# 导入表结构和示例数据
psql -d fft_solar_crm -f database/schema.sql

# 如果需要密码，使用：
psql -U postgres -d fft_solar_crm -f database/schema.sql
```

### Step 4: 配置环境变量 (1分钟)

```bash
# 复制示例文件
cp .env.example .env

# Windows 用户使用:
copy .env.example .env
```

编辑 `.env` 文件，至少配置以下内容：

```env
# 数据库配置（根据实际情况修改）
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fft_solar_crm
DB_USER=postgres
DB_PASSWORD=你的PostgreSQL密码

# JWT 密钥（可以暂时使用默认值）
JWT_SECRET=your_jwt_secret_key_here

# 服务器端口
PORT=5000
NODE_ENV=development
```

> 💡 **提示**: 邮件功能可以稍后配置，不影响系统基本使用

### Step 5: 启动应用 (30秒)

```bash
# 开发模式（同时启动前后端）
npm run dev
```

等待几秒钟，看到以下信息表示启动成功：

```
✓ Database connection established successfully.
Server running on port 5000
Compiled successfully!
```

### Step 6: 访问系统 (立即)

打开浏览器访问：

```
http://localhost:3000
```

使用默认账号登录：
- **用户名**: `admin`
- **密码**: `admin123`

---

## 恭喜！🎉

你已成功启动 FFT Solar CRM 系统！

## 下一步做什么？

### 探索系统功能

1. **查看 Dashboard**
   - 本月收入/支出统计
   - 项目概览
   - 财务数据

2. **管理甲方公司**
   - 点击左侧菜单 "甲方管理"
   - 查看示例数据
   - 尝试添加新甲方

3. **查看项目**
   - 点击 "项目管理"
   - 了解项目管理流程

### 示例数据

系统已预置示例数据：

**甲方公司** (2个)
- SunPower Corp - 单价 $0.50/W
- Canadian Solar Inc - 单价 $0.48/W

**员工** (4人)
- 张三 - 电工 - $150/项目
- 李四 - 领队 - $18/板
- 王五 - 安装人员 - $15/板
- 赵六 - 安装人员 - $12/板

### 常见问题

#### Q: 数据库连接失败？

**检查清单：**
1. PostgreSQL 服务是否运行？
   ```bash
   # Windows
   # 打开服务管理器，查找 postgresql 服务

   # Mac
   brew services list

   # Linux
   sudo systemctl status postgresql
   ```

2. `.env` 文件中的数据库密码是否正确？

3. 数据库 `fft_solar_crm` 是否已创建？
   ```bash
   psql -U postgres -c "\l" | grep fft_solar_crm
   ```

#### Q: 端口被占用？

**解决方法：**

1. 修改后端端口（`.env` 文件）
   ```env
   PORT=5001  # 改为其他端口
   ```

2. 或者关闭占用端口的程序
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <进程号> /F

   # Mac/Linux
   lsof -ti:5000 | xargs kill -9
   ```

#### Q: 前端无法连接后端？

**检查：**
1. 后端是否正常运行？访问 http://localhost:5000/health
2. `client/package.json` 是否配置了代理？
   ```json
   "proxy": "http://localhost:5000"
   ```

#### Q: 邮件发送失败？

**说明：**
邮件功能是可选的，不影响系统基本使用。如需配置：

1. 使用 Gmail 需要：
   - 开启两步验证
   - 生成应用专用密码

2. 在 `.env` 中配置：
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=你的邮箱@gmail.com
   EMAIL_PASSWORD=应用专用密码
   ```

## 快捷命令

```bash
# 仅启动后端
npm run server

# 仅启动前端
npm run client

# 同时启动前后端
npm run dev

# 构建生产版本
npm run build

# 查看数据库
psql -d fft_solar_crm

# 重置数据库
psql -d fft_solar_crm -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
psql -d fft_solar_crm -f database/schema.sql
```

## 使用技巧

### 1. 创建新项目流程

```
添加甲方 → 添加员工 → 创建项目 → 分配人员 → 跟踪进度 → 查看财务
```

### 2. 薪资计算逻辑

```javascript
// 领队、安装人员（按板子数）
薪资 = 项目板子数量 × 员工单价

// 电工（按项目）
薪资 = 固定金额
```

### 3. 项目收入计算

```javascript
收入 = 总瓦数 × 甲方单价
总瓦数 = 板子瓦数 × 板子数量
```

### 4. 项目状态

- **pending** (待分配) - 刚创建的项目
- **in_progress** (进行中) - 已分配人员
- **completed** (已完成) - 施工完成

## 开发文档

详细文档请参考：

- 📖 [README.md](README.md) - 项目介绍和功能说明
- 🛠 [DEVELOPMENT.md](DEVELOPMENT.md) - 开发指南
- 🚀 [DEPLOYMENT.md](DEPLOYMENT.md) - 部署指南
- 📊 [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - 项目总结

## 需要帮助？

遇到问题？查看：

1. **日志信息**
   - 后端日志：终端输出
   - 前端日志：浏览器控制台 (F12)

2. **数据库检查**
   ```bash
   # 查看所有表
   psql -d fft_solar_crm -c "\dt"

   # 查看用户表
   psql -d fft_solar_crm -c "SELECT * FROM users;"
   ```

3. **健康检查**
   ```bash
   # 后端健康检查
   curl http://localhost:5000/health

   # 测试数据库连接
   curl http://localhost:5000/api/clients
   ```

---

**祝使用愉快！** 🌟

如有问题，请查看详细文档或联系技术支持。
