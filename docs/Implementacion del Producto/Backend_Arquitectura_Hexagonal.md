# Arquitectura Hexagonal para el Backend de Ligenia

## Tabla de Contenidos
- [Introducción](#introducción)
- [Análisis del Frontend](#análisis-del-frontend)
- [Endpoints Necesarios](#endpoints-necesarios)
- [Estructura de Carpetas](#estructura-de-carpetas)
- [Casos de Uso Iniciales](#casos-de-uso-iniciales)
- [Implementación TDD](#implementación-tdd)
- [Integración con Supabase](#integración-con-supabase)
- [Trabajo Futuro](#trabajo-futuro)
- [Conclusiones](#conclusiones)

## Introducción

Este documento detalla la arquitectura hexagonal propuesta para el backend de Ligenia, diseñada para trabajar con el frontend actual implementado en su versión "Lovable". La arquitectura hexagonal (también conocida como "puertos y adaptadores") se ha elegido para garantizar un código mantenible, testeable y con una clara separación de responsabilidades. Además, se aplicará Test-Driven Development (TDD) para asegurar una alta calidad del código.

## Análisis del Frontend

Tras un análisis del frontend existente, se han identificado las siguientes características principales:

- Gestión de usuarios y autenticación mediante Supabase Auth
- Visualización y gestión de torneos
- Registro y seguimiento de partidos
- Visualización de estadísticas y rankings
- Gestión de perfiles de usuario
- Dashboards con información relevante
- Configuraciones y preferencias personalizadas (tema y tamaño de fuente)
- Asistente virtual (potencialmente para la siguiente iteración)

El frontend utiliza React con Tailwind CSS para la interfaz de usuario, y se integra con Supabase para autenticación y almacenamiento de datos. La internacionalización (i18n) se manejará a través de librerías específicas en el frontend.

## Endpoints Necesarios

Para satisfacer las necesidades del frontend, se requieren los siguientes endpoints:

### Autenticación
- **POST /api/auth/register**: Registro de usuarios
- **POST /api/auth/login**: Inicio de sesión
- **POST /api/auth/logout**: Cierre de sesión
- **GET /api/auth/profile**: Obtener perfil del usuario actual

### Usuarios
- **GET /api/users**: Listar usuarios
- **GET /api/users/{id}**: Obtener usuario por ID
- **PUT /api/users/{id}**: Actualizar usuario
- **GET /api/users/{id}/statistics**: Obtener estadísticas de un usuario
- **PUT /api/users/{id}/preferences**: Actualizar preferencias de usuario (tema, tamaño de fuente)
- **GET /api/users/{id}/preferences**: Obtener preferencias de usuario
- **PUT /api/users/{id}/password**: Cambiar contraseña del usuario

### Torneos
- **GET /api/tournaments**: Listar torneos (con filtros por estado, categoría, etc.)
- **GET /api/tournaments/{id}**: Obtener torneo por ID
- **POST /api/tournaments**: Crear torneo
- **PUT /api/tournaments/{id}**: Actualizar torneo
- **DELETE /api/tournaments/{id}**: Eliminar torneo
- **POST /api/tournaments/{id}/register**: Registrarse en un torneo
- **GET /api/tournaments/{id}/standings**: Obtener clasificación del torneo

### Partidos
- **GET /api/matches**: Listar partidos (con filtros)
- **GET /api/matches/{id}**: Obtener partido por ID
- **POST /api/matches**: Crear partido
- **PUT /api/matches/{id}**: Actualizar partido (resultados)
- **GET /api/tournaments/{id}/matches**: Obtener partidos de un torneo
- **GET /api/tournaments/{id}/bracket**: Obtener el bracket de un torneo

### Rankings
- **GET /api/rankings**: Obtener ranking general de jugadores
- **GET /api/rankings/{categoryId}**: Obtener ranking por categoría

### Históricos y Análisis
- **GET /api/users/{id}/performance/{year}**: Obtener rendimiento anual de un jugador
- **GET /api/users/{id}/match-history**: Obtener historial de partidos de un usuario con filtros

## Estructura de Carpetas

La arquitectura hexagonal propuesta sigue la siguiente estructura de carpetas:

```
backend/
├── src/
│   ├── domain/                     # Capa de dominio (Reglas de negocio)
│   │   ├── models/                 # Entidades de dominio
│   │   │   ├── User.ts
│   │   │   ├── Tournament.ts
│   │   │   ├── Match.ts
│   │   │   └── UserPreference.ts
│   │   ├── repositories/           # Interfaces de repositorios
│   │   │   ├── IUserRepository.ts
│   │   │   ├── ITournamentRepository.ts
│   │   │   ├── IMatchRepository.ts
│   │   │   └── IUserPreferenceRepository.ts
│   │   └── services/               # Servicios de dominio
│   │       ├── UserService.ts
│   │       ├── TournamentService.ts
│   │       ├── MatchService.ts
│   │       └── RankingService.ts
│   ├── application/                # Capa de aplicación (Casos de uso)
│   │   ├── user/                   # Casos de uso de usuario
│   │   │   ├── GetUserUseCase.ts
│   │   │   ├── UpdateUserUseCase.ts
│   │   │   ├── GetUserStatisticsUseCase.ts
│   │   │   ├── UpdatePreferencesUseCase.ts
│   │   │   ├── GetPreferencesUseCase.ts
│   │   │   ├── ChangePasswordUseCase.ts
│   │   │   ├── GetUserPerformanceUseCase.ts
│   │   │   └── GetMatchHistoryUseCase.ts
│   │   ├── tournament/             # Casos de uso de torneos
│   │   │   ├── CreateTournamentUseCase.ts
│   │   │   ├── GetTournamentsUseCase.ts
│   │   │   ├── RegisterToTournamentUseCase.ts
│   │   │   └── GetTournamentStandingsUseCase.ts
│   │   ├── match/                  # Casos de uso de partidos
│   │   │   ├── UpdateMatchResultUseCase.ts
│   │   │   ├── GetMatchesByTournamentUseCase.ts
│   │   │   └── GetTournamentBracketUseCase.ts
│   │   └── ranking/                # Casos de uso de rankings
│   │       ├── GetRankingUseCase.ts
│   │       └── GetCategoryRankingUseCase.ts
│   ├── infrastructure/             # Capa de infraestructura
│   │   ├── database/               # Configuración de base de datos
│   │   │   ├── prisma/             # Configuración de Prisma ORM
│   │   │   └── repositories/       # Implementaciones de repositorios
│   │   │       ├── UserRepository.ts
│   │   │       ├── TournamentRepository.ts
│   │   │       ├── MatchRepository.ts
│   │   │       └── UserPreferenceRepository.ts
│   │   ├── auth/                   # Servicios de autenticación
│   │   │   ├── SupabaseAuthService.ts
│   │   │   └── JwtService.ts
│   │   └── external/               # Servicios externos
│   ├── api/                        # Capa de presentación (API REST)
│   │   ├── controllers/            # Controladores HTTP
│   │   │   ├── AuthController.ts
│   │   │   ├── UserController.ts
│   │   │   ├── TournamentController.ts
│   │   │   ├── MatchController.ts
│   │   │   └── RankingController.ts
│   │   ├── middlewares/            # Middlewares
│   │   │   ├── AuthMiddleware.ts
│   │   │   ├── ValidationMiddleware.ts
│   │   │   └── ErrorHandlerMiddleware.ts
│   │   ├── routes/                 # Definición de rutas
│   │   │   ├── auth.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── tournament.routes.ts
│   │   │   ├── match.routes.ts
│   │   │   ├── ranking.routes.ts
│   │   │   └── index.ts
│   │   └── validators/             # Validadores de solicitudes
│   │       ├── UserValidator.ts
│   │       ├── TournamentValidator.ts
│   │       └── MatchValidator.ts
│   ├── config/                     # Configuración general
│   │   ├── env.ts
│   │   ├── app.ts
│   │   └── logger.ts
│   └── server.ts                   # Punto de entrada de la aplicación
├── tests/                          # Pruebas
│   ├── unit/                       # Pruebas unitarias
│   │   ├── domain/
│   │   ├── application/
│   │   └── infrastructure/
│   ├── integration/                # Pruebas de integración
│   │   ├── api/
│   │   └── repositories/
│   └── e2e/                        # Pruebas end-to-end
├── prisma/                         # Esquema de Prisma
│   └── schema.prisma
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Casos de Uso Iniciales

Basándose en la simplificación del MVP descrita en la documentación existente, los primeros casos de uso a implementar serán:

1. **Autenticación y Gestión de Usuarios**
   - Registro de usuario
   - Inicio de sesión
   - Obtener perfil de usuario
   - Actualizar perfil de usuario
   - Gestionar preferencias de usuario (tema, tamaño de fuente)

2. **Gestión de Torneos**
   - Crear torneo
   - Listar torneos disponibles
   - Obtener detalles de un torneo
   - Registrarse en un torneo

3. **Gestión de Partidos**
   - Crear partido
   - Actualizar resultado de un partido
   - Obtener bracket de un torneo

4. **Estadísticas y Rankings**
   - Obtener estadísticas de un usuario
   - Obtener ranking general
   - Obtener clasificación de un torneo específico
   - Obtener rendimiento histórico

## Implementación TDD

Para cada caso de uso, se seguirá el proceso de TDD:

1. **Red**: Escribir primero los tests que definan el comportamiento esperado del caso de uso.
2. **Green**: Implementar el código mínimo necesario para que los tests pasen.
3. **Refactor**: Mejorar el código manteniendo la funcionalidad y los tests pasando.

Ejemplo de implementación TDD para un caso de uso:

```typescript
// 1. RED: Test para CreateTournamentUseCase
describe('CreateTournamentUseCase', () => {
  it('should create a tournament successfully', async () => {
    // Arrange
    const mockTournamentData = { /* datos del torneo */ };
    const mockTournamentRepository = { create: jest.fn().mockResolvedValue({ id: '1', ...mockTournamentData }) };
    const useCase = new CreateTournamentUseCase(mockTournamentRepository);
    
    // Act
    const result = await useCase.execute(mockTournamentData);
    
    // Assert
    expect(mockTournamentRepository.create).toHaveBeenCalledWith(mockTournamentData);
    expect(result).toEqual({ id: '1', ...mockTournamentData });
  });
});

// 2. GREEN: Implementación mínima
class CreateTournamentUseCase {
  constructor(private tournamentRepository: ITournamentRepository) {}
  
  async execute(tournamentData: TournamentData): Promise<Tournament> {
    return this.tournamentRepository.create(tournamentData);
  }
}

// 3. REFACTOR: Mejorar implementación
class CreateTournamentUseCase {
  constructor(private tournamentRepository: ITournamentRepository) {}
  
  async execute(tournamentData: TournamentData): Promise<Tournament> {
    // Validar datos
    if (!tournamentData.name || !tournamentData.category) {
      throw new Error('Datos de torneo incompletos');
    }
    
    // Crear torneo
    const tournament = await this.tournamentRepository.create(tournamentData);
    
    // Lógica adicional si es necesaria
    
    return tournament;
  }
}
```

## Integración con Supabase

La integración con Supabase se realizará a través de adaptadores en la capa de infraestructura:

1. **Autenticación**: Se utilizará Supabase Auth para gestionar usuarios, implementando la interfaz `IAuthService` del dominio.

2. **Persistencia de datos**: Se implementarán los repositorios utilizando el cliente de Supabase para PostgreSQL, respetando las interfaces definidas en la capa de dominio.

3. **Arquitectura limpia**: La dependencia con Supabase estará aislada en la capa de infraestructura, permitiendo cambiar el proveedor si fuera necesario en el futuro.

4. **Preferencias de usuario**: Se almacenarán las preferencias de usuario básicas (tema, tamaño de fuente) en Supabase.

## Trabajo Futuro

Para iteraciones posteriores del proyecto, se contempla implementar las siguientes funcionalidades:

1. **Sistema de notificaciones**: Implementar un sistema completo de notificaciones para informar a los usuarios sobre:
   - Inscripciones a torneos
   - Resultados de partidos
   - Cambios en la programación
   - Recordatorios de eventos

2. **Asistente virtual**: Desarrollar un asistente virtual completo que pueda:
   - Responder a consultas de usuarios
   - Proporcionar sugerencias personalizadas
   - Asistir en la navegación de la plataforma
   - Ofrecer consejos para mejorar el juego

3. **Internacionalización avanzada**: Aunque la internacionalización básica se manejará a través de librerías en el frontend, en el futuro se podría:
   - Almacenar preferencias de idioma en el backend
   - Proporcionar contenido dinámico según el idioma seleccionado
   - Ofrecer traducciones automáticas para comunicaciones entre usuarios

## Conclusiones

La arquitectura hexagonal propuesta permite:

1. **Separación de responsabilidades**: Cada capa tiene un propósito claro y específico.
2. **Testabilidad**: Facilita la implementación de TDD en todos los niveles.
3. **Mantenibilidad**: La estructura organizada hace más fácil entender y mantener el código.
4. **Adaptabilidad**: Permite cambiar componentes externos (como la base de datos) con mínimo impacto.

Esta arquitectura se alinea con las necesidades simplificadas del MVP, mientras proporciona una base sólida para futuras ampliaciones del proyecto, como las mencionadas en la documentación de simplificación del MVP y en la sección de trabajo futuro.

La versión actual del frontend está implementada en su fase "Lovable", centrándose en ofrecer una experiencia de usuario atractiva y funcional, mientras que el backend proporcionará la robustez necesaria para soportar las funcionalidades esenciales del MVP. 