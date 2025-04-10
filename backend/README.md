# LIGENIA Backend

## Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Arquitectura](#arquitectura)
  - [Base de Datos](#base-de-datos)
  - [Características de Seguridad](#características-de-seguridad)
- [Instalación y Configuración](#instalación-y-configuración)
  - [Requisitos Previos](#requisitos-previos)
  - [Instalación](#instalación)
- [Endpoints de la API](#endpoints-de-la-api)
  - [Autenticación](#autenticación)
  - [Usuarios y Jugadores](#usuarios-y-jugadores)
  - [Torneos](#torneos)
  - [Partidos](#partidos)
  - [Estadísticas](#estadísticas)
  - [Rankings](#rankings)
  - [Rendimiento](#rendimiento)
  - [Preferencias](#preferencias)
- [Pruebas](#pruebas)
  - [Ejecución de Pruebas](#ejecución-de-pruebas)
  - [API Tester](#api-tester)
- [Herramientas de Desarrollo](#herramientas-de-desarrollo)
- [Scripts Útiles](#scripts-útiles)
- [Despliegue](#despliegue)
- [Licencia](#licencia)

## Descripción General

LIGENIA es una plataforma web que permite la gestión de competiciones, partidos y estadísticas para deportes como pádel. El sistema proporciona herramientas para la creación y gestión de torneos, seguimiento de jugadores, partidos y generación de estadísticas avanzadas.

## Arquitectura

El proyecto sigue una arquitectura limpia (Clean Architecture) con las siguientes capas:

- **API (`src/api/`)**: Controladores, rutas, middlewares y validaciones
- **Core (`src/core/`)**: Entidades de dominio, casos de uso e interfaces
- **Infraestructura (`src/infrastructure/`)**: Implementaciones de interfaces
- **Servicios Compartidos (`src/shared/`)**: Utilidades, configuraciones y servicios comunes

### Base de Datos

- PostgreSQL como sistema de gestión de base de datos
- Prisma como ORM para interactuar con la base de datos
- Migraciones automatizadas para control de versiones del esquema

### Características de Seguridad

- Supabase como sistema de autenticación externo
- Autenticación basada en JWT proporcionada por Supabase
- Verificación de roles de usuario (ADMIN, PLAYER)
- Protección de endpoints sensibles
- Validación de datos de entrada

## Instalación y Configuración

### Requisitos Previos

- Node.js >= 16
- npm o yarn
- PostgreSQL
- Cuenta en Supabase para la autenticación

### Instalación

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Configurar variables de entorno:
   - Copiar `.env.example` a `.env` y ajustar los valores
   - Configurar las variables de Supabase (URL y API Key)
   - Copiar `.env.test.example` a `.env.test` para entorno de pruebas

4. Generar cliente de Prisma:
   ```bash
   npx prisma generate
   ```

5. Iniciar la base de datos con Docker:
   ```bash
   ./scripts/db/db-manager.sh start dev
   ```

6. Ejecutar migraciones:
   ```bash
   npx prisma migrate dev
   ```

7. Iniciar el servidor:
   ```bash
   npm run dev
   ```

## Endpoints de la API

La API proporciona los siguientes grupos de endpoints:

### Autenticación
- `POST /api/auth/login` (Utiliza Supabase)
- `POST /api/auth/signup` (Utiliza Supabase)
- `POST /api/auth/logout` (Utiliza Supabase)

### Usuarios y Jugadores
- `GET /api/users` (admin)
- `GET /api/users/:id`
- `GET /api/players`
- `GET /api/players/:id`
- `PUT /api/players/:id`

### Torneos
- `GET /api/tournaments`
- `GET /api/tournaments/:id`
- `POST /api/tournaments` (admin)
- `PUT /api/tournaments/:id` (admin)
- `DELETE /api/tournaments/:id` (admin)
- `POST /api/tournaments/:id/register`
- `DELETE /api/tournaments/:id/unregister`

### Partidos
- `GET /api/matches`
- `GET /api/matches/:id`
- `POST /api/matches` (admin)
- `PUT /api/matches/:id`
- `DELETE /api/matches/:id` (admin)

### Estadísticas
- `GET /api/statistics/player/:playerId`
- `GET /api/statistics/tournament/:tournamentId`
- `GET /api/statistics/global`

### Rankings
- `GET /api/rankings`

### Rendimiento
- `GET /api/performance/history`
- `GET /api/performance/trends`

### Preferencias
- `GET /api/preferences`
- `PUT /api/preferences`
- `DELETE /api/preferences/reset`

## Pruebas

El proyecto incluye pruebas unitarias e integrales implementadas con Jest:

### Ejecución de Pruebas

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas con cobertura
npm run test:coverage

# Ejecutar pruebas unitarias
npm test -- --testPathPattern=unit

# Ejecutar pruebas de integración
npm test -- --testPathPattern=integration
```

### API Tester

Además, se incluye una herramienta personalizada para probar los endpoints de la API:

```bash
# Ejecutar el API Tester
python api_tester.py
```

Este tester permite verificar el comportamiento de los endpoints con diferentes roles de usuario (PLAYER, ADMIN).

## Herramientas de Desarrollo

- **ESLint y Prettier**: Formateo y linting consistente
- **Husky y lint-staged**: Verificación de calidad de código en commits
- **Jest**: Framework de pruebas
- **Docker**: Contenedores para base de datos y entornos de desarrollo
- **Supabase**: Plataforma externa para autenticación y gestión de usuarios

## Scripts Útiles

```bash
# Iniciar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Iniciar en modo producción
npm start

# Linting y formateo
npm run lint
npm run format

# Gestión de base de datos
./scripts/db/db-manager.sh start dev    # Iniciar BD desarrollo
./scripts/db/db-manager.sh start test   # Iniciar BD pruebas
./scripts/db/db-manager.sh stop all     # Detener todas las BD
```

## Despliegue

La aplicación está configurada para despliegue en Railway:

1. Asegurarse de que la aplicación pasa todas las pruebas
2. El despliegue se realiza automáticamente mediante CI/CD cuando se hace push a la rama principal
3. La configuración de despliegue se encuentra en `railway.toml`

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para más detalles.

