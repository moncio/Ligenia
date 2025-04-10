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

# Testing Strategy

## Test Categories

We have three main categories of tests:

1. **Unit Tests**: Fast tests that test a single unit in isolation with mocks.
2. **Integration Tests**: Tests that verify the interaction between components.
3. **Infrastructure Tests**: Tests that verify the integration with external systems like databases.

## Test Isolation Strategy

### Database Test Isolation

Infrastructure tests that interact with the database should be properly isolated to avoid interference between tests. We use the following strategies to ensure test isolation:

1. **Shared PrismaClient Instance**: We use a singleton PrismaClient instance for all tests to avoid connection pool exhaustion.
2. **Transaction-based Isolation**: Each test runs in a transaction that is rolled back after the test completes.
3. **Test-specific IDs**: Each test suite uses a unique ID prefix to avoid collisions.
4. **Proper Cleanup Order**: We clean up data in the correct order to avoid foreign key constraint violations.
5. **Sequential Execution**: Infrastructure tests run sequentially to avoid race conditions.

### Running Infrastructure Tests

To run infrastructure tests with proper isolation, use the following command:

```bash
npm run test:infrastructure
```

This command will:
- Run tests sequentially (--runInBand)
- Use proper test isolation via transactions
- Clean up test data after each test suite

For active development, you can use:

```bash
npm run test:infrastructure:watch
```

### Test Utils

We have several utilities to help with test isolation:

1. **db-test-utils.ts**: Provides utilities for database isolation and cleanup.
2. **test-data-factory.ts**: Factory for creating consistent test data.

Example usage:

```typescript
import { createRepositoryTestSuite } from '../../utils/db-test-utils';
import { TestDataFactory } from '../../utils/test-data-factory';

describe('MyRepository Tests', () => {
  const testSuite = createRepositoryTestSuite('my-repo');
  const prisma = testSuite.getPrisma();
  const testDataFactory = new TestDataFactory(prisma, 'my-repo-test');
  
  // Setup
  beforeAll(async () => {
    // Create test data
  });
  
  // Cleanup
  afterAll(async () => {
    await testSuite.cleanup();
  });
  
  // Test in transaction
  it('should do something transactional', async () => {
    await testSuite.runInTransaction(async (tx) => {
      // Test code that will be rolled back after
    });
  });
});
```

## Best Practices

1. **Use Transactions**: Always run database tests within transactions to avoid side effects.
2. **Register for Cleanup**: Register created entities for cleanup to ensure proper test data management.
3. **Use Test Data Factory**: Use the test data factory to ensure consistent test data creation.
4. **Avoid Hardcoded Expectations**: Use flexible assertions that don't rely on specific counts or IDs.
5. **Run Tests in Band**: Always run infrastructure tests sequentially to avoid race conditions.
6. **Clean Up After Yourself**: Even with transactions, explicitly clean up test data. 