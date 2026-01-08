@echo off
chcp 65001 >nul
title FFT Solar CRM - Docker 启动

echo =====================================
echo FFT Solar CRM - 启动 Docker 服务
echo =====================================
echo.
echo 前端: http://localhost:3201
echo 后端: http://localhost:3200
echo.
echo 正在启动服务...
echo.

docker-compose up -d

if %errorlevel% equ 0 (
    echo.
    echo ✓ 服务启动成功！
    echo.
    echo 访问: http://localhost:3201
    echo 登录: admin / admin123
    echo.
    echo 查看日志: docker-compose logs -f
    echo 停止服务: docker-compose down
    echo.
) else (
    echo.
    echo ✗ 服务启动失败
    echo 请检查 Docker Desktop 是否运行
    echo.
)

pause
