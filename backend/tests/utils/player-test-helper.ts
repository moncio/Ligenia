import {
  PrismaClient,
  User,
  Player,
  Tournament,
  UserRole,
  PlayerLevel,
  TournamentFormat,
  TournamentStatus,
} from '@prisma/client';
import { mockUsers } from '../mocks/auth-service.mock';

/**
 * Player Test Helper
 *
 * This file contains utility functions for creating test player data
 * in the test database. These functions are useful for testing player-related
 * endpoints that require actual data in the database.
 */

/**
 * PlayerTestData interface defines the structure for reusable test data
 */
export interface PlayerTestData {
  adminUser: User;
  playerUser: User;
  playerProfile?: Player;
  secondPlayerUser?: User;
  secondPlayerProfile?: Player;
  tournament?: Tournament;
}

/**
 * Creates a complete player test setup with admin, player user, and player profile
 *
 * @param prisma PrismaClient instance
 * @param createTournament Whether to create a tournament and connect players to it
 * @returns Promise resolving to PlayerTestData
 */
export async function createPlayerTestData(
  prisma: PrismaClient,
  createTournament = false,
): Promise<PlayerTestData> {
  // Create admin user if needed
  const adminUser = await prisma.user.upsert({
    where: { email: mockUsers.admin.email },
    update: {},
    create: {
      id: mockUsers.admin.id,
      email: mockUsers.admin.email,
      name: mockUsers.admin.name,
      password: 'hashed_password',
      role: UserRole.ADMIN,
      emailVerified: true,
    },
  });

  // Create player user if needed
  const playerUser = await prisma.user.upsert({
    where: { email: mockUsers.player.email },
    update: {},
    create: {
      id: mockUsers.player.id,
      email: mockUsers.player.email,
      name: mockUsers.player.name,
      password: 'hashed_password',
      role: UserRole.PLAYER,
      emailVerified: true,
    },
  });

  // Create a second player user
  const secondPlayerUser = await prisma.user.upsert({
    where: { email: 'player2@example.com' },
    update: {},
    create: {
      email: 'player2@example.com',
      name: 'Player Two',
      password: 'hashed_password',
      role: UserRole.PLAYER,
      emailVerified: true,
    },
  });

  // Create player profile linked to the player user
  let playerProfile;
  try {
    // Check if profile already exists
    const existingProfile = await prisma.player.findUnique({
      where: { userId: playerUser.id },
    });

    if (!existingProfile) {
      playerProfile = await prisma.player.create({
        data: {
          userId: playerUser.id,
          level: PlayerLevel.P3,
          country: 'Spain',
        },
      });
    } else {
      playerProfile = existingProfile;
    }
  } catch (error) {
    console.error('Error creating player profile:', error);
    throw new Error('Failed to create player profile for tests');
  }

  // Create second player profile
  let secondPlayerProfile;
  try {
    // Check if profile already exists
    const existingProfile = await prisma.player.findUnique({
      where: { userId: secondPlayerUser.id },
    });

    if (!existingProfile) {
      secondPlayerProfile = await prisma.player.create({
        data: {
          userId: secondPlayerUser.id,
          level: PlayerLevel.P2,
          country: 'Portugal',
        },
      });
    } else {
      secondPlayerProfile = existingProfile;
    }
  } catch (error) {
    console.error('Error creating second player profile:', error);
    throw new Error('Failed to create second player profile for tests');
  }

  // Create tournament if requested and connect players
  let tournament;
  if (createTournament) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 10); // 10 days from now

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 3); // 3 days after start

    const registrationEndDate = new Date(startDate);
    registrationEndDate.setDate(registrationEndDate.getDate() - 1); // 1 day before start

    // First delete any existing tournament with the same name to avoid duplicates
    await prisma.tournament.deleteMany({
      where: { name: 'Player Test Tournament' },
    });

    try {
      tournament = await prisma.tournament.create({
        data: {
          name: 'Player Test Tournament',
          description: 'Tournament created for player integration tests',
          startDate,
          endDate,
          registrationEndDate,
          location: 'Test Location',
          format: TournamentFormat.SINGLE_ELIMINATION,
          category: PlayerLevel.P3,
          status: TournamentStatus.ACTIVE,
          participants: {
            connect: [{ id: playerUser.id }, { id: secondPlayerUser.id }],
          },
        },
      });
    } catch (error) {
      console.error('Error creating tournament for player tests:', error);
    }
  }

  // Return the complete test data set
  return {
    adminUser,
    playerUser,
    playerProfile,
    secondPlayerUser,
    secondPlayerProfile,
    tournament,
  };
}

/**
 * Creates a basic player profile for testing
 *
 * @param prisma PrismaClient instance
 * @param userId ID of the user to create the player profile for
 * @param level Optional player level (defaults to P3)
 * @returns Promise resolving to the created player profile
 */
export async function createBasicPlayerProfile(
  prisma: PrismaClient,
  userId: string,
  level: PlayerLevel = PlayerLevel.P3,
): Promise<Player | null> {
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.log(`Warning: User with ID ${userId} doesn't exist`);
      return null;
    }

    // Check if profile already exists
    const existingProfile = await prisma.player.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      console.log(`Player profile already exists for user ${userId}`);
      return existingProfile;
    }

    // Create player profile
    return await prisma.player.create({
      data: {
        userId,
        level,
        country: 'Test Country',
      },
    });
  } catch (error) {
    console.error('Error creating basic player profile:', error);
    return null;
  }
}

/**
 * Cleans up player test data
 *
 * @param prisma PrismaClient instance
 * @param userId Optional specific user ID to clean up
 * @param tournamentId Optional specific tournament ID to clean up
 */
export async function cleanupPlayerTestData(
  prisma: PrismaClient,
  userId?: string,
  tournamentId?: string,
): Promise<void> {
  try {
    if (userId) {
      // Clean up player profile
      await prisma.player.deleteMany({
        where: { userId },
      });
      console.log(`Cleaned up player profile for user ${userId}`);
    }

    if (tournamentId) {
      // Check if tournament exists before attempting deletion
      const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
      });

      if (tournament) {
        try {
          // Clean up specific tournament and related data
          await prisma.$transaction([
            prisma.statistic.deleteMany({ where: { tournamentId } }),
            prisma.match.deleteMany({ where: { tournamentId } }),
            prisma.tournament.delete({ where: { id: tournamentId } }),
          ]);
          console.log(`Cleaned up tournament with ID ${tournamentId}`);
        } catch (error) {
          console.error(`Error cleaning up tournament with ID ${tournamentId}:`, error);
          // Try to delete each entity separately to ensure maximum cleanup
          await prisma.statistic
            .deleteMany({ where: { tournamentId } })
            .catch(e => console.error('Error deleting statistics:', e));
          await prisma.match
            .deleteMany({ where: { tournamentId } })
            .catch(e => console.error('Error deleting matches:', e));
          await prisma.tournament
            .delete({ where: { id: tournamentId } })
            .catch(e => console.error('Error deleting tournament:', e));
        }
      } else {
        console.log(`Tournament with ID ${tournamentId} not found, skipping cleanup`);
      }
    }

    // If no specific IDs were provided, clean up all test player data
    if (!userId && !tournamentId) {
      await prisma.$transaction([
        prisma.player.deleteMany({
          where: {
            OR: [
              { country: { equals: 'Test Country' } },
              { country: { equals: 'Spain' } },
              { country: { equals: 'Portugal' } },
            ],
          },
        }),
        prisma.tournament.deleteMany({
          where: {
            name: { contains: 'Player Test Tournament' },
          },
        }),
      ]);
      console.log('Cleaned up all test player data');
    }
  } catch (error) {
    console.error('Unexpected error in cleanupPlayerTestData:', error);
  }
}
