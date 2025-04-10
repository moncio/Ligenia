# Authentication Middleware for Testing

This document explains how to use the enhanced authentication middleware for testing purposes, particularly for role-based access control testing.

## Overview

The authentication middleware has been enhanced to support testing of role-based access control. In a test environment, you can now:

1. Use predefined test tokens to simulate users with different roles
2. Override the user role using a special header
3. Test endpoints that require specific user roles

## Predefined Test Tokens

The middleware recognizes the following predefined tokens:

| Token | Role | User ID | Description |
|-------|------|---------|-------------|
| `valid-token` | PLAYER | user-123 | Default player user |
| `admin-token` | ADMIN | admin-123 | Admin user with full privileges |
| `invalid-token` | N/A | N/A | Will trigger 401 Unauthorized |

## Using Test Tokens in Integration Tests

You can use these tokens in your tests by including them in the Authorization header:

```typescript
// Test with admin privileges
const response = await agent
  .post('/api/tournaments')
  .set('Authorization', 'Bearer admin-token')
  .send(tournamentData);
  
// Test with player privileges
const response = await agent
  .get('/api/users')
  .set('Authorization', 'Bearer valid-token');
```

## Overriding Roles with the x-test-role Header

For more flexibility, you can override the role using the `x-test-role` header. This allows you to specify any role within the `UserRole` enum (ADMIN or PLAYER):

```typescript
// Override role to ADMIN
const response = await agent
  .post('/api/tournaments')
  .set('Authorization', 'Bearer valid-token')
  .set('x-test-role', 'ADMIN')
  .send(tournamentData);
```

This feature only works when the `NODE_ENV` is set to `test`.

## Example: Testing Access Control

Here's a complete example of testing role-based access control:

```typescript
describe('Tournament Management', () => {
  it('allows admins to create tournaments', async () => {
    const response = await agent
      .post('/api/tournaments')
      .set('Authorization', 'Bearer admin-token')
      .send(tournamentData);
      
    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
  });
  
  it('prevents players from creating tournaments', async () => {
    const response = await agent
      .post('/api/tournaments')
      .set('Authorization', 'Bearer valid-token')
      .send(tournamentData);
      
    expect(response.status).toBe(403);
    expect(response.body.status).toBe('error');
  });
  
  it('allows specific user roles to perform actions', async () => {
    // Test with explicit role override
    const response = await agent
      .post('/api/tournaments')
      .set('Authorization', 'Bearer valid-token')
      .set('x-test-role', 'ADMIN')
      .send(tournamentData);
      
    expect(response.status).toBe(201);
  });
});
```

## Best Practices

1. Use the predefined tokens when possible for consistent testing
2. Use the `x-test-role` header when you need more flexibility
3. Ensure your tests cover all access control scenarios (unauthorized, forbidden, allowed)
4. Test both positive and negative cases for each role

## Setting Up Test Environment

Ensure your test environment has `NODE_ENV=test` set to enable all testing features.

In your test setup file (e.g., `tests/integration/setup.ts`), you may want to add:

```typescript
process.env.NODE_ENV = 'test';
```

Or set it in your `package.json` test scripts:

```json
"scripts": {
  "test": "NODE_ENV=test jest",
  "test:coverage": "NODE_ENV=test jest --coverage"
}
``` 