# LIGENIA Backend Scripts

Este directorio contiene scripts de utilidad para la aplicación backend de LIGENIA. Los scripts están organizados en las siguientes categorías:

## Estructura de Directorios

```
scripts/
├── auth/       # Scripts relacionados con autenticación y usuarios
├── data/       # Scripts para generar y manipular datos
├── db/         # Scripts para gestión de bases de datos
├── deploy/     # Scripts para despliegue y configuración de entorno
├── test/       # Scripts para pruebas e integración
└── utils/      # Scripts de utilidad general
```

## Categorías de Scripts

### Auth (Autenticación)

Scripts relacionados con la gestión de usuarios, autenticación y autorización:

- `create-admin-user.ts` - Crea un usuario administrador en Supabase y lo sincroniza con la base de datos local
- `debug-auth-middleware.js` - Simula el proceso de autenticación y autorización del middleware 
- `fix-admin-role.js` - Corrige problemas con roles de administrador entre Supabase y base de datos
- `sync-supabase-users.ts` - Sincroniza usuarios desde Supabase Auth a la base de datos local
- `test-admin-token.js` - Prueba la funcionalidad del token de administrador

```bash
# Crear un usuario administrador
npm run admin:create

# Sincronizar usuarios de Supabase
npm run sync:supabase:users
```

### Data (Datos)

Scripts para generación y manipulación de datos:

- `create-player-and-statistics-for-admin.ts` - Crea un perfil de jugador para un administrador
- `fix-player-statistics.ts` - Corrige estadísticas de jugadores
- `generate-test-data.ts` - Genera datos de prueba completos (jugadores, torneos, partidos)
- `populate-user-data.ts` - Genera datos de usuario para pruebas
- `update_tournament.js` - Actualiza el estado de los torneos

```bash
# Generar datos de prueba
npm run testdata:generate
```

### DB (Base de Datos)

Scripts para gestión de bases de datos:

- `db-manager.sh` - Administra las bases de datos de desarrollo y prueba

```bash
# Iniciar base de datos de desarrollo
./scripts/db/db-manager.sh start dev

# Iniciar base de datos de prueba
./scripts/db/db-manager.sh start test

# Ver el estado de las bases de datos
./scripts/db/db-manager.sh status
```

### Deploy (Despliegue)

Scripts relacionados con el despliegue y configuración del entorno:

- `ensure-logs-dir.js` - Asegura que el directorio de logs exista antes de iniciar la aplicación
- `railway-migration.js` - Ejecuta migraciones de Prisma en entorno Railway

### Test (Pruebas)

Scripts para pruebas e integración:

- `debug-mocks.js` - Depura los mocks para pruebas
- `run-integration-tests.sh` - Ejecuta las pruebas de integración
- `setup-integration-tests.js` - Configura el entorno para pruebas de integración

```bash
# Ejecutar pruebas de integración
npm run test:integration
```

### Utils (Utilidades)

Scripts de utilidad general:

- `update-console-logs.js` - Proporciona guía para reemplazar console.log con el sistema de logger

## Notas Generales

- Para que estos scripts funcionen correctamente, necesitas credenciales válidas de Supabase en tu archivo `.env`:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY` o `SUPABASE_ANON_KEY`
- La configuración de conexión a la base de datos debe estar correctamente configurada en tu archivo `.env`
- Asegúrate de que tu esquema de Prisma esté actualizado antes de ejecutar estos scripts

## Uso Recomendado

Para configurar un entorno de desarrollo completo:

1. Inicia la base de datos: `./scripts/db/db-manager.sh start dev`
2. Crea un usuario administrador: `npm run admin:create`
3. Genera datos de prueba: `npm run testdata:generate`
4. Ejecuta pruebas de integración: `npm run test:integration` 