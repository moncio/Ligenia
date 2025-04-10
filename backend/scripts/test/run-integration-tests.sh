#!/bin/bash

# Este script inicia la base de datos de prueba, ejecuta los tests de integración y apaga la base de datos

# Obtener el directorio del script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
# Cambiar al directorio raíz del proyecto
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_DIR"

# Colores para formatear la salida
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Iniciando pruebas de integración desde $PWD${NC}"

# Detener cualquier contenedor existente que pueda interferir
echo -e "${YELLOW}🛑 Deteniendo contenedores existentes...${NC}"
./scripts/db/db-manager.sh stop all

# Iniciar la base de datos de prueba
echo -e "${YELLOW}🚀 Iniciando base de datos de prueba...${NC}"
./scripts/db/db-manager.sh start test

echo -e "${YELLOW}⏳ Esperando a que la base de datos esté lista...${NC}"
sleep 3

# Ejecutar las migraciones si es necesario
echo -e "${YELLOW}📊 Aplicando migraciones a la base de datos de prueba...${NC}"
NODE_ENV=test npx dotenv-cli -e .env.test -- npx prisma migrate deploy

# Determinar qué tests ejecutar
if [ "$1" == "routes" ]; then
  echo -e "${GREEN}🔍 Ejecutando tests de rutas (API)...${NC}"
  NODE_ENV=test npx dotenv-cli -e .env.test -- jest --config=jest.config.js --runInBand --testMatch='**/tests/integration/routes/**/*.test.ts' --detectOpenHandles --forceExit
elif [ "$1" == "infrastructure" ]; then
  echo -e "${GREEN}🔍 Ejecutando tests de infraestructura...${NC}"
  NODE_ENV=test npx dotenv-cli -e .env.test -- jest --config=jest.config.js --runInBand --testMatch='**/tests/integration/infrastructure/**/*.test.ts' --detectOpenHandles --forceExit
else
  echo -e "${GREEN}🔍 Ejecutando todos los tests de integración...${NC}"
  NODE_ENV=test npx dotenv-cli -e .env.test -- jest --config=jest.config.js --runInBand --testMatch='**/tests/integration/**/*.test.ts' --detectOpenHandles --forceExit
fi

# Guardar el código de salida para retornarlo al final
EXIT_CODE=$?

# Opcional: detener la base de datos después de las pruebas
if [ "$2" == "cleanup" ]; then
  echo -e "${YELLOW}🧹 Limpiando: deteniendo la base de datos de prueba...${NC}"
  ./scripts/db/db-manager.sh stop test
fi

# Mostrar resultado final
if [ $EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}✅ Todas las pruebas han pasado correctamente${NC}"
else
  echo -e "${RED}❌ Algunas pruebas han fallado (código de salida: $EXIT_CODE)${NC}"
fi

echo -e "${BLUE}🏁 Proceso de pruebas de integración completado${NC}"

exit $EXIT_CODE 