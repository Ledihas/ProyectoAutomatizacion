@echo off
REM Script para detener el proyecto en producción

echo ==========================================
echo Deteniendo proyecto en produccion
echo ==========================================

docker-compose -f docker-compose.prod.yml down

echo.
echo Proyecto detenido correctamente
echo.
pause
