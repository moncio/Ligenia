# **Visión General del Proyecto**

## 📌 Introducción
LIGENIA es una plataforma innovadora diseñada para la gestión de ligas deportivas en tiempo real, incorporando inteligencia artificial para la automatización de estadísticas, análisis predictivo y asistencia con IA. La plataforma permite a organizadores de torneos, jugadores y espectadores acceder a información detallada de los partidos, equipos y clasificaciones de manera automatizada y eficiente.

---

## 📖 Tabla de Contenidos
1. [Visión del Proyecto](#-visión-del-proyecto)
2. [Tecnologías Utilizadas](#-tecnologías-utilizadas)
3. [Planificación del MVP (30 Horas de Desarrollo)](#-planificación-del-mvp-30-horas-de-desarrollo)
    - [Fase 1: Infraestructura y Setup](#1%EF%B8%8F%E2%83%A3-fase-1-infraestructura-y-setup-3-horas)
    - [Fase 2: Registro de Usuarios y Creación de Ligas](#2%EF%B8%8F%E2%83%A3-fase-2-registro-de-usuarios-y-creación-de-ligas-6-horas)
    - [Fase 3: Gestión de Partidos y Resultados](#3%EF%B8%8F%E2%83%A3-fase-3-gestión-de-partidos-y-resultados-6-horas)
    - [Fase 4: Chat con IA Básico](#4%EF%B8%8F%E2%83%A3-fase-4-chat-con-ia-básico-5-horas)
    - [Fase 5: Frontend y Estilo](#5%EF%B8%8F%E2%83%A3-fase-5-frontend-y-estilo-4-horas)
    - [Fase 6: Pruebas y Despliegue Final](#6%EF%B8%8F%E2%83%A3-fase-6-pruebas-y-despliegue-final-6-horas)
4. [Beneficios de LIGENIA](#-beneficios-de-ligenia)
5. [Próximos Pasos (Post-MVP)](#-próximos-pasos-post-mvp)
6. [Conclusión](#-conclusión)

---

## 🎯 Visión del Proyecto
Crear una Liga Virtual con Estadísticas en Tiempo Real, aprovechando la inteligencia artificial para mejorar la experiencia en la gestión de torneos deportivos amateur y semiprofesionales.

- 🔹 Automatización de datos de partidos y clasificaciones.
- 🔹 Chatbot con IA para consultas de estadísticas y reglas.
- 🔹 Accesible desde cualquier dispositivo con hosting gratuito.
- 🔹 MVP en menos de 30 horas para validación temprana.

---

## 🛠️ Tecnologías Utilizadas

| Componente        | Tecnología Seleccionada         |
|------------------|--------------------------------|
| **Frontend**    | React.js + Next.js + Tailwind CSS |
| **Backend**     | Node.js con Express              |
| **Base de Datos** | Supabase (PostgreSQL)          |
| **Autenticación** | Supabase Auth                 |
| **Chat IA**      | OpenAI GPT-4 API               |
| **Versionado**   | GitHub + GitHub Actions        |
| **Hosting Full-Stack** | Railway (Gratuito)     |
| **Tablas/Gráficos** | React Table / Chart.js       |

---

## 📅 Planificación del MVP (30 Horas de Desarrollo)

### 1️⃣ Fase 1: Infraestructura y Setup (3 horas)
- 🔹 Crear repositorio en GitHub.
- 🔹 Hosting gratuito en Vercel (frontend) y Render (backend).
- 🔹 Configurar base de datos en Supabase.
- 🔹 Definir modelos de datos mínimos (Ligas, Equipos, Partidos, Usuarios).

### 2️⃣ Fase 2: Registro de Usuarios y Creación de Ligas (6 horas)
- 🔹 Autenticación básica con Supabase Auth.
- 🔹 Página de inicio de sesión y registro.
- 🔹 Funcionalidad para que un usuario cree una liga nueva y agregue equipos.

### 3️⃣ Fase 3: Gestión de Partidos y Resultados (6 horas)
- 🔹 Creación de partidos dentro de una liga.
- 🔹 Entrada manual de resultados.
- 🔹 Tabla de clasificación dinámica basada en puntos.
- 🔹 Mostrar estadísticas básicas (victorias, derrotas, empates).

### 4️⃣ Fase 4: Chat con IA Básico (5 horas)
- 🔹 Integración con OpenAI GPT-4 API.
- 🔹 Chatbot responde preguntas sobre reglas del torneo, estadísticas y próximos partidos.

### 5️⃣ Fase 5: Frontend y Estilo (4 horas)
- 🔹 Diseño simple pero funcional con Tailwind CSS.
- 🔹 Tablas y gráficos dinámicos con React Table / Chart.js.

### 6️⃣ Fase 6: Pruebas y Despliegue Final (6 horas)
- 🔹 Pruebas con usuarios para detectar bugs.
- 🔹 Mejoras rápidas en la UX.
- 🔹 Entrega y documentación básica del MVP.

---

## 📌 Beneficios de LIGENIA
✅ Ahorro de tiempo en la gestión de ligas.  
✅ Automatización de estadísticas sin intervención manual.  
✅ Análisis predictivo de rendimiento basado en IA.  
✅ Hosting gratuito accesible desde cualquier dispositivo.  
✅ Escalable y adaptable para deportes y torneos múltiples.  

---

## 🚀 Próximos Pasos (Post-MVP)
Una vez validado el MVP, podemos ampliar la plataforma con:
- 🔹 Automatización avanzada de estadísticas con IA.
- 🔹 Integración con APIs de streaming para highlights de partidos.
- 🔹 Predicciones de IA sobre rendimiento de equipos y jugadores.
- 🔹 App móvil nativa para mejorar la experiencia de usuario.

---

## 📢 Conclusión
LIGENIA nace como una solución única en el mercado, combinando automatización de ligas, estadísticas en tiempo real y un chatbot con IA. Su arquitectura gratuita y escalable la convierte en la mejor opción para ligas amateur y semiprofesionales.  

## MVP: Sistema de Torneos y Rankings

Para la versión mínima viable (MVP) del proyecto LIGENIA, nos centraremos en implementar un sistema completo de gestión de torneos con formato de eliminación directa (Single Elimination) y un sistema de rankings individuales.

### Características del MVP

1. **Gestión de Torneos**
   - Creación y administración de torneos en formato Single Elimination
   - Soporte para torneos con 16, 32 o 64 equipos máximo
   - Cada equipo compuesto por 2 jugadores
   - Fecha límite de inscripción automática (3 días antes del inicio)
   - Notificaciones automáticas a usuarios sobre nuevos torneos

2. **Inscripción de Equipos**
   - Interfaz para que los usuarios formen equipos e inscriban a torneos
   - Validación de inscripciones según plazos y límites de participantes
   - Gestión de equipos por parte de los usuarios

3. **Generación de Emparejamientos**
   - Sorteo automático de emparejamientos en formato Single Elimination
   - Generación del cuadro completo del torneo
   - Visualización del bracket del torneo

4. **Sistema de Puntuación**
   - Asignación de puntos según la ronda alcanzada en el torneo
   - Distribución equitativa de puntos entre miembros del equipo
   - Actualización automática de puntuaciones al finalizar partidos

5. **Rankings Individuales**
   - Cálculo de rankings basado en puntos acumulados
   - Visualización de rankings globales
   - Historial de participación en torneos

### Prioridades para el MVP

El MVP se centrará en ofrecer una experiencia completa pero simplificada del sistema de torneos, priorizando:

1. La correcta implementación del formato Single Elimination
2. Un sistema robusto de inscripción de equipos
3. La generación automática de emparejamientos
4. El cálculo preciso de rankings individuales

Las funcionalidades avanzadas como análisis estadístico detallado, predicciones con IA y otros formatos de torneo se implementarán en versiones posteriores.

