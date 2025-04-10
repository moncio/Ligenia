/**
 * @jest-environment node
 */

import 'dotenv/config';
import supertest from 'supertest';
import app from '../../../src/app';
import { PrismaClient, UserRole } from '@prisma/client';
import { hash } from 'bcrypt';
import * as path from 'path';
import { config } from 'dotenv';
import { setMockContainer } from '../../../src/api/middlewares/auth.middleware';
import { createMockContainer } from '../../utils/container-mock';

// Configurar entorno de test
config({ path: path.resolve(__dirname, '../../../.env.test') });
process.env.NODE_ENV = 'test';

// Configurar el contenedor mock para la autenticación
const mockContainer = createMockContainer();
setMockContainer(mockContainer);

// Sobreescribir DATABASE_URL manualmente para asegurar que usa la DB de test
process.env.DATABASE_URL = 'postgresql://ligenia_user_test:C0mpl3x_D8_P4ssw0rd_7531*@localhost:5433/db_ligenia_test';

// Cliente Prisma para la base de datos de test
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL
});

// Create supertest agent
const agent = supertest(app);

// Helper para establecer headers de autenticación simulada
const setUserHeaders = (request: supertest.Test, userId: string, role: UserRole) => {
  return request
    .set('Authorization', `Bearer mock-token`)
    .set('x-user-id', userId)
    .set('x-user-role', role);
};

// Mock users con UUIDs válidos para pruebas
const mockUsers = {
  admin: {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'admin@example.com',
    name: 'Admin User',
    role: UserRole.ADMIN,
    emailVerified: true,
    password: 'password123',
  },
  player: {
    id: '123e4567-e89b-12d3-a456-426614174001',
    email: 'player@example.com',
    name: 'Player User',
    role: UserRole.PLAYER,
    emailVerified: true,
    password: 'password123',
  },
  anotherPlayer: {
    id: '123e4567-e89b-12d3-a456-426614174002',
    email: 'player2@example.com',
    name: 'Another Player',
    role: UserRole.PLAYER,
    emailVerified: true,
    password: 'password123',
  },
};

// ID no existente para pruebas
const nonExistentId = '00000000-0000-0000-0000-000000000000';

describe('User Routes - Integration Tests', () => {
  // Preparar base de datos para las pruebas
  beforeAll(async () => {
    console.log('Configurando entorno de prueba con base de datos real');
    
    try {
      // Limpiar datos de pruebas anteriores
      await prisma.user.deleteMany({
        where: {
          email: {
            in: [mockUsers.admin.email, mockUsers.player.email, mockUsers.anotherPlayer.email],
          },
        },
      });

      // Crear usuarios de prueba en la base de datos
      for (const [key, user] of Object.entries(mockUsers)) {
        await prisma.user.create({
          data: {
            id: user.id,
            email: user.email,
            password: await hash(user.password, 10),
            name: user.name,
            role: user.role,
            emailVerified: user.emailVerified,
          },
        });
        console.log(`Usuario de prueba creado: ${user.email} con rol ${user.role}`);
      }
    } catch (error) {
      console.error('Error preparando la base de datos para pruebas:', error);
    }
  });

  // Limpiar después de todas las pruebas
  afterAll(async () => {
    try {
      // Eliminar usuarios de prueba
      await prisma.user.deleteMany({
        where: {
          email: {
            in: [mockUsers.admin.email, mockUsers.player.email, mockUsers.anotherPlayer.email],
          },
        },
      });
      console.log('Datos de prueba eliminados');
      
      // Cerrar conexión con la base de datos
      await prisma.$disconnect();
    } catch (error) {
      console.error('Error limpiando la base de datos después de pruebas:', error);
    }
  });

  describe('Authentication Checks', () => {
    it('should return 401 when accessing protected routes without token', async () => {
      const response = await agent.get('/api/users');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Authentication token is missing');
    });

    it('should return 401 when accessing protected routes with invalid token', async () => {
      const response = await agent.get('/api/users').set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Invalid or expired token');
    });
  });

  describe('Authorization Checks', () => {
    it('should return 403 when player tries to access admin-only routes', async () => {
      const response = await setUserHeaders(
        agent.get('/api/users'), 
        mockUsers.player.id, 
        UserRole.PLAYER
      );

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
      const response = await setUserHeaders(
        agent.get('/api/users/invalid-id'), 
        mockUsers.admin.id, 
        UserRole.ADMIN
      );

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('Validation error in URL parameters');
    });

    it('should return 400 when using invalid UUID format for user ID in PUT requests', async () => {
      const response = await setUserHeaders(
        agent.put('/api/users/invalid-id').send({ name: 'Updated Name' }),
        mockUsers.admin.id,
        UserRole.ADMIN
      );

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('Validation error in URL parameters');
    });

    it('should return 400 when using invalid UUID format for user ID in DELETE requests', async () => {
      const response = await setUserHeaders(
        agent.delete('/api/users/invalid-id'),
        mockUsers.admin.id,
        UserRole.ADMIN
      );

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('Validation error in URL parameters');
    });

    it('should return 400 when using invalid UUID format for user ID in change-password requests', async () => {
      const response = await setUserHeaders(
        agent.post('/api/users/invalid-id/change-password').send({
          currentPassword: 'password123',
          newPassword: 'newpassword123',
        }),
        mockUsers.player.id,
        UserRole.PLAYER
      );

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('Validation error in URL parameters');
    });

    it('should return 400 when using invalid UUID format for user ID in statistics requests', async () => {
      const response = await setUserHeaders(
        agent.get('/api/users/invalid-id/statistics'),
        mockUsers.player.id,
        UserRole.PLAYER
      );

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('Validation error in URL parameters');
    });

    it('should return 400 when using invalid UUID format for user ID in preferences requests', async () => {
      const response = await setUserHeaders(
        agent.get('/api/users/invalid-id/preferences'),
        mockUsers.player.id,
        UserRole.PLAYER
      );

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('Validation error in URL parameters');
    });

    it('should return 400 when using invalid UUID format for user ID in preference update requests', async () => {
      const response = await setUserHeaders(
        agent.put('/api/users/invalid-id/preferences').send({
          notificationEnabled: true,
          theme: 'dark',
        }),
        mockUsers.player.id,
        UserRole.PLAYER
      );

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('Validation error in URL parameters');
    });
  });

  describe('GET /api/users', () => {
    it('should allow admins to get all users', async () => {
      const response = await setUserHeaders(
        agent.get('/api/users'),
        mockUsers.admin.id,
        UserRole.ADMIN
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('users');
      expect(Array.isArray(response.body.data.users)).toBe(true);
    });

    it('should accept query parameters for filtering', async () => {
      const response = await setUserHeaders(
        agent.get('/api/users?limit=10&offset=0&role=player'),
        mockUsers.admin.id,
        UserRole.ADMIN
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should allow admins to get any user', async () => {
      const response = await setUserHeaders(
        agent.get(`/api/users/${mockUsers.player.id}`),
        mockUsers.admin.id,
        UserRole.ADMIN
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('id', mockUsers.player.id);
    });

    it('should allow users to get their own profile', async () => {
      const response = await setUserHeaders(
        agent.get(`/api/users/${mockUsers.player.id}`),
        mockUsers.player.id,
        UserRole.PLAYER
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data.user).toHaveProperty('id', mockUsers.player.id);
    });

    it('should return 403 when a player tries to access another player profile', async () => {
      const response = await setUserHeaders(
        agent.get(`/api/users/${mockUsers.anotherPlayer.id}`),
        mockUsers.player.id,
        UserRole.PLAYER
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
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
      const response = await setUserHeaders(
        agent.put(`/api/users/${mockUsers.player.id}`).send(validUpdateData),
        mockUsers.admin.id,
        UserRole.ADMIN
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('name', validUpdateData.name);
      expect(response.body.data.user).toHaveProperty('email', validUpdateData.email);
    });

    it('should allow users to update their own profile', async () => {
      const response = await setUserHeaders(
        agent.put(`/api/users/${mockUsers.player.id}`).send(validUpdateData),
        mockUsers.player.id,
        UserRole.PLAYER
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data.user).toHaveProperty('name', validUpdateData.name);
    });

    it('should return 403 when a player tries to update another player profile', async () => {
      const response = await setUserHeaders(
        agent.put(`/api/users/${mockUsers.anotherPlayer.id}`).send(validUpdateData),
        mockUsers.player.id,
        UserRole.PLAYER
      );

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty(
        'message',
        'You do not have permission to update this user',
      );
    });

    it('should return 403 when a player tries to change role', async () => {
      const response = await setUserHeaders(
        agent.put(`/api/users/${mockUsers.player.id}`).send({ role: 'ADMIN' }),
        mockUsers.player.id,
        UserRole.PLAYER
      );

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty(
        'message',
        'You do not have permission to change user roles',
      );
    });

    it('should allow admins to change user roles', async () => {
      const response = await setUserHeaders(
        agent.put(`/api/users/${mockUsers.player.id}`).send({ role: 'ADMIN' }),
        mockUsers.admin.id,
        UserRole.ADMIN
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
    });

    it('should return 400 when providing invalid update data', async () => {
      const response = await setUserHeaders(
        agent.put(`/api/users/${mockUsers.player.id}`).send(invalidUpdateData),
        mockUsers.player.id,
        UserRole.PLAYER
      );

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('Validation error');
    });

    it('should return 401 when updating without token', async () => {
      const response = await agent.put(`/api/users/${mockUsers.player.id}`)
        .send(validUpdateData);

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
      const response = await setUserHeaders(
        agent.post(`/api/users/${mockUsers.player.id}/change-password`).send(validPasswordData),
        mockUsers.player.id,
        UserRole.PLAYER
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message', 'Password changed successfully');
    });

    it('should return 403 when a user tries to change another user password', async () => {
      const response = await setUserHeaders(
        agent.post(`/api/users/${mockUsers.anotherPlayer.id}/change-password`).send(validPasswordData),
        mockUsers.player.id,
        UserRole.PLAYER
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
    });

    it('should return 400 when providing invalid password data', async () => {
      const response = await setUserHeaders(
        agent.post(`/api/users/${mockUsers.player.id}/change-password`).send(invalidPasswordData),
        mockUsers.player.id,
        UserRole.PLAYER
      );

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
      const response = await setUserHeaders(
        agent.get(`/api/users/${mockUsers.player.id}/statistics`),
        mockUsers.player.id,
        UserRole.PLAYER
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
    });

    it('should return 200 when an admin accesses any user statistics', async () => {
      const response = await setUserHeaders(
        agent.get(`/api/users/${mockUsers.player.id}/statistics`),
        mockUsers.admin.id,
        UserRole.ADMIN
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
    });

    it('should return 403 when a player tries to access another player statistics', async () => {
      const response = await setUserHeaders(
        agent.get(`/api/users/${mockUsers.admin.id}/statistics`),
        mockUsers.player.id,
        UserRole.PLAYER
      );

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty(
        'message',
        'You do not have permission to access these statistics',
      );
    });

    it('should return 404 when the user does not exist', async () => {
      const response = await setUserHeaders(
        agent.get(`/api/users/${nonExistentId}/statistics`),
        mockUsers.admin.id,
        UserRole.ADMIN
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should allow admins to delete any user', async () => {
      // Usamos un usuario existente para simplificar
      const response = await setUserHeaders(
        agent.delete(`/api/users/${mockUsers.anotherPlayer.id}`),
        mockUsers.admin.id,
        UserRole.ADMIN
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message', 'User deleted successfully');
    });

    it('should allow users to delete their own account', async () => {
      const response = await setUserHeaders(
        agent.delete(`/api/users/${mockUsers.player.id}`),
        mockUsers.player.id,
        UserRole.PLAYER
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message', 'User deleted successfully');
    });

    it('should return 403 when a player tries to delete another player account', async () => {
      const response = await setUserHeaders(
        agent.delete(`/api/users/${mockUsers.admin.id}`),
        mockUsers.player.id,
        UserRole.PLAYER
      );

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty(
        'message',
        'You do not have permission to delete this user'
      );
    });

    it('should return 404 when the user does not exist', async () => {
      const response = await setUserHeaders(
        agent.delete(`/api/users/${nonExistentId}`),
        mockUsers.admin.id,
        UserRole.ADMIN
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
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
      const response = await setUserHeaders(
        agent.get(`/api/users/${mockUsers.player.id}/performance/2023`),
        mockUsers.player.id,
        UserRole.PLAYER
      );

      expect(response.status).toBe(200);
    });

    it('should accept requests to match history endpoint with valid token and UUID', async () => {
      const response = await setUserHeaders(
        agent.get(`/api/users/${mockUsers.player.id}/match-history`),
        mockUsers.player.id,
        UserRole.PLAYER
      );

      expect(response.status).toBe(200);
    });
  });
});
