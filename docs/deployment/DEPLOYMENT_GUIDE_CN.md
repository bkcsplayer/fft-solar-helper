# FFT Solar CRM - 完整部署指南

## 当前状态 ✅

已完成的步骤：
- ✅ 所有项目依赖已安装（后端 + 前端）
- ✅ 环境变量文件已配置（.env）
- ⏳ 需要安装 PostgreSQL 数据库

## 第一步：安装 PostgreSQL 数据库

### 方法 1：使用 Chocolatey（推荐 - 需要管理员权限）

1. **以管理员身份运行 PowerShell**
   - 按 `Win + X`
   - 选择"Windows PowerShell (管理员)"或"终端 (管理员)"

2. **安装 PostgreSQL**
   ```powershell
   choco install postgresql14 -y
   ```

3. **等待安装完成**（大约 5-10 分钟）

4. **检查安装**
   ```powershell
   psql --version
   ```

### 方法 2：手动下载安装

1. **下载 PostgreSQL**
   - 访问：https://www.postgresql.org/download/windows/
   - 下载 PostgreSQL 14 或更高版本
   - 推荐使用 EDB 安装程序

2. **运行安装程序**
   - 双击下载的 .exe 文件
   - 点击 "Next" 继续
   - 选择安装目录（默认即可）：`C:\Program Files\PostgreSQL\14`
   - 选择组件（全部勾选）
   - 选择数据目录（默认即可）

3. **设置密码**
   - **重要**：为 postgres 超级用户设置密码
   - 建议使用简单密码用于开发：`postgres`
   - 记住这个密码，后面会用到！

4. **设置端口**
   - 默认端口：`5432`（不要修改）

5. **选择区域**
   - 选择 "Default locale"

6. **完成安装**
   - 点击 "Next" 完成安装
   - 取消勾选 "Stack Builder"（不需要）

7. **添加到系统路径**
   - 打开环境变量设置
   - 在 PATH 中添加：`C:\Program Files\PostgreSQL\14\bin`

8. **验证安装**
   ```bash
   psql --version
   ```

## 第二步：创建数据库

安装 PostgreSQL 后，执行以下命令：

### 1. 创建数据库

**方法 A：使用命令行**
```bash
# 进入项目目录
cd f:/claude-vs-projects/fft-solar-help

# 创建数据库（会提示输入密码）
createdb -U postgres fft_solar_crm
```

**方法 B：使用 SQL 命令**
```bash
# 连接到 PostgreSQL
psql -U postgres

# 在 psql 中执行
CREATE DATABASE fft_solar_crm;

# 退出
\q
```

### 2. 导入数据库结构和示例数据

```bash
# 进入项目目录
cd f:/claude-vs-projects/fft-solar-help

# 导入 schema（会提示输入密码）
psql -U postgres -d fft_solar_crm -f database/schema.sql
```

成功后会看到：
```
CREATE TABLE
CREATE TABLE
...
INSERT 0 1
INSERT 0 2
...
```

### 3. 验证数据库

```bash
# 连接到数据库
psql -U postgres -d fft_solar_crm

# 查看所有表
\dt

# 查看用户数据
SELECT * FROM users;

# 查看甲方数据
SELECT * FROM clients;

# 退出
\q
```

## 第三步：更新 .env 配置

如果你的 PostgreSQL 密码不是 `postgres`，需要修改 `.env` 文件：

```bash
# 编辑 .env 文件
notepad .env
```

修改这一行：
```env
DB_PASSWORD=你的PostgreSQL密码
```

保存并关闭。

## 第四步：启动应用

### 方法 1：同时启动前后端（推荐）

```bash
# 进入项目目录
cd f:/claude-vs-projects/fft-solar-help

# 启动开发服务器
npm run dev
```

这会同时启动：
- 后端服务器：http://localhost:5000
- 前端应用：http://localhost:3000

### 方法 2：分别启动

**终端 1 - 启动后端**
```bash
cd f:/claude-vs-projects/fft-solar-help
npm run server
```

**终端 2 - 启动前端**
```bash
cd f:/claude-vs-projects/fft-solar-help
npm run client
```

## 第五步：访问系统

### 1. 打开浏览器

访问：http://localhost:3000

### 2. 登录系统

使用默认账号：
- **用户名**：`admin`
- **密码**：`admin123`

### 3. 测试功能

1. **查看 Dashboard**
   - 应该能看到月度财务统计
   - 项目数量统计
   - 所有数据来自数据库

2. **甲方管理**
   - 点击左侧菜单"甲方管理"
   - 应该能看到 2 个示例甲方
   - 尝试添加新甲方

3. **员工管理**
   - 查看 4 个示例员工
   - 注意不同角色的薪资类型

4. **项目管理**
   - 创建新项目
   - 查看项目详情（5个标签页）

## 常见问题

### 问题 1：数据库连接失败

**错误信息**：
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**解决方法**：
1. 检查 PostgreSQL 服务是否运行
   ```bash
   # Windows 服务管理器
   services.msc
   # 查找 postgresql-x64-14
   ```

2. 启动 PostgreSQL 服务
   ```bash
   # PowerShell（管理员）
   Start-Service postgresql-x64-14
   ```

3. 检查 .env 文件中的数据库配置是否正确

### 问题 2：密码认证失败

**错误信息**：
```
Error: password authentication failed for user "postgres"
```

**解决方法**：
1. 确认 .env 中的 DB_PASSWORD 与 PostgreSQL 安装时设置的密码一致
2. 重置 PostgreSQL 密码（如果忘记）：
   - 编辑 `pg_hba.conf` 文件
   - 位置：`C:\Program Files\PostgreSQL\14\data\pg_hba.conf`
   - 将认证方法从 `md5` 改为 `trust`
   - 重启 PostgreSQL 服务
   - 用 `psql -U postgres` 连接
   - 执行：`ALTER USER postgres PASSWORD 'newpassword';`
   - 改回 `pg_hba.conf`
   - 再次重启服务

### 问题 3：端口被占用

**错误信息**：
```
Error: listen EADDRINUSE: address already in use :::5000
```

**解决方法**：
1. 查找占用端口的进程
   ```bash
   netstat -ano | findstr :5000
   ```

2. 终止进程
   ```bash
   taskkill /PID <进程号> /F
   ```

3. 或者修改 .env 中的 PORT 为其他端口（如 5001）

### 问题 4：前端无法连接后端

**解决方法**：
1. 确保后端已启动并运行在 http://localhost:5000
2. 检查 `client/package.json` 中的 proxy 配置：
   ```json
   "proxy": "http://localhost:5000"
   ```
3. 重启前端服务

## 验证清单

部署成功的标志：

- ✅ PostgreSQL 服务正在运行
- ✅ 数据库 `fft_solar_crm` 已创建
- ✅ 12 张表已创建并包含示例数据
- ✅ 后端服务器启动成功（http://localhost:5000）
- ✅ 前端应用启动成功（http://localhost:3000）
- ✅ 能用 admin/admin123 登录
- ✅ Dashboard 显示真实数据（不是 mock）
- ✅ 可以查看甲方列表（2条记录）
- ✅ 可以查看员工列表（4条记录）

## 下一步

系统成功运行后，可以：

1. **探索功能**
   - 创建新项目
   - 分配员工
   - 跟踪施工进度
   - 查看财务报表

2. **自定义数据**
   - 添加真实的甲方信息
   - 添加公司员工
   - 创建实际项目

3. **生产部署**
   - 参考 DEPLOYMENT.md 进行生产环境部署
   - 配置反向代理（Nginx）
   - 启用 HTTPS
   - 设置自动备份

## 技术支持

如遇到其他问题：
1. 查看后端日志（终端输出）
2. 查看前端控制台（F12）
3. 检查数据库连接（psql 测试）
4. 参考项目文档：
   - README.md
   - DEVELOPMENT.md
   - QUICKSTART.md

---

**祝部署顺利！** 🎉

如有问题，请仔细按照上述步骤操作，大部分问题都能解决。
