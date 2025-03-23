import { PrismaClient, Tournament, User, Match, PlayerLevel, TournamentFormat, TournamentStatus, MatchStatus, UserRole } from '@prisma/client';
import { mockUsers } from '../mocks/auth-service.mock';

/**
 * Tournament Test Helper
 * 
 * This file contains utility functions for creating test tournament data
 * in the test database. These functions are useful for testing tournament-related
 * endpoints that require actual data in the database.
 */

/**
 * TournamentTestData interface defines the structure for reusable test data
 */
export interface TournamentTestData {
  tournament: Tournament;
  adminUser: User;
  playerUsers: User[];
  matches: Match[];
}

/**
 * Creates a complete tournament test setup with admin, players, and matches
 *
 * @param prisma PrismaClient instance
 * @returns Promise resolving to TournamentTestData
 */
export async function createTournamentTestData(prisma: PrismaClient): Promise<TournamentTestData> {
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
      emailVerified: true
    }
  });

  // Create player users if needed - using findFirst to prevent ID conflicts
  let playerUser1 = await prisma.user.findFirst({
    where: { email: mockUsers.player.email }
  });
  
  if (!playerUser1) {
    playerUser1 = await prisma.user.create({
      data: {
        id: mockUsers.player.id,
        email: mockUsers.player.email,
        name: mockUsers.player.name,
        password: 'hashed_password',
        role: UserRole.PLAYER,
        emailVerified: true
      }
    });
  }

  let playerUser2 = await prisma.user.findFirst({
    where: { email: 'player2@example.com' }
  });
  
  if (!playerUser2) {
    playerUser2 = await prisma.user.create({
      data: {
        email: 'player2@example.com',
        name: 'Player Two',
        password: 'hashed_password',
        role: UserRole.PLAYER,
        emailVerified: true
      }
    });
  }

  let playerUser3 = await prisma.user.findFirst({
    where: { email: 'player3@example.com' }
  });
  
  if (!playerUser3) {
    playerUser3 = await prisma.user.create({
      data: {
        email: 'player3@example.com',
        name: 'Player Three',
        password: 'hashed_password',
        role: UserRole.PLAYER,
        emailVerified: true
      }
    });
  }

  const playerUser4 = await prisma.user.upsert({
    where: { email: 'player4@example.com' },
    update: {},
    create: {
      email: 'player4@example.com',
      name: 'Player Four',
      password: 'hashed_password',
      role: UserRole.PLAYER,
      emailVerified: true
    }
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
    where: { name: 'Integration Test Tournament' }
  });

  // Check which player users exist before trying to connect them
  const existingPlayerUsers = await Promise.all(
    playerUsers.map(async (user) => {
      const exists = await prisma.user.findUnique({
        where: { id: user.id }
      });
      return exists ? user : null;
    })
  );
  
  const validPlayerUsers = existingPlayerUsers.filter(user => user !== null);
  console.log(`Found ${validPlayerUsers.length} valid players out of ${playerUsers.length}`);

  const tournament = await prisma.tournament.create({
    data: {
      name: 'Integration Test Tournament',
      description: 'Tournament created for integration tests',
      startDate,
      endDate,
      registrationEndDate,
      location: 'Test Location',
      format: TournamentFormat.SINGLE_ELIMINATION,
      category: PlayerLevel.P3,
      status: TournamentStatus.ACTIVE,
      participants: validPlayerUsers.length > 0 ? {
        connect: validPlayerUsers.map(user => ({ id: user.id }))
      } : undefined
    }
  });

  // Create matches for the tournament - wrap in try/catch to handle potential errors
  let matches: Match[] = [];
  
  // Only create matches if we have at least 4 valid players
  if (validPlayerUsers.length >= 4) {
    try {
      matches = await Promise.all([
        prisma.match.create({
          data: {
            tournamentId: tournament.id,
            homePlayerOneId: validPlayerUsers[0].id,
            homePlayerTwoId: validPlayerUsers[1].id,
            awayPlayerOneId: validPlayerUsers[2].id,
            awayPlayerTwoId: validPlayerUsers[3].id,
            round: 1,
            date: startDate,
            location: 'Test Court 1',
            status: MatchStatus.PENDING
          }
        }),
        prisma.match.create({
          data: {
            tournamentId: tournament.id,
            homePlayerOneId: validPlayerUsers[1].id,
            homePlayerTwoId: validPlayerUsers[2].id,
            awayPlayerOneId: validPlayerUsers[0].id,
            awayPlayerTwoId: validPlayerUsers[3].id,
            round: 2,
            date: new Date(startDate.getTime() + 24 * 60 * 60 * 1000), // day after start
            location: 'Test Court 2',
            status: MatchStatus.PENDING
          }
        })
      ]);
    } catch (error) {
      console.error('Error creating tournament matches:', error);
      // Continue with empty matches array
    }
  }

  // Return the complete test data set
  return {
    tournament,
    adminUser,
    playerUsers,
    matches
  };
}

/**
 * Creates a tournament for testing without any matches or participants
 * 
 * @param prisma PrismaClient instance
 * @param status Optional tournament status (defaults to ACTIVE)
 * @returns Promise resolving to the created tournament
 */
export async function createBasicTournament(
  prisma: PrismaClient, 
  status: TournamentStatus = TournamentStatus.ACTIVE
): Promise<Tournament> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 7); // 7 days from now
  
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 2); // 2 days after start
  
  const registrationEndDate = new Date(startDate);
  registrationEndDate.setDate(registrationEndDate.getDate() - 1); // 1 day before start

  const tournamentName = `Test Tournament ${Date.now()}`;

  return prisma.tournament.create({
    data: {
      name: tournamentName,
      description: 'Basic tournament for testing',
      startDate,
      endDate,
      registrationEndDate,
      location: 'Test Location',
      format: TournamentFormat.SINGLE_ELIMINATION,
      category: PlayerLevel.P3,
      status
    }
  });
}

/**
 * Adds participants to an existing tournament
 * 
 * @param prisma PrismaClient instance
 * @param tournamentId ID of the tournament to update
 * @param participantIds Array of user IDs to add as participants
 * @returns Promise resolving to the updated tournament
 */
export async function addTournamentParticipants(
  prisma: PrismaClient,
  tournamentId: string,
  participantIds: string[]
): Promise<Tournament> {
  return prisma.tournament.update({
    where: { id: tournamentId },
    data: {
      participants: {
        connect: participantIds.map(id => ({ id }))
      }
    }
  });
}

/**
 * Creates matches for an existing tournament
 * 
 * @param prisma PrismaClient instance
 * @param tournamentId ID of the tournament
 * @param playerIds Array of at least 4 player IDs to create matches with
 * @returns Promise resolving to an array of created matches
 */
export async function createTournamentMatches(
  prisma: PrismaClient,
  tournamentId: string,
  playerIds: string[]
): Promise<Match[]> {
  if (playerIds.length < 4) {
    throw new Error('At least 4 player IDs are required to create tournament matches');
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId }
  });

  if (!tournament) {
    throw new Error(`Tournament with ID ${tournamentId} not found`);
  }

  // Verify that all players exist before creating matches
  const existingPlayers = await prisma.user.findMany({
    where: {
      id: {
        in: playerIds
      }
    },
    select: {
      id: true
    }
  });

  const existingPlayerIds = existingPlayers.map(player => player.id);
  const missingPlayerIds = playerIds.filter(id => !existingPlayerIds.includes(id));

  if (missingPlayerIds.length > 0) {
    console.log(`Warning: Some players don't exist: ${missingPlayerIds.join(', ')}`);
    // Instead of failing, return empty array
    return [];
  }

  // Create two matches for the tournament
  try {
    return await Promise.all([
      prisma.match.create({
        data: {
          tournamentId,
          homePlayerOneId: playerIds[0],
          homePlayerTwoId: playerIds[1],
          awayPlayerOneId: playerIds[2],
          awayPlayerTwoId: playerIds[3],
          round: 1,
          date: tournament.startDate,
          location: 'Test Court 1',
          status: MatchStatus.PENDING
        }
      }),
      prisma.match.create({
        data: {
          tournamentId,
          homePlayerOneId: playerIds[1],
          homePlayerTwoId: playerIds[2],
          awayPlayerOneId: playerIds[0],
          awayPlayerTwoId: playerIds[3],
          round: 2,
          date: new Date(tournament.startDate.getTime() + 24 * 60 * 60 * 1000),
          location: 'Test Court 2',
          status: MatchStatus.PENDING
        }
      })
    ]);
  } catch (error) {
    console.error('Error creating tournament matches:', error);
    // Return empty array instead of throwing
    return [];
  }
}

/**
 * Adds standings (statistics) to a tournament for specific users
 * 
 * @param prisma PrismaClient instance
 * @param tournamentId ID of the tournament
 * @param userIds Array of user IDs to create statistics for
 * @returns Promise resolving to created statistics
 */
export async function createTournamentStandings(
  prisma: PrismaClient,
  tournamentId: string,
  userIds: string[]
): Promise<any[]> {
  const statsPromises = userIds.map((userId, index) => {
    return prisma.statistic.upsert({
      where: {
        userId_tournamentId: {
          userId,
          tournamentId
        }
      },
      update: {
        matchesPlayed: index + 1,
        wins: index,
        losses: 1,
        points: index * 10,
        rank: userIds.length - index
      },
      create: {
        userId,
        tournamentId,
        matchesPlayed: index + 1,
        wins: index,
        losses: 1,
        points: index * 10,
        rank: userIds.length - index
      }
    });
  });

  return Promise.all(statsPromises);
}

/**
 * Cleans up all tournament test data
 * 
 * @param prisma PrismaClient instance
 * @param tournamentId Optional specific tournament ID to clean up
 */
export async function cleanupTournamentTestData(
  prisma: PrismaClient,
  tournamentId?: string
): Promise<void> {
  try {
    if (tournamentId) {
      // Check if tournament exists before attempting deletion
      const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId }
      });
      
      if (tournament) {
        try {
          // Clean up specific tournament and related data
          await prisma.$transaction([
            prisma.statistic.deleteMany({ where: { tournamentId } }),
            prisma.match.deleteMany({ where: { tournamentId } }),
            prisma.tournament.delete({ where: { id: tournamentId } })
          ]);
          console.log(`Cleaned up tournament with ID ${tournamentId}`);
        } catch (error) {
          console.error(`Error cleaning up tournament with ID ${tournamentId}:`, error);
          // Try to delete each entity separately to ensure maximum cleanup
          await prisma.statistic.deleteMany({ where: { tournamentId } }).catch(e => console.error('Error deleting statistics:', e));
          await prisma.match.deleteMany({ where: { tournamentId } }).catch(e => console.error('Error deleting matches:', e));
          await prisma.tournament.delete({ where: { id: tournamentId } }).catch(e => console.error('Error deleting tournament:', e));
        }
      } else {
        console.log(`Tournament with ID ${tournamentId} not found, skipping cleanup`);
      }
    } else {
      // Clean up all test tournaments and related data
      try {
        await prisma.$transaction([
          prisma.statistic.deleteMany({ 
            where: { 
              tournament: { 
                name: { contains: 'Test Tournament' } 
              } 
            } 
          }),
          prisma.match.deleteMany({ 
            where: { 
              tournament: { 
                name: { contains: 'Test Tournament' } 
              } 
            } 
          }),
          prisma.tournament.deleteMany({ 
            where: { 
              name: { contains: 'Test Tournament' } 
            } 
          })
        ]);
        console.log("Cleaned up all test tournaments");
      } catch (error) {
        console.error("Error cleaning up all test tournaments:", error);
      }
    }
  } catch (error) {
    console.error("Unexpected error in cleanupTournamentTestData:", error);
  }
} 