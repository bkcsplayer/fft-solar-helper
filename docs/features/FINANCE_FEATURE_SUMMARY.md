# 财务管理系统功能总结

## 🎉 已完成的功能

### 📊 1. 项目文件上传功能
**位置**: 项目详情页 → "文档和照片" Tab

**功能特点**:
- ✅ 分类上传照片和文档
- ✅ 照片网格展示（缩略图）
- ✅ 文档列表展示（文件名、大小、上传时间）
- ✅ 文件下载功能
- ✅ 文件删除功能
- ✅ 按项目独立存储：`uploads/project-{id}/`

**支持格式**:
- **照片**: JPG, PNG, GIF, WebP
- **文档**: PDF, Word (.doc, .docx), Excel (.xls, .xlsx), TXT

**访问路径**:
```
前端: http://localhost:3201/projects/{id} → Tab 6
后端API: http://localhost:3200/projects/{id}/files
```

---

### 💰 2. 增强版财务管理系统
**位置**: 财务管理页面（侧边栏 "Finance"）

#### Tab 1: 统计概览
**功能**:
- ✅ 总收入统计（项目收入 + 其他收入）
- ✅ 总支出统计（人工成本 + 汽车费用 + 其他支出）
- ✅ 净利润计算
- ✅ 项目统计（完成项目数、安装瓦数）
- ✅ 按月/按年筛选

**计算逻辑**:
```javascript
收入 = 总瓦数 × 甲方单价 ($/W) + 手动添加的其他收入
支出 = 员工薪资 + 车辆费用 + 手动添加的支出 + 月度固定支出
利润 = 收入 - 支出
```

#### Tab 2: 手动收支记录
**功能**:
- ✅ 手动添加收入/支出记录
- ✅ 编辑和删除记录
- ✅ 关联车辆（针对加油、维护费用）
- ✅ 详细备注

**收入分类**:
- 项目收入
- 其他收入
- 退款
- 投资收益

**支出分类**:
- 加油费 (fuel)
- 汽车维护 (vehicle_maintenance)
- 汽车贷款 (car_loan)
- 软件订阅 (software_subscription)
- 保险 (insurance)
- 设备 (equipment)
- 网购 (online_shopping)
- 水电费 (utilities)
- 房租 (rent)
- 其他 (other)

**API端点**:
```
GET    /finance/records          - 获取所有记录
POST   /finance/records          - 创建记录
PUT    /finance/records/:id      - 更新记录
DELETE /finance/records/:id      - 删除记录
```

#### Tab 3: 月度固定支出
**功能**:
- ✅ 管理定期支出（订阅、贷款等）
- ✅ 自动按月生成支出记录
- ✅ 支持每周/每月/每年频率
- ✅ 激活/停用开关
- ✅ 设置开始和结束日期

**自动处理逻辑**:
- 系统自动检测需要处理的月度固定支出
- 根据频率（每周/每月/每年）计算下次处理日期
- 自动创建对应的支出记录
- 更新`last_processed_date`

**手动触发**:
点击"处理本月支出"按钮可手动触发所有活跃的固定支出处理

**API端点**:
```
GET    /finance/recurring           - 获取固定支出列表
POST   /finance/recurring           - 创建固定支出
PUT    /finance/recurring/:id       - 更新固定支出
DELETE /finance/recurring/:id       - 删除固定支出
POST   /finance/recurring/process   - 手动处理固定支出
```

---

## 🗄️ 数据库结构

### 新增/更新的表

#### 1. `recurring_expenses` (月度固定支出)
```sql
id                    SERIAL PRIMARY KEY
name                  VARCHAR(100)      -- 名称（如: Netflix订阅）
category              VARCHAR(50)       -- 分类
amount                DECIMAL(10,2)     -- 金额
frequency             VARCHAR(20)       -- 频率: monthly/weekly/yearly
is_active             BOOLEAN           -- 是否激活
start_date            DATE              -- 开始日期
end_date              DATE              -- 结束日期（可为空）
last_processed_date   DATE              -- 最后处理日期
notes                 TEXT              -- 备注
created_by            INTEGER           -- 创建人
created_at            TIMESTAMP
updated_at            TIMESTAMP
```

#### 2. `finance_records` (更新)
**新增字段**:
```sql
vehicle_id            INTEGER           -- 关联车辆
recurring_expense_id  INTEGER           -- 关联固定支出
is_recurring          BOOLEAN           -- 是否自动生成
```

---

## 🎯 使用场景示例

### 场景 1: 添加汽车加油费
1. 进入"财务管理" → "手动记录"
2. 点击"添加记录"
3. 填写:
   - 日期: 2026-01-06
   - 类型: 支出
   - 分类: 加油费
   - 金额: $50
   - 车辆: 选择对应车辆
   - 备注: Shell加油站
4. 点击"保存"

### 场景 2: 设置月度软件订阅
1. 进入"财务管理" → "月度固定支出"
2. 点击"添加固定支出"
3. 填写:
   - 名称: QuickBooks订阅
   - 分类: 软件订阅
   - 金额: $29.99
   - 频率: 每月
   - 开始日期: 2026-01-01
   - 激活状态: ✓
4. 点击"保存"
5. 每月自动生成$29.99的支出记录

### 场景 3: 设置汽车月供
1. 进入"财务管理" → "月度固定支出"
2. 点击"添加固定支出"
3. 填写:
   - 名称: Ford F-150 月供
   - 分类: 汽车贷款
   - 金额: $650
   - 频率: 每月
   - 开始日期: 2024-01-01
   - 结束日期: 2029-12-31 (60个月贷款)
   - 激活状态: ✓
4. 每月自动扣除$650

### 场景 4: 查看财务统计
1. 进入"财务管理" → "统计概览"
2. 选择时间周期（按月/按年）
3. 选择年份和月份
4. 查看:
   - 总收入（项目收入 + 其他收入）
   - 总支出（人工 + 汽车 + 其他）
   - 净利润
   - 项目统计

---

## 🔐 权限说明

- **管理员**: 可以访问所有财务功能
- **员工**: 根据配置可能无法访问财务管理页面

---

## 📌 技术细节

### 后端技术栈
- **框架**: Node.js + Express.js
- **ORM**: Sequelize
- **数据库**: PostgreSQL 14
- **文件上传**: Multer
- **事务处理**: Sequelize Transactions

### 前端技术栈
- **框架**: React 18
- **UI库**: Material-UI v5
- **路由**: React Router v6
- **HTTP客户端**: Axios

### 数据关系
```
finance_records
├── belongs_to: project
├── belongs_to: staff
├── belongs_to: vehicle
├── belongs_to: recurring_expense
└── belongs_to: user (creator)

recurring_expenses
├── has_many: finance_records
└── belongs_to: user (creator)
```

---

## 🚀 部署状态

✅ **后端**: 运行中 - http://localhost:3200 (健康)
✅ **前端**: 运行中 - http://localhost:3201 (健康)
✅ **数据库**: 运行中 - localhost:3202 (健康)

---

## 📝 待优化功能（可选）

1. **定时任务**: 使用cron job每天自动处理月度固定支出
2. **财务报表导出**: 支持导出Excel/PDF格式的财务报表
3. **图表可视化**: 添加收支趋势图、分类饼图
4. **财务预算**: 设置月度预算并追踪
5. **多币种支持**: 支持不同货币的汇率转换

---

## 🎊 总结

本次更新完成了：
1. ✅ 项目文件上传管理（照片和文档）
2. ✅ 完整的财务管理系统
3. ✅ 手动收支记录管理
4. ✅ 月度固定支出自动化管理
5. ✅ 财务统计和报表

系统现在可以完整追踪所有收入和支出，包括：
- 项目收入（自动计算）
- 员工薪资（自动计算）
- 手动添加的各类支出（加油、维护、网购等）
- 自动扣费的月度固定支出（订阅、贷款等）

所有功能已部署并可在浏览器中测试！🎉
