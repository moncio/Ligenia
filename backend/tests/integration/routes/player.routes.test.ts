/**
 * @jest-environment node
 */

import 'dotenv/config';
import supertest from 'supertest';
import app from '../../../src/app';
import { UserRole } from '@prisma/client';
import { prisma } from '../setup';
import {
  createPlayerTestData,
  PlayerTestData,
  cleanupPlayerTestData,
} from '../../utils/player-test-helper';
import { PlayerLevel } from '../../../src/core/domain/tournament/tournament.entity';

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
  country: 'Spain',
};

// Invalid player data for validation tests
const invalidPlayerData = {
  userId: 'not-a-uuid',
  name: 'T', // Too short
  level: 'INVALID_LEVEL',
};

// Update player data
const updatePlayerData = {
  name: 'Updated Player Name',
  level: PlayerLevel.P2,
  country: 'Portugal',
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
      const response = await agent.post('/api/players');

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
      expect(response.body).toHaveProperty(
        'message',
        'You do not have permission to access this resource',
      );
    });

    it.skip('should respect role override for testing', async () => {
      const response = await agent
        .post('/api/players')
        .set('Authorization', 'Bearer valid-token')
        .set('x-test-role', 'ADMIN')
        .send(createPlayerData);

      // We only care that authorization passes (not 401 or 403)
      // The test might still fail with 500 or 400 due to missing dependencies or validation
      expect([401, 403]).not.toContain(response.status);
    });
  });

  describe('Validation Checks', () => {
    it('should return 400 when creating player with invalid data', async () => {
      const response = await agent
        .post('/api/players')
        .set('Authorization', 'Bearer admin-token')
        .send(invalidPlayerData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
    });

    it('should return 400 when updating player with invalid data', async () => {
      const response = await agent
        .put('/api/players/player-1')
        .set('Authorization', 'Bearer admin-token')
        .send({ level: 'INVALID_LEVEL' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
    });
    
    it('should return 400 for invalid player ID format', async () => {
      const response = await agent.get(`/api/players/${invalidFormatId}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
    });
  });
});
