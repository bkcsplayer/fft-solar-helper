# FFT Solar CRM - 项目文件清单

## 项目根目录

```
fft-solar-help/
├── package.json                 # 根 package.json（包含脚本）
├── .env.example                 # 环境变量示例
├── .gitignore                   # Git 忽略文件配置
├── README.md                    # 项目说明文档
├── QUICKSTART.md               # 快速启动指南
├── DEVELOPMENT.md              # 开发指南
├── DEPLOYMENT.md               # 部署指南
├── PROJECT_SUMMARY.md          # 项目总结
└── FILE_LIST.md                # 本文件
```

## 后端代码 (server/)

### 配置文件
```
server/config/
└── database.js                  # Sequelize 数据库配置
```

### 控制器 (Controllers)
```
server/controllers/
├── authController.js            # 认证控制器（登录/登出）
├── clientController.js          # 甲方管理控制器
├── staffController.js           # 员工管理控制器
├── projectController.js         # 项目管理控制器（核心）
├── vehicleController.js         # 车辆管理控制器
├── assetController.js           # 资产设备控制器
├── financeController.js         # 财务管理控制器
└── dashboardController.js       # Dashboard 控制器
```

### 中间件 (Middleware)
```
server/middleware/
└── auth.js                      # JWT 认证中间件
```

### 数据模型 (Models)
```
server/models/
├── index.js                     # 模型聚合和关系定义
├── User.js                      # 用户模型
├── Client.js                    # 甲方模型
├── Staff.js                     # 员工模型
├── Project.js                   # 项目模型
├── ProjectInverter.js           # 项目逆变器模型
├── ProjectAssignment.js         # 项目人员分配模型
├── ProjectProgress.js           # 项目进度模型
├── Vehicle.js                   # 车辆模型
├── VehicleUsage.js             # 车辆使用记录模型
├── VehicleMaintenance.js       # 车辆维护记录模型
├── Asset.js                     # 资产模型
└── FinanceRecord.js            # 财务记录模型
```

### 路由 (Routes)
```
server/routes/
├── index.js                     # 路由聚合
├── auth.js                      # 认证路由
├── clients.js                   # 甲方路由
├── staff.js                     # 员工路由
├── projects.js                  # 项目路由
├── vehicles.js                  # 车辆路由
├── assets.js                    # 资产路由
├── finance.js                   # 财务路由
└── dashboard.js                 # Dashboard 路由
```

### 工具函数 (Utils)
```
server/utils/
└── emailService.js              # 邮件发送服务
```

### 服务器入口
```
server/
└── index.js                     # Express 服务器入口文件
```

## 前端代码 (client/)

### 公共文件
```
client/public/
└── index.html                   # HTML 模板
```

### 源代码
```
client/src/
├── index.js                     # React 入口文件
├── App.js                       # 主应用组件
```

### 组件 (Components)
```
client/src/components/
├── Layout.js                    # 主布局（侧边栏+顶栏）
└── PrivateRoute.js             # 受保护路由组件
```

### 上下文 (Context)
```
client/src/context/
└── AuthContext.js              # 认证上下文
```

### 页面 (Pages)
```
client/src/pages/
├── Login.js                     # 登录页面
├── Dashboard.js                 # Dashboard 首页
│
├── Clients/                     # 甲方管理
│   ├── ClientList.js           # 甲方列表（已实现）
│   └── ClientForm.js           # 甲方表单（框架）
│
├── Staff/                       # 员工管理
│   ├── StaffList.js            # 员工列表（框架）
│   └── StaffForm.js            # 员工表单（框架）
│
├── Projects/                    # 项目管理
│   ├── ProjectList.js          # 项目列表（框架）
│   ├── ProjectForm.js          # 项目表单（框架）
│   └── ProjectDetail.js        # 项目详情（框架）
│
├── Vehicles/                    # 车辆管理
│   └── VehicleList.js          # 车辆列表（框架）
│
├── Assets/                      # 资产管理
│   └── AssetList.js            # 资产列表（框架）
│
└── Finance/                     # 财务管理
    └── FinanceOverview.js      # 财务概览（框架）
```

### 服务 (Services)
```
client/src/services/
└── api.js                       # Axios API 封装
```

### 前端配置
```
client/
└── package.json                 # 前端依赖配置
```

## 数据库脚本 (database/)

```
database/
├── schema.sql                   # 完整数据库表结构
└── init-admin.js               # 管理员密码生成脚本
```

## API 端点总览

### 认证 API
```
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/logout
```

### 甲方管理 API
```
GET    /api/clients
POST   /api/clients
GET    /api/clients/:id
PUT    /api/clients/:id
DELETE /api/clients/:id
GET    /api/clients/:id/projects
```

### 员工管理 API
```
GET    /api/staff
POST   /api/staff
GET    /api/staff/:id
PUT    /api/staff/:id
DELETE /api/staff/:id
GET    /api/staff/:id/payments
```

### 项目管理 API
```
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id

# 逆变器
POST   /api/projects/:id/inverters
PUT    /api/projects/:id/inverters/:inverterId
DELETE /api/projects/:id/inverters/:inverterId

# 人员分配
GET    /api/projects/:id/assignments
POST   /api/projects/:id/assignments
DELETE /api/projects/:id/assignments/:assignmentId
POST   /api/projects/:id/notify

# 进度管理
GET    /api/projects/:id/progress
PUT    /api/projects/:id/progress/:stage

# 财务
GET    /api/projects/:id/finance
```

### 车辆管理 API
```
GET    /api/vehicles
POST   /api/vehicles
GET    /api/vehicles/:id
PUT    /api/vehicles/:id
DELETE /api/vehicles/:id
GET    /api/vehicles/:id/usage
POST   /api/vehicles/:id/usage
GET    /api/vehicles/:id/maintenance
POST   /api/vehicles/:id/maintenance
```

### 资产管理 API
```
GET    /api/assets
POST   /api/assets
GET    /api/assets/:id
PUT    /api/assets/:id
DELETE /api/assets/:id
```

### 财务管理 API
```
GET    /api/finance/records
POST   /api/finance/records
PUT    /api/finance/records/:id
DELETE /api/finance/records/:id
GET    /api/finance/summary
GET    /api/finance/projects
GET    /api/finance/staff
```

### Dashboard API
```
GET    /api/dashboard/overview
GET    /api/dashboard/charts
```

## 数据库表结构

### 用户和权限
- `users` - 管理员用户

### 业务核心
- `clients` - 甲方公司
- `staff` - 员工
- `projects` - 项目
- `project_inverters` - 项目逆变器
- `project_assignments` - 项目人员分配
- `project_progress` - 施工进度

### 资产管理
- `vehicles` - 车辆
- `vehicle_usage` - 车辆使用记录
- `vehicle_maintenance` - 车辆维护记录
- `assets` - 资产设备

### 财务
- `finance_records` - 财务记录

## 文件统计

### 后端
- **控制器**: 8 个
- **模型**: 13 个（含 index.js）
- **路由**: 9 个（含 index.js）
- **中间件**: 1 个
- **工具**: 1 个

### 前端
- **页面组件**: 11 个
- **共用组件**: 2 个
- **服务**: 1 个
- **上下文**: 1 个

### 文档
- **README.md** - 项目说明
- **QUICKSTART.md** - 快速启动
- **DEVELOPMENT.md** - 开发指南
- **DEPLOYMENT.md** - 部署指南
- **PROJECT_SUMMARY.md** - 项目总结
- **FILE_LIST.md** - 文件清单（本文件）

### 数据库
- **schema.sql** - 数据库结构（~300 行）
- **init-admin.js** - 密码生成工具

## 代码行数估算

| 类型 | 文件数 | 估算行数 |
|------|--------|----------|
| 后端控制器 | 8 | ~2,500 |
| 后端模型 | 13 | ~1,000 |
| 后端路由 | 9 | ~400 |
| 后端其他 | 3 | ~200 |
| 前端组件 | 14 | ~1,500 |
| 前端服务 | 2 | ~100 |
| 数据库 SQL | 1 | ~300 |
| 文档 | 6 | ~2,000 |
| **总计** | **56** | **~8,000** |

## 核心功能实现状态

### ✅ 已完成（可运行）
- 后端完整 API
- 数据库完整结构
- 认证系统
- Dashboard 页面
- 甲方列表页面
- 路由和导航

### ⏳ 待完善（已有框架）
- 其他前端页面的详细实现
- 文件上传功能
- 图表可视化
- 数据导出功能

## 技术栈版本

```json
{
  "node": ">=16.0.0",
  "react": "^18.2.0",
  "@mui/material": "^5.14.19",
  "express": "^4.18.2",
  "sequelize": "^6.35.1",
  "postgresql": ">=12.0.0"
}
```

---

**文件总数**: 56+ 个文件
**代码行数**: ~8,000 行
**开发时间**: 约 6-8 小时（完整系统框架）
**项目状态**: ✅ 核心功能完成，可用于开发测试

---

最后更新: 2025年1月5日
