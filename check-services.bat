@echo off
REM Script para verificar el estado de los servicios

echo ==========================================
echo Verificando estado de los servicios
echo ==========================================
echo.

echo Contenedores en ejecucion:
docker-compose -f docker-compose.prod.yml ps
echo.

echo ==========================================
echo Verificando conectividad de servicios
echo ==========================================
echo.

echo Verificando Frontend (puerto 3000)...
curl -s -o nul -w "Status: %%{http_code}\n" http://localhost:3000 || echo No disponible

echo.
echo Verificando Evolution API (puerto 8081)...
curl -s -o nul -w "Status: %%{http_code}\n" http://localhost:8081 || echo No disponible

echo.
echo Verificando N8N (puerto 5678)...
curl -s -o nul -w "Status: %%{http_code}\n" http://localhost:5678 || echo No disponible

echo.
echo ==========================================
echo Uso de recursos
echo ==========================================
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

echo.
pause
