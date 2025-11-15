@echo off
REM Script para probar comunicación interna entre servicios Docker
REM Este script verifica que los servicios pueden comunicarse usando nombres de contenedor
REM dentro de la red Docker (app_network)

echo ==========================================
echo Test de Comunicacion Interna Docker
echo ==========================================
echo.

REM Verificar que los contenedores están corriendo
echo 1. Verificando que los contenedores estan corriendo...
echo ---------------------------------------------------

set "all_running=true"

docker ps --format "{{.Names}}" | findstr /C:"evolution_api" >nul
if %errorlevel% equ 0 (
    echo [OK] Contenedor evolution_api esta corriendo
) else (
    echo [ERROR] Contenedor evolution_api NO esta corriendo
    set "all_running=false"
)

docker ps --format "{{.Names}}" | findstr /C:"n8n" >nul
if %errorlevel% equ 0 (
    echo [OK] Contenedor n8n esta corriendo
) else (
    echo [ERROR] Contenedor n8n NO esta corriendo
    set "all_running=false"
)

docker ps --format "{{.Names}}" | findstr /C:"evolution_postgres" >nul
if %errorlevel% equ 0 (
    echo [OK] Contenedor evolution_postgres esta corriendo
) else (
    echo [ERROR] Contenedor evolution_postgres NO esta corriendo
    set "all_running=false"
)

docker ps --format "{{.Names}}" | findstr /C:"evolution_redis" >nul
if %errorlevel% equ 0 (
    echo [OK] Contenedor evolution_redis esta corriendo
) else (
    echo [ERROR] Contenedor evolution_redis NO esta corriendo
    set "all_running=false"
)

echo.

if "%all_running%"=="false" (
    echo [ERROR] No todos los contenedores estan corriendo.
    echo Ejecuta: docker-compose -f docker-compose.prod.yml up -d
    exit /b 1
)

REM Test 1: Evolution API -> n8n
echo 2. Test: Evolution API -^> n8n
echo ---------------------------------------------------
echo Probando: curl http://n8n:5678/healthz desde evolution_api

docker exec evolution_api curl -s -o nul -w "%%{http_code}" http://n8n:5678/healthz 2>nul > temp_result.txt
set /p result=<temp_result.txt
del temp_result.txt

if "%result%"=="200" (
    echo [OK] Evolution API puede comunicarse con n8n ^(HTTP %result%^)
) else if "%result%"=="301" (
    echo [OK] Evolution API puede comunicarse con n8n ^(HTTP %result%^)
) else if "%result%"=="302" (
    echo [OK] Evolution API puede comunicarse con n8n ^(HTTP %result%^)
) else (
    echo [ERROR] Evolution API NO puede comunicarse con n8n ^(HTTP %result%^)
)

echo.

REM Test 2: n8n -> Evolution API
echo 3. Test: n8n -^> Evolution API
echo ---------------------------------------------------
echo Probando: wget http://evolution-api:8080 desde n8n

docker exec n8n wget --spider -q -S http://evolution-api:8080 2>&1 | findstr "HTTP/" > temp_result.txt
if %errorlevel% equ 0 (
    echo [OK] n8n puede comunicarse con Evolution API
) else (
    echo [ERROR] n8n NO puede comunicarse con Evolution API
)
if exist temp_result.txt del temp_result.txt

echo.

REM Test 3: Evolution API -> PostgreSQL
echo 4. Test: Evolution API -^> PostgreSQL
echo ---------------------------------------------------
echo Probando: conexion a postgres:5432 desde evolution_api

docker exec evolution_postgres pg_isready -U username -d evolution_api 2>&1 | findstr "accepting connections" >nul
if %errorlevel% equ 0 (
    echo [OK] PostgreSQL esta aceptando conexiones
    
    REM Verificar conectividad de red desde evolution_api
    docker exec evolution_api ping -c 1 postgres 2>&1 | findstr "1 packets transmitted, 1 received" >nul
    if %errorlevel% equ 0 (
        echo [OK] Evolution API puede hacer ping a PostgreSQL
    ) else (
        echo [WARN] Evolution API NO puede hacer ping a PostgreSQL ^(pero postgres responde^)
    )
) else (
    echo [ERROR] PostgreSQL NO esta aceptando conexiones
)

echo.

REM Test 4: Evolution API -> Redis
echo 5. Test: Evolution API -^> Redis
echo ---------------------------------------------------
echo Probando: conexion a redis:6379 desde evolution_api

docker exec evolution_redis redis-cli ping 2>&1 | findstr "PONG" >nul
if %errorlevel% equ 0 (
    echo [OK] Redis esta respondiendo
    
    REM Verificar conectividad de red desde evolution_api
    docker exec evolution_api ping -c 1 redis 2>&1 | findstr "1 packets transmitted, 1 received" >nul
    if %errorlevel% equ 0 (
        echo [OK] Evolution API puede hacer ping a Redis
    ) else (
        echo [WARN] Evolution API NO puede hacer ping a Redis ^(pero redis responde^)
    )
) else (
    echo [ERROR] Redis NO esta respondiendo
)

echo.

REM Test 5: Verificar red Docker
echo 6. Verificando configuracion de red Docker
echo ---------------------------------------------------

docker network ls | findstr "app_network" >nul
if %errorlevel% equ 0 (
    echo [OK] Red Docker 'app_network' existe
    
    REM Verificar que todos los contenedores están en la misma red
    docker inspect evolution_api 2>nul | findstr "app_network" >nul
    if %errorlevel% equ 0 (
        echo [OK] Contenedor evolution_api esta en la red app_network
    ) else (
        echo [ERROR] Contenedor evolution_api NO esta en la red app_network
    )
    
    docker inspect n8n 2>nul | findstr "app_network" >nul
    if %errorlevel% equ 0 (
        echo [OK] Contenedor n8n esta en la red app_network
    ) else (
        echo [ERROR] Contenedor n8n NO esta en la red app_network
    )
    
    docker inspect evolution_postgres 2>nul | findstr "app_network" >nul
    if %errorlevel% equ 0 (
        echo [OK] Contenedor evolution_postgres esta en la red app_network
    ) else (
        echo [ERROR] Contenedor evolution_postgres NO esta en la red app_network
    )
    
    docker inspect evolution_redis 2>nul | findstr "app_network" >nul
    if %errorlevel% equ 0 (
        echo [OK] Contenedor evolution_redis esta en la red app_network
    ) else (
        echo [ERROR] Contenedor evolution_redis NO esta en la red app_network
    )
) else (
    echo [ERROR] Red Docker 'app_network' NO existe
)

echo.
echo ==========================================
echo Test completado
echo ==========================================
echo.
echo Nota: Los servicios deben comunicarse usando nombres de contenedor
echo       ^(ej: http://n8n:5678, http://evolution-api:8080^)
echo       NO usar localhost o IPs externas para comunicacion interna.
echo.

pause
