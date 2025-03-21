# Tests

Este directorio contiene los tests para el backend de LIGENIA, siguiendo las mejores prácticas de TDD (Test-Driven Development).

## Estructura

```
/tests
  /unit           # Tests unitarios para casos de uso y entidades
  /integration    # Tests de integración para repositorios y servicios
  /e2e            # Tests end-to-end para la API
  /fixtures       # Datos de prueba y mocks
```

## Tipos de Tests

### Unit Tests
- Prueban componentes individuales en aislamiento
- Se centran en la lógica de negocio
- No tienen dependencias externas
- Ubicación: `/tests/unit`

### Integration Tests
- Prueban la interacción entre componentes
- Incluyen acceso a la base de datos
- Verifican la integración de repositorios
- Ubicación: `/tests/integration`

### End-to-End Tests
- Prueban el flujo completo de la aplicación
- Simulan interacciones de usuario reales
- Verifican la API completa
- Ubicación: `/tests/e2e`

## Convenciones

1. **Nombrado de archivos**: `*.test.ts`
2. **Estructura de tests**: Usar el patrón AAA (Arrange, Act, Assert)
3. **Fixtures**: Mantener datos de prueba en `/fixtures`
4. **Mocks**: Usar Jest para mockear dependencias

## Ejecución

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests unitarios
npm run test:unit

# Ejecutar tests de integración
npm run test:integration

# Ejecutar tests e2e
npm run test:e2e
``` 