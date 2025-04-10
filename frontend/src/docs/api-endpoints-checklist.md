# Checklist de Interfaces y Endpoints API

Este documento proporciona un checklist de las interfaces principales de la aplicación y los endpoints API que utilizan para obtener datos.

## Inicio

Página principal que muestra un resumen de las competiciones y estadísticas del usuario.

- `/api/auth/me` - Obtener información del usuario actual
- `/api/players/me/matches?limit=5` - Obtener partidos recientes del jugador actual
- `/api/players/me/matches/upcoming?limit=5` - Obtener próximos partidos del jugador actual
- `/api/players/me/tournaments` - Obtener torneos activos del jugador actual
- `/api/rankings/me` - Obtener la posición actual del usuario en el ranking

## Competiciones

Interfaz para visualizar, buscar y registrarse en torneos.

- `/api/tournaments` - Listar todos los torneos (con filtros opcionales)
  - Parámetros: `status`, `category`, `page`, `limit`
- `/api/tournaments/{id}` - Obtener detalles de un torneo específico
- `/api/tournaments/{id}/register` - Registrarse en un torneo
- `/api/tournaments/{id}/bracket` - Obtener el cuadro de un torneo
- `/api/tournaments/{id}/matches` - Listar partidos de un torneo

## Estadísticas

Página que muestra las estadísticas globales y rankings de todos los jugadores.

- `/api/rankings/global` - Obtener ranking global de todos los jugadores
  - Parámetros: `page`, `limit`, `search`, `sortBy`, `sortOrder`
- `/api/statistics/global` - Obtener estadísticas globales del sistema
  - Parámetros: `period`, `category`
- `/api/rankings/category/{category}` - Obtener ranking por categoría (P1, P2, P3)

## UserEstadisticas

Página que muestra las estadísticas detalladas de un usuario específico.

- `/api/rankings/me` - Obtener la posición actual del usuario en el ranking
- `/api/statistics/user/{userId}` - Obtener estadísticas agregadas del usuario
  - Muestra resumen de puntos, victorias, derrotas y porcentaje de victorias
- `/api/players/{playerId}/statistics` - Obtener estadísticas detalladas del jugador por torneo
- `/api/players/{playerId}/matches` - Obtener historial de partidos del jugador
- `/api/performance/player/{playerId}/history?year={year}` - Obtener historial de rendimiento por año

## Configuración

Página para gestionar las preferencias y configuración del usuario.

- `/api/users/{id}` - Obtener información del usuario
- `/api/users/{id}` - Actualizar información del usuario (método PUT)
- `/api/users/{id}/preferences` - Obtener preferencias del usuario
- `/api/users/{id}/preferences` - Actualizar preferencias del usuario (método PUT)

## Estado de implementación

| Interfaz | Implementación | Estado |
|----------|----------------|--------|
| Inicio | Completa | ✅ |
| Competiciones | Completa | ✅ |
| Estadísticas | Completa y mejorada | ✅ |
| UserEstadisticas | Completa con 3 tarjetas (Ranking, Puntuación, Victorias) | ✅ |
| Configuración | Completa | ✅ |

## Notas

- Todos los endpoints requieren autenticación mediante un token JWT válido en el header `Authorization: Bearer {token}`
- Los endpoints para estadísticas de usuario solo permiten acceder a los datos del propio usuario o requieren permisos de administrador
- El formato de respuesta estándar es:

```json
{
  "status": "success",
  "data": {
    // Datos específicos del endpoint
  }
}
```

- En caso de error, el formato es:

```json
{
  "status": "error",
  "message": "Descripción del error"
}
```