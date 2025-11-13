@echo off
REM Script para verificar que todo está listo para deployment

echo ==========================================
echo Verificacion de Setup para Produccion
echo ==========================================
echo.

set ERROR_COUNT=0

REM Verificar Docker
echo [1/8] Verificando Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker no esta instalado o no esta en el PATH
    set /a ERROR_COUNT+=1
) else (
    docker --version
    echo [OK] Docker instalado
)
echo.

REM Verificar Docker Compose
echo [2/8] Verificando Docker Compose...
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose no esta instalado
    set /a ERROR_COUNT+=1
) else (
    docker-compose --version
    echo [OK] Docker Compose instalado
)
echo.

REM Verificar archivo .env
echo [3/8] Verificando archivo .env...
if not exist .env (
    if exist .env.production (
        echo [WARNING] Archivo .env no encontrado, pero .env.production existe
        echo [INFO] Se copiara automaticamente al iniciar
    ) else (
        echo [ERROR] Ni .env ni .env.production encontrados
        set /a ERROR_COUNT+=1
    )
) else (
    echo [OK] Archivo .env existe
)
echo.

REM Verificar archivo docker-compose.prod.yml
echo [4/8] Verificando archivo docker-compose.prod.yml...
if not exist docker-compose.prod.yml (
    echo [ERROR] Archivo docker-compose.prod.yml no encontrado
    set /a ERROR_COUNT+=1
) else (
    echo [OK] Archivo docker-compose.prod.yml existe
)
echo.

REM Verificar puertos disponibles
echo [5/8] Verificando puertos disponibles...

netstat -ano | findstr :3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo [WARNING] Puerto 3000 esta en uso
    set /a ERROR_COUNT+=1
) else (
    echo [OK] Puerto 3000 disponible
)

netstat -ano | findstr :8081 >nul 2>&1
if %errorlevel% equ 0 (
    echo [WARNING] Puerto 8081 esta en uso
    set /a ERROR_COUNT+=1
) else (
    echo [OK] Puerto 8081 disponible
)

netstat -ano | findstr :5678 >nul 2>&1
if %errorlevel% equ 0 (
    echo [WARNING] Puerto 5678 esta en uso
    set /a ERROR_COUNT+=1
) else (
    echo [OK] Puerto 5678 disponible
)
echo.

REM Verificar espacio en disco
echo [6/8] Verificando espacio en disco...
for /f "tokens=3" %%a in ('dir /-c ^| findstr /C:"bytes free"') do set FREE_SPACE=%%a
echo Espacio libre: %FREE_SPACE% bytes
echo [OK] Verificacion de espacio completada
echo.

REM Verificar Dockerfile del frontend
echo [7/8] Verificando Dockerfile del frontend...
if not exist Automation_Project_Refine\Dockerfile (
    echo [ERROR] Dockerfile del frontend no encontrado
    set /a ERROR_COUNT+=1
) else (
    echo [OK] Dockerfile del frontend existe
)
echo.

REM Validar docker-compose.prod.yml
echo [8/8] Validando sintaxis de docker-compose.prod.yml...
docker-compose -f docker-compose.prod.yml config >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Error en la sintaxis de docker-compose.prod.yml
    set /a ERROR_COUNT+=1
) else (
    echo [OK] Sintaxis de docker-compose.prod.yml correcta
)
echo.

REM Resumen
echo ==========================================
echo Resumen de Verificacion
echo ==========================================
echo.

if %ERROR_COUNT% equ 0 (
    echo [SUCCESS] Todas las verificaciones pasaron correctamente
    echo.
    echo Puedes proceder con el deployment ejecutando:
    echo    start-production.bat
    echo.
) else (
    echo [FAILED] Se encontraron %ERROR_COUNT% errores
    echo.
    echo Por favor, corrige los errores antes de continuar.
    echo.
)

REM Verificar variables de entorno importantes
echo ==========================================
echo Verificacion de Variables de Entorno
echo ==========================================
echo.

if exist .env (
    echo Revisando .env para valores por defecto...
    echo.

    findstr /C:"POSTGRES_PASSWORD=change_this" .env >nul 2>&1
    if %errorlevel% equ 0 (
        echo [WARNING] POSTGRES_PASSWORD usa valor por defecto
        echo           Cambialo por una contrasena segura
    )

    findstr /C:"EVOLUTION_API_KEY=B6D711FCDE4D4FD5936544120E713976" .env >nul 2>&1
    if %errorlevel% equ 0 (
        echo [WARNING] EVOLUTION_API_KEY usa valor por defecto
        echo           Cambialo por una clave unica
    )

    findstr /C:"your_database_id" .env >nul 2>&1
    if %errorlevel% equ 0 (
        echo [WARNING] Configuracion de Appwrite incompleta
        echo           Configura VITE_APPWRITE_* con tus valores
    )
) else (
    echo [INFO] Archivo .env no existe aun
    echo        Se creara automaticamente al iniciar
)

echo.
echo ==========================================
echo Verificacion Completada
echo ==========================================
echo.
pause
