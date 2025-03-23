import { PrismaClient, User, UserRole, PerformanceHistory } from '@prisma/client';
import { mockUsers } from '../mocks/auth-service.mock';
import { createPlayerTestData } from './player-test-helper';

/**
 * Performance Test Helper
 *
 * This file contains utility functions for creating test performance data
 * in the test database. These functions are useful for testing performance-related
 * endpoints that require actual data in the database.
 */

/**
 * PerformanceTestData interface defines the structure for reusable test data
 */
export interface PerformanceTestData {
  adminUser: User;
  playerUsers: User[];
  performances: PerformanceHistory[];
}

/**
 * Creates a complete performance test setup with users and performance records
 *
 * @param prisma PrismaClient instance
 * @param performanceCount Number of performance records to create (default: 3)
 * @returns Promise resolving to PerformanceTestData
 */
export async function createPerformanceTestData(
  prisma: PrismaClient,
  performanceCount: number = 3,
): Promise<PerformanceTestData> {
  try {
    // Create player test data which will give us users
    const playerTestData = await createPlayerTestData(prisma, false);

    // Gather users to create performance records for
    const playerUsers = [playerTestData.playerUser, playerTestData.secondPlayerUser].filter(
      (user): user is User => user !== undefined,
    );

    // If we need more users than we have, create them
    if (playerUsers.length < performanceCount) {
      for (let i = playerUsers.length; i < performanceCount; i++) {
        const extraUser = await prisma.user.create({
          data: {
            email: `performance-player${i + 2}@example.com`,
            name: `Performance Player ${i + 2}`,
            password: 'hashed_password',
            role: UserRole.PLAYER,
            emailVerified: true,
          },
        });
        playerUsers.push(extraUser);
      }
    }

    // Create performance records for each player
    const performances: PerformanceHistory[] = [];
    const currentYear = new Date().getFullYear();

    for (let i = 0; i < playerUsers.length; i++) {
      // Create multiple performance records for each user (for different months)
      for (let month = 1; month <= 3; month++) {
        // Calculate performance with different values for each user/month
        const matchesPlayed = 10 + i * 2;
        const wins = Math.max(0, 8 - i - month); // Different win counts by user and month
        const losses = matchesPlayed - wins;
        const points = wins * 10;

        // Check if performance record already exists
        const existingPerformance = await prisma.performanceHistory.findUnique({
          where: {
            userId_year_month: {
              userId: playerUsers[i].id,
              year: currentYear,
              month: month,
            },
          },
        });

        if (existingPerformance) {
          // Update existing performance
          const updatedPerformance = await prisma.performanceHistory.update({
            where: {
              userId_year_month: {
                userId: playerUsers[i].id,
                year: currentYear,
                month: month,
              },
            },
            data: {
              matchesPlayed,
              wins,
              losses,
              points,
            },
          });
          performances.push(updatedPerformance);
        } else {
          // Create new performance
          const newPerformance = await prisma.performanceHistory.create({
            data: {
              userId: playerUsers[i].id,
              year: currentYear,
              month: month,
              matchesPlayed,
              wins,
              losses,
              points,
            },
          });
          performances.push(newPerformance);
        }
      }

      // Also create an annual performance record (without month)
      const annualMatchesPlayed = 30 + i * 5;
      const annualWins = Math.max(0, 20 - i * 3);
      const annualLosses = annualMatchesPlayed - annualWins;
      const annualPoints = annualWins * 10;

      // Check if annual performance already exists
      const existingAnnualPerformance = await prisma.performanceHistory.findFirst({
        where: {
          userId: playerUsers[i].id,
          year: currentYear,
          month: null,
        },
      });

      if (existingAnnualPerformance) {
        // Update existing annual performance
        const updatedAnnualPerformance = await prisma.performanceHistory.update({
          where: { id: existingAnnualPerformance.id },
          data: {
            matchesPlayed: annualMatchesPlayed,
            wins: annualWins,
            losses: annualLosses,
            points: annualPoints,
          },
        });
        performances.push(updatedAnnualPerformance);
      } else {
        // Create new annual performance
        const newAnnualPerformance = await prisma.performanceHistory.create({
          data: {
            userId: playerUsers[i].id,
            year: currentYear,
            month: null,
            matchesPlayed: annualMatchesPlayed,
            wins: annualWins,
            losses: annualLosses,
            points: annualPoints,
          },
        });
        performances.push(newAnnualPerformance);
      }
    }

    return {
      adminUser: playerTestData.adminUser,
      playerUsers,
      performances,
    };
  } catch (error) {
    console.error('Error creating performance test data:', error);
    throw error;
  }
}

/**
 * Creates a single performance record for a user
 *
 * @param prisma PrismaClient instance
 * @param userId ID of the user
 * @param year Year for the performance record
 * @param month Optional month for the performance record
 * @param data Optional performance data
 * @returns Promise resolving to the created performance
 */
export async function createBasicPerformance(
  prisma: PrismaClient,
  userId: string,
  year: number,
  month: number | null = null,
  data?: Partial<{
    matchesPlayed: number;
    wins: number;
    losses: number;
    points: number;
  }>,
): Promise<PerformanceHistory> {
  const matchesPlayed = data?.matchesPlayed ?? 5;
  const wins = data?.wins ?? 3;
  const losses = data?.losses ?? 2;
  const points = data?.points ?? wins * 10;

  if (month !== null) {
    // Check if monthly performance already exists
    const existingPerformance = await prisma.performanceHistory.findUnique({
      where: {
        userId_year_month: {
          userId,
          year,
          month,
        },
      },
    });

    if (existingPerformance) {
      // Update existing performance
      return prisma.performanceHistory.update({
        where: {
          userId_year_month: {
            userId,
            year,
            month,
          },
        },
        data: {
          matchesPlayed,
          wins,
          losses,
          points,
        },
      });
    }
  } else {
    // Check if annual performance already exists
    const existingPerformance = await prisma.performanceHistory.findFirst({
      where: {
        userId,
        year,
        month: null,
      },
    });

    if (existingPerformance) {
      // Update existing performance
      return prisma.performanceHistory.update({
        where: { id: existingPerformance.id },
        data: {
          matchesPlayed,
          wins,
          losses,
          points,
        },
      });
    }
  }

  // Create new performance
  return prisma.performanceHistory.create({
    data: {
      userId,
      year,
      month,
      matchesPlayed,
      wins,
      losses,
      points,
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
 * Cleans up performance test data
 *
 * @param prisma PrismaClient instance
 * @param userId Optional specific user ID to clean up performance records for
 * @param year Optional specific year to clean up performance records for
 * @param month Optional specific month to clean up performance records for
 */
export async function cleanupPerformanceTestData(
  prisma: PrismaClient,
  userId?: string,
  year?: number,
  month?: number | null,
): Promise<void> {
  try {
    const whereClause: any = {};

    if (userId) whereClause.userId = userId;
    if (year !== undefined) whereClause.year = year;
    if (month !== undefined) whereClause.month = month;

    if (Object.keys(whereClause).length > 0) {
      // Delete specific performance records
      await prisma.performanceHistory.deleteMany({ where: whereClause });

      if (userId && year !== undefined && month !== undefined) {
        console.log(
          `Cleaned up performance for user ${userId} in year ${year}${month !== null ? `, month ${month}` : ''}`,
        );
      } else if (userId) {
        console.log(`Cleaned up all performance records for user ${userId}`);
      } else if (year !== undefined) {
        console.log(
          `Cleaned up all performance records for year ${year}${month !== null ? `, month ${month}` : ''}`,
        );
      }
    } else {
      // Delete all test performance records
      // Only delete records for test users to avoid affecting other tests
      const testUserIds = Object.values(mockUsers).map(user => user.id);
      await prisma.performanceHistory.deleteMany({
        where: {
          userId: { in: testUserIds },
        },
      });
      console.log('Cleaned up all test performance records');
    }
  } catch (error) {
    console.error('Unexpected error in cleanupPerformanceTestData:', error);
  }
}
