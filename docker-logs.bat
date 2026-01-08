@echo off
chcp 65001 >nul
title FFT Solar CRM - Docker 日志

echo =====================================
echo FFT Solar CRM - 查看实时日志
echo =====================================
echo.
echo 按 Ctrl+C 停止查看日志
echo.
echo 正在获取日志...
echo.

docker-compose logs -f --tail=100
