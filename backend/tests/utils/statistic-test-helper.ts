import {
  PrismaClient,
  Statistic,
  User,
  Tournament,
  UserRole,
  PlayerLevel,
  TournamentFormat,
  TournamentStatus,
} from '@prisma/client';
import { mockUsers } from '../mocks/auth-service.mock';
import { createPlayerTestData } from './player-test-helper';

/**
 * Statistic Test Helper
 *
 * This file contains utility functions for creating test statistic data
 * in the test database. These functions are useful for testing statistic-related
 * endpoints that require actual data in the database.
 */

/**
 * StatisticTestData interface defines the structure for reusable test data
 */
export interface StatisticTestData {
  adminUser: User;
  playerUsers: User[];
  tournament: Tournament;
  statistics: Statistic[];
}

/**
 * Creates a complete statistic test setup with users, tournament, and statistics
 *
 * @param prisma PrismaClient instance
 * @param playerCount Number of players to create statistics for (default: 3)
 * @returns Promise resolving to StatisticTestData
 */
export async function createStatisticTestData(
  prisma: PrismaClient,
  playerCount: number = 3,
): Promise<StatisticTestData> {
  try {
    // Create player test data which will give us users and a tournament
    const playerTestData = await createPlayerTestData(prisma, true);

    // Gather users to create statistics for
    const playerUsers = [playerTestData.playerUser, playerTestData.secondPlayerUser].filter(
      Boolean,
    ) as User[];

    // If we need more users than we have, create them
    if (playerUsers.length < playerCount) {
      for (let i = playerUsers.length; i < playerCount; i++) {
        const extraUser = await prisma.user.create({
          data: {
            email: `player${i + 2}@example.com`,
            name: `Player ${i + 2}`,
            password: 'hashed_password',
            role: UserRole.PLAYER,
            emailVerified: true,
          },
        });
        playerUsers.push(extraUser);
      }
    }

    // Create tournament if not created by playerTestData
    let tournament = playerTestData.tournament;
    if (!tournament) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 10);

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 3);

      const registrationEndDate = new Date(startDate);
      registrationEndDate.setDate(registrationEndDate.getDate() - 1);

      tournament = await prisma.tournament.create({
        data: {
          name: 'Statistic Test Tournament',
          description: 'Tournament created for statistic integration tests',
          startDate,
          endDate,
          registrationEndDate,
          location: 'Test Location',
          format: TournamentFormat.SINGLE_ELIMINATION,
          category: PlayerLevel.P3,
          status: TournamentStatus.ACTIVE,
          participants: {
            connect: playerUsers.map(user => ({ id: user.id })),
          },
        },
      });
    }

    // Create statistics for each player
    const statistics: Statistic[] = [];

    for (let i = 0; i < playerUsers.length; i++) {
      // Calculate statistics with different values for each player
      // First player has best stats, last player has worst stats
      const matchesPlayed = 10;
      const wins = Math.max(0, 8 - i * 2); // 8, 6, 4, ...
      const losses = matchesPlayed - wins;
      const points = wins * 10;
      const rank = i + 1;

      // Check if statistic already exists
      const existingStat = await prisma.statistic.findUnique({
        where: {
          userId_tournamentId: {
            userId: playerUsers[i].id,
            tournamentId: tournament.id,
          },
        },
      });

      if (existingStat) {
        // Update existing statistic
        const updatedStat = await prisma.statistic.update({
          where: {
            userId_tournamentId: {
              userId: playerUsers[i].id,
              tournamentId: tournament.id,
            },
          },
          data: {
            matchesPlayed,
            wins,
            losses,
            points,
            rank,
          },
        });
        statistics.push(updatedStat);
      } else {
        // Create new statistic
        const newStat = await prisma.statistic.create({
          data: {
            userId: playerUsers[i].id,
            tournamentId: tournament.id,
            matchesPlayed,
            wins,
            losses,
            points,
            rank,
          },
        });
        statistics.push(newStat);
      }
    }

    return {
      adminUser: playerTestData.adminUser,
      playerUsers,
      tournament,
      statistics,
    };
  } catch (error) {
    console.error('Error creating statistic test data:', error);
    throw error;
  }
}

/**
 * Creates a single statistic for a user in a tournament
 *
 * @param prisma PrismaClient instance
 * @param userId ID of the user
 * @param tournamentId ID of the tournament
 * @param data Optional statistic data
 * @returns Promise resolving to the created statistic
 */
export async function createBasicStatistic(
  prisma: PrismaClient,
  userId: string,
  tournamentId: string,
  data?: Partial<{
    matchesPlayed: number;
    wins: number;
    losses: number;
    points: number;
    rank: number;
  }>,
): Promise<Statistic> {
  const matchesPlayed = data?.matchesPlayed ?? 5;
  const wins = data?.wins ?? 3;
  const losses = data?.losses ?? 2;
  const points = data?.points ?? wins * 10;
  const rank = data?.rank ?? 1;

  // Check if statistic already exists
  const existingStat = await prisma.statistic.findUnique({
    where: {
      userId_tournamentId: {
        userId,
        tournamentId,
      },
    },
  });

  if (existingStat) {
    // Update existing statistic
    return prisma.statistic.update({
      where: {
        userId_tournamentId: {
          userId,
          tournamentId,
        },
      },
      data: {
        matchesPlayed,
        wins,
        losses,
        points,
        rank,
      },
    });
  }

  // Create new statistic
  return prisma.statistic.create({
    data: {
      userId,
      tournamentId,
      matchesPlayed,
      wins,
      losses,
      points,
      rank,
    },
  });
}

/**
 * Calculate win rate for statistical analysis
 *
 * @param wins Number of wins
 * @param matchesPlayed Total matches played
 * @returns Win rate as a percentage
 */
export function calculateWinRate(wins: number, matchesPlayed: number): number {
  if (matchesPlayed === 0) return 0;
  return (wins / matchesPlayed) * 100;
}

/**
 * Cleans up statistic test data
 *
 * @param prisma PrismaClient instance
 * @param userId Optional specific user ID to clean up statistics for
 * @param tournamentId Optional specific tournament ID to clean up statistics for
 */
export async function cleanupStatisticTestData(
  prisma: PrismaClient,
  userId?: string,
  tournamentId?: string,
): Promise<void> {
  try {
    if (userId && tournamentId) {
      // Delete specific user-tournament statistic
      await prisma.statistic.deleteMany({
        where: {
          userId,
          tournamentId,
        },
      });
      console.log(`Cleaned up statistic for user ${userId} in tournament ${tournamentId}`);
    } else if (userId) {
      // Delete all statistics for a specific user
      await prisma.statistic.deleteMany({
        where: { userId },
      });
      console.log(`Cleaned up all statistics for user ${userId}`);
    } else if (tournamentId) {
      // Delete all statistics for a specific tournament
      await prisma.statistic.deleteMany({
        where: { tournamentId },
      });
      console.log(`Cleaned up all statistics for tournament ${tournamentId}`);
    } else {
      // Delete all test statistics
      await prisma.statistic.deleteMany({
        where: {
          tournament: {
            name: { contains: 'Test Tournament' },
          },
        },
      });
      console.log('Cleaned up all test statistics');
    }
  } catch (error) {
    console.error('Unexpected error in cleanupStatisticTestData:', error);
  }
}
