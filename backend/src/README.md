# LIGENIA Backend

## Estructura del Proyecto

El backend de LIGENIA sigue una arquitectura limpia (Clean Architecture) con la siguiente estructura:

```
/src
  /core               # Núcleo de la aplicación (reglas de negocio)
    /domain           # Entidades, interfaces de repositorios, esquemas
    /application      # Casos de uso
    /infrastructure   # Implementaciones de repositorios, servicios externos
  /shared             # Código compartido entre módulos
  /config             # Configuración del sistema
```

## Principios Arquitectónicos

1. **Separación de Responsabilidades**: Cada capa tiene una responsabilidad específica.
2. **Dependencia Hacia Adentro**: Las capas externas dependen de las internas, no al revés.
3. **Independencia de Frameworks**: El dominio no depende de frameworks o librerías externas.
4. **Testabilidad**: La arquitectura facilita pruebas unitarias e integración. 