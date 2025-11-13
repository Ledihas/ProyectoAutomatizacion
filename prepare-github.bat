@echo off
REM Script para preparar el proyecto para GitHub

echo ==========================================
echo Preparando proyecto para GitHub
echo ==========================================
echo.

REM Verificar que estamos en un repositorio Git
git status >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] No estas en un repositorio Git
    echo Inicializa Git primero con: git init
    pause
    exit /b 1
)

echo [1/6] Verificando estado actual...
git status
echo.

echo [2/6] Verificando archivos sensibles...
if exist .env (
    echo [WARNING] Archivo .env existe
    echo           Asegurate de que este en .gitignore
    findstr /C:".env" .gitignore >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] .env esta en .gitignore
    ) else (
        echo [ERROR] .env NO esta en .gitignore
        pause
        exit /b 1
    )
)
echo.

echo [3/6] Verificando carpetas a excluir...
if exist evolution-api (
    echo [INFO] Carpeta evolution-api encontrada
    findstr /C:"evolution-api/" .gitignore >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] evolution-api/ esta en .gitignore
    ) else (
        echo [WARNING] evolution-api/ NO esta en .gitignore
        echo           Agregandola...
        echo evolution-api/ >> .gitignore
    )
)

if exist n8n-nodes-late (
    echo [INFO] Carpeta n8n-nodes-late encontrada
    findstr /C:"n8n-nodes-late/" .gitignore >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] n8n-nodes-late/ esta en .gitignore
    ) else (
        echo [WARNING] n8n-nodes-late/ NO esta en .gitignore
        echo           Agregandola...
        echo n8n-nodes-late/ >> .gitignore
    )
)
echo.

echo [4/6] Archivos que se subiran a GitHub:
echo.
git ls-files
echo.

echo [5/6] Verificando que archivos sensibles NO esten incluidos...
git ls-files | findstr /C:".env" | findstr /V /C:".env.production" >nul 2>&1
if %errorlevel% equ 0 (
    echo [ERROR] Archivo .env esta incluido en Git
    echo           Removelo con: git rm --cached .env
    pause
    exit /b 1
) else (
    echo [OK] .env no esta incluido
)

git ls-files | findstr /C:"evolution-api" >nul 2>&1
if %errorlevel% equ 0 (
    echo [WARNING] evolution-api esta incluido en Git
    echo            Puedes removerlo con: git rm -r --cached evolution-api/
) else (
    echo [OK] evolution-api no esta incluido
)

git ls-files | findstr /C:"n8n-nodes-late" >nul 2>&1
if %errorlevel% equ 0 (
    echo [WARNING] n8n-nodes-late esta incluido en Git
    echo            Puedes removerlo con: git rm -r --cached n8n-nodes-late/
) else (
    echo [OK] n8n-nodes-late no esta incluido
)
echo.

echo [6/6] Resumen de archivos importantes:
echo.
echo Documentacion:
git ls-files | findstr /C:".md"
echo.
echo Scripts:
git ls-files | findstr /C:".bat"
git ls-files | findstr /C:".sh"
echo.
echo Configuracion Docker:
git ls-files | findstr /C:"docker-compose"
git ls-files | findstr /C:"Dockerfile"
echo.

echo ==========================================
echo Verificacion Completada
echo ==========================================
echo.
echo Siguiente paso:
echo   1. Revisa los archivos listados arriba
echo   2. Si todo esta bien, ejecuta:
echo.
echo      git checkout -b docker-production
echo      git add .
echo      git commit -m "feat: Add Docker production configuration"
echo      git push origin docker-production
echo.
pause
