# FFT Solar CRM - Windows 自动部署脚本
# 使用方法：以管理员身份运行 PowerShell，然后执行：powershell -ExecutionPolicy Bypass -File deploy-windows.ps1

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "FFT Solar CRM - 自动部署脚本" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否以管理员身份运行
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "警告：建议以管理员身份运行此脚本" -ForegroundColor Yellow
    Write-Host "某些操作可能需要管理员权限" -ForegroundColor Yellow
    Write-Host ""
}

# 步骤 1: 检查 Node.js
Write-Host "步骤 1: 检查 Node.js..." -ForegroundColor Green
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js 已安装: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ 错误: 未检测到 Node.js" -ForegroundColor Red
    Write-Host "请先安装 Node.js: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# 步骤 2: 检查 PostgreSQL
Write-Host ""
Write-Host "步骤 2: 检查 PostgreSQL..." -ForegroundColor Green
try {
    $psqlVersion = psql --version 2>&1
    Write-Host "✓ PostgreSQL 已安装: $psqlVersion" -ForegroundColor Green
    $postgresInstalled = $true
} catch {
    Write-Host "✗ PostgreSQL 未安装" -ForegroundColor Yellow
    $postgresInstalled = $false

    # 尝试使用 Chocolatey 安装
    if (Get-Command choco -ErrorAction SilentlyContinue) {
        Write-Host "检测到 Chocolatey，尝试自动安装 PostgreSQL..." -ForegroundColor Yellow

        if ($isAdmin) {
            Write-Host "正在安装 PostgreSQL 14（这可能需要几分钟）..." -ForegroundColor Yellow
            choco install postgresql14 -y --force

            # 刷新环境变量
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

            # 再次检查
            try {
                $psqlVersion = psql --version 2>&1
                Write-Host "✓ PostgreSQL 安装成功: $psqlVersion" -ForegroundColor Green
                $postgresInstalled = $true
            } catch {
                Write-Host "✗ 自动安装失败，请手动安装 PostgreSQL" -ForegroundColor Red
            }
        } else {
            Write-Host "需要管理员权限才能安装 PostgreSQL" -ForegroundColor Yellow
            Write-Host "请以管理员身份重新运行此脚本，或手动安装 PostgreSQL" -ForegroundColor Yellow
        }
    } else {
        Write-Host "请手动安装 PostgreSQL 14 或更高版本" -ForegroundColor Yellow
        Write-Host "下载地址: https://www.postgresql.org/download/windows/" -ForegroundColor Cyan
    }

    if (-not $postgresInstalled) {
        Write-Host ""
        Write-Host "安装 PostgreSQL 后，请重新运行此脚本" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "快速安装步骤:" -ForegroundColor Cyan
        Write-Host "1. 下载 PostgreSQL: https://www.postgresql.org/download/windows/" -ForegroundColor White
        Write-Host "2. 运行安装程序，设置密码为: postgres" -ForegroundColor White
        Write-Host "3. 安装完成后，重新运行此脚本" -ForegroundColor White
        exit 1
    }
}

# 步骤 3: 安装项目依赖
Write-Host ""
Write-Host "步骤 3: 安装项目依赖..." -ForegroundColor Green

if (-not (Test-Path "node_modules")) {
    Write-Host "安装后端依赖..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "✓ 后端依赖已安装" -ForegroundColor Green
}

if (-not (Test-Path "client\node_modules")) {
    Write-Host "安装前端依赖..." -ForegroundColor Yellow
    Set-Location client
    npm install
    Set-Location ..
} else {
    Write-Host "✓ 前端依赖已安装" -ForegroundColor Green
}

# 步骤 4: 配置环境变量
Write-Host ""
Write-Host "步骤 4: 配置环境变量..." -ForegroundColor Green

if (-not (Test-Path ".env")) {
    Write-Host "输入 PostgreSQL 密码（默认: postgres）:" -ForegroundColor Yellow
    $dbPassword = Read-Host "密码"
    if ([string]::IsNullOrEmpty($dbPassword)) {
        $dbPassword = "postgres"
    }

    $envContent = @"
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fft_solar_crm
DB_USER=postgres
DB_PASSWORD=$dbPassword

# JWT Secret
JWT_SECRET=fft_solar_crm_secret_key_2025_development
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Email Configuration (Nodemailer) - Optional
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=FFT Solar CRM <noreply@fftsolar.com>

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
"@

    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✓ .env 文件已创建" -ForegroundColor Green
} else {
    Write-Host "✓ .env 文件已存在" -ForegroundColor Green
}

# 步骤 5: 创建数据库
Write-Host ""
Write-Host "步骤 5: 创建数据库..." -ForegroundColor Green

# 读取 .env 获取密码
$envContent = Get-Content ".env"
$dbPassword = ($envContent | Select-String "DB_PASSWORD=(.+)" | ForEach-Object { $_.Matches.Groups[1].Value })

# 设置密码环境变量
$env:PGPASSWORD = $dbPassword

# 检查数据库是否已存在
$dbExists = psql -U postgres -lqt 2>$null | Select-String -Pattern "fft_solar_crm"

if (-not $dbExists) {
    Write-Host "创建数据库 fft_solar_crm..." -ForegroundColor Yellow
    createdb -U postgres fft_solar_crm 2>&1 | Out-Null

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ 数据库创建成功" -ForegroundColor Green
    } else {
        Write-Host "✗ 数据库创建失败" -ForegroundColor Red
        Write-Host "请检查 PostgreSQL 是否正在运行，以及密码是否正确" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "✓ 数据库已存在" -ForegroundColor Green
}

# 步骤 6: 导入数据库结构
Write-Host ""
Write-Host "步骤 6: 导入数据库结构和示例数据..." -ForegroundColor Green

# 检查是否已有表
$tableCount = psql -U postgres -d fft_solar_crm -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>$null

if ($tableCount -eq $null -or $tableCount -eq 0) {
    Write-Host "导入数据库结构..." -ForegroundColor Yellow
    psql -U postgres -d fft_solar_crm -f database\schema.sql 2>&1 | Out-Null

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ 数据库结构导入成功" -ForegroundColor Green
    } else {
        Write-Host "✗ 数据库导入失败" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✓ 数据库表已存在（共 $tableCount 张表）" -ForegroundColor Green
    Write-Host "如需重新导入，请先删除数据库" -ForegroundColor Yellow
}

# 清除密码环境变量
Remove-Item Env:\PGPASSWORD

# 步骤 7: 验证安装
Write-Host ""
Write-Host "步骤 7: 验证安装..." -ForegroundColor Green

# 验证数据库表
$tableList = @("users", "clients", "staff", "projects", "vehicles", "assets", "finance_records")
$allTablesExist = $true

foreach ($table in $tableList) {
    $tableExists = psql -U postgres -d fft_solar_crm -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '$table');" 2>$null

    if ($tableExists -like "*t*") {
        Write-Host "  ✓ 表 $table 存在" -ForegroundColor Green
    } else {
        Write-Host "  ✗ 表 $table 不存在" -ForegroundColor Red
        $allTablesExist = $false
    }
}

# 完成
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "部署完成！" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "下一步操作:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. 启动开发服务器:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. 打开浏览器访问:" -ForegroundColor White
Write-Host "   http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. 使用以下账号登录:" -ForegroundColor White
Write-Host "   用户名: admin" -ForegroundColor Cyan
Write-Host "   密码:   admin123" -ForegroundColor Cyan
Write-Host ""
Write-Host "提示: 按 Ctrl+C 可停止服务器" -ForegroundColor Yellow
Write-Host ""

# 询问是否立即启动
Write-Host "是否立即启动开发服务器？(Y/N): " -ForegroundColor Yellow -NoNewline
$startNow = Read-Host

if ($startNow -eq "Y" -or $startNow -eq "y" -or $startNow -eq "") {
    Write-Host ""
    Write-Host "正在启动服务器..." -ForegroundColor Green
    Write-Host "前端: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "后端: http://localhost:5000" -ForegroundColor Cyan
    Write-Host ""
    npm run dev
}
