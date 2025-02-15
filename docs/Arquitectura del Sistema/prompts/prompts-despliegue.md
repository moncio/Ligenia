# Resumen de la Conversación: Despliegue e Infraestructura de LIGENIA

## Asistente Utilizado

- **Nombre**: ChatGPT 4o
- **Versión**: 4o
- **Modelo**: gpt-4o

## Prompts y Respuesta

### Prompt 1: 

**Usuario**: Eres un ingeniero senior Devops, estamos estudiando como va a ser la infraestructura para LIGENIA, necesito que me respondas a las siguientes cuestiones:

1) Estrategia de testing y suite de tests a realizar (tests unitarios y de integracion) con las tecnologias involucradas para ello
2) Tecnologias involucradas en el pipeline a la hora integrar todo y desplegar en la nube:
   - Tests
   - Check de codigo/scan de seguridad
3) Diferencia entre el despliegue de la infraestructura en local al entorno de produccion dando detalle del mismo en cada caso
4) Estructura de directorio del proyecto LIGENIA
5) Guia de instalacion paso a paso para desplegar el proyecto en local y en la nube

**Respuesta**: Respondio a las preguntas anteriores dando una respuesta para cada una de forma general

### Prompt 2:

**Usuario**: ahora teniendo en cuenta todo @Codebase , haz las elecciones adecuadas en cada caso del punto anterior

**Respuesta**: se focaliza en la estrategia de testing y suite de tests a realizar (tests unitarios y de integracion) con las tecnologias involucradas para ello, se selecciona Jest para los tests unitarios y Supertest para los tests de integracion, github actions para el pipeline de CI/CD, docker para el despliegue local y railway para el despliegue en la nube, se selecciona Railway como el servicio de despliegue en la nube mas adecuado para el proyecto