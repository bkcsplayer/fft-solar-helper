@echo off
chcp 65001 >nul
title FFT Solar CRM - 一键部署

echo =====================================
echo FFT Solar CRM - 一键部署工具
echo =====================================
echo.

echo 正在检查权限...
net session >nul 2>&1
if %errorLevel% == 0 (
    echo ✓ 已获得管理员权限
) else (
    echo 警告：建议以管理员身份运行
    echo 某些操作可能需要管理员权限
)

echo.
echo 开始部署...
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0deploy-windows.ps1"

pause
