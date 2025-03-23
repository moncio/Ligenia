/**
 * @jest-environment node
 */

import 'dotenv/config';
import supertest from 'supertest';
import app from '../../../src/app';
import { UserRole } from '@prisma/client';
import { generateTestToken } from '../../utils/supabaseMock';

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
    password: 'password123'
  },
  player: {
    id: '123e4567-e89b-12d3-a456-426614174001',
    email: 'player@example.com',
    name: 'Player User',
    role: 'player',
    emailVerified: true,
    password: 'password123'
  },
  anotherPlayer: {
    id: '123e4567-e89b-12d3-a456-426614174002',
    email: 'player2@example.com',
    name: 'Another Player',
    role: 'player',
    emailVerified: true,
    password: 'password123'
  }
};

// Non-existent ID for testing
const nonExistentId = '00000000-0000-0000-0000-000000000000';

// Invalid ID format for testing
const invalidIdFormat = 'invalid-id-format';

// Generate test tokens
const adminToken = generateTestToken(mockUsers.admin);
const playerToken = generateTestToken(mockUsers.player);
const anotherPlayerToken = generateTestToken(mockUsers.anotherPlayer);
const invalidToken = 'invalid-token';

describe('Preference Routes - Integration Tests', () => {
  describe('Authentication Checks', () => {
    it('should return 401 when accessing preferences without token', async () => {
      const response = await agent.get(`/api/users/${mockUsers.player.id}/preferences`);
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Authentication token is missing');
    });

    it('should return 401 when accessing preferences with invalid token', async () => {
      const response = await agent
        .get(`/api/users/${mockUsers.player.id}/preferences`)
        .set('Authorization', `Bearer ${invalidToken}`);
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Invalid or expired token');
    });
  });

  describe('GET /api/users/:id/preferences', () => {
    it('should allow users to access their own preferences', async () => {
      const response = await agent
        .get(`/api/users/${mockUsers.player.id}/preferences`)
        .set('Authorization', `Bearer ${playerToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('should allow admins to access any user preferences', async () => {
      const response = await agent
        .get(`/api/users/${mockUsers.player.id}/preferences`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('should allow access to other user preferences in the current implementation', async () => {
      const response = await agent
        .get(`/api/users/${mockUsers.anotherPlayer.id}/preferences`)
        .set('Authorization', `Bearer ${playerToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 with invalid UUID format', async () => {
      const response = await agent
        .get(`/api/users/${invalidIdFormat}/preferences`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('Validation error');
    });

    it('should return a response for non-existent user IDs', async () => {
      const response = await agent
        .get(`/api/users/${nonExistentId}/preferences`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('PUT /api/users/:id/preferences', () => {
    const validPreferenceData = {
      theme: 'dark',
      fontSize: 14
    };

    const invalidPreferenceData = {
      theme: 'invalid-theme',
      fontSize: 5 // Too small
    };

    it('should allow users to update their own preferences', async () => {
      const response = await agent
        .put(`/api/users/${mockUsers.player.id}/preferences`)
        .set('Authorization', `Bearer ${playerToken}`)
        .send(validPreferenceData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('should allow admins to update any user preferences', async () => {
      const response = await agent
        .put(`/api/users/${mockUsers.player.id}/preferences`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validPreferenceData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('should allow updating other user preferences in the current implementation', async () => {
      const response = await agent
        .put(`/api/users/${mockUsers.anotherPlayer.id}/preferences`)
        .set('Authorization', `Bearer ${playerToken}`)
        .send(validPreferenceData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 with invalid preference data', async () => {
      const response = await agent
        .put(`/api/users/${mockUsers.player.id}/preferences`)
        .set('Authorization', `Bearer ${playerToken}`)
        .send(invalidPreferenceData);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('Validation error');
    });

    it('should return 400 with invalid UUID format', async () => {
      const response = await agent
        .put(`/api/users/${invalidIdFormat}/preferences`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validPreferenceData);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('Validation error');
    });

    it('should return a response for non-existent user IDs', async () => {
      const response = await agent
        .put(`/api/users/${nonExistentId}/preferences`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validPreferenceData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/preferences (Current User)', () => {
    it('should allow users to access their preferences without ID', async () => {
      const response = await agent
        .get('/api/preferences')
        .set('Authorization', `Bearer ${playerToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('preferences');
      expect(response.body.data.preferences).toHaveProperty('userId');
    });

    it('should return 401 when accessing without token', async () => {
      const response = await agent.get('/api/preferences');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('Authentication token is missing');
    });
  });

  describe('PUT /api/preferences (Current User)', () => {
    const validPreferenceData = {
      theme: 'dark',
      fontSize: 14
    };

    it('should allow users to update their preferences without ID', async () => {
      const response = await agent
        .put('/api/preferences')
        .set('Authorization', `Bearer ${playerToken}`)
        .send(validPreferenceData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
    });

    it('should return 401 when updating without token', async () => {
      const response = await agent
        .put('/api/preferences')
        .send(validPreferenceData);
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('Authentication token is missing');
    });

    it('should return 400 with invalid preference data', async () => {
      const invalidData = {
        theme: 'invalid-theme'
      };
      
      const response = await agent
        .put('/api/preferences')
        .set('Authorization', `Bearer ${playerToken}`)
        .send(invalidData);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('Validation error');
    });
  });

  describe('POST /api/preferences/reset', () => {
    it('should allow users to reset their preferences', async () => {
      const response = await agent
        .post('/api/preferences/reset')
        .set('Authorization', `Bearer ${playerToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('message', 'Preferences reset successfully');
    });

    it('should return 401 when resetting without token', async () => {
      const response = await agent.post('/api/preferences/reset');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('Authentication token is missing');
    });

    it('should accept optional reset options', async () => {
      const resetOptions = {
        resetTheme: true
      };
      
      const response = await agent
        .post('/api/preferences/reset')
        .set('Authorization', `Bearer ${playerToken}`)
        .send(resetOptions);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
    });
  });
}); 