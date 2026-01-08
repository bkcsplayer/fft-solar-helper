# FFT Solar CRM - NPM 脚本说明

## 根目录脚本 (/)

在项目根目录运行的命令：

### 开发相关

```bash
# 同时启动前后端（推荐用于开发）
npm run dev
```
- 同时启动后端服务器（端口 5000）和前端开发服务器（端口 3000）
- 使用 concurrently 工具并发运行
- 前端代理配置会自动将 API 请求转发到后端

```bash
# 仅启动后端服务器
npm run server
```
- 启动 Express 服务器
- 使用 nodemon 自动重启（代码变更时）
- 运行在 http://localhost:5000

```bash
# 仅启动前端开发服务器
npm run client
```
- 启动 React 开发服务器
- 运行在 http://localhost:3000
- 热重载功能

### 安装依赖

```bash
# 一键安装所有依赖（根目录 + client）
npm run install-all
```
- 安装根目录的依赖（后端）
- 自动进入 client 目录安装前端依赖
- 首次克隆项目后必须运行

### 生产构建

```bash
# 构建前端生产版本
npm run build
```
- 在 client 目录执行 `npm run build`
- 生成优化后的静态文件到 `client/build/`
- 用于生产环境部署

## 前端脚本 (client/)

在 `client/` 目录运行的命令：

```bash
cd client

# 启动开发服务器
npm start
```
- 启动 React 开发服务器
- 自动打开浏览器
- 热重载

```bash
# 构建生产版本
npm run build
```
- 创建优化后的生产构建
- 输出到 `build/` 目录
- 代码压缩、优化

```bash
# 运行测试
npm test
```
- 运行 Jest 测试
- 交互式测试模式

```bash
# 弹出配置（不推荐）
npm run eject
```
- 将隐藏的配置文件暴露出来
- **注意**: 这是单向操作，无法撤销

## 使用场景

### 场景 1: 初次设置项目

```bash
# 1. 克隆项目
git clone <repo-url>
cd fft-solar-help

# 2. 安装所有依赖
npm run install-all

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件

# 4. 创建并初始化数据库
createdb fft_solar_crm
psql -d fft_solar_crm -f database/schema.sql

# 5. 启动开发服务器
npm run dev
```

### 场景 2: 日常开发

```bash
# 启动开发环境（前后端同时）
npm run dev

# 或者分别启动（在两个终端）
# 终端 1
npm run server

# 终端 2
npm run client
```

### 场景 3: 仅开发前端

```bash
# 确保后端已运行
npm run server

# 在另一个终端启动前端
cd client
npm start
```

### 场景 4: 仅开发后端

```bash
# 启动后端并监听变化
npm run server

# 使用 Postman 或 curl 测试 API
curl http://localhost:5000/api/clients
```

### 场景 5: 准备部署

```bash
# 1. 构建前端
npm run build

# 2. 设置生产环境变量
export NODE_ENV=production

# 3. 启动生产服务器（使用 PM2）
pm2 start server/index.js --name fft-solar-crm
```

## 自定义脚本

### 添加新的脚本

编辑根目录的 `package.json`：

```json
{
  "scripts": {
    "server": "nodemon server/index.js",
    "client": "cd client && npm start",
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "build": "cd client && npm run build",
    "install-all": "npm install && cd client && npm install",

    // 添加自定义脚本
    "db:reset": "psql -d fft_solar_crm -f database/schema.sql",
    "db:backup": "pg_dump fft_solar_crm > backup.sql",
    "test:api": "jest --testPathPattern=server",
    "lint": "eslint server client/src"
  }
}
```

### 有用的自定义脚本示例

```json
{
  "scripts": {
    // 数据库管理
    "db:create": "createdb fft_solar_crm",
    "db:drop": "dropdb fft_solar_crm",
    "db:reset": "npm run db:drop && npm run db:create && psql -d fft_solar_crm -f database/schema.sql",
    "db:backup": "pg_dump fft_solar_crm > backups/backup-$(date +%Y%m%d).sql",

    // 测试
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",

    // 代码质量
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write \"**/*.{js,jsx,json,md}\"",

    // 生产部署
    "start:prod": "NODE_ENV=production node server/index.js",
    "deploy": "npm run build && npm run start:prod"
  }
}
```

## 环境变量

脚本中使用环境变量：

```bash
# 开发环境
NODE_ENV=development npm run server

# 生产环境
NODE_ENV=production npm start

# 自定义端口
PORT=3001 npm run server
```

## 依赖管理

### 安装新依赖

```bash
# 后端依赖（在根目录）
npm install express-rate-limit

# 前端依赖（在 client 目录）
cd client
npm install recharts
```

### 更新依赖

```bash
# 查看过时的包
npm outdated

# 更新所有包到最新版本
npm update

# 更新特定包
npm install express@latest
```

### 删除依赖

```bash
# 后端
npm uninstall package-name

# 前端
cd client
npm uninstall package-name
```

## 故障排除

### 端口冲突

```bash
# 修改后端端口
PORT=5001 npm run server

# 修改前端端口
PORT=3001 npm run client
```

### 清除缓存

```bash
# 清除 npm 缓存
npm cache clean --force

# 删除 node_modules 重新安装
rm -rf node_modules
rm -rf client/node_modules
npm run install-all
```

### Nodemon 不工作

```bash
# 全局安装 nodemon
npm install -g nodemon

# 或在本地使用 npx
npx nodemon server/index.js
```

## 性能监控

### 使用 PM2

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start server/index.js --name fft-solar

# 查看状态
pm2 status

# 查看日志
pm2 logs fft-solar

# 监控
pm2 monit

# 重启
pm2 restart fft-solar

# 停止
pm2 stop fft-solar
```

## 快速参考

| 命令 | 作用 | 使用场景 |
|------|------|----------|
| `npm run dev` | 启动前后端 | 日常开发 |
| `npm run server` | 仅启动后端 | 后端开发/API测试 |
| `npm run client` | 仅启动前端 | 前端开发 |
| `npm run install-all` | 安装所有依赖 | 首次设置/依赖更新 |
| `npm run build` | 构建前端 | 生产部署 |
| `npm start` | 运行（生产） | 生产环境 |

## 调试模式

### 后端调试

```bash
# 使用 Node.js 调试器
node --inspect server/index.js

# 使用 VS Code 调试
# 添加到 .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Server",
  "program": "${workspaceFolder}/server/index.js",
  "restart": true,
  "console": "integratedTerminal"
}
```

### 前端调试

```bash
# React DevTools
# 安装 Chrome 扩展: React Developer Tools

# 启用 source maps
GENERATE_SOURCEMAP=true npm start
```

## CI/CD 脚本

```json
{
  "scripts": {
    "ci:install": "npm ci && cd client && npm ci",
    "ci:test": "npm test && cd client && npm test",
    "ci:build": "npm run build",
    "ci:deploy": "npm run ci:install && npm run ci:test && npm run ci:build"
  }
}
```

---

**提示**: 所有脚本都在项目根目录运行，除非特别说明需要在 `client/` 目录运行。

**推荐工作流**: `npm run install-all` → 配置 `.env` → `npm run dev`
