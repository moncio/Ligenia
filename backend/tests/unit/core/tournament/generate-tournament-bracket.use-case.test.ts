import { GenerateTournamentBracketUseCase, GenerateTournamentBracketInput } from '../../../../src/core/application/use-cases/tournament/generate-tournament-bracket.use-case';
import { ITournamentRepository } from '../../../../src/core/application/interfaces/repositories/tournament.repository';
import { IMatchRepository, MatchFilter } from '../../../../src/core/application/interfaces/repositories/match.repository';
import { IUserRepository } from '../../../../src/core/application/interfaces/repositories/user.repository';
import { Tournament, TournamentFormat, TournamentStatus, PlayerLevel } from '../../../../src/core/domain/tournament/tournament.entity';
import { User, UserRole } from '../../../../src/core/domain/user/user.entity';
import { Match } from '../../../../src/core/domain/match/match.entity';

// Mock repositories
const mockTournamentRepository: jest.Mocked<ITournamentRepository> = {
  findById: jest.fn(),
  findAll: jest.fn(),
  count: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  countParticipants: jest.fn(),
  registerParticipant: jest.fn(),
  unregisterParticipant: jest.fn(),
  isParticipantRegistered: jest.fn(),
  getParticipants: jest.fn(),
  countParticipantsByTournamentId: jest.fn()
};

const mockMatchRepository: jest.Mocked<IMatchRepository> = {
  findById: jest.fn(),
  findByFilter: jest.fn(),
  findByTournamentAndRound: jest.fn(),
  findByPlayerId: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  tournamentHasMatches: jest.fn(),
  count: jest.fn()
};

const mockUserRepository: jest.Mocked<IUserRepository> = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  save: jest.fn(),
  update: jest.fn()
};

describe('GenerateTournamentBracketUseCase', () => {
  let useCase: GenerateTournamentBracketUseCase;
  
  // Test constants
  const tournamentId = 'b8f8225b-65a3-4366-b33a-dcfec72a0cc4';
  const adminId = 'e00a5dfd-d57d-4574-96e3-99fec4bee642';
  const creatorId = '6c45b268-0bb4-4c2f-bde1-60cc075bd633';
  const regularUserId = '54872c93-74f9-4bb3-89b3-b8a4424e0082';
  
  // Participant IDs for testing
  const participants = [
    'e5e17a74-1ef6-4e3c-9efc-31e9e82a409e',
    '7a07dd47-5baf-48d6-90d5-3c9493078b9b',
    '94e9c001-3df1-4ce7-bda7-8cc25df19c23',
    'a70de1e7-8b49-4cc2-a0f7-15a0a3b51eb3',
    'bf6a2f9b-e90a-4378-983f-feeac107882e',
    'c0a9c97f-4e63-42e1-91f8-f3c072c51bfd',
    'dbfccf76-6986-4138-91b2-1d2a90d6c530',
    'd59a5c2b-0b5c-4b2c-9e3a-d9c5e290b4e1',
  ];
  
  beforeEach(() => {
    useCase = new GenerateTournamentBracketUseCase(
      mockTournamentRepository,
      mockMatchRepository,
      mockUserRepository
    );
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default mock responses
    mockTournamentRepository.findById.mockResolvedValue(createTournament(creatorId, TournamentStatus.OPEN));
    mockUserRepository.findById.mockResolvedValue(createRegularUser(regularUserId));
    mockMatchRepository.tournamentHasMatches.mockResolvedValue(false);
    mockTournamentRepository.getParticipants.mockResolvedValue(participants);
    mockMatchRepository.save.mockResolvedValue(undefined);
  });

  // Helper function to create a tournament
  function createTournament(creatorId: string, status: TournamentStatus): Tournament {
    const tournament = new Tournament(
      tournamentId,
      'Test Tournament',
      'Test Description',
      new Date(),
      new Date(),
      TournamentFormat.SINGLE_ELIMINATION,
      status,
      'Test Location',
      10,
      new Date(),
      PlayerLevel.P1,
      creatorId,
      new Date(),
      new Date()
    );
    return tournament;
  }

  // Helper function to create an admin user
  function createAdminUser(userId: string): User {
    const user = new User(
      userId,
      'admin@example.com',
      'Admin',
      'User',
      UserRole.ADMIN,
      true
    );
    return user;
  }

  // Helper function to create a regular user
  function createRegularUser(userId: string): User {
    const user = new User(
      userId,
      'user@example.com',
      'Regular',
      'User',
      UserRole.PLAYER,
      true
    );
    return user;
  }

  describe('Success cases', () => {
    it('should generate a bracket when tournament is in OPEN state and user is admin', async () => {
      // Arrange
      const input: GenerateTournamentBracketInput = {
        tournamentId,
        userId: adminId
      };
      
      mockUserRepository.findById.mockResolvedValue(createAdminUser(adminId));
      
      // Act
      const result = await useCase.execute(input);
      
      // Assert
      expect(result.isSuccess).toBe(true);
      
      if (result.isSuccess) {
        expect(result.getValue().tournamentId).toBe(tournamentId);
        expect(result.getValue().format).toBe(TournamentFormat.SINGLE_ELIMINATION);
        expect(result.getValue().matchesCreated).toBe(4); // For 8 participants, should be 4 first-round matches
        expect(mockMatchRepository.save).toHaveBeenCalledTimes(4);
      }
    });

    it('should generate a bracket when tournament is in DRAFT state and user is creator', async () => {
      // Arrange
      const input: GenerateTournamentBracketInput = {
        tournamentId,
        userId: creatorId
      };
      
      mockTournamentRepository.findById.mockResolvedValue(createTournament(creatorId, TournamentStatus.DRAFT));
      mockUserRepository.findById.mockResolvedValue(createRegularUser(creatorId));
      
      // Act
      const result = await useCase.execute(input);
      
      // Assert
      expect(result.isSuccess).toBe(true);
      
      if (result.isSuccess) {
        expect(result.getValue().tournamentId).toBe(tournamentId);
        expect(result.getValue().format).toBe(TournamentFormat.SINGLE_ELIMINATION);
        expect(result.getValue().rounds).toBe(3); // For 8 participants, should be 3 rounds
      }
    });

    it('should handle odd number of participants correctly', async () => {
      // Arrange
      const input: GenerateTournamentBracketInput = {
        tournamentId,
        userId: adminId
      };
      
      const oddParticipants = participants.slice(0, 7); // Just take 7 participants
      mockTournamentRepository.getParticipants.mockResolvedValue(oddParticipants);
      mockUserRepository.findById.mockResolvedValue(createAdminUser(adminId));
      
      // Act
      const result = await useCase.execute(input);
      
      // Assert
      expect(result.isSuccess).toBe(true);
      
      if (result.isSuccess) {
        expect(result.getValue().matchesCreated).toBe(3); // For 7 participants, should be 3 first-round matches (with 1 bye)
      }
    });

    it('should handle minimum number of participants (2)', async () => {
      // Arrange
      const input: GenerateTournamentBracketInput = {
        tournamentId,
        userId: adminId
      };
      
      const minParticipants = participants.slice(0, 2); // Just take 2 participants
      mockTournamentRepository.getParticipants.mockResolvedValue(minParticipants);
      mockUserRepository.findById.mockResolvedValue(createAdminUser(adminId));
      
      // Act
      const result = await useCase.execute(input);
      
      // Assert
      expect(result.isSuccess).toBe(true);
      
      if (result.isSuccess) {
        expect(result.getValue().matchesCreated).toBe(1); // For 2 participants, should be 1 match
        expect(result.getValue().rounds).toBe(1); // Only 1 round needed
      }
    });
  });

  describe('Failure cases', () => {
    it('should fail if tournament does not exist', async () => {
      // Arrange
      const input: GenerateTournamentBracketInput = {
        tournamentId,
        userId: adminId
      };
      
      mockTournamentRepository.findById.mockResolvedValue(null);
      
      // Act
      const result = await useCase.execute(input);
      
      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Tournament with ID');
      expect(result.getError().message).toContain('not found');
    });

    it('should fail if user does not exist', async () => {
      // Arrange
      const input: GenerateTournamentBracketInput = {
        tournamentId,
        userId: adminId
      };
      
      mockUserRepository.findById.mockResolvedValue(null);
      
      // Act
      const result = await useCase.execute(input);
      
      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('User with ID');
      expect(result.getError().message).toContain('not found');
    });

    it('should fail if user is not admin or creator', async () => {
      // Arrange
      const input: GenerateTournamentBracketInput = {
        tournamentId,
        userId: regularUserId
      };
      
      // Act
      const result = await useCase.execute(input);
      
      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Only admins or the tournament creator');
    });

    it('should fail if tournament is not in DRAFT or OPEN state', async () => {
      // Arrange
      const input: GenerateTournamentBracketInput = {
        tournamentId,
        userId: adminId
      };
      
      mockUserRepository.findById.mockResolvedValue(createAdminUser(adminId));
      mockTournamentRepository.findById.mockResolvedValue(
        createTournament(creatorId, TournamentStatus.ACTIVE)
      );
      
      // Act
      const result = await useCase.execute(input);
      
      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Cannot generate bracket for a tournament in ACTIVE state');
    });

    it('should fail if tournament already has matches', async () => {
      // Arrange
      const input: GenerateTournamentBracketInput = {
        tournamentId,
        userId: adminId
      };
      
      mockUserRepository.findById.mockResolvedValue(createAdminUser(adminId));
      mockMatchRepository.tournamentHasMatches.mockResolvedValue(true);
      
      // Act
      const result = await useCase.execute(input);
      
      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Tournament already has matches');
    });

    it('should fail if tournament has less than 2 participants', async () => {
      // Arrange
      const input: GenerateTournamentBracketInput = {
        tournamentId,
        userId: adminId
      };
      
      mockUserRepository.findById.mockResolvedValue(createAdminUser(adminId));
      mockTournamentRepository.getParticipants.mockResolvedValue([participants[0]]);
      
      // Act
      const result = await useCase.execute(input);
      
      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Tournament needs at least 2 participants');
    });

    it('should fail if input validation fails', async () => {
      // Arrange
      const input = {
        tournamentId: 'invalid-uuid',
        userId: adminId
      } as GenerateTournamentBracketInput;
      
      // Act
      const result = await useCase.execute(input);
      
      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Invalid input');
    });

    it('should fail if an error occurs during match creation', async () => {
      // Arrange
      const input: GenerateTournamentBracketInput = {
        tournamentId,
        userId: adminId
      };
      
      mockUserRepository.findById.mockResolvedValue(createAdminUser(adminId));
      mockMatchRepository.save.mockRejectedValue(new Error('Database error during match save'));
      
      // Act
      const result = await useCase.execute(input);
      
      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Database error during match save');
    });
  });

  describe('Integration with Start Tournament', () => {
    // This test would ideally be in an integration test, but we'll mock it here
    it('should generate a bracket as part of starting a tournament', async () => {
      // This would be a more comprehensive integration test with StartTournamentUseCase
      // Here we simply verify that our use case has the correct boundaries to be called by
      // the StartTournamentUseCase (correct input parameters, etc.)
      
      // Arrange
      const input: GenerateTournamentBracketInput = {
        tournamentId,
        userId: adminId
      };
      
      mockUserRepository.findById.mockResolvedValue(createAdminUser(adminId));
      
      // Act
      const result = await useCase.execute(input);
      
      // Assert
      expect(result.isSuccess).toBe(true);
      
      // Verify that we generate the correct structure expected by the tournament start process
      if (result.isSuccess) {
        expect(result.getValue()).toHaveProperty('tournamentId');
        expect(result.getValue()).toHaveProperty('format');
        expect(result.getValue()).toHaveProperty('rounds');
        expect(result.getValue()).toHaveProperty('matchesCreated');
      }
    });
  });
}); 