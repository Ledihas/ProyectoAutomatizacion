@echo off
REM Script para iniciar el proyecto en producción con Docker (Windows)

echo ==========================================
echo Iniciando proyecto en modo PRODUCCION
echo ==========================================

REM Verificar que existe el archivo .env
if not exist .env (
    echo Error: No se encontro el archivo .env
    echo Copiando .env.production a .env...
    if exist .env.production (
        copy .env.production .env
        echo Archivo .env creado. Por favor, verifica las variables.
    ) else (
        echo Error: Tampoco existe .env.production
        exit /b 1
    )
)

REM Detener contenedores existentes
echo Deteniendo contenedores existentes...
docker-compose -f docker-compose.prod.yml down

REM Construir imágenes
echo Construyendo imagenes Docker...
docker-compose -f docker-compose.prod.yml build --no-cache

REM Iniciar servicios
echo Iniciando servicios...
docker-compose -f docker-compose.prod.yml up -d

REM Esperar a que los servicios estén listos
echo Esperando a que los servicios esten listos...
timeout /t 10 /nobreak > nul

REM Mostrar estado de los contenedores
echo.
echo Estado de los contenedores:
docker-compose -f docker-compose.prod.yml ps

echo.
echo ==========================================
echo Proyecto iniciado correctamente
echo ==========================================
echo.
echo Servicios disponibles:
echo    - Frontend:      http://localhost:3000
echo    - Evolution API: http://localhost:8081
echo    - N8N:           http://localhost:5678
echo.
echo Para ver los logs:
echo    docker-compose -f docker-compose.prod.yml logs -f
echo.
echo Para detener:
echo    docker-compose -f docker-compose.prod.yml down
echo.
pause
