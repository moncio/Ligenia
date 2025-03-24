// Debug script for testing the mock container
const { Container } = require('inversify');
const { Result } = require('./src/shared/result');
const { UserRole } = require('./src/core/domain/user/user.entity');

console.log('\n== Testing mock container creation directly ==\n');

// Create a simple mock use case
const createMockUserUseCases = () => {
  return {
    listUsersUseCase: {
      execute: jest.fn().mockImplementation((params) => {
        console.log('[DEBUG] Mock listUsersUseCase executed with params:', params);
        
        const limit = params?.limit || 10;
        const offset = params?.offset || 0;
        
        console.log('[DEBUG] Creating mock data with limit:', limit, 'offset:', offset);
        
        // Create mock users
        const mockUsers = [
          {
            id: '123e4567-e89b-12d3-a456-426614174001',
            name: 'Test User 1',
            email: 'test1@example.com',
            role: UserRole.PLAYER
          },
          {
            id: '123e4567-e89b-12d3-a456-426614174002',
            name: 'Test User 2',
            email: 'test2@example.com',
            role: UserRole.ADMIN
          }
        ];
        
        const result = Result.ok({
          users: mockUsers,
          total: mockUsers.length,
          limit,
          offset
        });
        
        console.log('[DEBUG] Returning result:', JSON.stringify(result));
        console.log('[DEBUG] Result isSuccess():', result.isSuccess());
        console.log('[DEBUG] Result getValue():', JSON.stringify(result.getValue()));
        
        return Promise.resolve(result);
      })
    }
  };
};

// Create a container
const createMockContainer = () => {
  const container = new Container();
  const mockUserUseCases = createMockUserUseCases();
  
  // Bind mock use cases
  container.bind('listUsersUseCase').toConstantValue(mockUserUseCases.listUsersUseCase);
  
  return container;
};

console.log('Creating container manually');
const container = createMockContainer();
console.log('Container created:', !!container);

// Get one of the mock use cases
try {
  const listUsersUseCase = container.get('listUsersUseCase');
  console.log('\n== ListUsersUseCase ==');
  console.log('Use case exists:', !!listUsersUseCase);
  console.log('Use case type:', typeof listUsersUseCase);
  console.log('Use case properties:', Object.keys(listUsersUseCase));
  console.log('Execute is function:', typeof listUsersUseCase.execute === 'function');
  
  // Test execute method
  console.log('\n== Testing listUsersUseCase.execute ==');
  const params = { limit: 10, offset: 0 };
  console.log('Calling with params:', params);
  const resultPromise = listUsersUseCase.execute(params);
  console.log('Return type is Promise:', resultPromise instanceof Promise);
  
  resultPromise.then(result => {
    console.log('\n== Result from execute call ==');
    console.log('Result type:', typeof result);
    console.log('Result is Result instance:', result instanceof Result);
    console.log('Result has isSuccess method:', typeof result.isSuccess === 'function');
    console.log('Result has isFailure method:', typeof result.isFailure === 'function');
    console.log('Result.isSuccess():', result.isSuccess());
    console.log('Result.isFailure():', result.isFailure());
    
    if (result.isSuccess()) {
      const value = result.getValue();
      console.log('Result value:', value);
    } else {
      console.log('Result error:', result.getError());
    }
  }).catch(error => {
    console.error('Error executing use case:', error);
  });
} catch (error) {
  console.error('Error getting use case from container:', error);
}

// Test the result class
console.log('\n== Testing Result class directly ==');
const okResult = Result.ok({ test: 'data' });
console.log('okResult type:', typeof okResult);
console.log('okResult isSuccess():', okResult.isSuccess());
console.log('okResult isFailure():', okResult.isFailure());
console.log('okResult value:', okResult.getValue());

const failResult = Result.fail(new Error('Test error'));
console.log('failResult type:', typeof failResult);
console.log('failResult isSuccess():', failResult.isSuccess());
console.log('failResult isFailure():', failResult.isFailure());
console.log('failResult error message:', failResult.getError().message);

// Keep process alive for async operations
setTimeout(() => {
  console.log('\n== Debug completed ==');
}, 1000); 