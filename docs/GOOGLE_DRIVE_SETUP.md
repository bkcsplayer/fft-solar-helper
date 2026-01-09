# Google Drive 配置说明

## ⚠️ 重要：凭证文件配置

### 方式1: 使用凭证文件（推荐）

**步骤：**

1. **获取Service Account凭证文件**
   ```bash
   # 从Google Cloud Console下载credentials.json
   ```

2. **将凭证文件放到服务器**
   ```bash
   # 创建config目录
   mkdir -p /www/wwwroot/fft-solar-helper/server/config
   
   # 上传凭证文件
   scp credentials.json root@vps:/www/wwwroot/fft-solar-helper/server/config/google-drive-credentials.json
   
   # 设置权限（重要！）
   chmod 600 /www/wwwroot/fft-solar-helper/server/config/google-drive-credentials.json
   ```

3. **在.env中配置文件路径**
   ```env
   GOOGLE_SERVICE_ACCOUNT_KEY_PATH=/app/config/google-drive-credentials.json
   ```

4. **确保Docker可以访问该文件**
   - 修改`docker-compose.yml`添加volume映射：
   ```yaml
   volumes:
     - ./server/config:/app/config:ro  # ro = read-only
   ```

### 方式2: 使用环境变量（不推荐，但可行）

如果必须用环境变量，需要把JSON转为base64：

```bash
# 转换凭证为base64
cat credentials.json | base64 -w 0 > credentials.base64

# 在.env中设置
GOOGLE_SERVICE_ACCOUNT_KEY_BASE64=<paste_base64_here>
```

代码中解码：
```javascript
const credentials = JSON.parse(
  Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64, 'base64').toString()
);
```

---

## 📋 完整配置清单

### 1. `.env` 文件配置

```env
# Google Drive Configuration
GOOGLE_DRIVE_ENABLED=true
GOOGLE_DRIVE_ROOT_FOLDER_ID=1abc...xyz
GOOGLE_SERVICE_ACCOUNT_EMAIL=fft-solar@project-id.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=/app/config/google-drive-credentials.json
GOOGLE_DRIVE_WEBHOOK_TOKEN=your_random_secure_token_here_use_uuid
GOOGLE_DRIVE_SYNC_INTERVAL=300
```

### 2. Docker Compose配置

**修改 `docker-compose.yml`：**

```yaml
services:
  backend:
    # ... 现有配置
    volumes:
      - ./server:/app
      - ./uploads:/app/uploads
      - ./server/config:/app/config:ro  # 新增：只读挂载config目录
    environment:
      # ... 现有环境变量
      - GOOGLE_DRIVE_ENABLED=${GOOGLE_DRIVE_ENABLED}
      - GOOGLE_DRIVE_ROOT_FOLDER_ID=${GOOGLE_DRIVE_ROOT_FOLDER_ID}
      - GOOGLE_SERVICE_ACCOUNT_EMAIL=${GOOGLE_SERVICE_ACCOUNT_EMAIL}
      - GOOGLE_SERVICE_ACCOUNT_KEY_PATH=${GOOGLE_SERVICE_ACCOUNT_KEY_PATH}
```

### 3. .gitignore 确保安全

**确保以下文件不被提交：**

```gitignore
# 环境变量
.env
.env.local
.env.*.local

# Google Drive凭证
server/config/google-drive-credentials.json
server/config/*.json
credentials.json
*.pem
```

---

## 🔐 安全最佳实践

### ✅ 推荐做法

1. **文件方式存储凭证**
   - 权限设置为600（只有owner可读写）
   - 不提交到Git
   - Docker挂载为只读

2. **使用.env管理配置参数**
   - Folder ID
   - Service Account Email  
   - Webhook Token

3. **VPS服务器上的完整配置**
   ```bash
   # 1. 创建config目录
   mkdir -p /www/wwwroot/fft-solar-helper/server/config
   
   # 2. 上传凭证
   scp credentials.json root@vps:/www/wwwroot/fft-solar-helper/server/config/google-drive-credentials.json
   
   # 3. 设置权限
   chmod 600 /www/wwwroot/fft-solar-helper/server/config/google-drive-credentials.json
   
   # 4. 编辑.env
   nano /www/wwwroot/fft-solar-helper/.env
   
   # 添加：
   GOOGLE_DRIVE_ENABLED=true
   GOOGLE_DRIVE_ROOT_FOLDER_ID=your_folder_id
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service@project.iam.gserviceaccount.com
   GOOGLE_SERVICE_ACCOUNT_KEY_PATH=/app/config/google-drive-credentials.json
   GOOGLE_DRIVE_WEBHOOK_TOKEN=$(uuidgen)  # 或任何随机字符串
   ```

### ❌ 不推荐做法

1. ❌ 把JSON内容直接粘贴到.env（太长且不安全）
2. ❌ 把凭证文件提交到Git
3. ❌ 使用777权限
4. ❌ 硬编码到代码中

---

## 🚀 快速开始脚本

创建一个设置脚本简化配置：

**`scripts/setup-google-drive.sh`：**

```bash
#!/bin/bash

echo "🔧 Google Drive配置向导"
echo "========================"
echo ""

# 1. 检查凭证文件
read -p "请输入Service Account凭证文件路径: " CRED_PATH

if [ ! -f "$CRED_PATH" ]; then
    echo "❌ 文件不存在: $CRED_PATH"
    exit 1
fi

# 2. 复制到config目录
mkdir -p server/config
cp "$CRED_PATH" server/config/google-drive-credentials.json
chmod 600 server/config/google-drive-credentials.json
echo "✅ 凭证文件已复制"

# 3. 提取Service Account Email
EMAIL=$(jq -r '.client_email' server/config/google-drive-credentials.json)
echo "📧 Service Account Email: $EMAIL"

# 4. 获取其他配置
read -p "请输入Root Folder ID: " FOLDER_ID
WEBHOOK_TOKEN=$(uuidgen)

# 5. 更新.env
cat >> .env << EOF

# Google Drive Configuration (自动生成)
GOOGLE_DRIVE_ENABLED=true
GOOGLE_DRIVE_ROOT_FOLDER_ID=$FOLDER_ID
GOOGLE_SERVICE_ACCOUNT_EMAIL=$EMAIL
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=/app/config/google-drive-credentials.json
GOOGLE_DRIVE_WEBHOOK_TOKEN=$WEBHOOK_TOKEN
GOOGLE_DRIVE_SYNC_INTERVAL=300
EOF

echo ""
echo "✅ 配置完成！"
echo "请确保已在Google Drive中将根文件夹共享给："
echo "   $EMAIL"
```

使用：
```bash
chmod +x scripts/setup-google-drive.sh
./scripts/setup-google-drive.sh
```

---

## 📝 总结

**推荐配置方式：**

```
项目结构：
fft-solar-helper/
├── .env                          # 配置参数（Folder ID等）
├── .gitignore                    # 排除凭证文件
├── docker-compose.yml            # 挂载config目录
└── server/
    └── config/
        └── google-drive-credentials.json  # 凭证文件（不提交Git）
```

**VPS部署时：**
1. 手动上传凭证文件到VPS
2. 在VPS的.env中配置参数
3. 重启Docker容器

这样既安全又灵活！
