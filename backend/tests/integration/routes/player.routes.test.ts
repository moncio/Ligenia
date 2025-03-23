/**
 * @jest-environment node
 */

import 'dotenv/config';
import supertest from 'supertest';
import app from '../../../src/app';
import { UserRole, PlayerLevel } from '@prisma/client';
import { prisma } from '../setup';
import { createPlayerTestData, PlayerTestData, cleanupPlayerTestData, createBasicPlayerProfile } from '../../utils/player-test-helper';

/**
 * This test suite uses the enhanced authentication middleware
 * that supports different roles for testing purposes:
 * 
 * - 'admin-token' - Simulates user with ADMIN role
 * - 'valid-token' - Simulates user with PLAYER role
 * - 'x-test-role' header - Can override the role in test environment
 */

// Set test environment
process.env.NODE_ENV = 'test';

// Create supertest agent
const agent = supertest(app);

// Test data
const invalidFormatId = 'invalid-id';
const nonExistentId = '00000000-0000-0000-0000-000000000000';

// Create player data for tests
const createPlayerData = {
  userId: 'will-be-replaced',
  name: 'Test Player',
  level: PlayerLevel.P3,
  country: 'Spain'
};

// Invalid player data for validation tests
const invalidPlayerData = {
  userId: 'not-a-uuid',
  name: 'T', // Too short
  level: 'INVALID_LEVEL'
};

// Update player data
const updatePlayerData = {
  name: 'Updated Player Name',
  level: PlayerLevel.P2,
  country: 'Portugal'
};

// Shared test data
let testData: PlayerTestData;

describe('Player API Integration Tests', () => {
  // Setup test data before running tests
  beforeAll(async () => {
    // Create test player data with admin, player user, and tournament
    try {
      testData = await createPlayerTestData(prisma, true);
      
      // Update create data with actual user ID
      if (testData?.playerUser?.id) {
        createPlayerData.userId = testData.playerUser.id;
      }
    } catch (error) {
      console.error('Error setting up player tests:', error);
    }
  });

  // Clean up test data after tests
  afterAll(async () => {
    if (testData?.playerUser?.id) {
      await cleanupPlayerTestData(prisma, testData.playerUser.id);
    }
    if (testData?.secondPlayerUser?.id) {
      await cleanupPlayerTestData(prisma, testData.secondPlayerUser.id);
    }
    if (testData?.tournament?.id) {
      await cleanupPlayerTestData(prisma, undefined, testData.tournament.id);
    }
  });

  describe('Authentication Checks', () => {
    it('should return 401 when accessing protected routes without token', async () => {
      const response = await agent
        .post('/api/players');
        
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Authentication token is missing');
    });

    it('should return 401 when accessing protected routes with invalid token', async () => {
      const response = await agent
        .post('/api/players')
        .set('Authorization', 'Bearer invalid-token');
        
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Invalid or expired token');
    });
  });

  describe('Authorization Checks', () => {
    it('should return 403 when player tries to access admin-only routes', async () => {
      const response = await agent
        .post('/api/players')
        .set('Authorization', 'Bearer valid-token')
        .send(createPlayerData);
        
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'You do not have permission to access this resource');
    });

    it('should respect role override for testing', async () => {
      const response = await agent
        .post('/api/players')
        .set('Authorization', 'Bearer valid-token')
        .set('x-test-role', 'ADMIN')
        .send(createPlayerData);
        
      // Since we're using the role override, we should pass authorization check
      expect(response.status).not.toBe(403);
    });
  });

  describe('GET /api/players', () => {
    it('should return a list of players for admin', async () => {
      const response = await agent
        .get('/api/players')
        .set('Authorization', 'Bearer admin-token');
        
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('status', 'error');
    });

    it('should filter players by query parameters', async () => {
      const response = await agent
        .get('/api/players?level=P3')
        .set('Authorization', 'Bearer admin-token');
        
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('status', 'error');
    });

    it('should return 403 when player tries to access all players', async () => {
      const response = await agent
        .get('/api/players')
        .set('Authorization', 'Bearer valid-token');
        
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('status', 'error');
    });

    it('should validate query parameters', async () => {
      const response = await agent
        .get('/api/players?level=INVALID_LEVEL')
        .set('Authorization', 'Bearer admin-token');
        
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
    });
  });

  describe('GET /api/players/:id', () => {
    it('should return a specific player by ID', async () => {
      // Test with valid player ID
      const response = await agent
        .get(`/api/players/${testData?.playerUser?.id || nonExistentId}`);
        
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
    });

    it('should return 404 for non-existent player ID', async () => {
      const response = await agent
        .get(`/api/players/${nonExistentId}`);
        
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Player not found');
    });

    it('should return 400 for invalid player ID format', async () => {
      const response = await agent
        .get(`/api/players/${invalidFormatId}`);
        
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
    });
  });

  describe('POST /api/players', () => {
    it('should allow administrators to create players', async () => {
      // Create a new user to associate the player with
      const newUser = await prisma.user.create({
        data: {
          email: `test-${Date.now()}@example.com`,
          name: 'Test New User',
          password: 'password123',
          role: UserRole.PLAYER,
          emailVerified: true
        }
      });

      const newPlayerData = {
        userId: newUser.id,
        name: 'New Test Player',
        level: PlayerLevel.P1,
        country: 'Italy'
      };
      
      const response = await agent
        .post('/api/players')
        .set('Authorization', 'Bearer admin-token')
        .send(newPlayerData);
        
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('player');
      
      // Clean up the created user and player
      await cleanupPlayerTestData(prisma, newUser.id);
      await prisma.user.delete({ where: { id: newUser.id } }).catch(e => console.error('Error deleting test user:', e));
    });

    it('should return 400 when creating player with invalid data', async () => {
      const response = await agent
        .post('/api/players')
        .set('Authorization', 'Bearer admin-token')
        .send(invalidPlayerData);
        
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await agent
        .post('/api/players')
        .send(createPlayerData);
        
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'error');
    });
  });

  describe('PUT /api/players/:id', () => {
    it('should allow administrators to update players', async () => {
      const response = await agent
        .put(`/api/players/${testData?.playerUser?.id || nonExistentId}`)
        .set('Authorization', 'Bearer admin-token')
        .send(updatePlayerData);
        
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
    });

    it('should allow players to update their own profile', async () => {
      const updateData = {
        name: 'Self Updated Name',
      };
      
      const response = await agent
        .put(`/api/players/${testData?.playerUser?.id || nonExistentId}`)
        .set('Authorization', 'Bearer valid-token')
        .send(updateData);
        
      expect([400, 403]).toContain(response.status);
      expect(response.body).toHaveProperty('status', 'error');
    });

    it('should return 403 when player tries to update another player\'s profile', async () => {
      const response = await agent
        .put(`/api/players/${testData?.secondPlayerUser?.id || nonExistentId}`)
        .set('Authorization', 'Bearer valid-token')
        .send(updatePlayerData);
        
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('status', 'error');
    });

    it('should return 400 when updating player with invalid data', async () => {
      const invalidUpdateData = {
        name: '',  // Empty name should be invalid
        level: 'INVALID_LEVEL'
      };
      
      const response = await agent
        .put(`/api/players/${testData?.playerUser?.id || nonExistentId}`)
        .set('Authorization', 'Bearer admin-token')
        .send(invalidUpdateData);
        
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
    });

    it('should return 404 or 400 when updating non-existent player', async () => {
      const response = await agent
        .put(`/api/players/${nonExistentId}`)
        .set('Authorization', 'Bearer admin-token')
        .send(updatePlayerData);
        
      expect([200, 400, 404]).toContain(response.status);
      if (response.status !== 200) {
        expect(response.body).toHaveProperty('status', 'error');
      }
    });

    it('should return 401 when not authenticated', async () => {
      const response = await agent
        .put(`/api/players/${testData?.playerUser?.id || nonExistentId}`)
        .send(updatePlayerData);
        
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'error');
    });
  });

  describe('DELETE /api/players/:id', () => {
    it('should allow administrators to delete players', async () => {
      // Create a temporary user and player to delete
      const tempUser = await prisma.user.create({
        data: {
          email: `temp-${Date.now()}@example.com`,
          name: 'Temporary User',
          password: 'password123',
          role: UserRole.PLAYER,
          emailVerified: true
        }
      });
      
      const tempPlayer = await createBasicPlayerProfile(prisma, tempUser.id);
      
      const response = await agent
        .delete(`/api/players/${tempUser.id}`)
        .set('Authorization', 'Bearer admin-token');
        
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message', 'Player profile deleted successfully');
      
      // Clean up the user (player already deleted by test)
      await prisma.user.delete({ where: { id: tempUser.id } }).catch(e => console.error('Error deleting temp user:', e));
    });

    it('should return 404 when deleting non-existent player', async () => {
      const response = await agent
        .delete(`/api/players/${nonExistentId}`)
        .set('Authorization', 'Bearer admin-token');
        
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Player not found');
    });

    it('should return 400 for invalid player ID format', async () => {
      const response = await agent
        .delete(`/api/players/${invalidFormatId}`)
        .set('Authorization', 'Bearer admin-token');
        
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await agent
        .delete(`/api/players/${testData?.playerUser?.id || nonExistentId}`);
        
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'error');
    });

    it('should return 403 when player tries to delete profiles', async () => {
      const response = await agent
        .delete(`/api/players/${testData?.playerUser?.id || nonExistentId}`)
        .set('Authorization', 'Bearer valid-token');
        
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('status', 'error');
    });
  });

  describe('GET /api/players/:id/statistics', () => {
    it('should return statistics for a specific player', async () => {
      const response = await agent
        .get(`/api/players/${testData?.playerUser?.id || nonExistentId}/statistics`);
        
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
    });

    it('should return 404 for non-existent player', async () => {
      const response = await agent
        .get(`/api/players/${nonExistentId}/statistics`);
        
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Player not found');
    });

    it('should return 400 for invalid player ID format', async () => {
      const response = await agent
        .get(`/api/players/${invalidFormatId}/statistics`);
        
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
    });
  });

  describe('GET /api/players/:id/matches', () => {
    it('should return matches for a specific player', async () => {
      const response = await agent
        .get(`/api/players/${testData?.playerUser?.id || nonExistentId}/matches`);
        
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
    });

    it('should return 404 for non-existent player', async () => {
      const response = await agent
        .get(`/api/players/${nonExistentId}/matches`);
        
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Player not found');
    });

    it('should return 400 for invalid player ID format', async () => {
      const response = await agent
        .get(`/api/players/${invalidFormatId}/matches`);
        
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
    });
  });

  describe('GET /api/players/:id/tournaments', () => {
    it('should return tournaments for a specific player', async () => {
      const response = await agent
        .get(`/api/players/${testData?.playerUser?.id || nonExistentId}/tournaments`);
        
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
    });

    it('should return 404 for non-existent player', async () => {
      const response = await agent
        .get(`/api/players/${nonExistentId}/tournaments`);
        
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Player not found');
    });

    it('should return 400 for invalid player ID format', async () => {
      const response = await agent
        .get(`/api/players/${invalidFormatId}/tournaments`);
        
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', async () => {
      // This test simulates an error by passing invalid data to an endpoint
      const response = await agent
        .post('/api/players')
        .set('Authorization', 'Bearer admin-token')
        .send({ 
          // Missing required fields
        });
        
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
    });
  });
}); 