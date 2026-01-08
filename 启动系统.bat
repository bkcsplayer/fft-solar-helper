@echo off
chcp 65001 >nul
title FFT Solar CRM - 启动系统

echo =====================================
echo FFT Solar CRM - 启动系统
echo =====================================
echo.
echo 前端地址: http://localhost:3000
echo 后端地址: http://localhost:5000
echo.
echo 登录账号:
echo   用户名: admin
echo   密码:   admin123
echo.
echo 按 Ctrl+C 停止服务器
echo.
echo 正在启动...
echo.

cd /d "%~dp0"
npm run dev
