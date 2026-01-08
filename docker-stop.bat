@echo off
chcp 65001 >nul
title FFT Solar CRM - Docker 停止

echo =====================================
echo FFT Solar CRM - 停止 Docker 服务
echo =====================================
echo.
echo 正在停止所有服务...
echo.

docker-compose down

if %errorlevel% equ 0 (
    echo.
    echo ✓ 服务已停止
    echo.
    echo 如需删除数据卷，使用: docker-compose down -v
    echo 如需重新启动，使用: docker-start.bat
    echo.
) else (
    echo.
    echo ✗ 停止失败
    echo.
)

pause
