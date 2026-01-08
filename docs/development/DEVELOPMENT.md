# FFT Solar CRM 开发指南

## 开发环境设置

### 1. 克隆项目

```bash
git clone <repository-url>
cd fft-solar-help
```

### 2. 安装依赖

```bash
# 安装后端依赖
npm install

# 安装前端依赖
cd client
npm install
cd ..
```

### 3. 配置数据库

```bash
# 启动 PostgreSQL
# Windows: 使用 pgAdmin 或命令行
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql

# 创建数据库
createdb fft_solar_crm

# 导入数据库结构
psql -d fft_solar_crm -f database/schema.sql
```

### 4. 配置环境变量

```bash
# 复制示例文件
cp .env.example .env

# 编辑 .env 文件，配置数据库连接等信息
```

### 5. 启动开发服务器

```bash
# 方式 1: 同时启动前后端
npm run dev

# 方式 2: 分别启动
# 终端 1 - 后端
npm run server

# 终端 2 - 前端
npm run client
```

## 项目架构

### 后端架构

```
server/
├── config/         # 配置文件
├── controllers/    # 业务逻辑控制器
├── middleware/     # 中间件（认证、错误处理等）
├── models/         # 数据模型（Sequelize）
├── routes/         # API 路由定义
├── utils/          # 工具函数
└── index.js        # 入口文件
```

### 前端架构

```
client/src/
├── components/     # 可复用组件
├── context/        # React Context（状态管理）
├── pages/          # 页面组件
├── services/       # API 调用服务
├── App.js          # 主应用组件
└── index.js        # 入口文件
```

## 开发规范

### 代码风格

- 使用 ES6+ 语法
- 使用 async/await 处理异步
- 遵循 RESTful API 设计原则
- 使用有意义的变量和函数名
- 添加必要的注释

### Git 提交规范

```bash
# 功能开发
git commit -m "feat: 添加甲方管理功能"

# Bug 修复
git commit -m "fix: 修复项目列表分页问题"

# 文档更新
git commit -m "docs: 更新 API 文档"

# 代码重构
git commit -m "refactor: 重构项目控制器"

# 样式调整
git commit -m "style: 调整 Dashboard 布局"
```

## API 开发

### 添加新的 API 端点

1. **创建控制器** (`server/controllers/`)

```javascript
// server/controllers/exampleController.js
const { Example } = require('../models');

exports.getExamples = async (req, res) => {
  try {
    const examples = await Example.findAll();
    res.json(examples);
  } catch (error) {
    console.error('Get examples error:', error);
    res.status(500).json({ error: 'Failed to fetch examples' });
  }
};
```

2. **创建路由** (`server/routes/`)

```javascript
// server/routes/example.js
const express = require('express');
const router = express.Router();
const exampleController = require('../controllers/exampleController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);
router.get('/', exampleController.getExamples);

module.exports = router;
```

3. **注册路由** (`server/routes/index.js`)

```javascript
const exampleRoutes = require('./example');
router.use('/examples', exampleRoutes);
```

### API 错误处理

```javascript
try {
  // 业务逻辑
  const result = await someOperation();
  res.json(result);
} catch (error) {
  console.error('Operation error:', error);
  res.status(500).json({
    error: 'Operation failed',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}
```

## 前端开发

### 添加新页面

1. **创建页面组件** (`client/src/pages/`)

```javascript
// client/src/pages/Example/ExampleList.js
import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import api from '../../services/api';

const ExampleList = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/examples');
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4">Example List</Typography>
      {/* 渲染数据 */}
    </Box>
  );
};

export default ExampleList;
```

2. **添加路由** (`client/src/App.js`)

```javascript
import ExampleList from './pages/Example/ExampleList';

<Route path="examples" element={<ExampleList />} />
```

3. **添加菜单** (`client/src/components/Layout.js`)

```javascript
const menuItems = [
  // ...
  { text: '示例', icon: <Icon />, path: '/examples' },
];
```

### API 调用

```javascript
// 使用 api.js 服务（自动添加 token）
import api from '../services/api';

// GET 请求
const response = await api.get('/endpoint');

// POST 请求
const response = await api.post('/endpoint', { data });

// PUT 请求
const response = await api.put('/endpoint/:id', { data });

// DELETE 请求
const response = await api.delete('/endpoint/:id');
```

## 数据库操作

### 使用 Sequelize ORM

```javascript
// 查询所有记录
const items = await Model.findAll();

// 带条件查询
const items = await Model.findAll({
  where: { status: 'active' },
  order: [['created_at', 'DESC']],
  limit: 10
});

// 查询单条记录
const item = await Model.findByPk(id);
const item = await Model.findOne({ where: { name: 'test' } });

// 创建记录
const item = await Model.create({ name: 'test', value: 123 });

// 更新记录
await item.update({ value: 456 });

// 删除记录
await item.destroy();

// 关联查询
const items = await Model.findAll({
  include: [
    { model: RelatedModel, as: 'relation' }
  ]
});
```

### 事务处理

```javascript
const { sequelize } = require('./models');

const t = await sequelize.transaction();

try {
  const item1 = await Model1.create({ data }, { transaction: t });
  const item2 = await Model2.create({ data }, { transaction: t });

  await t.commit();
} catch (error) {
  await t.rollback();
  throw error;
}
```

## 测试

### 手动测试 API

```bash
# 使用 curl
curl -X GET http://localhost:5000/api/clients \
  -H "Authorization: Bearer YOUR_TOKEN"

# 使用 Postman
1. 创建请求
2. 添加 Authorization header
3. 发送请求
```

### 测试数据

数据库初始化脚本已包含示例数据：
- 2 个甲方公司
- 4 个员工
- 1 个管理员用户

## 常见问题

### 数据库连接失败

```bash
# 检查 PostgreSQL 是否运行
# Windows
pg_ctl status

# Mac/Linux
sudo systemctl status postgresql

# 检查 .env 配置
cat .env | grep DB_
```

### 端口被占用

```bash
# 查找占用端口的进程
# Windows
netstat -ano | findstr :5000

# Mac/Linux
lsof -i :5000

# 杀死进程
# Windows
taskkill /PID <PID> /F

# Mac/Linux
kill -9 <PID>
```

### 前端代理问题

如果前端无法连接后端 API，检查 `client/package.json`：

```json
{
  "proxy": "http://localhost:5000"
}
```

## 调试技巧

### 后端调试

```javascript
// 使用 console.log
console.log('Debug:', variable);

// 使用 debugger
debugger;

// 使用 VS Code 调试
// 创建 .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Server",
      "program": "${workspaceFolder}/server/index.js"
    }
  ]
}
```

### 前端调试

```javascript
// 使用 console.log
console.log('Component state:', state);

// 使用 React DevTools
// Chrome 扩展：React Developer Tools

// 使用 debugger
debugger;
```

## 性能优化

### 后端优化

1. **数据库查询优化**
   - 使用索引
   - 避免 N+1 查询
   - 使用分页

2. **缓存策略**
   - Redis 缓存常用数据
   - API 响应缓存

### 前端优化

1. **组件优化**
   - 使用 React.memo
   - 使用 useMemo 和 useCallback
   - 懒加载路由

2. **打包优化**
   - 代码分割
   - 压缩资源
   - Tree shaking

## 部署前检查清单

- [ ] 所有功能测试通过
- [ ] 更新环境变量
- [ ] 数据库备份
- [ ] 更新文档
- [ ] 安全检查（密码、密钥等）
- [ ] 性能测试
- [ ] 日志配置
- [ ] 错误监控

## 有用的命令

```bash
# 查看数据库表
psql -d fft_solar_crm -c "\dt"

# 查看表结构
psql -d fft_solar_crm -c "\d projects"

# 导出数据
pg_dump fft_solar_crm > backup.sql

# 导入数据
psql fft_solar_crm < backup.sql

# 清空表
psql -d fft_solar_crm -c "TRUNCATE projects CASCADE"

# 重置自增 ID
psql -d fft_solar_crm -c "ALTER SEQUENCE projects_id_seq RESTART WITH 1"
```

## 资源链接

- [Express.js 文档](https://expressjs.com/)
- [Sequelize 文档](https://sequelize.org/)
- [React 文档](https://react.dev/)
- [Material-UI 文档](https://mui.com/)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

---

Happy Coding! 🚀
