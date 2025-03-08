# Proyecto LIGENIA

## Descripción General

LIGENIA es una innovadora plataforma web que utiliza inteligencia artificial para mejorar la experiencia en el ámbito deportivo. El proyecto se centra en ofrecer una liga virtual con estadísticas en tiempo real, proporcionando análisis predictivo de rendimiento y generación automática de rankings basados en estadísticas avanzadas.

## Objetivo del Proyecto

El objetivo principal de LIGENIA es crear una aplicación web que asista a los usuarios en todos los pasos del proceso deportivo, desde el análisis y diseño inicial hasta el despliegue final. La plataforma está diseñada para ser accesible y gratuita, utilizando tecnologías modernas para ofrecer una experiencia fluida y eficiente.

## Características Clave

- **Análisis de Rendimiento:** Herramientas avanzadas para analizar el rendimiento deportivo.
- **Rutinas Personalizadas:** Generación de rutinas deportivas adaptadas a las necesidades individuales.
- **Liga Virtual:** Creación y gestión de ligas con estadísticas en tiempo real.
- **Estadísticas Avanzadas:** Uso de IA para generar estadísticas y rankings automáticos.

## Tecnologías Utilizadas

- **Backend y Base de Datos:** Railway, que ofrece un entorno unificado para el hosting gratuito de frontend, backend y base de datos.
- **Base de Datos:** PostgreSQL, proporcionado por Railway.
- **Despliegue:** Railway permite un despliegue sin interrupciones en un solo entorno.

## Planificación del MVP

El MVP de LIGENIA está diseñado para ser funcional en menos de 30 horas de desarrollo, priorizando la gestión de ligas y torneos. Las funcionalidades avanzadas se dejarán para iteraciones posteriores, asegurando que las funcionalidades esenciales se implementen dentro del límite de tiempo.

## Proyecto Final del Bootcamp AI4Devs

Este proyecto es el resultado final del bootcamp AI4Devs, donde se aplicaron los conocimientos adquiridos en inteligencia artificial y desarrollo web para crear una plataforma innovadora en el ámbito deportivo.

## Estructura de la Base de Datos

La base de datos de LIGENIA ha sido diseñada siguiendo principios de normalización, seguridad y rendimiento. A continuación se detallan los principales modelos y sus características:

### Modelos Principales

1. **User**: Gestión completa de usuarios con características avanzadas de seguridad.
   - Autenticación robusta con verificación de email y recuperación de contraseña
   - Soporte para autenticación de dos factores
   - Sistema de roles flexible que permite asignar múltiples roles a un usuario
   - Campos de perfil para información deportiva (nivel de juego, mano preferida, etc.)
   - Protección contra intentos de inicio de sesión fallidos

2. **Role**: Sistema de roles con permisos granulares.
   - Roles predefinidos (ADMIN, PLAYER, COACH, REFEREE)
   - Permisos específicos almacenados como JSON para máxima flexibilidad
   - Relación muchos a muchos con usuarios para permitir múltiples roles

3. **League**: Gestión de ligas deportivas.
   - Diferentes tipos de puntuación (STANDARD, ADVANCED, CUSTOM)
   - Metadatos como descripción, logo y visibilidad pública/privada
   - Relación con torneos para organizar competiciones

4. **Tournament**: Gestión completa de torneos.
   - Diferentes estados (DRAFT, ACTIVE, COMPLETED, CANCELLED)
   - Modalidades de juego (SINGLES, DOUBLES, MIXED)
   - Reglas específicas, premios y cuotas de inscripción
   - Límites de equipos y fechas de inicio/fin

5. **Team**: Equipos participantes en torneos.
   - Soporte para equipos de dos jugadores (específico para pádel)
   - Ranking y logo del equipo
   - Relaciones con partidos y usuarios

6. **Match**: Gestión de partidos.
   - Resultados detallados almacenados como JSON
   - Ubicación específica con relación al modelo Location
   - Notas y estadísticas asociadas

7. **Statistic**: Estadísticas detalladas de rendimiento.
   - Estadísticas básicas (puntos, victorias, derrotas)
   - Estadísticas avanzadas (sets, juegos, aces, dobles faltas, etc.)
   - Porcentajes y ratings de rendimiento
   - Soporte para estadísticas personalizadas mediante JSON

8. **Location**: Gestión de ubicaciones para partidos.
   - Información completa (dirección, ciudad, código postal, país)
   - Coordenadas geográficas para integración con mapas
   - Detalles de instalaciones disponibles

9. **Notification**: Sistema de notificaciones para usuarios.
   - Diferentes tipos (partidos programados, resultados, actualizaciones, etc.)
   - Estado de lectura y datos relacionados
   - Optimizado para consultas rápidas

10. **Chatbot**: Asistentes virtuales con IA.
    - Relación con usuarios para personalización
    - Base para la integración con servicios de IA como OpenAI

11. **AuditLog**: Sistema de auditoría para seguridad.
    - Registro de acciones importantes (creación, actualización, eliminación, etc.)
    - Información detallada sobre el usuario, IP y agente de usuario
    - Datos específicos de cada acción para análisis posterior

### Optimizaciones de Rendimiento

- **Índices Estratégicos**: Índices simples y compuestos en campos frecuentemente consultados
- **Relaciones Optimizadas**: Diseño cuidadoso de relaciones para minimizar JOINs innecesarios
- **Campos JSON**: Uso de campos JSON para datos flexibles sin sacrificar rendimiento
- **Normalización**: Estructura normalizada para evitar redundancia y mantener integridad

### Características de Seguridad

- **Protección de Contraseñas**: Almacenamiento seguro de contraseñas
- **Verificación de Email**: Sistema de verificación para prevenir cuentas falsas
- **Bloqueo de Cuentas**: Protección contra intentos de fuerza bruta
- **Autenticación de Dos Factores**: Capa adicional de seguridad
- **Auditoría Completa**: Registro detallado de acciones sensibles
- **Tokens de Recuperación**: Sistema seguro para recuperación de contraseñas

### Escalabilidad y Mantenimiento

- **Diseño Modular**: Cada entidad tiene responsabilidades claramente definidas
- **Campos Timestamp**: Todos los modelos incluyen campos de creación y actualización
- **Soporte para Metadatos**: Campos flexibles para adaptarse a requisitos futuros
- **Migraciones Versionadas**: Sistema de migraciones para evolución controlada del esquema

### Datos de Prueba (Seed)

La base de datos incluye un completo conjunto de datos de prueba que permite probar todas las funcionalidades del sistema:

- **Usuarios con diferentes roles**: Administradores, jugadores, entrenadores y árbitros
- **Ligas y torneos**: Torneos en diferentes estados (borrador, activo, completado)
- **Equipos y partidos**: Estructura completa de competición con resultados
- **Estadísticas detalladas**: Datos de rendimiento para análisis y visualización
- **Ubicaciones reales**: Información geográfica completa para los partidos
- **Notificaciones de ejemplo**: Diferentes tipos de notificaciones para probar la interfaz
- **Registros de auditoría**: Ejemplos de acciones auditadas para seguridad
- **Chatbots configurados**: Asistentes virtuales listos para integración con IA

Para ejecutar el seed y poblar la base de datos con estos datos de prueba:

```bash
npx prisma db seed
```

Este comando limpia los datos existentes y crea un conjunto completo de datos interrelacionados que permiten probar todas las funcionalidades del sistema sin necesidad de crear datos manualmente.

## Gestión de la Base de Datos con Prisma

LIGENIA utiliza Prisma como ORM (Object-Relational Mapping) para interactuar con la base de datos PostgreSQL. A continuación se detallan los comandos más útiles para gestionar la base de datos:

### Comandos Básicos de Prisma

```bash
# Generar el cliente de Prisma basado en el esquema
npx prisma generate

# Crear una nueva migración a partir de cambios en el esquema
npx prisma migrate dev --name nombre_descriptivo

# Aplicar migraciones pendientes en entorno de producción
npx prisma migrate deploy

# Visualizar y editar datos con Prisma Studio
npx prisma studio

# Validar el esquema de Prisma
npx prisma validate

# Formatear el archivo schema.prisma
npx prisma format
```

### Estructura de Archivos

- **`prisma/schema.prisma`**: Define el esquema de la base de datos y las relaciones entre modelos
- **`prisma/migrations/`**: Contiene todas las migraciones versionadas
- **`prisma/seed.js`**: Script para poblar la base de datos con datos de prueba

### Buenas Prácticas Implementadas

1. **Migraciones Atómicas**: Cada migración realiza cambios específicos y bien documentados
2. **Índices Estratégicos**: Campos frecuentemente consultados están indexados para mejor rendimiento
3. **Relaciones Explícitas**: Todas las relaciones están claramente definidas con referencias
4. **Campos por Defecto**: Valores predeterminados para simplificar la creación de registros
5. **Validación de Datos**: Restricciones a nivel de base de datos para garantizar integridad
6. **Campos de Auditoría**: Todos los modelos incluyen timestamps de creación y actualización

## Configuración de Supabase

- **Row Level Security (RLS):** Implementar RLS en las tablas de la base de datos para asegurar que los usuarios solo puedan acceder a los datos que les pertenecen.
- **Autenticación y Autorización:** Utilizar Supabase Auth para gestionar la autenticación de usuarios, asegurando que cada solicitud incluya un JWT.

## Buenas Prácticas de Seguridad

- **Cifrado de Datos:** Asegurar que todos los datos sensibles estén cifrados tanto en tránsito como en reposo.
- **Protección contra Ataques Comunes:** Implementar medidas para prevenir inyecciones SQL, XSS, y CSRF.
- **Gestión de Contraseñas:** Utilizar bcrypt para el hashing de contraseñas.

## Pruebas y CI/CD

- **Desarrollo Guiado por Pruebas (TDD):** Escribir pruebas unitarias e integrales antes de implementar las funcionalidades.
- **Integración Continua:** Configurar GitHub Actions para ejecutar automáticamente las pruebas en cada commit o pull request.

## Arquitectura y Diseño

- **Arquitectura de Microservicios:** Seguir el diseño de microservicios para asegurar la escalabilidad y flexibilidad del sistema.
- **Modelo de Datos:** Asegurarse de que el modelo de datos esté bien normalizado y optimizado para el rendimiento.

## Guía de Instalación

1. **Clonar el Repositorio:**
   ```bash
   git clone https://github.com/usuario/proyecto-ligenia.git
   cd proyecto-ligenia/backend
   ```

2. **Configurar Variables de Entorno:**
   - Crear un archivo `.env` basado en el ejemplo proporcionado y configurar las variables necesarias para Supabase y Railway.

3. **Instalar Dependencias:**
   ```bash
   npm install
   ```

4. **Ejecutar el Servidor de Desarrollo:**
   ```bash
   npm run dev
   ```

5. **Ejecutar Pruebas:**
   ```bash
   npm test
   ```

Siguiendo estas líneas clave, podemos asegurar que la implementación del backend de LIGENIA sea segura, eficiente y escalable.