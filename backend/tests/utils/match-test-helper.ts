import {
  PrismaClient,
  Match,
  User,
  Tournament,
  MatchStatus,
  UserRole,
  TournamentFormat,
  PlayerLevel,
  TournamentStatus,
} from '@prisma/client';
import { mockUsers } from '../mocks/auth-service.mock';

/**
 * Match Test Helper
 *
 * This file contains utility functions for creating test match data
 * in the test database. These functions are useful for testing match-related
 * endpoints that require actual data in the database.
 */

/**
 * MatchTestData interface defines the structure for reusable test data
 */
export interface MatchTestData {
  match: Match;
  tournament: Tournament;
  adminUser: User;
  playerUsers: User[];
}

/**
 * Creates a complete match test setup with admin, tournament, players, and a match
 *
 * @param prisma PrismaClient instance
 * @returns Promise resolving to MatchTestData
 */
export async function createMatchTestData(prisma: PrismaClient): Promise<MatchTestData> {
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

  // Create player users if needed
  const playerUser1 = await prisma.user.upsert({
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

  const playerUser2 = await prisma.user.upsert({
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

  const playerUser3 = await prisma.user.upsert({
    where: { email: 'player3@example.com' },
    update: {},
    create: {
      email: 'player3@example.com',
      name: 'Player Three',
      password: 'hashed_password',
      role: UserRole.PLAYER,
      emailVerified: true,
    },
  });

  const playerUser4 = await prisma.user.upsert({
    where: { email: 'player4@example.com' },
    update: {},
    create: {
      email: 'player4@example.com',
      name: 'Player Four',
      password: 'hashed_password',
      role: UserRole.PLAYER,
      emailVerified: true,
    },
  });

  const playerUsers = [playerUser1, playerUser2, playerUser3, playerUser4];

  // Create tournament
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 10); // 10 days from now

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 3); // 3 days after start

  const registrationEndDate = new Date(startDate);
  registrationEndDate.setDate(registrationEndDate.getDate() - 1); // 1 day before start

  // First delete any existing tournament with the same name to avoid duplicates
  await prisma.tournament.deleteMany({
    where: { name: 'Match Test Tournament' },
  });

  const tournament = await prisma.tournament.create({
    data: {
      name: 'Match Test Tournament',
      description: 'Tournament created for match integration tests',
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

  // Create a match for the tournament - wrap in try/catch to handle potential errors
  let match: Match | null = null;
  try {
    match = await prisma.match.create({
      data: {
        tournamentId: tournament.id,
        homePlayerOneId: playerUser1.id,
        homePlayerTwoId: playerUser2.id,
        awayPlayerOneId: playerUser3.id,
        awayPlayerTwoId: playerUser4.id,
        round: 1,
        date: startDate,
        location: 'Test Court 1',
        status: MatchStatus.PENDING,
      },
    });
  } catch (error) {
    console.error('Error creating test match:', error);
    // Continue with null match - test will detect this and handle accordingly
  }

  if (!match) {
    throw new Error('Failed to create test match');
  }

  // Return the complete test data set
  return {
    match,
    tournament,
    adminUser,
    playerUsers,
  };
}

/**
 * Creates a basic match for testing with minimal relations
 *
 * @param prisma PrismaClient instance
 * @param tournamentId ID of the tournament to create the match for
 * @param playerIds Array of player IDs to use
 * @param status Optional match status (defaults to PENDING)
 * @returns Promise resolving to the created match
 */
export async function createBasicMatch(
  prisma: PrismaClient,
  tournamentId: string,
  playerIds: string[],
  status: MatchStatus = MatchStatus.PENDING,
): Promise<Match | null> {
  if (playerIds.length < 4) {
    throw new Error('At least 4 player IDs are required to create a match');
  }

  try {
    // Verify that all players exist before creating match
    const existingPlayers = await prisma.user.findMany({
      where: {
        id: {
          in: playerIds,
        },
      },
      select: {
        id: true,
      },
    });

    const existingPlayerIds = existingPlayers.map(player => player.id);
    const missingPlayerIds = playerIds.filter(id => !existingPlayerIds.includes(id));

    if (missingPlayerIds.length > 0) {
      console.log(`Warning: Some players don't exist: ${missingPlayerIds.join(', ')}`);
      return null;
    }

    // Create match
    return await prisma.match.create({
      data: {
        tournamentId,
        homePlayerOneId: playerIds[0],
        homePlayerTwoId: playerIds[1],
        awayPlayerOneId: playerIds[2],
        awayPlayerTwoId: playerIds[3],
        round: 1,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        location: 'Test Court',
        status,
      },
    });
  } catch (error) {
    console.error('Error creating basic match:', error);
    return null;
  }
}

/**
 * Cleans up all match test data
 *
 * @param prisma PrismaClient instance
 * @param matchId Optional specific match ID to clean up
 * @param tournamentId Optional specific tournament ID to clean up
 */
export async function cleanupMatchTestData(
  prisma: PrismaClient,
  matchId?: string,
  tournamentId?: string,
): Promise<void> {
  try {
    if (matchId) {
      // Check if match exists before attempting deletion
      const match = await prisma.match.findUnique({
        where: { id: matchId },
      });

      if (match) {
        await prisma.match.delete({ where: { id: matchId } });
        console.log(`Cleaned up match with ID ${matchId}`);
      } else {
        console.log(`Match with ID ${matchId} not found, skipping cleanup`);
      }
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

    // If no specific IDs were provided, clean up all test matches and tournaments
    if (!matchId && !tournamentId) {
      await prisma.$transaction([
        prisma.match.deleteMany({
          where: {
            OR: [
              { location: { contains: 'Test Court' } },
              { tournament: { name: { contains: 'Match Test Tournament' } } },
            ],
          },
        }),
        prisma.tournament.deleteMany({
          where: {
            name: { contains: 'Match Test Tournament' },
          },
        }),
      ]);
      console.log('Cleaned up all test matches and related tournaments');
    }
  } catch (error) {
    console.error('Unexpected error in cleanupMatchTestData:', error);
  }
}
