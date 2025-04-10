#!/bin/bash

# Este script lista todos los comandos disponibles en el directorio scripts

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

# Colores para formatear la salida
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧰 Comandos disponibles en Ligenia Backend${NC}"
echo ""

echo -e "${CYAN}💼 Categorías:${NC}"

# Mostrar directorios principales primero
for dir in */; do
  if [ -d "$dir" ]; then
    dirname=$(basename "$dir")
    case "$dirname" in
      "auth")
        echo -e "${YELLOW}🔑 auth/${NC} - Scripts de autenticación y usuarios"
        ;;
      "data")
        echo -e "${YELLOW}📊 data/${NC} - Scripts para generar y manipular datos"
        ;;
      "db")
        echo -e "${YELLOW}🗄️ db/${NC} - Scripts para gestión de bases de datos"
        ;;
      "deploy")
        echo -e "${YELLOW}🚀 deploy/${NC} - Scripts para despliegue y configuración"
        ;;
      "test")
        echo -e "${YELLOW}🧪 test/${NC} - Scripts para pruebas e integración"
        ;;
      "utils")
        echo -e "${YELLOW}🔧 utils/${NC} - Scripts de utilidad general"
        ;;
      *)
        echo -e "${YELLOW}📁 $dirname/${NC}"
        ;;
    esac
  fi
done

echo ""
echo -e "${CYAN}🔍 Scripts por categoría:${NC}"

# Función para listar scripts recursivamente
list_scripts() {
  local dir=$1
  local prefix=$2
  
  # Por cada archivo en el directorio
  for file in "$dir"/*; do
    if [ -d "$file" ]; then
      # Es un directorio, mostrarlo en otro color
      dirname=$(basename "$file")
      echo -e "${GREEN}${prefix}📁 ${dirname}/${NC}"
      # Listar su contenido con indentación
      list_scripts "$file" "${prefix}  "
    elif [ -x "$file" ] && [[ "$file" == *.sh || "$file" == *.js || "$file" == *.ts ]]; then
      # Es un script ejecutable, mostrar su nombre y una descripción breve
      scriptname=$(basename "$file")
      if grep -q "# " "$file"; then
        description=$(grep -m 1 "# " "$file" | sed 's/# //')
      elif grep -q "// " "$file"; then
        description=$(grep -m 1 "// " "$file" | sed 's/\/\/ //')
      elif grep -q "/\*\* " "$file"; then
        description=$(grep -m 1 "/\*\* " "$file" | sed 's/\/\*\* //')
      else
        description="Sin descripción"
      fi
      
      # Determinar icono según extensión
      if [[ "$scriptname" == *.sh ]]; then
        echo -e "${BLUE}${prefix}🛠️ ${scriptname}${NC}: ${description}"
      elif [[ "$scriptname" == *.js ]]; then
        echo -e "${BLUE}${prefix}📜 ${scriptname}${NC}: ${description}"
      elif [[ "$scriptname" == *.ts ]]; then
        echo -e "${BLUE}${prefix}📘 ${scriptname}${NC}: ${description}"
      else
        echo -e "${BLUE}${prefix}📄 ${scriptname}${NC}: ${description}"
      fi
    fi
  done
}

list_scripts "." ""

echo ""
echo -e "${YELLOW}ℹ️  Para ejecutar un comando:${NC} ./scripts/categoría/comando.sh [argumentos]"
echo -e "${YELLOW}ℹ️  Ejemplo:${NC} ./scripts/db/db-manager.sh start dev"
echo ""
echo -e "${YELLOW}📖 Más información:${NC} Ver README.md para detalles sobre cada script" 