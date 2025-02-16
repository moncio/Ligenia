# Diseño del Sistema LIGENIA

## Asistente utilizado
Modelo: GPT-4o

## Prompts y Respuesta

### Prompt 1:
**Usuario**: Dado el @Codebase actual del proyecto que es solo documentación del proyecto, toma el rol como arquitecto de software experto. Necesito que te centres en el diseño del sistema, queremos diseñar lo siguiente:
1) diseño de la base de datos
2) diseño de la interfaz de usuario
3) especificación de servicios y APIs necesarios (endpoints, métodos HTTP y formatos de respuesta)
Antes que hagas nada, quiero estudies el contexto del proyecto y me digas si lo tienes claro, luego iremos paso a paso según te diga.

**Respuesta**: Revisé el contexto del proyecto y confirmé que tengo claro el enfoque y los objetivos para el diseño del sistema.

### Prompt 2:
**Usuario**: vamos a comenzar con la base de datos, teniendo en cuenta que queremos usar PostgreSQL, haz un primer boceto, genera un diagrama de clases en formato plantUML, usa el contexto del proyecto para ello

**Respuesta**: Generé un diagrama de clases en formato PlantUML para la base de datos.

### Prompt 3: 
**Usuario**: si nos centramos en el padel, normalmente los partidos son jugadors por parejas (2 usuarios) ten en cuenta esto

**Respuesta**: Actualicé el diagrama de clases para reflejar la modalidad de pádel.

### Prompt 4:
**Usuario**: que optimizaciones se pueden hacer a esta base de datos? buscamos:

- normalizar la base de datos
- recomendaciones de indices adecuados de cara a tener en cuenta aquellas queries que mas se vayan a utilizar mejorando asi el rendimiento de las mismas y de la aplicacion
- sugerencias de mas optimizaciones

**Respuesta**: Proporcioné una lista de optimizaciones para la base de datos.

### Prompt 5: 
**Usuario**: aplica estas optimizaciones que indicas en el codigo plantUML que me presentaste antes, haz un documento en markdown que se llama "modelo base de datos.md" que tenga lo siguiente:

1) titulo: Modelo de la base de datos
2) Introduccion del documento explicando que es
3) Tabla de contenidos
4) Explicacion detallada de la base de datos
5) Codigo en formato plantUML de la misma
6) Optimizaciones tenidas en cuenta
7) Conclusiones

**Respuesta**: Generé un documento en formato Markdown con el modelo de la base de datos.

### Prompt 6:
**Usuario**: ahora vamos a centrarnos en el punto 2: Especificación de Servicios y APIs, diseña los servicios del sistema y genera un diagrama de componentes que escenifique la interaccion de los modulos del sistema

**Respuesta**: Generé un diagrama de componentes que escenifique la interaccion de los modulos del sistema.

### Prompt 7:
**Usuario**: ten en cuenta que el servicio de autenticacon vamos a aprovechar el modulo que viene incorporado en Supabase

**Respuesta**: Tuve en cuenta el servicio de autenticación que viene incorporado en Supabase.

### Prompt 8:
**Usuario**: me faltan endpoints para la parte de administracion

**Respuesta**: Generé endpoints para la parte de administración.    

### Prompt 9: 
**Usuario**: Indica el formato en el que van a venir los datos, que sea lo más estándar y rápido en términos de rendimiento del sistema.

**Respuesta**: Proporcioné un formato estándar en JSON para la transferencia de datos en la API.

### Prompt 10:
**Usuario**: Sería interesante generar un swagger de la API? Genera una tabla con todos los métodos propuestos a modo resumen en formato markdown.

**Respuesta**: Creé una tabla resumen de los endpoints de la API en formato Markdown.

### Prompt 11:
**Usuario**: Genera un documento en formato markdown con los siguientes apartados...

**Respuesta**: Generé un documento en formato Markdown con las especificaciones de la API.

### Prompt 12:
**Usuario**: Nos queda definir el diagrama de componentes con el contexto actual que tenemos, qué herramientas puedo usar para ello?

**Respuesta**: Sugerí herramientas para crear diagramas de componentes, como Lucidchart y PlantUML.

### Prompt 13:
**Usuario**: Usa PlantUML, genera una primera versión del diagrama con el contexto actual...

**Respuesta**: Creé un diagrama de componentes en PlantUML y lo documenté.

### Prompt 14:
**Usuario**: Me falta en el diagrama la parte de infraestructura en el despliegue con el servicio de hosting (Railway)...

**Respuesta**: Actualicé el diagrama de componentes para incluir Railway y documenté los cambios.

### Prompt 15:
**Usuario**: Guarda esta conversación en formato markdown, quiero que me indiques siempre el mismo formato...

**Respuesta**: Confirmé el formato para guardar la conversación y preparé el documento en Markdown.
