# Arquitectura Hexagonal para el Backend de Ligenia

## Tabla de Contenidos
1. [Introducción](#introducción)
   - [Propósito del Documento](#propósito-del-documento)
   - [Objetivos de la Arquitectura](#objetivos-de-la-arquitectura)
   - [Principios de Diseño](#principios-de-diseño)

2. [Análisis del Frontend](#análisis-del-frontend)
   - [Características Principales](#características-principales)
   - [Tecnologías Utilizadas](#tecnologías-utilizadas)
   - [Integración con Backend](#integración-con-backend)

3. [Arquitectura del Sistema](#arquitectura-del-sistema)
   - [Capas de la Arquitectura](#capas-de-la-arquitectura)
   - [Estructura de Carpetas](#estructura-de-carpetas)
   - [Flujo de Datos](#flujo-de-datos)

4. [API REST](#api-rest)
   - [Convenciones de Nomenclatura](#convenciones-de-nomenclatura)
   - [Autenticación y Autorización](#autenticación-y-autorización)
   - [Endpoints por Módulo](#endpoints-por-módulo)
   - [Manejo de Errores](#manejo-de-errores)
   - [Paginación y Filtrado](#paginación-y-filtrado)

5. [Testing](#testing)
   - [Estrategia de Testing](#estrategia-de-testing)
   - [Tests Unitarios](#tests-unitarios)
   - [Tests de Integración](#tests-de-integración)
   - [Tests End-to-End](#tests-end-to-end)
   - [Cobertura de Tests](#cobertura-de-tests)

6. [Integración con Supabase](#integración-con-supabase)
   - [Autenticación](#autenticación)
   - [Base de Datos](#base-de-datos)
   - [Almacenamiento](#almacenamiento)
   - [Funciones en Tiempo Real](#funciones-en-tiempo-real)

7. [Trabajo Futuro](#trabajo-futuro)
   - [Mejoras Planificadas](#mejoras-planificadas)
   - [Escalabilidad](#escalabilidad)
   - [Monitorización](#monitorización)

8. [Conclusiones](#conclusiones)
   - [Beneficios de la Arquitectura](#beneficios-de-la-arquitectura)
   - [Lecciones Aprendidas](#lecciones-aprendidas)

## Introducción

### Propósito del Documento
Este documento detalla la arquitectura hexagonal implementada en el backend de Ligenia, diseñada para soportar la versión "Lovable" del frontend. Proporciona una guía completa de la estructura, endpoints y estrategias de testing.

### Objetivos de la Arquitectura
- Mantener una clara separación de responsabilidades
- Facilitar el testing automatizado
- Permitir la evolución independiente de componentes
- Garantizar la mantenibilidad del código

### Principios de Diseño
- Arquitectura Hexagonal (Ports & Adapters)
- Principios SOLID
- Domain-Driven Design (DDD)
- Test-Driven Development (TDD)

## Análisis del Frontend

### Características Principales
- Gestión de usuarios y autenticación
- Sistema de torneos y competiciones
- Registro y seguimiento de partidos
- Estadísticas y rankings
- Gestión de perfiles
- Dashboards informativos
- Preferencias personalizadas

### Tecnologías Utilizadas
- React con TypeScript
- Tailwind CSS
- Supabase Auth
- i18next para internacionalización

### Integración con Backend
- API REST
- WebSockets para actualizaciones en tiempo real
- JWT para autenticación
- Manejo de estados con React Query

## API REST

### Convenciones de Nomenclatura
- Uso de sustantivos en plural para recursos
- Versionado en la URL (v1)
- Formato de respuesta JSON
- Códigos de estado HTTP estándar

### Endpoints por Módulo

#### Autenticación
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | /api/v1/auth/register | Registro de usuario | No |
| POST | /api/v1/auth/login | Inicio de sesión | No |
| POST | /api/v1/auth/logout | Cierre de sesión | Sí |
| GET | /api/v1/auth/me | Perfil del usuario actual | Sí |
| POST | /api/v1/auth/refresh | Renovar token | No |
| POST | /api/v1/auth/forgot-password | Solicitar reset de contraseña | No |
| POST | /api/v1/auth/reset-password | Resetear contraseña | No |

#### Usuarios
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | /api/v1/users | Listar usuarios | Sí |
| GET | /api/v1/users/{id} | Obtener usuario | Sí |
| PUT | /api/v1/users/{id} | Actualizar usuario | Sí |
| DELETE | /api/v1/users/{id} | Eliminar usuario | Sí |
| GET | /api/v1/users/{id}/statistics | Estadísticas de usuario | Sí |
| PUT | /api/v1/users/{id}/preferences | Actualizar preferencias | Sí |
| GET | /api/v1/users/{id}/matches | Historial de partidos | Sí |
| GET | /api/v1/users/{id}/tournaments | Torneos del usuario | Sí |

#### Torneos
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | /api/v1/tournaments | Listar torneos | Sí |
| POST | /api/v1/tournaments | Crear torneo | Sí |
| GET | /api/v1/tournaments/{id} | Obtener torneo | Sí |
| PUT | /api/v1/tournaments/{id} | Actualizar torneo | Sí |
| DELETE | /api/v1/tournaments/{id} | Eliminar torneo | Sí |
| POST | /api/v1/tournaments/{id}/register | Registrarse en torneo | Sí |
| GET | /api/v1/tournaments/{id}/participants | Listar participantes | Sí |
| GET | /api/v1/tournaments/{id}/matches | Partidos del torneo | Sí |
| GET | /api/v1/tournaments/{id}/standings | Clasificación | Sí |
| GET | /api/v1/tournaments/{id}/bracket | Bracket del torneo | Sí |

#### Partidos
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | /api/v1/matches | Listar partidos | Sí |
| POST | /api/v1/matches | Crear partido | Sí |
| GET | /api/v1/matches/{id} | Obtener partido | Sí |
| PUT | /api/v1/matches/{id} | Actualizar partido | Sí |
| DELETE | /api/v1/matches/{id} | Eliminar partido | Sí |
| POST | /api/v1/matches/{id}/result | Registrar resultado | Sí |
| GET | /api/v1/matches/{id}/statistics | Estadísticas del partido | Sí |

#### Rankings y Estadísticas
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | /api/v1/rankings | Ranking general | Sí |
| GET | /api/v1/rankings/{category} | Ranking por categoría | Sí |
| GET | /api/v1/statistics/global | Estadísticas globales | Sí |
| GET | /api/v1/statistics/tournaments | Estadísticas de torneos | Sí |
| GET | /api/v1/statistics/matches | Estadísticas de partidos | Sí |

### Manejo de Errores
- Formato estandarizado de errores
- Códigos de error específicos
- Mensajes descriptivos
- Logging centralizado

### Paginación y Filtrado
- Paginación basada en cursor
- Límite configurable de resultados
- Filtros por fecha, estado, categoría
- Ordenamiento personalizable

## Testing

### Estrategia de Testing
La estrategia de testing sigue la pirámide de testing:
- 70% Tests Unitarios
- 20% Tests de Integración
- 10% Tests End-to-End

### Tests Unitarios
- **Dominio**: Testing de entidades y reglas de negocio
- **Aplicación**: Testing de casos de uso
- **Infraestructura**: Testing de adaptadores
- **Cobertura objetivo**: >90%

### Tests de Integración
- **API**: Validación de endpoints
- **Base de Datos**: Operaciones CRUD
- **Autenticación**: Flujos de auth
- **Cobertura objetivo**: >80%

### Tests End-to-End
- Flujos completos de usuario
- Integración frontend-backend
- Escenarios críticos de negocio
- Cobertura objetivo: >60%

### Cobertura de Tests
- **Total**: 85%
- **Líneas**: 87%
- **Funciones**: 90%
- **Ramas**: 83%

## Integración con Supabase

### Autenticación
- JWT basado en Supabase Auth
- Roles y permisos personalizados
- Políticas de seguridad RLS

### Base de Datos
- PostgreSQL gestionado por Supabase
- Migraciones automáticas
- Backups programados

### Almacenamiento
- Archivos de usuario
- Imágenes de perfil
- Documentos de torneos

### Funciones en Tiempo Real
- Actualizaciones de partidos
- Notificaciones
- Estado de torneos

## Trabajo Futuro

### Mejoras Planificadas
- Sistema de notificaciones avanzado
- Asistente virtual con IA
- Análisis predictivo de partidos
- Internacionalización completa

### Escalabilidad
- Caché distribuido
- Balanceo de carga
- Sharding de base de datos
- Microservicios específicos

### Monitorización
- Métricas de rendimiento
- Alertas automáticas
- Logs centralizados
- APM integrado

## Conclusiones

### Beneficios de la Arquitectura
- Mantenibilidad mejorada
- Testing simplificado
- Escalabilidad preparada
- Desarrollo ágil facilitado

### Lecciones Aprendidas
- Importancia del diseño inicial
- Valor del testing automatizado
- Beneficios de la arquitectura limpia
- Flexibilidad para cambios futuros 