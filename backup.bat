@echo off
REM Script para hacer backup de los datos importantes

echo ==========================================
echo Creando backup de datos
echo ==========================================

REM Crear directorio de backups si no existe
if not exist backups mkdir backups

REM Obtener fecha y hora para el nombre del backup
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set BACKUP_DATE=%datetime:~0,8%-%datetime:~8,6%

echo.
echo Fecha del backup: %BACKUP_DATE%
echo.

REM Backup de PostgreSQL
echo Haciendo backup de PostgreSQL...
docker exec evolution_postgres pg_dump -U username evolution_api > backups\postgres_%BACKUP_DATE%.sql
if %errorlevel% equ 0 (
    echo PostgreSQL backup completado: backups\postgres_%BACKUP_DATE%.sql
) else (
    echo Error al hacer backup de PostgreSQL
)

echo.

REM Backup de volúmenes Docker
echo Haciendo backup de instancias de Evolution...
docker run --rm -v evolution_instances:/data -v %cd%\backups:/backup alpine tar czf /backup/evolution_instances_%BACKUP_DATE%.tar.gz /data
if %errorlevel% equ 0 (
    echo Evolution instances backup completado: backups\evolution_instances_%BACKUP_DATE%.tar.gz
) else (
    echo Error al hacer backup de Evolution instances
)

echo.

echo Haciendo backup de datos de N8N...
docker run --rm -v n8n_data:/data -v %cd%\backups:/backup alpine tar czf /backup/n8n_data_%BACKUP_DATE%.tar.gz /data
if %errorlevel% equ 0 (
    echo N8N backup completado: backups\n8n_data_%BACKUP_DATE%.tar.gz
) else (
    echo Error al hacer backup de N8N
)

echo.
echo ==========================================
echo Backup completado
echo ==========================================
echo.
echo Archivos de backup creados en: backups\
dir /b backups\*%BACKUP_DATE%*
echo.

REM Limpiar backups antiguos (mantener solo los últimos 7 días)
echo Limpiando backups antiguos (mas de 7 dias)...
forfiles /p backups /s /m *.* /d -7 /c "cmd /c del @path" 2>nul
echo.

pause
