# LIGENIA Frontend

## Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Arquitectura](#arquitectura)
  - [Estructura de Carpetas](#estructura-de-carpetas)
  - [Componentes Principales](#componentes-principales)
  - [Características de Seguridad](#características-de-seguridad)
- [Tecnologías](#tecnologías)
- [Instalación y Configuración](#instalación-y-configuración)
  - [Requisitos Previos](#requisitos-previos)
  - [Instalación](#instalación)
- [Funcionalidades Principales](#funcionalidades-principales)
  - [Autenticación](#autenticación)
  - [Dashboard](#dashboard)
  - [Torneos](#torneos)
  - [Partidos](#partidos)
  - [Estadísticas](#estadísticas)
  - [Rankings](#rankings)
  - [Preferencias de Usuario](#preferencias-de-usuario)
- [Utilidades](#utilidades)
  - [Formateo de Fechas](#formateo-de-fechas)
  - [Transformación de Datos](#transformación-de-datos)
- [Herramientas de Desarrollo](#herramientas-de-desarrollo)
- [Scripts Útiles](#scripts-útiles)
- [Despliegue](#despliegue)

## Descripción General

LIGENIA es una plataforma web que permite la gestión de competiciones, partidos y estadísticas para deportes como pádel. El frontend proporciona una interfaz intuitiva y moderna para interactuar con todas las funcionalidades del sistema, permitiendo a los usuarios gestionar torneos, partidos y visualizar estadísticas avanzadas.

## Arquitectura

El frontend sigue una arquitectura moderna basada en componentes, con separación clara de responsabilidades y gestión eficiente del estado.

### Estructura de Carpetas

- **`src/components/`**: Componentes reutilizables de React
- **`src/pages/`**: Páginas principales de la aplicación
- **`src/hooks/`**: Hooks personalizados para la gestión de estado y lógica
- **`src/lib/`**: Utilidades para la UI y cliente API
- **`src/utils/`**: Funciones utilitarias y de ayuda
- **`src/contexts/`**: Contextos de React para la gestión de estado global
- **`src/types/`**: Definiciones de tipos TypeScript
- **`src/integrations/`**: Integraciones con servicios externos
- **`src/config/`**: Configuraciones de la aplicación

### Componentes Principales

- **UI Components**: Componentes de interfaz de usuario basados en shadcn/ui
- **Layouts**: Estructuras de diseño reutilizables para diferentes páginas
- **Forms**: Componentes de formulario con validación integrada
- **Data Display**: Componentes para mostrar datos (tablas, gráficos, etc.)
- **Navigation**: Componentes de navegación (menú, barra lateral, etc.)

### Características de Seguridad

- Autenticación basada en token proporcionada por Supabase
- Protección de rutas según roles de usuario
- Manejo seguro de tokens y datos sensibles
- Validación de formularios del lado del cliente

## Tecnologías

El frontend está construido con las siguientes tecnologías principales:

- **React**: Biblioteca para construir interfaces de usuario
- **TypeScript**: Superset tipado de JavaScript
- **Vite**: Herramienta de construcción rápida
- **Tailwind CSS**: Framework de CSS utilitario
- **shadcn/ui**: Componentes de UI accesibles y personalizables
- **React Router**: Enrutamiento para aplicaciones React
- **React Query**: Gestión de estado del servidor y caché
- **React Hook Form**: Manejo de formularios
- **Zod**: Validación de esquemas
- **Supabase**: Autenticación y gestión de usuarios
- **Axios**: Cliente HTTP para peticiones a la API
- **Recharts**: Biblioteca para visualización de datos

## Instalación y Configuración

### Requisitos Previos

- Node.js >= 16
- npm o yarn
- Backend de LIGENIA en funcionamiento

### Instalación

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Configurar variables de entorno:
   - Copiar `.env.example` a `.env` y ajustar los valores
   - Configurar las variables de Supabase (URL y API Key)
   - Configurar la URL de la API del backend

4. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Funcionalidades Principales

### Autenticación
- Registro de usuarios
- Inicio de sesión
- Recuperación de contraseña
- Gestión de perfil de usuario

### Dashboard
- Resumen de estadísticas del jugador
- Próximos partidos
- Resultados recientes
- Torneos activos
- Ranking actual

### Torneos
- Listado de torneos disponibles
- Detalles de torneo
- Inscripción/Cancelación de inscripción
- Visualización de cuadros y resultados
- Calendario de partidos

### Partidos
- Listado de partidos
- Detalles de partido
- Registro de resultados
- Historial de partidos jugados

### Estadísticas
- Estadísticas individuales del jugador
- Comparativa con otros jugadores
- Evolución del rendimiento
- Gráficos y visualizaciones

### Rankings
- Ranking global
- Rankings por categoría
- Evolución del ranking

### Preferencias de Usuario
- Configuración de notificaciones
- Preferencias de visualización
- Configuración de privacidad

## Utilidades

### Formateo de Fechas

El proyecto incluye un conjunto de utilidades para el formateo de fechas en `src/utils/dateUtils.ts`:

- `formatShortDate`: Formato corto (DD/MM/YYYY)
- `formatMediumDate`: Formato medio (DD MMM YYYY)
- `formatLongDate`: Formato largo (DD de MMMM de YYYY)
- `formatDateTime`: Fecha con hora (DD/MM/YYYY HH:MM)
- `formatTime`: Solo hora (HH:MM)
- `formatRelativeTime`: Formato relativo (Hoy, Mañana, Ayer, Hace X días)

### Transformación de Datos

Se proporcionan funciones para transformar datos del backend al formato requerido por el frontend:

- `transformPlayerStatistics`: Transforma estadísticas de jugador
- Otras utilidades en `src/utils/dataTransformer.ts`

## Herramientas de Desarrollo

- **ESLint y TypeScript-ESLint**: Linting de código
- **Tailwind CSS**: Estilizado mediante clases utilitarias
- **shadcn/ui**: Componentes de UI accesibles
- **Vite**: Servidor de desarrollo rápido
- **React DevTools**: Depuración de componentes React

## Scripts Útiles

```bash
# Iniciar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Construir para desarrollo
npm run build:dev

# Linting de código
npm run lint

# Vista previa de la build
npm run preview
```

## Despliegue

El frontend de LIGENIA está configurado para ser desplegado en Railway, en consonancia con el backend:

1. Construir la aplicación para producción:
   ```bash
   npm run build
   ```

2. El despliegue se realiza automáticamente mediante CI/CD cuando se hace push a la rama principal.

3. La configuración de despliegue se encuentra en el archivo de configuración de Railway correspondiente.

4. Aunque Railway es la plataforma de despliegue principal, los archivos generados en el directorio `dist/` también pueden ser servidos por otros servicios como:
   - Vercel
   - Netlify
   - GitHub Pages
   - Firebase Hosting
