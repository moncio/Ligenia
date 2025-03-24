/**
 * @jest-environment node
 */

import 'dotenv/config';
import supertest from 'supertest';
import app from '../../../src/app';
import { UserRole } from '../../../src/core/domain/user/user.entity';
import { generateTestToken } from '../../utils/supabaseMock';
import { createMockContainer } from '../../utils/container-mock';
import { setMockContainer } from '../../../src/api/middlewares/auth.middleware';

// Set up the mock container before all tests
beforeAll(() => {
  console.log('Setting up test environment');
  
  // Create a mock container with mock use cases
  const mockContainer = createMockContainer();
  console.log('Mock container created:', !!mockContainer);
  
  // Set the mock container for authentication middleware
  setMockContainer(mockContainer);
  console.log('Mock container set for auth middleware');
  
  // Set NODE_ENV to test
  process.env.NODE_ENV = 'test';
  console.log('NODE_ENV set to:', process.env.NODE_ENV);
});

// Create supertest agent
const agent = supertest(app);

// Mock users with valid UUIDs
const mockUsers = {
  admin: {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    emailVerified: true,
    password: 'password123',
  },
  player: {
    id: '123e4567-e89b-12d3-a456-426614174001',
    email: 'player@example.com',
    name: 'Player User',
    role: 'player',
    emailVerified: true,
    password: 'password123',
  },
  anotherPlayer: {
    id: '123e4567-e89b-12d3-a456-426614174002',
    email: 'player2@example.com',
    name: 'Another Player',
    role: 'player',
    emailVerified: true,
    password: 'password123',
  },
};

// Non-existent ID for testing
const nonExistentId = '00000000-0000-0000-0000-000000000000';

// Generate test tokens
const adminToken = generateTestToken(mockUsers.admin);
const playerToken = generateTestToken(mockUsers.player);
const anotherPlayerToken = generateTestToken(mockUsers.anotherPlayer);
const invalidToken = 'invalid-token';

console.log('Generated test tokens:');
console.log('Admin token:', adminToken.substring(0, 20) + '...');
console.log('Player token:', playerToken.substring(0, 20) + '...');

// Debug JWT token setup
const jwt = require('jsonwebtoken');
try {
  const decodedAdmin = jwt.decode(adminToken);
  console.log('Decoded admin token:', decodedAdmin);
  
  const decodedPlayer = jwt.decode(playerToken);
  console.log('Decoded player token:', decodedPlayer);
} catch (error) {
  console.error('Error decoding tokens:', error);
}

describe('User Routes - Integration Tests', () => {
  describe('Authentication Checks', () => {
    it('should return 401 when accessing protected routes without token', async () => {
      const response = await agent.get('/api/users');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Authentication token is missing');
    });

    it('should return 401 when accessing protected routes with invalid token', async () => {
      const response = await agent.get('/api/users').set('Authorization', `Bearer ${invalidToken}`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Invalid or expired token');
    });
  });

  describe('Authorization Checks', () => {
    it('should return 403 when player tries to access admin-only routes', async () => {
      const response = await agent.get('/api/users').set('Authorization', `Bearer ${playerToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty(
        'message',
        'You do not have permission to access this resource',
      );
    });
  });

  describe('Param Validation', () => {
    it('should return 400 when using invalid UUID format for user ID', async () => {
      const response = await agent
        .get('/api/users/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('Validation error in URL parameters');
    });

    it('should return 400 when using invalid UUID format for user ID in PUT requests', async () => {
      const response = await agent
        .put('/api/users/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('Validation error in URL parameters');
    });

    it('should return 400 when using invalid UUID format for user ID in DELETE requests', async () => {
      const response = await agent
        .delete('/api/users/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('Validation error in URL parameters');
    });

    it('should return 400 when using invalid UUID format for user ID in change-password requests', async () => {
      const response = await agent
        .post('/api/users/invalid-id/change-password')
        .set('Authorization', `Bearer ${playerToken}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('Validation error in URL parameters');
    });

    it('should return 400 when using invalid UUID format for user ID in statistics requests', async () => {
      const response = await agent
        .get('/api/users/invalid-id/statistics')
        .set('Authorization', `Bearer ${playerToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('Validation error in URL parameters');
    });

    it('should return 400 when using invalid UUID format for user ID in preferences requests', async () => {
      const response = await agent
        .get('/api/users/invalid-id/preferences')
        .set('Authorization', `Bearer ${playerToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('Validation error in URL parameters');
    });

    it('should return 400 when using invalid UUID format for user ID in preference update requests', async () => {
      const response = await agent
        .put('/api/users/invalid-id/preferences')
        .set('Authorization', `Bearer ${playerToken}`)
        .send({
          notificationEnabled: true,
          theme: 'dark',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('Validation error in URL parameters');
    });
  });

  describe('GET /api/users', () => {
    it('should allow admins to get all users', async () => {
      const response = await agent.get('/api/users').set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('users');
      expect(Array.isArray(response.body.data.users)).toBe(true);
    });

    it('should accept query parameters for filtering', async () => {
      const response = await agent
        .get('/api/users?limit=10&offset=0&role=player')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should allow admins to get any user', async () => {
      const response = await agent
        .get(`/api/users/${mockUsers.player.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('id', mockUsers.player.id);
    });

    it('should allow users to get their own profile', async () => {
      const response = await agent
        .get(`/api/users/${mockUsers.player.id}`)
        .set('Authorization', `Bearer ${playerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data.user).toHaveProperty('id', mockUsers.player.id);
    });

    it('should return 403 when a player tries to access another player profile', async () => {
      const response = await agent
        .get(`/api/users/${mockUsers.anotherPlayer.id}`)
        .set('Authorization', `Bearer ${playerToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty(
        'message',
        'You do not have permission to access this resource',
      );
    });

    it('should return 401 when accessing without token', async () => {
      const response = await agent.get(`/api/users/${mockUsers.player.id}`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'error');
    });
  });

  describe('PUT /api/users/:id', () => {
    const validUpdateData = {
      name: 'Updated Name',
      email: 'updated@example.com',
    };

    const invalidUpdateData = {
      name: '', // Empty name
      email: 'not-an-email',
    };

    it('should allow admins to update any user', async () => {
      const response = await agent
        .put(`/api/users/${mockUsers.player.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validUpdateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('name', validUpdateData.name);
      expect(response.body.data.user).toHaveProperty('email', validUpdateData.email);
    });

    it('should allow users to update their own profile', async () => {
      const response = await agent
        .put(`/api/users/${mockUsers.player.id}`)
        .set('Authorization', `Bearer ${playerToken}`)
        .send(validUpdateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data.user).toHaveProperty('name', validUpdateData.name);
    });

    it('should return 403 when a player tries to update another player profile', async () => {
      const response = await agent
        .put(`/api/users/${mockUsers.anotherPlayer.id}`)
        .set('Authorization', `Bearer ${playerToken}`)
        .send(validUpdateData);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty(
        'message',
        'You do not have permission to update this user',
      );
    });

    it('should return 403 when a player tries to change role', async () => {
      const response = await agent
        .put(`/api/users/test/player-role-change/${mockUsers.player.id}`)
        .set('Authorization', `Bearer ${playerToken}`)
        .send({ role: 'admin' });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty(
        'message',
        'You do not have permission to change user roles',
      );
    });

    it('should allow admins to change user roles', async () => {
      const response = await agent
        .put(`/api/users/test/admin-role-change/${mockUsers.player.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'admin' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
    });

    it('should return 400 when providing invalid update data', async () => {
      const response = await agent
        .put(`/api/users/${mockUsers.player.id}`)
        .set('Authorization', `Bearer ${playerToken}`)
        .send(invalidUpdateData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('Validation error');
    });

    it('should return 401 when updating without token', async () => {
      const response = await agent.put(`/api/users/${mockUsers.player.id}`).send(validUpdateData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'error');
    });
  });

  describe('POST /api/users/:id/change-password', () => {
    const validPasswordData = {
      currentPassword: 'password123',
      newPassword: 'newpassword123',
    };

    const invalidPasswordData = {
      currentPassword: 'password123',
      newPassword: 'weak', // Too short
    };

    it('should allow users to change their own password', async () => {
      const response = await agent
        .post(`/api/users/${mockUsers.player.id}/change-password`)
        .set('Authorization', `Bearer ${playerToken}`)
        .send(validPasswordData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message', 'Password changed successfully');
    });

    it('should return 403 when a user tries to change another user password', async () => {
      const response = await agent
        .post(`/api/users/${mockUsers.anotherPlayer.id}/change-password`)
        .set('Authorization', `Bearer ${playerToken}`)
        .send(validPasswordData);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'You can only change your own password');
    });

    it('should return 400 when providing invalid password data', async () => {
      const response = await agent
        .post(`/api/users/${mockUsers.player.id}/change-password`)
        .set('Authorization', `Bearer ${playerToken}`)
        .send(invalidPasswordData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('Validation error');
    });

    it('should return 401 when changing password without token', async () => {
      const response = await agent
        .post(`/api/users/${mockUsers.player.id}/change-password`)
        .send(validPasswordData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'error');
    });
  });

  describe('User Statistics Endpoint', () => {
    it('should return 401 without token', async () => {
      const response = await agent.get(`/api/users/${mockUsers.player.id}/statistics`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Authentication token is missing');
    });

    it('should return 200 when a user accesses their own statistics', async () => {
      const response = await agent
        .get(`/api/users/${mockUsers.player.id}/statistics`)
        .set('Authorization', `Bearer ${playerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('userId', mockUsers.player.id);
      expect(response.body.data).toHaveProperty('statistics');
      expect(response.body.data.statistics).toHaveProperty('gamesPlayed');
      expect(response.body.data.statistics).toHaveProperty('winRate');
    });

    it('should return 200 when an admin accesses any user statistics', async () => {
      const response = await agent
        .get(`/api/users/${mockUsers.player.id}/statistics`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('userId', mockUsers.player.id);
    });

    it('should return 403 when a player tries to access another player statistics', async () => {
      const response = await agent
        .get(`/api/users/${mockUsers.admin.id}/statistics`)
        .set('Authorization', `Bearer ${playerToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty(
        'message',
        'You do not have permission to access these statistics',
      );
    });

    it('should return 404 when the user does not exist', async () => {
      const response = await agent
        .get(`/api/users/${nonExistentId}/statistics`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'User not found');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should allow admins to delete any user', async () => {
      const response = await agent
        .delete(`/api/users/${mockUsers.anotherPlayer.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message', 'User deleted successfully');
    });

    it('should allow users to delete their own account', async () => {
      const response = await agent
        .delete(`/api/users/${mockUsers.player.id}`)
        .set('Authorization', `Bearer ${playerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message', 'User deleted successfully');
    });

    it('should return 403 when a player tries to delete another player account', async () => {
      const response = await agent
        .delete(`/api/users/${mockUsers.admin.id}`)
        .set('Authorization', `Bearer ${playerToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty(
        'message',
        'You do not have permission to delete this user'
      );
    });

    it('should return 404 when the user does not exist', async () => {
      const response = await agent
        .delete(`/api/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'User not found');
    });

    it('should return 401 when deleting without token', async () => {
      const response = await agent.delete(`/api/users/${mockUsers.player.id}`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Authentication token is missing');
    });
  });

  describe('Simplified Endpoints', () => {
    it('should accept requests to performance endpoint with valid token and UUID', async () => {
      const response = await agent
        .get(`/api/users/${mockUsers.player.id}/performance/2023`)
        .set('Authorization', `Bearer ${playerToken}`);

      expect(response.status).toBe(200);
    });

    it('should accept requests to match history endpoint with valid token and UUID', async () => {
      const response = await agent
        .get(`/api/users/${mockUsers.player.id}/match-history`)
        .set('Authorization', `Bearer ${playerToken}`);

      expect(response.status).toBe(200);
    });
  });
});
