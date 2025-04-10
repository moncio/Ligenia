#!/bin/bash

# Script para gestionar entornos de base de datos

# Directorio base del proyecto
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$BASE_DIR"

# Colores para formatear la salida
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Emoji para formatear la salida
ROCKET="🚀"
STOP="🛑"
SETTINGS="⚙️"
CHECK="✅"
WRENCH="🔧"
SEARCH="🔍"
WARNING="⚠️"
ERROR="❌"
DB="🗄️"
TERMINAL="💻"
LOGS="📋"

# Función para mostrar ayuda
show_help() {
  echo -e "${BLUE}${ROCKET} Gestor de bases de datos para Ligenia Backend${NC}"
  echo ""
  echo -e "Uso: $0 ${YELLOW}[comando]${NC} ${GREEN}[entorno]${NC}"
  echo ""
  echo -e "${YELLOW}Comandos:${NC}"
  echo -e "  ${GREEN}start${NC}        Inicia la base de datos"
  echo -e "  ${GREEN}stop${NC}         Detiene la base de datos"
  echo -e "  ${GREEN}restart${NC}      Reinicia la base de datos"
  echo -e "  ${GREEN}status${NC}       Muestra el estado de las bases de datos"
  echo -e "  ${GREEN}logs${NC}         Muestra los logs de la base de datos"
  echo -e "  ${GREEN}shell${NC}        Abre una shell psql en la base de datos"
  echo ""
  echo -e "${GREEN}Entornos:${NC}"
  echo -e "  ${BLUE}dev${NC}          Entorno de desarrollo (por defecto)"
  echo -e "  ${BLUE}test${NC}         Entorno de pruebas"
  echo -e "  ${BLUE}all${NC}          Ambos entornos (solo válido para algunos comandos)"
  echo ""
  echo -e "${YELLOW}Ejemplos:${NC}"
  echo -e "  $0 ${GREEN}start${NC} ${BLUE}dev${NC}    # Inicia la base de datos de desarrollo"
  echo -e "  $0 ${GREEN}stop${NC} ${BLUE}test${NC}    # Detiene la base de datos de pruebas"
  echo -e "  $0 ${GREEN}status${NC} ${BLUE}all${NC}   # Muestra el estado de ambas bases de datos"
}

# Obtener parámetros
COMMAND=$1
ENV=$2

# Valores por defecto
if [ -z "$ENV" ]; then
  ENV="dev"
fi

# Función para iniciar base de datos
start_db() {
  local env=$1
  local compose_file=""
  local env_file=""
  local container_name=""
  
  if [ "$env" == "dev" ]; then
    compose_file="docker/docker-compose.yml"
    env_file=".env"
    container_name="ligenia_db"
  elif [ "$env" == "test" ]; then
    compose_file="docker/docker-compose.test.yml"
    env_file=".env.test"
    container_name="ligenia_db_test"
  else
    echo -e "${RED}${ERROR} Error: Entorno no válido: $env${NC}"
    exit 1
  fi
  
  echo -e "${BLUE}${ROCKET} Iniciando base de datos de $env...${NC}"
  
  # Cargar variables de entorno
  echo -e "${YELLOW}${LOGS} Cargando variables de entorno...${NC}"
  export $(grep -v '^#' $env_file | xargs)
  
  # Iniciar contenedor
  echo -e "${YELLOW}${SETTINGS} Iniciando contenedor...${NC}"
  docker-compose -f "$compose_file" --env-file "$env_file" up -d
  
  # Verificar estado
  sleep 2
  echo -e "${YELLOW}${SEARCH} Verificando estado del contenedor...${NC}"
  docker ps | grep $container_name
  
  # Mostrar información de conexión
  echo -e "${GREEN}${CHECK} Base de datos $env iniciada${NC}"
  echo -e "${BLUE}${WRENCH} Usuario: $DATABASE_USER${NC}"
  echo -e "${BLUE}${WRENCH} Base de datos: $DATABASE_NAME${NC}"
  echo -e "${BLUE}${WRENCH} Puerto: $DATABASE_PORT${NC}"
}

# Función para detener base de datos
stop_db() {
  local env=$1
  local compose_file=""
  
  if [ "$env" == "dev" ]; then
    compose_file="docker/docker-compose.yml"
  elif [ "$env" == "test" ]; then
    compose_file="docker/docker-compose.test.yml"
  else
    echo -e "${RED}${ERROR} Error: Entorno no válido: $env${NC}"
    exit 1
  fi
  
  echo -e "${YELLOW}${STOP} Deteniendo base de datos de $env...${NC}"
  docker-compose -f "$compose_file" down
  echo -e "${GREEN}${CHECK} Base de datos de $env detenida${NC}"
}

# Función para mostrar estado
show_status() {
  echo -e "${BLUE}${SEARCH} Estado de las bases de datos:${NC}"
  docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E 'ligenia_db|NAMES'
}

# Función para mostrar logs
show_logs() {
  local env=$1
  local container_name=""
  
  if [ "$env" == "dev" ]; then
    container_name="ligenia_db"
  elif [ "$env" == "test" ]; then
    container_name="ligenia_db_test"
  else
    echo -e "${RED}${ERROR} Error: Entorno no válido: $env${NC}"
    exit 1
  fi
  
  echo -e "${BLUE}${LOGS} Mostrando logs de $container_name...${NC}"
  docker logs $container_name
}

# Función para abrir shell psql
open_shell() {
  local env=$1
  local container_name=""
  local db_user=""
  local db_name=""
  
  if [ "$env" == "dev" ]; then
    container_name="ligenia_db"
    db_user="ligenia_user"
    db_name="db_ligenia"
  elif [ "$env" == "test" ]; then
    container_name="ligenia_db_test"
    db_user="ligenia_user_test"
    db_name="db_ligenia_test"
  else
    echo -e "${RED}${ERROR} Error: Entorno no válido: $env${NC}"
    exit 1
  fi
  
  echo -e "${BLUE}${TERMINAL} Abriendo shell psql en $container_name...${NC}"
  docker exec -it $container_name psql -U $db_user -d $db_name
}

# Procesar comando
case "$COMMAND" in
  start)
    if [ "$ENV" == "all" ]; then
      start_db "dev"
      start_db "test"
    else
      start_db "$ENV"
    fi
    ;;
  stop)
    if [ "$ENV" == "all" ]; then
      stop_db "dev"
      stop_db "test"
    else
      stop_db "$ENV"
    fi
    ;;
  restart)
    if [ "$ENV" == "all" ]; then
      stop_db "dev"
      stop_db "test"
      start_db "dev"
      start_db "test"
    else
      stop_db "$ENV"
      start_db "$ENV"
    fi
    ;;
  status)
    show_status
    ;;
  logs)
    show_logs "$ENV"
    ;;
  shell)
    open_shell "$ENV"
    ;;
  *)
    show_help
    exit 1
    ;;
esac

exit 0 