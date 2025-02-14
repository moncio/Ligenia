# Definición y Diseño del Proyecto LIGENIA

## Asistente utilizado
**Modelo:** ChatGPT 4-turbo

## Prompts y respuestas

### Prompt 1:
**Usuario**: Toma el rol de un ingeniero informático senior. Quiero hacer un proyecto web con asistencia IA que ayude en todos los pasos del proceso. Desde el análisis y diseño inicial hasta el despliegue final. La temática ha de ser relacionada con deportes, me gustaría que la aplicación tuviera algún chat para preguntar a la IA. Dame opciones, de momento ideas a modo brainstorming.

**Respuesta**: Propuse 10 ideas de negocio enfocadas en deportes con IA. Entre ellas, destacaba una plataforma de análisis de rendimiento, un generador de rutinas deportivas personalizadas y una liga virtual con estadísticas en tiempo real. Analicé brevemente cada idea para ofrecer variedad y enfoques viables.

### Prompt 2:
**Usuario**: De todas esas opciones me gusta mucho la opción 3, quiero una idea de negocio que hoy en día no esté extendida y que pueda dar algún beneficio futuro, dame más detalles acerca de esa opción y qué existe actualmente en el mercado.

**Respuesta**: Profundicé en la opción de una liga virtual con estadísticas en tiempo real. Analicé plataformas existentes como SportEasy y Sofascore Editor, y expliqué qué características innovadoras podrían diferenciar a LIGENIA, como análisis predictivo de rendimiento y generación automática de rankings basados en estadísticas avanzadas.

### Prompt 3:
**Usuario**: Profundizando en esta idea, ¿cuál podría ser un MVP viable? La idea aquí sería tener ese producto mínimo para luego ir iterando y mejorando el proyecto en las diferentes áreas que lo compongan.

**Respuesta**: Esquematicé un MVP funcional en menos de 30 horas de desarrollo. Definí 6 fases clave para su implementación, incluyendo autenticación, gestión de ligas y torneos, entrada de resultados y generación de estadísticas. Propuse el uso de Supabase como base de datos y Vercel y Render como hosting gratuito.

### Prompt 4:
**Usuario**: El hosting ha de ser gratuito, accesible para poder acceder desde una URL publicada, y el tiempo para hacer esto no debería superar las 30 horas, siendo el deadline de entrega del MVP el 24 de marzo, estando hoy a 29 de enero. Reestructura la planificación en base a esto.

**Respuesta**: Rediseñé la planificación del MVP asegurando que las funcionalidades esenciales pudieran implementarse dentro del límite de tiempo. Priorizamos la gestión de ligas y torneos, dejando funcionalidades avanzadas para iteraciones posteriores. Se optimizó el uso de Supabase para reducir el trabajo en el backend.

### Prompt 5:
**Usuario**: Volviendo a darte contexto, hicimos este documento de visión general del proyecto: al final del mismo en tecnologías utilizada me indicas separar frontend y backend para el hosting y no quiero hacer eso, dame qué alternativas hay para el caso que quiera todo junto y que sea gratuito.

**Respuesta**: Propuse Railway como alternativa de hosting unificado para frontend, backend y base de datos, eliminando la necesidad de Vercel y Render por separado. Railway ofrece PostgreSQL gratuito y despliegue sin interrupciones en un solo entorno.

### Prompt 6:
**Usuario**: Muy bien, pues nos centraremos en Railway, por favor actualiza dicho documento con este nuevo enfoque y dámelo modificado.

**Respuesta**: Modifiqué el documento de visión general del proyecto, eliminando Vercel y Render y reemplazándolos por Railway como la opción central de hosting gratuito. Aseguré que la planificación del MVP y las tecnologías reflejaran este cambio.

