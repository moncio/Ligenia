# Especificaciones de la API

## Introducción

Este documento proporciona una descripción detallada de la API de LIGENIA, una plataforma diseñada para la gestión de ligas y torneos de pádel. La API está estructurada para facilitar la interacción con los diferentes componentes del sistema, permitiendo a los desarrolladores integrar y gestionar funcionalidades de manera eficiente. Además, se menciona el uso de Swagger para documentar y probar la API de forma interactiva.

## 📌 Tabla de Contenidos
1. [Introducción](#introducción)
2. [Explicación en Detalle de las Especificaciones de la API](#explicación-en-detalle-de-las-especificaciones-de-la-api)
   - [Servicios Principales](#servicios-principales)
   - [Autenticación](#autenticación)
   - [Gestión de Usuarios](#gestion-de-usuarios)
   - [Gestión de Ligas](#gestion-de-ligas)
   - [Gestión de Torneos](#gestion-de-torneos)
   - [Gestión de Equipos](#gestion-de-equipos)
   - [Gestión de Partidos](#gestion-de-partidos)
   - [Estadísticas](#estadísticas)
   - [Chatbot IA](#chatbot-ia)
3. [Uso de Swagger](#uso-de-swagger)
4. [Conclusión](#conclusión)


## Explicación en Detalle de las Especificaciones de la API

La API de LIGENIA está diseñada siguiendo principios RESTful, utilizando JSON como formato estándar para la transferencia de datos. Los servicios están organizados en torno a las principales entidades del sistema, como usuarios, ligas, torneos, equipos, partidos y estadísticas. Además, se incluyen endpoints específicos para la administración de estas entidades, asegurando que solo los usuarios con los permisos adecuados puedan realizar ciertas operaciones.

### Servicios Principales

1. **Autenticación (Supabase)**
   - Utiliza el módulo de autenticación de Supabase para gestionar el inicio y cierre de sesión, así como el registro de usuarios.

2. **Gestión de Usuarios**
   - Permite la consulta, actualización y eliminación de usuarios. La creación de usuarios se gestiona a través de Supabase Auth.

3. **Gestión de Ligas**
   - Gestiona la creación, actualización, eliminación y consulta de ligas.

4. **Gestión de Torneos**
   - Permite la gestión de torneos dentro de las ligas.

5. **Gestión de Equipos**
   - Gestiona la creación, actualización, eliminación y consulta de equipos.

6. **Gestión de Partidos**
   - Permite la programación, actualización, eliminación y consulta de partidos.

7. **Estadísticas**
   - Proporciona estadísticas de jugadores y equipos.

8. **Chatbot IA**
   - Interactúa con el chatbot para consultas sobre reglas, estadísticas y más.

### Administración

Los endpoints de administración permiten a los usuarios con roles específicos gestionar las entidades del sistema, asegurando que las operaciones críticas estén protegidas y controladas.

## Tabla Resumen de la API

| Servicio                      | Método HTTP | Endpoint                | Descripción                                           |
|-------------------------------|-------------|-------------------------|-------------------------------------------------------|
| Autenticación (Supabase)      | POST        | /auth/login             | Iniciar sesión de usuario                             |
| Autenticación (Supabase)      | POST        | /auth/signup            | Registrar nuevo usuario                               |
| Autenticación (Supabase)      | POST        | /auth/logout            | Cerrar sesión de usuario                              |
| Gestión de Usuarios           | GET         | /api/users              | Obtener lista de usuarios                             |
| Gestión de Usuarios           | PUT         | /api/users/{id}         | Actualizar información de usuario                     |
| Gestión de Usuarios           | DELETE      | /api/users/{id}         | Eliminar usuario                                      |
| Administración de Usuarios    | GET         | /api/admin/users        | Obtener lista de usuarios (admin)                     |
| Administración de Usuarios    | PUT         | /api/admin/users/{id}   | Actualizar usuario (admin)                            |
| Administración de Usuarios    | DELETE      | /api/admin/users/{id}   | Eliminar usuario (admin)                              |
| Gestión de Ligas              | GET         | /api/leagues            | Obtener lista de ligas                                |
| Gestión de Ligas              | POST        | /api/leagues            | Crear nueva liga                                      |
| Gestión de Ligas              | PUT         | /api/leagues/{id}       | Actualizar liga                                       |
| Gestión de Ligas              | DELETE      | /api/leagues/{id}       | Eliminar liga                                         |
| Administración de Ligas       | GET         | /api/admin/leagues      | Obtener lista de ligas (admin)                        |
| Administración de Ligas       | PUT         | /api/admin/leagues/{id} | Actualizar liga (admin)                               |
| Administración de Ligas       | DELETE      | /api/admin/leagues/{id} | Eliminar liga (admin)                                 |
| Gestión de Torneos            | GET         | /api/tournaments        | Obtener lista de torneos                              |
| Gestión de Torneos            | POST        | /api/tournaments        | Crear nuevo torneo                                    |
| Gestión de Torneos            | PUT         | /api/tournaments/{id}   | Actualizar torneo                                     |
| Gestión de Torneos            | DELETE      | /api/tournaments/{id}   | Eliminar torneo                                       |
| Administración de Torneos     | GET         | /api/admin/tournaments  | Obtener lista de torneos (admin)                      |
| Administración de Torneos     | PUT         | /api/admin/tournaments/{id} | Actualizar torneo (admin)                        |
| Administración de Torneos     | DELETE      | /api/admin/tournaments/{id} | Eliminar torneo (admin)                          |
| Gestión de Equipos            | GET         | /api/teams              | Obtener lista de equipos                              |
| Gestión de Equipos            | POST        | /api/teams              | Crear nuevo equipo                                    |
| Gestión de Equipos            | PUT         | /api/teams/{id}         | Actualizar equipo                                     |
| Gestión de Equipos            | DELETE      | /api/teams/{id}         | Eliminar equipo                                       |
| Administración de Equipos     | GET         | /api/admin/teams        | Obtener lista de equipos (admin)                      |
| Administración de Equipos     | PUT         | /api/admin/teams/{id}   | Actualizar equipo (admin)                             |
| Administración de Equipos     | DELETE      | /api/admin/teams/{id}   | Eliminar equipo (admin)                               |
| Gestión de Partidos           | GET         | /api/matches            | Obtener lista de partidos                             |
| Gestión de Partidos           | POST        | /api/matches            | Crear nuevo partido                                   |
| Gestión de Partidos           | PUT         | /api/matches/{id}       | Actualizar partido                                    |
| Gestión de Partidos           | DELETE      | /api/matches/{id}       | Eliminar partido                                      |
| Administración de Partidos    | GET         | /api/admin/matches      | Obtener lista de partidos (admin)                     |
| Administración de Partidos    | PUT         | /api/admin/matches/{id} | Actualizar partido (admin)                            |
| Administración de Partidos    | DELETE      | /api/admin/matches/{id} | Eliminar partido (admin)                              |
| Estadísticas                  | GET         | /api/statistics         | Obtener estadísticas de jugadores y equipos           |
| Chatbot IA                    | POST        | /api/chatbot            | Consultar al chatbot sobre reglas y estadísticas      |

## Uso de Swagger

Swagger es una herramienta poderosa para documentar y probar APIs. Al integrar Swagger en el desarrollo de la API de LIGENIA, se generará automáticamente una documentación interactiva que permitirá a los desarrolladores explorar y probar los endpoints de manera sencilla. Swagger facilita la comprensión de la API y asegura que los desarrolladores tengan acceso a ejemplos claros de solicitudes y respuestas.

En este proyecto, se hará uso de la librería `swagger-ui` para implementar Swagger. Esta librería permitirá generar y visualizar la documentación de la API en tiempo real, proporcionando una interfaz gráfica intuitiva donde los desarrolladores podrán ver todos los endpoints disponibles, sus métodos HTTP, parámetros requeridos y ejemplos de respuestas. Además, `swagger-ui` facilita la prueba de los endpoints directamente desde la documentación, lo que mejora significativamente el proceso de desarrollo y depuración de la API.

## Conclusión

La API de LIGENIA está diseñada para ser una herramienta robusta y flexible, capaz de soportar las necesidades de la gestión de ligas y torneos de pádel. La integración de Swagger mejorará la experiencia de desarrollo y facilitará la colaboración entre los equipos de desarrollo y los usuarios finales.
