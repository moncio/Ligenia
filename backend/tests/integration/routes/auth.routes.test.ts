/**
 * @jest-environment node
 */

import { config } from 'dotenv';
import { UserRole } from '@prisma/client';
import { hash } from 'bcrypt';
import path from 'path';
import { prisma, request } from '../setup';
import { setMockContainer } from '../../../src/api/middlewares/auth.middleware';
import { createMockContainer } from '../../utils/container-mock';

// Cargar variables de entorno de prueba
config({ path: path.resolve(__dirname, '../../../.env.test') });

// Ensure test environment
process.env.NODE_ENV = 'test';

// Configurar el contenedor mock para la autenticación
const mockContainer = createMockContainer();
setMockContainer(mockContainer);

// Sobreescribir DATABASE_URL manualmente para asegurar que usa la DB de test
process.env.DATABASE_URL = 'postgresql://ligenia_user_test:C0mpl3x_D8_P4ssw0rd_7531*@localhost:5433/db_ligenia_test';

// Helper para establecer headers de autenticación simulada
const setUserHeaders = (userRequest: any, userId: string, role: UserRole) => {
  return userRequest
    .set('Authorization', `Bearer mock-token`)
    .set('x-user-id', userId)
    .set('x-user-role', role);
};

// Datos de prueba para usuarios
const testUser = {
  id: '123e4567-e89b-12d3-a456-426614174001',
  email: 'player@example.com',
  password: 'Password123!',
  name: 'Test User',
  role: UserRole.PLAYER,
};

const testAdmin = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'admin@example.com',
  password: 'Password123!',
  name: 'Test Admin',
  role: UserRole.ADMIN,
};

describe('Auth Routes Integration Tests', () => {
  let refreshToken: string = 'simulated-refresh-token'; // Token simulado para refrescar

  // Preparar datos antes de las pruebas
  beforeAll(async () => {
    try {
      // Set test environment
      process.env.NODE_ENV = 'test';

      // Limpiar datos existentes
      await prisma.user.deleteMany({
        where: {
          email: {
            in: [testUser.email, testAdmin.email, 'newuser@example.com'],
          },
        },
      });

      // Crear usuarios de prueba con contraseñas hasheadas
      await prisma.user.create({
        data: {
          id: testUser.id,
          email: testUser.email,
          password: await hash(testUser.password, 10),
          name: testUser.name,
          role: testUser.role,
          emailVerified: true,
        },
      });

      await prisma.user.create({
        data: {
          id: testAdmin.id,
          email: testAdmin.email,
          password: await hash(testAdmin.password, 10),
          name: testAdmin.name,
          role: testAdmin.role,
          emailVerified: true,
        },
      });

      console.log('Usuarios de prueba creados en la base de datos de test');
    } catch (error) {
      console.error('Error en setup de pruebas de auth:', error);
    }
  });

  // Limpiar después de todas las pruebas
  afterAll(async () => {
    try {
      await prisma.user.deleteMany({
        where: {
          email: {
            in: [testUser.email, testAdmin.email, 'newuser@example.com'],
          },
        },
      });
      console.log('Datos de prueba eliminados de la base de datos');
    } catch (error) {
      console.error('Error en teardown de pruebas de auth:', error);
    }
  });

  describe('POST /api/auth/login', () => {
    it('should login a user with valid credentials and return tokens', async () => {
      const response = await request.post('/api/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });

      // Para depuración
      console.log('Login response:', response.body);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('email', testUser.email);
    });

    it('should login admin user and return user role in response', async () => {
      const response = await request.post('/api/auth/login').send({
        email: testAdmin.email,
        password: testAdmin.password,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data.user).toHaveProperty('role');
    });

    it('should validate required fields with Zod', async () => {
      const response = await request.post('/api/auth/login').send({
        // Campos incompletos - falta password
        email: testUser.email,
      });

      // Current implementation returns 400 for validation errors
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/auth/register', () => {
    const newUser = {
      email: 'newuser@example.com',
      password: 'NewPassword123!',
      name: 'New User',
      role: UserRole.PLAYER,
    };

    it('should register a new user and return tokens', async () => {
      const response = await request.post('/api/auth/register').send(newUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user).toHaveProperty('email', newUser.email);
    });

    it('should reject weak passwords according to validation schema', async () => {
      const response = await request.post('/api/auth/register').send({
        email: 'valid@example.com',
        password: 'weak', // Contraseña débil
        name: 'Valid User',
        role: UserRole.PLAYER,
      });

      // The validation middleware should reject weak passwords
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user profile with valid token', async () => {
      const response = await setUserHeaders(
        request.get('/api/auth/me'),
        testUser.id, 
        UserRole.PLAYER
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
    });

    it('should return 401 without token', async () => {
      const response = await request.get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('Authentication token is missing');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'error');
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    it('should refresh tokens with valid refresh token', async () => {
      // En un entorno real, necesitaríamos un refresh token válido
      // Para esta prueba, usamos un token simulado
      const response = await request.post('/api/auth/refresh-token').send({ 
        refreshToken: refreshToken 
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('should return 400 if refresh token is missing', async () => {
      const response = await request.post('/api/auth/refresh-token').send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('Validation error');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should return 401 when token is not provided', async () => {
      const response = await request.post('/api/auth/logout');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'error');
    });

    it('should successfully logout user when token is provided', async () => {
      const response = await setUserHeaders(
        request.post('/api/auth/logout'),
        testUser.id, 
        UserRole.PLAYER
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.message).toContain('Logged out');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should return success when requesting password reset', async () => {
      const response = await request.post('/api/auth/forgot-password').send({
        email: testUser.email,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.message).toContain('Password reset link sent');
    });

    it('should validate required fields', async () => {
      const response = await request.post('/api/auth/forgot-password').send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should return success when resetting password', async () => {
      const response = await request.post('/api/auth/reset-password').send({
        token: 'valid-reset-token',
        password: 'NewPassword123!',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.message).toContain('Password reset successfully');
    });

    it('should validate required fields', async () => {
      const response = await request.post('/api/auth/reset-password').send({
        token: 'valid-reset-token',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
    });
  });

  describe('POST /api/auth/verify-email', () => {
    it('should return success when verifying email', async () => {
      const response = await request.post('/api/auth/verify-email').send({
        token: 'valid-verification-token',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.message).toContain('Email verified successfully');
    });

    it('should validate required fields', async () => {
      const response = await request.post('/api/auth/verify-email').send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
    });
  });
});
