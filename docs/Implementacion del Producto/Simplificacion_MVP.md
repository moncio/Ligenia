# Simplificación del Proyecto para MVP

## Tabla de Contenidos
- [Introducción](#introducción)
- [Cambios Realizados](#cambios-realizados)
  - [1. Simplificación del Modelo de Datos](#1-simplificación-del-modelo-de-datos)
    - [Eliminación de Entidades](#eliminación-de-entidades)
    - [Simplificación de Entidades Existentes](#simplificación-de-entidades-existentes)
  - [2. Simplificación de la Arquitectura](#2-simplificación-de-la-arquitectura)
  - [3. Simplificación de Funcionalidades](#3-simplificación-de-funcionalidades)
- [Futuras Ampliaciones](#futuras-ampliaciones)
  - [1. Ampliaciones del Modelo de Datos](#1-ampliaciones-del-modelo-de-datos)
  - [2. Ampliaciones de la Arquitectura](#2-ampliaciones-de-la-arquitectura)
  - [3. Ampliaciones de Funcionalidades](#3-ampliaciones-de-funcionalidades)
- [Conclusión](#conclusión)

## Introducción

Este documento detalla las simplificaciones realizadas en el proyecto Ligenia para alcanzar un Producto Mínimo Viable (MVP) funcional dentro del plazo establecido. Debido a limitaciones de tiempo y recursos, se tomó la decisión de simplificar varios aspectos del diseño original, manteniendo la funcionalidad esencial mientras se posponen características más complejas para futuras iteraciones.

## Cambios Realizados

### 1. Simplificación del Modelo de Datos

#### Eliminación de Entidades
- **Ligas**: Se eliminó el concepto de ligas como entidad separada. En el MVP, los torneos existen de forma independiente.
- **Equipos**: Se eliminó la entidad de equipos como estructura separada. En su lugar, se trabaja directamente con parejas de jugadores.
- **Ubicaciones**: Se simplificó a un campo de texto en lugar de una entidad completa con coordenadas y detalles.
- **Roles**: Se simplificó a un campo en el usuario en lugar de una entidad separada con permisos detallados.
- **Notificaciones**: Se pospuso el sistema de notificaciones.
- **Auditoría**: Se pospuso el sistema de registro de auditoría.
- **Chatbots**: Se pospuso la integración con chatbots.

#### Simplificación de Entidades Existentes
- **Usuario**: Se redujeron los campos a lo esencial (id, email, password, name, role).
- **Jugador**: Se simplificó a información básica (nivel, edad, país).
- **Torneo**: Se simplificó a formato de eliminación simple, con fechas y categoría.
- **Partido**: Se adaptó para trabajar directamente con jugadores en lugar de equipos.
- **Estadística**: Se redujo a métricas esenciales (partidos jugados, victorias, derrotas, puntos, ranking).

### 2. Simplificación de la Arquitectura

- **Formatos de Torneo**: Se limitó a un único formato (eliminación simple).
- **Generación de Partidos**: Se simplificó el algoritmo para trabajar solo con el formato de eliminación simple.
- **Cálculo de Estadísticas**: Se simplificó para incluir solo métricas básicas.

### 3. Simplificación de Funcionalidades

- **Registro y Autenticación**: Se implementó un sistema básico sin verificación de email o autenticación de dos factores.
- **Gestión de Torneos**: Se limitó a creación, inscripción y visualización básica.
- **Gestión de Partidos**: Se simplificó a creación, actualización de resultados y visualización.
- **Ranking de Jugadores**: Se implementó un sistema básico basado en puntos.

## Futuras Ampliaciones

Las siguientes características fueron pospuestas para futuras iteraciones del proyecto:

### 1. Ampliaciones del Modelo de Datos

- **Ligas**: Implementar ligas que agrupen múltiples torneos con clasificaciones generales.
- **Equipos**: Crear equipos formales con nombres, logos y rankings propios.
- **Ubicaciones**: Desarrollar una entidad completa con coordenadas, instalaciones y disponibilidad.
- **Roles y Permisos**: Implementar un sistema completo de roles con permisos granulares.
- **Notificaciones**: Desarrollar un sistema de notificaciones en tiempo real.
- **Auditoría**: Implementar un sistema completo de registro de actividades.
- **Chatbots**: Integrar asistentes virtuales para ayuda y análisis.

### 2. Ampliaciones de la Arquitectura

- **Múltiples Formatos de Torneo**: Implementar formatos adicionales (doble eliminación, round robin, suizo).
- **Algoritmos Avanzados**: Desarrollar algoritmos más sofisticados para generación de partidos y cálculo de rankings.
- **Análisis de Datos**: Implementar herramientas de análisis estadístico avanzado.

### 3. Ampliaciones de Funcionalidades

- **Autenticación Avanzada**: Implementar verificación de email, recuperación de contraseña y autenticación de dos factores.
- **Gestión Avanzada de Torneos**: Añadir funcionalidades como inscripción con pago, premios, y reglas personalizadas.
- **Gestión Avanzada de Partidos**: Implementar reserva de pistas, asignación de árbitros y transmisión en vivo.
- **Sistema de Ranking Avanzado**: Desarrollar un sistema de ranking basado en algoritmos ELO o similares.
- **Funcionalidades Sociales**: Implementar perfiles de usuario, mensajería y compartir en redes sociales.
- **Aplicación Móvil**: Desarrollar una aplicación móvil nativa para iOS y Android.

## Conclusión

La simplificación del proyecto para el MVP ha permitido enfocarse en las funcionalidades esenciales y entregar un producto funcional dentro del plazo establecido. Las características pospuestas representan oportunidades de mejora y expansión para futuras iteraciones, manteniendo una hoja de ruta clara para el desarrollo continuo del sistema.

Esta estrategia de desarrollo incremental permite validar el concepto básico con usuarios reales antes de invertir en características más complejas, asegurando que el desarrollo futuro esté alineado con las necesidades reales de los usuarios. 