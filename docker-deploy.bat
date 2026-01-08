@echo off
chcp 65001 >nul
title FFT Solar CRM - Docker 部署

echo =====================================
echo FFT Solar CRM - Docker 一键部署
echo =====================================
echo.
echo 端口配置:
echo   前端: http://localhost:3201
echo   后端: http://localhost:3200
echo   数据库: localhost:3202
echo.
echo 登录账号:
echo   用户名: admin
echo   密码: admin123
echo.
echo =====================================
echo.

echo [1/5] 检查 Docker 环境...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ 错误: 未检测到 Docker
    echo 请先安装 Docker Desktop for Windows
    echo 下载地址: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ 错误: 未检测到 docker-compose
    echo 请确保 Docker Desktop 已正确安装
    pause
    exit /b 1
)

echo ✓ Docker 环境检查通过
echo.

echo [2/5] 停止并删除旧容器（如果存在）...
docker-compose down -v 2>nul
echo ✓ 清理完成
echo.

echo [3/5] 构建 Docker 镜像...
echo 这可能需要几分钟时间，请耐心等待...
docker-compose build --no-cache
if %errorlevel% neq 0 (
    echo ✗ 镜像构建失败
    pause
    exit /b 1
)
echo ✓ 镜像构建成功
echo.

echo [4/5] 启动所有服务...
docker-compose up -d
if %errorlevel% neq 0 (
    echo ✗ 服务启动失败
    pause
    exit /b 1
)
echo ✓ 服务启动成功
echo.

echo [5/5] 等待服务就绪...
echo 等待数据库初始化（约30秒）...
timeout /t 30 /nobreak >nul
echo.

echo =====================================
echo 部署完成！🎉
echo =====================================
echo.
echo 访问地址:
echo   前端: http://localhost:3201
echo   后端: http://localhost:3200
echo.
echo 登录信息:
echo   用户名: admin
echo   密码: admin123
echo.
echo 查看日志:
echo   docker-compose logs -f
echo.
echo 停止服务:
echo   docker-compose down
echo.
echo 重启服务:
echo   docker-compose restart
echo.
echo =====================================
echo.

echo 是否立即打开浏览器？(Y/N):
set /p open_browser=
if /i "%open_browser%"=="Y" (
    start http://localhost:3201
)

echo.
echo 提示: 使用 docker-compose logs -f 查看实时日志
echo.
pause
