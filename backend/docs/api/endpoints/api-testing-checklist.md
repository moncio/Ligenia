# API Testing Checklist

Este documento proporciona un checklist completo para probar todos los endpoints de la API de Ligenia. Cada endpoint debe ser probado para asegurar su correcto funcionamiento, incluyendo casos de éxito y de error.

## Instrucciones

Para realizar las pruebas, utiliza el script `supabase_api_tester.py` con la siguiente sintaxis:

```
python3 supabase_api_tester.py
login test@test.es test123
backend [método] [endpoint] [parámetros]
```

Por ejemplo:
```
backend get tournaments
backend post tournaments/bf031f69-55ab-4cf5-922e-f8b96a65eeb5/register {"userId": "5d54bd55-6dce-41fd-84c0-f68e7cf4a9fc"}
```

Marca cada prueba como:
- ✅ PASS - Funciona correctamente
- ❌ FAIL - No funciona como se espera
- ⚠️ PARTIAL - Funciona parcialmente o con advertencias
- ➖ N/A - No aplicable en este contexto

## Autenticación y Estado del Sistema

| ID | Endpoint | Método | Descripción | Comando | Estado | Notas |
|----|----------|--------|-------------|---------|--------|-------|
| S01 | `/health` | GET | Verificar estado del sistema | `backend get health` | ✅ | |
| S02 | `/version` | GET | Verificar versión de la API | `backend get version` | ✅ | |
| A01 | `/auth/login` | POST | Iniciar sesión con credenciales | `backend post auth/login {"email": "test@test.es", "password": "test123"}` | ➖ N/A | Autenticación manejada directamente por Supabase |
| A02 | `/auth/register` | POST | Registrar nuevo usuario | `backend post auth/register {"email": "nuevo@test.es", "password": "test123", "name": "Nuevo Usuario"}` | ➖ N/A | Registro manejado directamente por Supabase |
| A03 | `/auth/logout` | POST | Cerrar sesión | `backend post auth/logout` | ➖ N/A | Cierre de sesión manejado por Supabase |
| A04 | `/auth/refresh` | POST | Refrescar token | `backend post auth/refresh {"refreshToken": "token"}` | ➖ N/A | Refresco de token manejado por Supabase |
| D01 | `/debug/token-decode` | POST | Decodificar token JWT | `backend post debug/token-decode {"token": "tu-token"}` | ✅ | Endpoint de diagnóstico disponible |
| D02 | `/debug/token-validation` | POST | Validar token JWT | `backend post debug/token-validation {"token": "tu-token"}` | ✅ | Endpoint de diagnóstico disponible |

## Gestión de Usuarios

| ID | Endpoint | Método | Descripción | Comando | Estado | Notas |
|----|----------|--------|-------------|---------|--------|-------|
| U01 | `/users` | GET | Listar todos los usuarios (Admin) | `backend get users` | ⚠️ PARTIAL | Requiere rol ADMIN, devuelve 403 con rol PLAYER |
| U02 | `/users/:id` | GET | Obtener usuario por ID | `backend get users/5d54bd55-6dce-41fd-84c0-f68e7cf4a9fc` | ✅ | Funciona para el propio ID del usuario |
| U03 | `/users/:id` | PUT | Actualizar usuario | `backend put users/5d54bd55-6dce-41fd-84c0-f68e7cf4a9fc {"name": "John Doe"}` | ✅ | Funciona para el propio ID del usuario |
| U04 | `/users/:id` | DELETE | Eliminar usuario (Admin) | `backend delete users/5d54bd55-6dce-41fd-84c0-f68e7cf4a9fc` | ⚠️ PARTIAL | Requiere rol ADMIN, devuelve 403 con rol PLAYER |
| U05 | `/users/:id/match-history` | GET | Obtener historial de partidos | `backend get users/5d54bd55-6dce-41fd-84c0-f68e7cf4a9fc/match-history` | ✅ | Funciona para el propio ID del usuario |
| U06 | `/users/:id/preferences` | GET | Obtener preferencias de usuario | `backend get users/5d54bd55-6dce-41fd-84c0-f68e7cf4a9fc/preferences` | ✅ | Funciona para el propio ID del usuario |
| U07 | `/users/:id/preferences` | PUT | Actualizar preferencias | `backend put users/5d54bd55-6dce-41fd-84c0-f68e7cf4a9fc/preferences {"notificationEnabled": true, "theme": "dark", "language": "es"}` | ✅ | Funciona para el propio ID del usuario |

## Gestión de Torneos

| ID | Endpoint | Método | Descripción | Comando | Estado | Notas |
|----|----------|--------|-------------|---------|--------|-------|
| T01 | `/tournaments` | GET | Listar todos los torneos | `backend get tournaments` | ✅ | |
| T02 | `/tournaments?status=ACTIVE` | GET | Filtrar torneos por estado | `backend get tournaments?status=ACTIVE` | ✅ | |
| T03 | `/tournaments?category=P3` | GET | Filtrar torneos por categoría | `backend get tournaments?category=P3` | ✅ | |
| T04 | `/tournaments` | POST | Crear nuevo torneo (Admin) | `backend post tournaments {"name": "Nuevo Torneo", "description": "Descripción", "startDate": "2023-05-01", "endDate": "2023-05-07", "format": "SINGLE_ELIMINATION", "location": "Madrid", "maxParticipants": 16, "registrationDeadline": "2023-04-28", "category": "P3"}` | ⚠️ PARTIAL | Requiere rol ADMIN, devuelve 403 con rol PLAYER |
| T05 | `/tournaments/:id` | GET | Obtener torneo por ID | `backend get tournaments/bf031f69-55ab-4cf5-922e-f8b96a65eeb5` | ✅ | |
| T06 | `/tournaments/:id` | PUT | Actualizar torneo (Admin) | `backend put tournaments/bf031f69-55ab-4cf5-922e-f8b96a65eeb5 {"name": "Nombre Actualizado"}` | ⚠️ PARTIAL | Requiere rol ADMIN, devuelve 403 con rol PLAYER |
| T07 | `/tournaments/:id` | DELETE | Cancelar torneo (Admin) | `backend delete tournaments/bf031f69-55ab-4cf5-922e-f8b96a65eeb5` | ⚠️ PARTIAL | Requiere rol ADMIN, devuelve 403 con rol PLAYER |
| T08 | `/tournaments/:id/register` | POST | Registrarse en un torneo | `backend post tournaments/bf031f69-55ab-4cf5-922e-f8b96a65eeb5/register {"playerId": "5d54bd55-6dce-41fd-84c0-f68e7cf4a9fc"}` | ❌ FAIL | Devuelve error 500 (Internal Server Error). Puede indicar un problema en la implementación del servidor |
| T09 | `/tournaments/:id/start` | POST | Iniciar torneo (Admin) | `backend post tournaments/bf031f69-55ab-4cf5-922e-f8b96a65eeb5/start` | ⚠️ PARTIAL | Requiere rol ADMIN, devuelve 403 con rol PLAYER |
| T10 | `/tournaments/:id/bracket` | GET | Obtener bracket del torneo | `backend get tournaments/bf031f69-55ab-4cf5-922e-f8b96a65eeb5/bracket` | ✅ | |
| T11 | `/tournaments/:id/standings` | GET | Obtener clasificación del torneo | `backend get tournaments/bf031f69-55ab-4cf5-922e-f8b96a65eeb5/standings` | ✅ | |

## Gestión de Partidos

| ID | Endpoint | Método | Descripción | Comando | Estado | Notas |
|----|----------|--------|-------------|---------|--------|-------|
| M01 | `/tournaments/:id/matches` | GET | Listar partidos de un torneo | `backend get tournaments/bf031f69-55ab-4cf5-922e-f8b96a65eeb5/matches` | ✅ | |
| M02 | `/matches/:id` | GET | Obtener partido por ID | `backend get matches/c7bcb9d3-f25e-4e43-8ff3-6a9b6872564a` | ✅ | |
| M03 | `/matches/:id` | PUT | Actualizar detalles de partido (Admin) | `backend put matches/c7bcb9d3-f25e-4e43-8ff3-6a9b6872564a {"date": "2023-05-02", "location": "Pista Central"}` | ⚠️ PARTIAL | Requiere rol ADMIN, devuelve 403 con rol PLAYER |
| M04 | `/matches/:id/result` | POST | Registrar resultado de partido | `backend post matches/c7bcb9d3-f25e-4e43-8ff3-6a9b6872564a/result {"homeScore": 6, "awayScore": 4}` | ⚠️ PARTIAL | Solo disponible para participantes del partido o ADMINs |
| M05 | `/users/:id/match-history` | GET | Listar partidos del usuario | `backend get users/5d54bd55-6dce-41fd-84c0-f68e7cf4a9fc/match-history` | ✅ | Funciona para el propio ID del usuario |

## Gestión de Jugadores

| ID | Endpoint | Método | Descripción | Comando | Estado | Notas |
|----|----------|--------|-------------|---------|--------|-------|
| P01 | `/players` | GET | Listar todos los jugadores | `backend get players` | ✅ | |
| P02 | `/players/:id` | GET | Obtener jugador por ID | `backend get players/5d54bd55-6dce-41fd-84c0-f68e7cf4a9fc` | ❌ FAIL | Devuelve error 500 (Internal Server Error) |
| P03 | `/players/:id` | PUT | Actualizar jugador (Admin) | `backend put players/5d54bd55-6dce-41fd-84c0-f68e7cf4a9fc {"level": "P2"}` | ⚠️ PARTIAL | Requiere rol ADMIN, devuelve 403 con rol PLAYER |

## Estadísticas

| ID | Endpoint | Método | Descripción | Comando | Estado | Notas |
|----|----------|--------|-------------|---------|--------|-------|
| ST01 | `/players/:id/statistics` | GET | Obtener estadísticas de un jugador | `backend get players/5d54bd55-6dce-41fd-84c0-f68e7cf4a9fc/statistics` | ✅ | Funciona para el propio ID del usuario |
| ST02 | `/tournaments/:id/statistics` | GET | Obtener estadísticas de un torneo | `backend get tournaments/bf031f69-55ab-4cf5-922e-f8b96a65eeb5/statistics` | ✅ | |
| ST03 | `/statistics/global` | GET | Obtener estadísticas globales (Admin) | `backend get statistics/global` | ⚠️ PARTIAL | Requiere rol ADMIN, devuelve 403 con rol PLAYER |

## Rankings

| ID | Endpoint | Método | Descripción | Comando | Estado | Notas |
|----|----------|--------|-------------|---------|--------|-------|
| R01 | `/rankings/global` | GET | Obtener ranking global | `backend get rankings/global` | ✅ | |
| R02 | `/rankings/category/:category` | GET | Obtener ranking por categoría | `backend get rankings/category/P3` | ✅ | |
| R03 | `/players/:id/ranking` | GET | Obtener ranking de un jugador | `backend get players/5d54bd55-6dce-41fd-84c0-f68e7cf4a9fc/ranking` | ✅ | Funciona para el propio ID del usuario |

## Historial de Rendimiento

| ID | Endpoint | Método | Descripción | Comando | Estado | Notas |
|----|----------|--------|-------------|---------|--------|-------|
| PH01 | `/players/:id/performance-history` | GET | Obtener historial de rendimiento de un jugador | `backend get players/5d54bd55-6dce-41fd-84c0-f68e7cf4a9fc/performance-history` | ✅ | Funciona para el propio ID del usuario |
| PH02 | `/players/:id/performance-summary` | GET | Obtener resumen de rendimiento de un jugador | `backend get players/5d54bd55-6dce-41fd-84c0-f68e7cf4a9fc/performance-summary` | ✅ | Funciona para el propio ID del usuario |
| PH03 | `/users/:id/performance/:year` | GET | Obtener rendimiento anual | `backend get users/5d54bd55-6dce-41fd-84c0-f68e7cf4a9fc/performance/2023` | ✅ | Funciona para el propio ID del usuario |

## Preferencias de Usuario

| ID | Endpoint | Método | Descripción | Comando | Estado | Notas |
|----|----------|--------|-------------|---------|--------|-------|
| PR01 | `/users/:id/preferences` | GET | Obtener preferencias de usuario | `backend get users/5d54bd55-6dce-41fd-84c0-f68e7cf4a9fc/preferences` | ✅ | Funciona para el propio ID del usuario |
| PR02 | `/users/:id/preferences` | PUT | Actualizar preferencias | `backend put users/5d54bd55-6dce-41fd-84c0-f68e7cf4a9fc/preferences {"notificationEnabled": true, "theme": "dark", "language": "es"}` | ✅ | Funciona para el propio ID del usuario |

## Métricas y Webhooks (Admin)

| ID | Endpoint | Método | Descripción | Comando | Estado | Notas |
|----|----------|--------|-------------|---------|--------|-------|
| ME01 | `/metrics/usage` | GET | Obtener métricas de uso de la API | `backend get metrics/usage` | ⚠️ PARTIAL | Requiere rol ADMIN, devuelve 403 con rol PLAYER |
| ME02 | `/metrics/performance` | GET | Obtener métricas de rendimiento | `backend get metrics/performance` | ⚠️ PARTIAL | Requiere rol ADMIN, devuelve 403 con rol PLAYER |
| WH01 | `/webhooks/supabase` | POST | Webhook para eventos de Supabase | `backend post webhooks/supabase {"event": "user.created", "data": {}}` | ⚠️ PARTIAL | Solo para uso interno o aplicaciones autorizadas |

## Procedimiento de Prueba

1. Inicia sesión con `login test@test.es test123`
2. Verifica la autenticación con `diagnose`
3. Prueba cada endpoint en el orden listado
4. Para cada endpoint, prueba:
   - Caso de éxito (parámetros correctos)
   - Caso de error (parámetros incorrectos o faltantes)
   - Caso de autorización (si aplica)
5. Documenta el resultado de cada prueba en la columna "Estado"
6. Añade notas sobre comportamientos inesperados o problemas encontrados

## Resumen de Pruebas

| Categoría | Total Endpoints | Pasados | Fallidos | Parciales | N/A |
|-----------|----------------|---------|----------|-----------|-----|
| Autenticación y Sistema | 8 | 4 | 0 | 0 | 4 |
| Usuarios | 7 | 5 | 0 | 2 | 0 |
| Torneos | 11 | 5 | 1 | 5 | 0 |
| Partidos | 5 | 3 | 0 | 2 | 0 |
| Jugadores | 3 | 1 | 1 | 1 | 0 |
| Estadísticas | 3 | 2 | 0 | 1 | 0 |
| Rankings | 3 | 3 | 0 | 0 | 0 |
| Rendimiento | 3 | 3 | 0 | 0 | 0 |
| Preferencias | 2 | 2 | 0 | 0 | 0 |
| Métricas y Webhooks | 3 | 0 | 0 | 3 | 0 |
| **TOTAL** | 48 | 28 | 2 | 14 | 4 |

## Problemas Encontrados

- **T08**: Endpoint `/tournaments/:id/register` (POST)
  - **Descripción**: Al intentar registrar un jugador en un torneo, el servidor devuelve un error 500 (Internal Server Error).
  - **Mensaje de error**: `{"status": "error", "message": "Internal server error"}`
  - **Impacto**: Alto - Los usuarios no pueden registrarse en torneos, lo que es una funcionalidad core del sistema.
  - **Posibles causas**: 
    - Error en la implementación del controlador del servidor
    - Problema con la base de datos o la relación entre jugadores y torneos
    - El torneo podría no existir o estar en un estado que no permite registros
    - El ID del jugador podría no ser válido o no existir en la base de datos

- **P02**: Endpoint `/players/:id` (GET)
  - **Descripción**: Al intentar obtener la información de un jugador por ID, el servidor devuelve un error 500 (Internal Server Error).
  - **Mensaje de error**: `{"status": "error", "message": "Internal server error"}`
  - **Impacto**: Alto - No se puede acceder a la información de los jugadores, lo que afecta a muchas funcionalidades que dependen de esta información.
  - **Posibles causas**:
    - Error en la implementación del controlador del servidor
    - Problema con la base de datos de jugadores
    - El ID del jugador podría no existir en la base de datos, pero el sistema no maneja adecuadamente este caso
    - Posible problema con la relación entre las tablas de usuarios y jugadores

## Conclusiones

Este checklist muestra que la mayoría de los endpoints del sistema están funcionando correctamente. Para acceder a los datos del usuario actual, el sistema utiliza el ID específico del usuario en lugar de un endpoint especial "/me". 

Los endpoints marcados como PARTIAL son aquellos que requieren permisos de ADMIN, lo cual es el comportamiento esperado para un usuario normal.

Los endpoints marcados como N/A son aquellos relacionados con autenticación que son manejados directamente por Supabase, lo cual es consistente con la arquitectura del sistema.

En general, el sistema demuestra una buena organización de permisos y separación de responsabilidades entre endpoints públicos, endpoints para usuarios autenticados y endpoints administrativos. Sin embargo, podría mejorarse implementando endpoints tipo "/me" para simplificar el acceso a los datos del usuario autenticado.