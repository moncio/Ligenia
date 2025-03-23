/**
 * @jest-environment node
 */

// TODO: These tests need to be updated to match the actual implementation of the ranking endpoints.
// Currently, most tests are failing because:
// 1. Filtering by tournament returns 400 instead of 200
// 2. Accessing rankings by category returns 400 instead of 200
// 3. Error messages don't contain the expected text
// The base endpoint (GET /api/rankings) works but with limitations.
// This file should be revisited once the RankingController implementation is completed.

import { config } from 'dotenv';
import { UserRole, PlayerLevel } from '@prisma/client';
import path from 'path';
import { prisma, request, mockAuthService } from '../setup';
import { mockUsers } from '../../mocks/auth-service.mock';

// Load test environment variables
config({ path: path.resolve(__dirname, '../../../.env.test') });

describe('Ranking Routes Integration Tests', () => {
  let playerToken: string;
  let adminToken: string;

  // Set up test data before running tests
  beforeAll(async () => {
    try {
      // Login to get tokens
      const playerLoginResult = await mockAuthService.login({
        email: mockUsers.player.email,
        password: mockUsers.player.password,
      });

      if (playerLoginResult.isSuccess) {
        playerToken = playerLoginResult.getValue().accessToken;
      }

      const adminLoginResult = await mockAuthService.login({
        email: mockUsers.admin.email,
        password: mockUsers.admin.password,
      });

      if (adminLoginResult.isSuccess) {
        adminToken = adminLoginResult.getValue().accessToken;
      }

      // Verify tokens were obtained correctly
      expect(playerToken).toBeDefined();
      expect(adminToken).toBeDefined();

      // Create some test statistics data for players
      // Create or find test users with PLAYER role
      const testPlayers = [];
      for (let i = 1; i <= 5; i++) {
        const existingPlayer = await prisma.user.findFirst({
          where: { email: `ranking-player${i}@example.com` },
        });

        if (existingPlayer) {
          testPlayers.push(existingPlayer);
        } else {
          const player = await prisma.user.create({
            data: {
              email: `ranking-player${i}@example.com`,
              name: `Ranking Player ${i}`,
              password: 'hashed_password',
              role: UserRole.PLAYER,
              emailVerified: true,
              playerProfile: {
                create: {
                  level: i <= 2 ? PlayerLevel.P1 : i <= 4 ? PlayerLevel.P2 : PlayerLevel.P3,
                },
              },
            },
          });
          testPlayers.push(player);
        }
      }

      // Create a test tournament
      const testTournament = await prisma.tournament.create({
        data: {
          name: 'Ranking Test Tournament',
          description: 'Tournament for testing rankings',
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          registrationEndDate: new Date(),
          status: 'ACTIVE',
        },
      });

      // Create statistics for players with different point values
      for (let i = 0; i < testPlayers.length; i++) {
        // Check if statistic already exists
        const existingStat = await prisma.statistic.findUnique({
          where: {
            userId_tournamentId: {
              userId: testPlayers[i].id,
              tournamentId: testTournament.id,
            },
          },
        });

        if (existingStat) {
          await prisma.statistic.update({
            where: {
              userId_tournamentId: {
                userId: testPlayers[i].id,
                tournamentId: testTournament.id,
              },
            },
            data: {
              points: (5 - i) * 50, // First player has 250, second 200, etc.
              matchesPlayed: 10,
              wins: 5 - i,
              losses: i,
              rank: i + 1,
            },
          });
        } else {
          await prisma.statistic.create({
            data: {
              userId: testPlayers[i].id,
              tournamentId: testTournament.id,
              points: (5 - i) * 50, // First player has 250, second 200, etc.
              matchesPlayed: 10,
              wins: 5 - i,
              losses: i,
              rank: i + 1,
            },
          });
        }
      }
    } catch (error) {
      console.error('Error in ranking tests setup:', error);
    }
  });

  afterAll(async () => {
    // Clean up test data
    try {
      await prisma.statistic.deleteMany({
        where: {
          user: {
            email: {
              startsWith: 'ranking-player',
            },
          },
        },
      });

      await prisma.player.deleteMany({
        where: {
          user: {
            email: {
              startsWith: 'ranking-player',
            },
          },
        },
      });

      await prisma.user.deleteMany({
        where: {
          email: {
            startsWith: 'ranking-player',
          },
        },
      });

      await prisma.tournament.deleteMany({
        where: {
          name: 'Ranking Test Tournament',
        },
      });
    } catch (error) {
      console.error('Error cleaning up ranking test data:', error);
    }
  });

  describe('GET /api/rankings', () => {
    it('should return global rankings in descending order by points', async () => {
      const response = await request.get('/api/rankings');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('rankings');
      expect(Array.isArray(response.body.data.rankings)).toBe(true);

      const rankings = response.body.data.rankings;

      // Check that we have at least our test players
      expect(rankings.length).toBeGreaterThan(0);

      // Verify the structure of the rankings
      expect(rankings[0]).toHaveProperty('player_id');
      expect(rankings[0]).toHaveProperty('full_name');
      expect(rankings[0]).toHaveProperty('total_points');
      expect(rankings[0]).toHaveProperty('position');

      // Verify the order (descending by points)
      for (let i = 1; i < rankings.length; i++) {
        expect(parseInt(rankings[i - 1].total_points)).toBeGreaterThanOrEqual(
          parseInt(rankings[i].total_points),
        );
      }
    });

    it('should paginate results correctly', async () => {
      const limit = 2;
      const response = await request.get('/api/rankings').query({ limit, offset: 0 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('rankings');

      // Ensure we got the requested number of results
      expect(response.body.data.rankings.length).toBeLessThanOrEqual(limit);

      // Get the second page
      const secondPageResponse = await request.get('/api/rankings').query({ limit, offset: limit });

      expect(secondPageResponse.status).toBe(200);

      // Ensure the two pages have different players
      const firstPagePlayerIds = response.body.data.rankings.map((r: any) => r.player_id);
      const secondPagePlayerIds = secondPageResponse.body.data.rankings.map(
        (r: any) => r.player_id,
      );

      // Check that the pages don't have overlapping player IDs
      const overlap = firstPagePlayerIds.filter((id: string) => secondPagePlayerIds.includes(id));
      expect(overlap.length).toBe(0);
    });

    it('should handle invalid query parameters gracefully', async () => {
      const response = await request
        .get('/api/rankings')
        .query({ limit: 'invalid', offset: 'invalid' });

      // It should still work, using default values
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('rankings');
      expect(Array.isArray(response.body.data.rankings)).toBe(true);
    });
  });

  describe('GET /api/rankings/:categoryId', () => {
    it('should return rankings filtered by player category', async () => {
      // Test with P1 category
      const response = await request.get(`/api/rankings/${PlayerLevel.P1}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('rankings');
      expect(Array.isArray(response.body.data.rankings)).toBe(true);

      const rankings = response.body.data.rankings;

      // Verify the structure of the rankings
      if (rankings.length > 0) {
        expect(rankings[0]).toHaveProperty('player_id');
        expect(rankings[0]).toHaveProperty('full_name');
        expect(rankings[0]).toHaveProperty('total_points');
        expect(rankings[0]).toHaveProperty('position');
      }

      // All players should be in the P1 category (this is verified by the SQL query)
    });

    it('should return 400 for invalid category', async () => {
      const invalidCategoryId = 'INVALID_CATEGORY';

      const response = await request.get(`/api/rankings/${invalidCategoryId}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('Invalid player category');
    });

    it('should paginate category results correctly', async () => {
      const limit = 1;
      const response = await request
        .get(`/api/rankings/${PlayerLevel.P2}`)
        .query({ limit, offset: 0 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('rankings');

      // Ensure we got the right number of results
      expect(response.body.data.rankings.length).toBeLessThanOrEqual(limit);
    });
  });
});
