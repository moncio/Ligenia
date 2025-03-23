#!/bin/bash

# Detener cualquier contenedor existente
docker-compose down

# Extraer variables del archivo .env.test
export $(grep -v '^#' backend/.env.test | xargs)

# Iniciar contenedor con docker-compose.test.yml
docker-compose -f docker-compose.test.yml up -d

echo "Base de datos de pruebas iniciada"
echo "Usuario: $DATABASE_USER"
echo "Base de datos: $DATABASE_NAME"
echo "Puerto: $DATABASE_PORT"

# Verificar si el contenedor está en ejecución
docker ps | grep ligenia_db_test 