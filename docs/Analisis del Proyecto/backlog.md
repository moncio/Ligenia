# Backlog del Proyecto

## 📌 Introducción
Este documento detalla el backlog del proyecto **LIGENIA**, una plataforma innovadora para la gestión de ligas y torneos deportivos. Se incluyen historias de usuario, priorización de funcionalidades y tickets de trabajo, con un enfoque en la integración de inteligencia artificial para mejorar la experiencia del usuario.

## 📖 Tabla de Contenidos
1. [Gestión de Ligas y Torneos](#gestión-de-ligas-y-torneos)
   - [Historia de Usuario 1: Creación de Ligas](#historia-de-usuario-1-creación-de-ligas)
   - [Historia de Usuario 2: Creación de Torneos](#historia-de-usuario-2-creación-de-torneos)
   - [Historia de Usuario 3: Gestión de Equipos](#historia-de-usuario-3-gestión-de-equipos)
   - [Historia de Usuario 4: Programación de Partidos](#historia-de-usuario-4-programación-de-partidos)
2. [Gestión de Resultados y Estadísticas](#gestión-de-resultados-y-estadísticas)
   - [Historia de Usuario 5: Registro de Resultados](#historia-de-usuario-5-registro-de-resultados)
   - [Historia de Usuario 6: Consulta de Estadísticas](#historia-de-usuario-6-consulta-de-estadísticas)
3. [Integración de Chatbot IA](#integración-de-chatbot-ia)
   - [Historia de Usuario 7: Asistencia con Chatbot IA](#historia-de-usuario-7-asistencia-con-chatbot-ia)
4. [Priorización de Historias de Usuario](#priorización-de-historias-de-usuario)
5. [Tickets de Trabajo](#tickets-de-trabajo)

---

## ⚽ Gestión de Ligas y Torneos

### 📌 Historia de Usuario 1: Creación de Ligas
- **Formato estándar:** "Como administrador, quiero crear ligas para organizar torneos y gestionar equipos."
- **Descripción:** Permitir a los administradores generar ligas con sus respectivas reglas y configuraciones.
- **Criterios de Aceptación:**
  - Dado que un administrador accede al sistema,
  - cuando ingresa los datos de una nueva liga y la guarda,
  - entonces el sistema almacena la liga y la muestra en su lista de ligas creadas.
- **Notas adicionales:** Definir reglas personalizables para cada liga.
- **Tareas:**
  - Crear formulario de creación de liga.
  - Implementar almacenamiento en base de datos.
  - Validar datos ingresados por el administrador.

### 📌 Historia de Usuario 2: Creación de Torneos
- **Formato estándar:** "Como administrador, quiero crear torneos dentro de una liga para estructurar la competencia."
- **Descripción:** Permitir a los administradores generar torneos en las ligas creadas.
- **Criterios de Aceptación:**
  - Dado que un administrador accede a una liga,
  - cuando selecciona la opción de crear torneo e ingresa la información requerida,
  - entonces el sistema almacena el torneo y lo asocia a la liga correspondiente.
- **Notas adicionales:** Permitir diferentes formatos de torneos (grupos, eliminación directa, etc.).
- **Tareas:**
  - Diseñar interfaz para la creación de torneos.
  - Implementar lógica de asignación de torneos a ligas.
  - Almacenar datos en la base de datos.

### 📌 Historia de Usuario 3: Gestión de Equipos
- **Formato estándar:** "Como administrador, quiero gestionar equipos dentro de un torneo para definir los participantes."
- **Descripción:** Permitir a los administradores registrar, editar y eliminar equipos participantes.
- **Criterios de Aceptación:**
  - Dado que un administrador accede a un torneo,
  - cuando añade o modifica los equipos registrados,
  - entonces el sistema actualiza la lista de participantes del torneo.
- **Notas adicionales:** Permitir cambios de equipos antes del inicio del torneo.
- **Tareas:**
  - Diseñar panel de gestión de equipos.
  - Implementar funciones de edición y eliminación.
  - Validar que no haya cambios después del inicio del torneo.

### 📌 Historia de Usuario 4: Programación de Partidos
- **Formato estándar:** "Como administrador, quiero programar partidos dentro de un torneo para estructurar el calendario de competencia."
- **Descripción:** Permitir que los administradores asignen fechas y horarios a los partidos.
- **Criterios de Aceptación:**
  - Dado que un administrador accede a la gestión de partidos,
  - cuando programa la fecha y hora de un partido,
  - entonces el sistema almacena y muestra la información en el calendario de torneos.
- **Notas adicionales:** Implementar un sistema de validación de horarios para evitar conflictos.
- **Tareas:**
  - Diseñar interfaz de programación de partidos.
  - Implementar lógica de validación de horarios.
  - Guardar y visualizar los partidos en el calendario.

---

## 📊 Gestión de Resultados y Estadísticas

### 📌 Historia de Usuario 5: Registro de Resultados
- **Formato estándar:** "Como administrador, quiero registrar los resultados de los partidos para actualizar las clasificaciones."
- **Descripción:** Permitir a los administradores ingresar los resultados de los partidos finalizados.
- **Criterios de Aceptación:**
  - Dado que un administrador accede a la gestión de partidos,
  - cuando selecciona un partido y registra el resultado,
  - entonces el sistema actualiza la clasificación de la liga.
- **Notas adicionales:** Implementar validaciones para evitar errores en la introducción de datos.
- **Tareas:**
  - Diseñar pantalla para registro de resultados.
  - Implementar lógica de actualización de estadísticas.
  - Integrar con la base de datos.

### 📌 Historia de Usuario 6: Consulta de Estadísticas
- **Formato estándar:** "Como jugador, quiero consultar mis estadísticas personales para conocer mi rendimiento en los torneos."
- **Descripción:** Permitir a los jugadores visualizar su historial de partidos, puntos y clasificación.
- **Criterios de Aceptación:**
  - Dado que un jugador accede a su perfil,
  - cuando selecciona la opción de estadísticas,
  - entonces el sistema muestra su historial de torneos, partidos jugados y estadísticas relevantes.
- **Notas adicionales:** Posibilidad de exportar datos en formato PDF o CSV.
- **Tareas:**
  - Diseñar interfaz para la consulta de estadísticas.
  - Implementar conexión con base de datos.
  - Agregar opción de exportación de datos.

---

## 🤖 Integración de Chatbot IA

### 📌 Historia de Usuario 7: Asistencia con Chatbot IA
- **Formato estándar:** "Como usuario, quiero interactuar con un chatbot para obtener respuestas rápidas sobre reglas, estadísticas y próximos partidos."
- **Descripción:** Proveer un chatbot que responda a preguntas frecuentes y ofrezca estadísticas personalizadas.
- **Criterios de Aceptación:**
  - Dado que un usuario accede al chatbot,
  - cuando realiza una consulta sobre reglas o estadísticas,
  - entonces el chatbot proporciona una respuesta precisa y relevante.
- **Notas adicionales:** El chatbot debe aprender de interacciones previas para mejorar sus respuestas.
- **Tareas:**
  - Integrar OpenAI GPT-4 API para el chatbot.
  - Diseñar interfaz de chat.
  - Implementar lógica de aprendizaje automático.

---

## 📌 Priorización de Historias de Usuario

Utilizando la técnica RICE (Reach, Impact, Confidence, Effort), se priorizan las historias de usuario de la siguiente manera:

| Historia de Usuario            | Reach | Impact | Confidence | Effort | RICE Score |
|--------------------------------|-------|--------|------------|--------|------------|
| Creación de Ligas              | 8     | 8      | 5          | 1      | 320        |
| Creación de Torneos            | 7     | 8      | 5          | 1      | 280        |
| Gestión de Equipos             | 7     | 7      | 4          | 1      | 196        |
| Programación de Partidos       | 6     | 7      | 4          | 1      | 168        |
| Registro de Resultados         | 6     | 6      | 4          | 1      | 144        |
| Consulta de Estadísticas       | 5     | 6      | 4          | 1      | 120        |
| Asistencia con Chatbot IA      | 5     | 5      | 4          | 1      | 100        |

---

## 🎯 Tickets de Trabajo

### 🎯 LIG-001: Creación de Ligas
**Descripción:** Implementar la funcionalidad para crear ligas.
**Criterios de Aceptación:**
  - Formulario de creación de liga.
  - Almacenamiento en base de datos.
**Prioridad:** Alta
**Esfuerzo Estimado:** 5 puntos de historia

### 🎯 LIG-002: Creación de Torneos
**Descripción:** Desarrollo de la funcionalidad para crear torneos.
**Criterios de Aceptación:**
  - Interfaz de creación de torneos.
  - Asignación a ligas.
**Prioridad:** Alta
**Esfuerzo Estimado:** 5 puntos de historia

### 🎯 LIG-003: Gestión de Equipos
**Descripción:** Permitir la administración de equipos dentro de torneos.
**Criterios de Aceptación:**
  - Funcionalidad para agregar, editar y eliminar equipos.
  - Restricción de modificaciones post-inicio del torneo.
**Prioridad:** Media
**Esfuerzo Estimado:** 3 puntos de historia

### 🎯 LIG-004: Programación de Partidos
**Descripción:** Desarrollo de la funcionalidad para programar encuentros en torneos.
**Criterios de Aceptación:**
  - Interfaz para asignar horarios y fechas a los partidos.
  - Validación de conflictos de horario.
**Prioridad:** Alta
**Esfuerzo Estimado:** 5 puntos de historia

### 🎯 LIG-005: Registro de Resultados
**Descripción:** Implementar la funcionalidad para registrar resultados de partidos.
**Criterios de Aceptación:**
  - Pantalla de registro de resultados.
  - Actualización de clasificaciones.
**Prioridad:** Media
**Esfuerzo Estimado:** 4 puntos de historia

### 🎯 LIG-006: Consulta de Estadísticas
**Descripción:** Permitir a los jugadores consultar sus estadísticas.
**Criterios de Aceptación:**
  - Interfaz de consulta de estadísticas.
  - Exportación de datos.
**Prioridad:** Media
**Esfuerzo Estimado:** 3 puntos de historia

### 🎯 LIG-007: Implementación de Chatbot
**Descripción:** Desarrollar chatbot de asistencia para responder preguntas frecuentes.
**Criterios de Aceptación:**
  - Responder preguntas sobre torneos, reglas y estadísticas.
  - Base de conocimiento actualizable.
**Prioridad:** Media
**Esfuerzo Estimado:** 4 puntos de historia

### 🎯 LIG-008: Pruebas Automatizadas
**Descripción:** Implementar pruebas automatizadas para garantizar estabilidad del sistema.
**Criterios de Aceptación:**
  - Pruebas unitarias para módulos críticos.
  - Pruebas de integración de endpoints API.
**Prioridad:** Alta
**Esfuerzo Estimado:** 6 puntos de historia

### 🎯 LIG-009: Documentación del Proyecto
**Descripción:** Elaborar documentación técnica y funcional del sistema.
**Criterios de Aceptación:**
  - Documentación de API y arquitectura.
  - Manual de usuario para administradores y jugadores.
**Prioridad:** Media
**Esfuerzo Estimado:** 3 puntos de historia

### 🎯 LIG-010: Mejora de UX/UI
**Descripción:** Mejorar la experiencia de usuario y la interfaz gráfica.
**Criterios de Aceptación:**
  - Diseño intuitivo y responsive.
  - Feedback de usuarios incorporado.
**Prioridad:** Media
**Esfuerzo Estimado:** 4 puntos de historia

---

## 📌 Priorización de Tickets de Trabajo

| Ticket ID | Descripción                          | Prioridad | Esfuerzo Estimado |
|-----------|--------------------------------------|-----------|-------------------|
| LIG-001   | Creación de Ligas                    | Alta      | 5 puntos          |
| LIG-002   | Creación de Torneos                  | Alta      | 5 puntos          |
| LIG-003   | Gestión de Equipos                   | Media     | 3 puntos          |
| LIG-004   | Programación de Partidos             | Alta      | 5 puntos          |
| LIG-005   | Registro de Resultados               | Media     | 4 puntos          |
| LIG-006   | Consulta de Estadísticas             | Media     | 3 puntos          |
| LIG-007   | Implementación de Chatbot            | Media     | 4 puntos          |
| LIG-008   | Pruebas Automatizadas                | Alta      | 6 puntos          |
| LIG-009   | Documentación del Proyecto           | Media     | 3 puntos          |
| LIG-010   | Mejora de UX/UI                      | Media     | 4 puntos          |

---

## 🚀 Conclusión
Este documento cubre el backlog priorizado y los tickets de trabajo detallados, incluyendo funcionalidades clave, pruebas y documentación, con un enfoque en la integración de inteligencia artificial para mejorar la experiencia del usuario en la gestión de ligas y torneos deportivos.

