# Modelo de la Base de Datos

## Introducción

Este documento describe el modelo de la base de datos para la plataforma LIGENIA, diseñada para la gestión de ligas y torneos de pádel. El modelo está optimizado para garantizar un rendimiento eficiente y una estructura normalizada, facilitando así la gestión de datos y mejorando la experiencia del usuario.

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Tabla de Contenidos](#tabla-de-contenidos)
3. [Explicación Detallada de la Base de Datos](#explicación-detallada-de-la-base-de-datos)
4. [Código en Formato PlantUML](#código-en-formato-plantuml)
5. [Optimizaciones Tenidas en Cuenta](#optimizaciones-tenidas-en-cuenta)
6. [Conclusiones](#conclusiones)

## Explicación Detallada de la Base de Datos

La base de datos de LIGENIA está diseñada para soportar la gestión de usuarios, ligas, torneos, equipos, partidos y estadísticas. Cada entidad está normalizada para asegurar la integridad de los datos y minimizar la redundancia. Las relaciones entre las entidades están claramente definidas para facilitar las consultas y operaciones comunes.

## Código en Formato PlantUML

```plantuml
@startuml

entity "Usuarios" as Usuarios {
id : UUID [PK]
nombre : String
correo : String
contraseña : String
rol : String
fecha_registro : Date
-- Índice en correo para búsquedas rápidas
}

entity "Ligas" as Ligas {
id : UUID [PK]
nombre : String
admin_id : UUID [FK]
tipo_puntuacion : String
fecha_creacion : Date
-- Índice en nombre para búsquedas por nombre
}

entity "Torneos" as Torneos {
id : UUID [PK]
liga_id : UUID [FK]
nombre : String
modalidad : String
estado : String
-- Índice en nombre para búsquedas por nombre
}

entity "Equipos" as Equipos {
id : UUID [PK]
torneo_id : UUID [FK]
jugador_1_id : UUID [FK]
jugador_2_id : UUID [FK] // Siempre requerido para pádel
}

entity "Partidos" as Partidos {
id : UUID [PK]
torneo_id : UUID [FK]
equipo_1_id : UUID [FK]
equipo_2_id : UUID [FK]
resultado : JSON
fecha : Date
-- Índice compuesto en (torneo_id, fecha) para consultas frecuentes
}

entity "Estadísticas" as Estadisticas {
id : UUID [PK]
jugador_id : UUID [FK]
torneo_id : UUID [FK]
puntos : Integer
victorias : Integer
derrotas : Integer
}

entity "Roles" as Roles {
id : UUID [PK]
nombre : String
}

entity "Chatbot" as Chatbot {
id : UUID [PK]
nombre : String
}

Usuarios ||--o{ Ligas : "1:N"
Ligas ||--o{ Torneos : "1:N"
Torneos ||--o{ Equipos : "1:N"
Equipos ||--o{ Partidos : "1:N"
Partidos ||--o{ Estadisticas : "1:N"
Usuarios ||--o{ Equipos : "1:N"
Usuarios ||--o{ Estadisticas : "1:N"
Usuarios }--|| Roles : "N:1"
Usuarios }--|| Chatbot : "N:1"

@enduml
```

## Optimizaciones Tenidas en Cuenta

1. **Normalización**: Todas las tablas están en Tercera Forma Normal (3NF) para asegurar que no haya redundancia de datos y que cada atributo dependa únicamente de la clave primaria.

2. **Índices**:
   - Índice en `correo` de `Usuarios` para mejorar las búsquedas por correo electrónico.
   - Índices en `nombre` de `Ligas` y `Torneos` para facilitar las búsquedas por nombre.
   - Índice compuesto en `(torneo_id, fecha)` de `Partidos` para optimizar las consultas que filtran por torneo y fecha.

3. **Relaciones Claras**: Las relaciones entre entidades están claramente definidas para facilitar las operaciones de `JOIN` y mejorar la integridad referencial.

## Conclusiones

El modelo de la base de datos de LIGENIA está diseñado para ser eficiente y escalable, soportando las operaciones comunes de gestión de ligas y torneos de pádel. Las optimizaciones aplicadas, como la normalización y el uso de índices, aseguran un rendimiento óptimo y una estructura de datos robusta. Este diseño proporciona una base sólida para el desarrollo y la expansión futura de la plataforma.