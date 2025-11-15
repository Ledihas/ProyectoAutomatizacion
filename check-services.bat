@echo off
REM Script para verificar el estado de los servicios Docker
REM Verifica contenedores, health status, logs y comunicacion interna

echo ==========================================
echo VERIFICACION DE SERVICIOS DOCKER
echo ==========================================
echo.

REM Verificar que Docker esta corriendo
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker no esta corriendo o no esta instalado
    echo Por favor inicia Docker Desktop y vuelve a intentar
    pause
    exit /b 1
)

echo [OK] Docker esta corriendo
echo.

echo ==========================================
echo 1. ESTADO DE CONTENEDORES
echo ==========================================
echo.
docker-compose -f docker-compose.prod.yml ps
echo.

REM Verificar que los contenedores estan corriendo
set "CONTAINERS=postgres redis evolution-api n8n"
set "ALL_RUNNING=1"

for %%c in (%CONTAINERS%) do (
    docker ps --filter "name=%%c" --format "{{.Names}}" | findstr /C:"%%c" >nul
    if errorlevel 1 (
        echo [ERROR] Contenedor %%c NO esta corriendo
        set "ALL_RUNNING=0"
    ) else (
        echo [OK] Contenedor %%c esta corriendo
    )
)
echo.

if "%ALL_RUNNING%"=="0" (
    echo [ADVERTENCIA] Algunos contenedores no estan corriendo
    echo Ejecuta: docker-compose -f docker-compose.prod.yml up -d
    echo.
)

echo ==========================================
echo 2. HEALTH STATUS DE SERVICIOS
echo ==========================================
echo.

REM Verificar health status de cada servicio
for %%c in (%CONTAINERS%) do (
    echo Verificando health de %%c...
    docker inspect --format="{{if .State.Health}}{{.State.Health.Status}}{{else}}no-healthcheck{{end}}" %%c 2>nul
    if errorlevel 1 (
        echo [ERROR] No se pudo obtener health status de %%c
    )
    echo.
)

echo ==========================================
echo 3. VERIFICACION DE PUERTOS EXTERNOS
echo ==========================================
echo.

echo Verificando Evolution API (puerto 8081)...
curl -s -o nul -w "HTTP Status: %%{http_code}\n" http://localhost:8081 2>nul
if errorlevel 1 (
    echo [ERROR] No se pudo conectar a Evolution API
    echo Verifica que el contenedor este corriendo y el puerto 8081 este expuesto
)
echo.

echo Verificando N8N (puerto 5678)...
curl -s -o nul -w "HTTP Status: %%{http_code}\n" http://localhost:5678 2>nul
if errorlevel 1 (
    echo [ERROR] No se pudo conectar a N8N
    echo Verifica que el contenedor este corriendo y el puerto 5678 este expuesto
)
echo.

echo ==========================================
echo 4. COMUNICACION INTERNA ENTRE SERVICIOS
echo ==========================================
echo.

echo Probando comunicacion interna desde evolution-api a n8n...
docker exec evolution-api curl -s -o nul -w "HTTP Status: %%{http_code}\n" http://n8n:5678 2>nul
if errorlevel 1 (
    echo [ERROR] Evolution API no puede comunicarse con n8n internamente
) else (
    echo [OK] Evolution API puede comunicarse con n8n
)
echo.

echo Probando comunicacion interna desde evolution-api a postgres...
docker exec evolution-api nc -zv postgres 5432 2>&1 | findstr "open"
if errorlevel 1 (
    echo [ERROR] Evolution API no puede comunicarse con PostgreSQL
) else (
    echo [OK] Evolution API puede comunicarse con PostgreSQL
)
echo.

echo Probando comunicacion interna desde evolution-api a redis...
docker exec evolution-api nc -zv redis 6379 2>&1 | findstr "open"
if errorlevel 1 (
    echo [ERROR] Evolution API no puede comunicarse con Redis
) else (
    echo [OK] Evolution API puede comunicarse con Redis
)
echo.

echo ==========================================
echo 5. LOGS RECIENTES (ultimas 20 lineas)
echo ==========================================
echo.

set "HAS_ERRORS=0"

for %%c in (%CONTAINERS%) do (
    echo --- Logs de %%c ---
    docker logs %%c --tail 20 2>&1 | findstr /I "error fail exception" >nul
    if not errorlevel 1 (
        echo [ADVERTENCIA] Se encontraron errores en los logs de %%c
        echo Mostrando ultimas 20 lineas:
        docker logs %%c --tail 20 2>&1
        set "HAS_ERRORS=1"
    ) else (
        echo [OK] No se encontraron errores recientes en %%c
    )
    echo.
)

if "%HAS_ERRORS%"=="1" (
    echo [ADVERTENCIA] Se encontraron errores en algunos servicios
    echo Para ver logs completos usa: docker logs [nombre-contenedor]
    echo.
)

echo ==========================================
echo 6. USO DE RECURSOS
echo ==========================================
echo.
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
echo.

echo ==========================================
echo RESUMEN DE VERIFICACION
echo ==========================================
echo.

if "%ALL_RUNNING%"=="1" (
    echo [OK] Todos los contenedores estan corriendo
) else (
    echo [ERROR] Algunos contenedores no estan corriendo
)

if "%HAS_ERRORS%"=="0" (
    echo [OK] No se encontraron errores en los logs
) else (
    echo [ADVERTENCIA] Se encontraron errores en los logs
)

echo.
echo Para mas detalles:
echo - Ver logs completos: docker logs [nombre-contenedor]
echo - Ver logs en tiempo real: docker logs -f [nombre-contenedor]
echo - Reiniciar servicios: docker-compose -f docker-compose.prod.yml restart
echo - Reiniciar un servicio: docker-compose -f docker-compose.prod.yml restart [servicio]
echo.

pause
