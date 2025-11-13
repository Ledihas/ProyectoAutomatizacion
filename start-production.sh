#!/bin/bash

# Script para iniciar el proyecto en producción con Docker

echo "=========================================="
echo "Iniciando proyecto en modo PRODUCCIÓN"
echo "=========================================="

# Verificar que existe el archivo .env
if [ ! -f .env ]; then
    echo "⚠️  No se encontró el archivo .env"
    if [ -f .env.production ]; then
        echo "📋 Copiando .env.production a .env..."
        cp .env.production .env
        echo "✅ Archivo .env creado. Por favor, verifica las variables."
    else
        echo "❌ Error: Tampoco existe .env.production"
        exit 1
    fi
fi

# Detener contenedores existentes
echo "🛑 Deteniendo contenedores existentes..."
docker-compose -f docker-compose.prod.yml down

# Construir imágenes
echo "🔨 Construyendo imágenes Docker..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Iniciar servicios
echo "🚀 Iniciando servicios..."
docker-compose -f docker-compose.prod.yml up -d

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 10

# Mostrar estado de los contenedores
echo ""
echo "📊 Estado de los contenedores:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "=========================================="
echo "✅ Proyecto iniciado correctamente"
echo "=========================================="
echo ""
echo "🌐 Servicios disponibles:"
echo "   - Frontend:      http://localhost:3000"
echo "   - Evolution API: http://localhost:8081"
echo "   - N8N:           http://localhost:5678"
echo ""
echo "📝 Para ver los logs:"
echo "   docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "🛑 Para detener:"
echo "   docker-compose -f docker-compose.prod.yml down"
echo ""
