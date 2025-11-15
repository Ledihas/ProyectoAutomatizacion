@echo off
REM Script completo de verificacion de servicios Docker para arquitectura hibrida
REM Verifica: contenedores running, health status, logs de errores, comunicacion interna

setlocal enabledelayedexpansion

echo ==========================================
echo VERIFICACION COMPLETA DE SERVICIOS DOCKER
echo ==========================================
echo Fecha: %date% %time%
echo.

REM ==========================================
REM VERIFICAR PREREQUISITOS
REM ==========================================

echo [1/7] Verificando prerequisitos...
echo.

REM Verificar que Docker esta corriendo
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker no esta corriendo o no esta instalado
    echo.
    echo Acciones requeridas:
    echo 1. Inicia Docker Desktop
    echo 2. Espera a que Docker este completamente iniciado
    echo 3. Vuelve a ejecutar este script
    echo.
    pause
    exit /b 1
)
echo [OK] Docker esta corriendo
echo.

REM Verificar que docker-compose esta disponible
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] docker-compose no esta disponible
    pause
    exit /b 1
)
echo [OK] docker-compose esta disponible
echo.

REM Verificar que existe el archivo docker-compose.prod.yml
if not exist "docker-compose.prod.yml" (
    echo [ERROR] No se encuentra docker-compose.prod.yml
    echo Asegurate de ejecutar este script desde la raiz del proyecto
    pause
    exit /b 1
)
echo [OK] docker-compose.prod.yml encontrado
echo.

REM ==========================================
REM ESTADO DE CONTENEDORES
REM ==========================================

echo ==========================================
echo [2/7] ESTADO DE CONTENEDORES
echo ==========================================
echo.

docker-compose -f docker-compose.prod.yml ps
echo.

REM Definir servicios esperados (sin frontend)
set "SERVICES=postgres redis evolution-api n8n"
set "ALL_RUNNING=1"
set "RUNNING_COUNT=0"
set "TOTAL_COUNT=0"

echo Verificando estado individual de cada servicio...
echo.

for %%s in (%SERVICES%) do (
    set /a TOTAL_COUNT+=1
    docker ps --filter "name=%%s" --filter "status=running" --format "{{.Names}}" | findstr /C:"%%s" >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] %%s - NO esta corriendo
        set "ALL_RUNNING=0"
    ) else (
        echo [OK] %%s - Corriendo
        set /a RUNNING_COUNT+=1
    )
)
echo.
echo Servicios corriendo: !RUNNING_COUNT! de !TOTAL_COUNT!
echo.

if "!ALL_RUNNING!"=="0" (
    echo [ADVERTENCIA] Algunos servicios no estan corriendo
    echo.
    echo Para iniciar todos los servicios:
    echo   docker-compose -f docker-compose.prod.yml up -d
    echo.
    echo Para iniciar un servicio especifico:
    echo   docker-compose -f docker-compose.prod.yml up -d [nombre-servicio]
    echo.
)

REM ==========================================
REM HEALTH STATUS
REM ==========================================

echo ==========================================
echo [3/7] HEALTH STATUS DE SERVICIOS
echo ==========================================
echo.

set "HEALTH_ISSUES=0"

for %%s in (%SERVICES%) do (
    echo Servicio: %%s
    
    REM Obtener health status
    for /f "delims=" %%h in ('docker inspect --format="{{if .State.Health}}{{.State.Health.Status}}{{else}}no-healthcheck{{end}}" %%s 2^>nul') do set "HEALTH=%%h"
    
    if "!HEALTH!"=="healthy" (
        echo   Estado: [OK] Healthy
    ) else if "!HEALTH!"=="unhealthy" (
        echo   Estado: [ERROR] Unhealthy
        set "HEALTH_ISSUES=1"
    ) else if "!HEALTH!"=="starting" (
        echo   Estado: [INFO] Starting...
    ) else if "!HEALTH!"=="no-healthcheck" (
        echo   Estado: [INFO] Sin healthcheck configurado
    ) else (
        echo   Estado: [WARN] Desconocido o contenedor no existe
        set "HEALTH_ISSUES=1"
    )
    
    REM Obtener uptime
    for /f "delims=" %%u in ('docker inspect --format="{{.State.Status}}" %%s 2^>nul') do set "STATUS=%%u"
    echo   Status: !STATUS!
    
    echo.
)

if "!HEALTH_ISSUES!"=="1" (
    echo [ADVERTENCIA] Algunos servicios tienen problemas de health
    echo Revisa los logs para mas detalles
    echo.
)

REM ==========================================
REM PUERTOS EXTERNOS
REM ==========================================

echo ==========================================
echo [4/7] VERIFICACION DE PUERTOS EXTERNOS
echo ==========================================
echo.

echo Probando acceso externo a servicios...
echo.

echo Evolution API (puerto 8081):
curl -s -o nul -w "  HTTP Status: %%{http_code}\n" --max-time 5 http://localhost:8081 2>nul
if errorlevel 1 (
    echo   [ERROR] No se pudo conectar
    echo   Verifica que evolution-api este corriendo y el puerto 8081 este expuesto
) else (
    echo   [OK] Accesible
)
echo.

echo N8N (puerto 5678):
curl -s -o nul -w "  HTTP Status: %%{http_code}\n" --max-time 5 http://localhost:5678 2>nul
if errorlevel 1 (
    echo   [ERROR] No se pudo conectar
    echo   Verifica que n8n este corriendo y el puerto 5678 este expuesto
) else (
    echo   [OK] Accesible
)
echo.

REM ==========================================
REM COMUNICACION INTERNA
REM ==========================================

echo ==========================================
echo [5/7] COMUNICACION INTERNA ENTRE SERVICIOS
echo ==========================================
echo.

set "COMM_ISSUES=0"

echo Probando comunicacion interna desde evolution-api...
echo.

REM Verificar que evolution-api esta corriendo antes de probar
docker ps --filter "name=evolution-api" --filter "status=running" --format "{{.Names}}" | findstr "evolution-api" >nul 2>&1
if errorlevel 1 (
    echo [SKIP] evolution-api no esta corriendo, saltando pruebas de comunicacion
    echo.
    set "COMM_ISSUES=1"
) else (
    echo evolution-api -^> n8n (http://n8n:5678):
    docker exec evolution-api curl -s -o nul -w "  HTTP Status: %%{http_code}\n" --max-time 5 http://n8n:5678 2>nul
    if errorlevel 1 (
        echo   [ERROR] No se pudo conectar
        set "COMM_ISSUES=1"
    ) else (
        echo   [OK] Comunicacion exitosa
    )
    echo.
    
    echo evolution-api -^> postgres (puerto 5432):
    docker exec evolution-api timeout 3 bash -c "echo > /dev/tcp/postgres/5432" 2>nul
    if errorlevel 1 (
        echo   [ERROR] No se pudo conectar
        set "COMM_ISSUES=1"
    ) else (
        echo   [OK] Puerto accesible
    )
    echo.
    
    echo evolution-api -^> redis (puerto 6379):
    docker exec evolution-api timeout 3 bash -c "echo > /dev/tcp/redis/6379" 2>nul
    if errorlevel 1 (
        echo   [ERROR] No se pudo conectar
        set "COMM_ISSUES=1"
    ) else (
        echo   [OK] Puerto accesible
    )
    echo.
)

if "!COMM_ISSUES!"=="1" (
    echo [ADVERTENCIA] Problemas de comunicacion interna detectados
    echo Verifica la configuracion de red en docker-compose.prod.yml
    echo Todos los servicios deben estar en la misma red (app_network)
    echo.
)

REM ==========================================
REM LOGS DE ERRORES
REM ==========================================

echo ==========================================
echo [6/7] ANALISIS DE LOGS RECIENTES
echo ==========================================
echo.

set "LOG_ERRORS=0"

echo Buscando errores en logs (ultimas 50 lineas)...
echo.

for %%s in (%SERVICES%) do (
    echo Analizando logs de %%s...
    
    REM Buscar errores en los logs
    docker logs %%s --tail 50 2>&1 | findstr /I /C:"error" /C:"fail" /C:"exception" /C:"fatal" >nul 2>&1
    if not errorlevel 1 (
        echo   [WARN] Se encontraron posibles errores
        echo   Mostrando ultimas 10 lineas con errores:
        echo   ----------------------------------------
        docker logs %%s --tail 50 2>&1 | findstr /I /C:"error" /C:"fail" /C:"exception" /C:"fatal" | more +0
        echo   ----------------------------------------
        set "LOG_ERRORS=1"
    ) else (
        echo   [OK] No se encontraron errores recientes
    )
    echo.
)

if "!LOG_ERRORS!"=="1" (
    echo [INFO] Para ver logs completos de un servicio:
    echo   docker logs [nombre-servicio]
    echo.
    echo Para ver logs en tiempo real:
    echo   docker logs -f [nombre-servicio]
    echo.
)

REM ==========================================
REM USO DE RECURSOS
REM ==========================================

echo ==========================================
echo [7/7] USO DE RECURSOS
echo ==========================================
echo.

docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
echo.

REM ==========================================
REM RESUMEN FINAL
REM ==========================================

echo ==========================================
echo RESUMEN DE VERIFICACION
echo ==========================================
echo.

set "OVERALL_STATUS=OK"

if "!ALL_RUNNING!"=="0" (
    echo [ERROR] Algunos contenedores no estan corriendo
    set "OVERALL_STATUS=ERROR"
) else (
    echo [OK] Todos los contenedores estan corriendo
)

if "!HEALTH_ISSUES!"=="1" (
    echo [WARN] Algunos servicios tienen problemas de health
    set "OVERALL_STATUS=WARN"
) else (
    echo [OK] Health status correcto en todos los servicios
)

if "!COMM_ISSUES!"=="1" (
    echo [WARN] Problemas de comunicacion interna detectados
    set "OVERALL_STATUS=WARN"
) else (
    echo [OK] Comunicacion interna funcionando correctamente
)

if "!LOG_ERRORS!"=="1" (
    echo [WARN] Se encontraron errores en los logs
    set "OVERALL_STATUS=WARN"
) else (
    echo [OK] No se encontraron errores en los logs
)

echo.
echo Estado general: !OVERALL_STATUS!
echo.

REM ==========================================
REM COMANDOS UTILES
REM ==========================================

echo ==========================================
echo COMANDOS UTILES
echo ==========================================
echo.
echo Reiniciar todos los servicios:
echo   docker-compose -f docker-compose.prod.yml restart
echo.
echo Reiniciar un servicio especifico:
echo   docker-compose -f docker-compose.prod.yml restart [servicio]
echo.
echo Ver logs de un servicio:
echo   docker logs [nombre-servicio]
echo   docker logs -f [nombre-servicio]  (tiempo real)
echo.
echo Detener todos los servicios:
echo   docker-compose -f docker-compose.prod.yml down
echo.
echo Iniciar todos los servicios:
echo   docker-compose -f docker-compose.prod.yml up -d
echo.
echo Ver estado de red:
echo   docker network inspect [nombre-red]
echo.

echo ==========================================
echo Verificacion completada
echo ==========================================
echo.

pause
