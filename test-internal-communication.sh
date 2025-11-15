#!/bin/bash

# Script para probar comunicación interna entre servicios Docker
# Este script verifica que los servicios pueden comunicarse usando nombres de contenedor
# dentro de la red Docker (app_network)

echo "=========================================="
echo "Test de Comunicación Interna Docker"
echo "=========================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir resultados
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
    else
        echo -e "${RED}✗ $2${NC}"
    fi
}

# Verificar que los contenedores están corriendo
echo "1. Verificando que los contenedores están corriendo..."
echo "---------------------------------------------------"

containers=("evolution_api" "n8n" "evolution_postgres" "evolution_redis")
all_running=true

for container in "${containers[@]}"; do
    if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
        print_result 0 "Contenedor $container está corriendo"
    else
        print_result 1 "Contenedor $container NO está corriendo"
        all_running=false
    fi
done

echo ""

if [ "$all_running" = false ]; then
    echo -e "${RED}Error: No todos los contenedores están corriendo.${NC}"
    echo "Ejecuta: docker-compose -f docker-compose.prod.yml up -d"
    exit 1
fi

# Test 1: Evolution API -> n8n
echo "2. Test: Evolution API -> n8n"
echo "---------------------------------------------------"
echo "Probando: curl http://n8n:5678/healthz desde evolution_api"

result=$(docker exec evolution_api curl -s -o /dev/null -w "%{http_code}" http://n8n:5678/healthz 2>/dev/null)

if [ "$result" = "200" ] || [ "$result" = "301" ] || [ "$result" = "302" ]; then
    print_result 0 "Evolution API puede comunicarse con n8n (HTTP $result)"
else
    print_result 1 "Evolution API NO puede comunicarse con n8n (HTTP $result)"
fi

echo ""

# Test 2: n8n -> Evolution API
echo "3. Test: n8n -> Evolution API"
echo "---------------------------------------------------"
echo "Probando: curl http://evolution-api:8080 desde n8n"

result=$(docker exec n8n wget --spider -q -S http://evolution-api:8080 2>&1 | grep "HTTP/" | awk '{print $2}')

if [ "$result" = "200" ] || [ "$result" = "401" ] || [ "$result" = "404" ]; then
    print_result 0 "n8n puede comunicarse con Evolution API (HTTP $result)"
else
    print_result 1 "n8n NO puede comunicarse con Evolution API (HTTP $result)"
fi

echo ""

# Test 3: Evolution API -> PostgreSQL
echo "4. Test: Evolution API -> PostgreSQL"
echo "---------------------------------------------------"
echo "Probando: conexión a postgres:5432 desde evolution_api"

# Intentar conectar a PostgreSQL usando nc (netcat) o curl
if docker exec evolution_api sh -c "command -v nc" > /dev/null 2>&1; then
    # Usar netcat si está disponible
    result=$(docker exec evolution_api nc -zv postgres 5432 2>&1)
    if echo "$result" | grep -q "succeeded\|open"; then
        print_result 0 "Evolution API puede comunicarse con PostgreSQL"
    else
        print_result 1 "Evolution API NO puede comunicarse con PostgreSQL"
    fi
else
    # Alternativa: verificar que el contenedor postgres responde
    result=$(docker exec evolution_postgres pg_isready -U username -d evolution_api 2>&1)
    if echo "$result" | grep -q "accepting connections"; then
        print_result 0 "PostgreSQL está aceptando conexiones (verificado desde postgres)"
        # Verificar conectividad de red desde evolution_api
        ping_result=$(docker exec evolution_api ping -c 1 postgres 2>&1)
        if echo "$ping_result" | grep -q "1 packets transmitted, 1 received"; then
            print_result 0 "Evolution API puede hacer ping a PostgreSQL"
        else
            print_result 1 "Evolution API NO puede hacer ping a PostgreSQL"
        fi
    else
        print_result 1 "PostgreSQL NO está aceptando conexiones"
    fi
fi

echo ""

# Test 4: Evolution API -> Redis
echo "5. Test: Evolution API -> Redis"
echo "---------------------------------------------------"
echo "Probando: conexión a redis:6379 desde evolution_api"

# Intentar hacer ping a Redis
if docker exec evolution_api sh -c "command -v nc" > /dev/null 2>&1; then
    # Usar netcat si está disponible
    result=$(docker exec evolution_api nc -zv redis 6379 2>&1)
    if echo "$result" | grep -q "succeeded\|open"; then
        print_result 0 "Evolution API puede comunicarse con Redis"
    else
        print_result 1 "Evolution API NO puede comunicarse con Redis"
    fi
else
    # Alternativa: verificar que Redis responde
    result=$(docker exec evolution_redis redis-cli ping 2>&1)
    if [ "$result" = "PONG" ]; then
        print_result 0 "Redis está respondiendo (verificado desde redis)"
        # Verificar conectividad de red desde evolution_api
        ping_result=$(docker exec evolution_api ping -c 1 redis 2>&1)
        if echo "$ping_result" | grep -q "1 packets transmitted, 1 received"; then
            print_result 0 "Evolution API puede hacer ping a Redis"
        else
            print_result 1 "Evolution API NO puede hacer ping a Redis"
        fi
    else
        print_result 1 "Redis NO está respondiendo"
    fi
fi

echo ""

# Test 5: Verificar red Docker
echo "6. Verificando configuración de red Docker"
echo "---------------------------------------------------"

network_name="app_network"
if docker network ls | grep -q "$network_name"; then
    print_result 0 "Red Docker '$network_name' existe"
    
    # Verificar que todos los contenedores están en la misma red
    for container in "${containers[@]}"; do
        if docker inspect "$container" 2>/dev/null | grep -q "\"$network_name\""; then
            print_result 0 "Contenedor $container está en la red $network_name"
        else
            print_result 1 "Contenedor $container NO está en la red $network_name"
        fi
    done
else
    print_result 1 "Red Docker '$network_name' NO existe"
fi

echo ""
echo "=========================================="
echo "Test completado"
echo "=========================================="
echo ""
echo -e "${YELLOW}Nota:${NC} Los servicios deben comunicarse usando nombres de contenedor"
echo "      (ej: http://n8n:5678, http://evolution-api:8080)"
echo "      NO usar localhost o IPs externas para comunicación interna."
echo ""
