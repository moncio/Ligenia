import { GetTournamentParticipantsUseCase, GetTournamentParticipantsInput } from '../../../../src/core/application/use-cases/tournament/get-tournament-participants.use-case';
import { ITournamentRepository } from '../../../../src/core/application/interfaces/repositories/tournament.repository';
import { Tournament, TournamentFormat, TournamentStatus, PlayerLevel } from '../../../../src/core/domain/tournament/tournament.entity';

// Mock for Tournament Repository
class MockTournamentRepository implements ITournamentRepository {
  private tournaments: Tournament[] = [];
  private participantRegistrations: Map<string, Set<string>> = new Map();

  constructor(initialTournaments: Tournament[] = []) {
    this.tournaments = initialTournaments;
    this.tournaments.forEach(tournament => {
      this.participantRegistrations.set(tournament.id, new Set<string>());
    });
  }

  async findById(id: string): Promise<Tournament | null> {
    return this.tournaments.find(t => t.id === id) || null;
  }

  async findAll(filter?: any, pagination?: any): Promise<Tournament[]> {
    return this.tournaments;
  }

  async count(): Promise<number> {
    return this.tournaments.length;
  }

  async save(tournament: Tournament): Promise<void> {
    this.tournaments.push(tournament);
    this.participantRegistrations.set(tournament.id, new Set<string>());
  }

  async update(tournament: Tournament): Promise<void> {
    const index = this.tournaments.findIndex(t => t.id === tournament.id);
    if (index !== -1) {
      this.tournaments[index] = tournament;
    }
  }

  async delete(id: string): Promise<void> {
    const index = this.tournaments.findIndex(t => t.id === id);
    if (index !== -1) {
      this.tournaments.splice(index, 1);
      this.participantRegistrations.delete(id);
    }
  }

  async countParticipants(tournamentId: string): Promise<number> {
    const participants = this.participantRegistrations.get(tournamentId);
    return participants ? participants.size : 0;
  }

  async registerParticipant(tournamentId: string, playerId: string): Promise<void> {
    const participants = this.participantRegistrations.get(tournamentId);
    if (participants) {
      participants.add(playerId);
    } else {
      this.participantRegistrations.set(tournamentId, new Set<string>([playerId]));
    }
  }

  async unregisterParticipant(tournamentId: string, playerId: string): Promise<void> {
    const participants = this.participantRegistrations.get(tournamentId);
    if (participants) {
      participants.delete(playerId);
    }
  }

  async isParticipantRegistered(tournamentId: string, playerId: string): Promise<boolean> {
    const participants = this.participantRegistrations.get(tournamentId);
    return participants ? participants.has(playerId) : false;
  }

  async getParticipants(tournamentId: string, pagination?: any): Promise<string[]> {
    const participants = this.participantRegistrations.get(tournamentId);
    if (!participants) return [];
    
    let result = Array.from(participants);
    
    // Apply pagination if specified
    if (pagination) {
      const { skip, limit } = pagination;
      result = result.slice(skip, skip + limit);
    }
    
    return result;
  }

  async countParticipantsByTournamentId(tournamentId: string): Promise<number> {
    return this.countParticipants(tournamentId);
  }
}

describe('GetTournamentParticipantsUseCase', () => {
  let useCase: GetTournamentParticipantsUseCase;
  let tournamentRepository: ITournamentRepository;
  
  const existingTournamentId = '123e4567-e89b-12d3-a456-426614174000';
  const nonExistingTournamentId = '123e4567-e89b-12d3-a456-426614174999';
  const invalidTournamentId = 'invalid-id';

  const createDate = (day: number, month: number, year: number): Date => {
    return new Date(year, month - 1, day);
  };

  beforeEach(() => {
    // Create sample tournament for testing
    const sampleTournament = new Tournament(
      existingTournamentId,
      'Test Tournament',
      'Tournament for testing the get participants use case',
      createDate(15, 7, 2023),
      createDate(20, 7, 2023),
      TournamentFormat.SINGLE_ELIMINATION,
      TournamentStatus.OPEN,
      'Madrid',
      16,
      createDate(10, 7, 2023),
      PlayerLevel.P1,
      'user1',
      createDate(1, 7, 2023),
      createDate(1, 7, 2023)
    );

    // Initialize repository with sample tournament
    tournamentRepository = new MockTournamentRepository([sampleTournament]);
    
    // Register 25 participants for testing pagination
    for (let i = 1; i <= 25; i++) {
      tournamentRepository.registerParticipant(existingTournamentId, `user${i}`);
    }
    
    // Initialize use case
    useCase = new GetTournamentParticipantsUseCase(tournamentRepository);
  });

  it('should retrieve tournament participants with default pagination', async () => {
    // Setup input with only tournamentId (default page=1, limit=10)
    const input: GetTournamentParticipantsInput = {
      tournamentId: existingTournamentId
    };
    
    // Execute use case
    const result = await useCase.execute(input);
    
    // Assertions
    expect(result.isSuccess).toBe(true);
    
    const output = result.getValue();
    expect(output.participants).toBeDefined();
    expect(output.participants.length).toBe(10);
    
    // Check pagination metadata
    expect(output.pagination.totalItems).toBe(25);
    expect(output.pagination.itemsPerPage).toBe(10);
    expect(output.pagination.currentPage).toBe(1);
    expect(output.pagination.totalPages).toBe(3); // 25 items with 10 per page = 3 pages
    expect(output.pagination.hasNextPage).toBe(true);
    expect(output.pagination.hasPreviousPage).toBe(false);
  });

  it('should retrieve tournament participants with custom pagination', async () => {
    // Setup input with custom pagination (page=2, limit=5)
    const input: GetTournamentParticipantsInput = {
      tournamentId: existingTournamentId,
      page: 2,
      limit: 5
    };
    
    // Execute use case
    const result = await useCase.execute(input);
    
    // Assertions
    expect(result.isSuccess).toBe(true);
    
    const output = result.getValue();
    expect(output.participants).toBeDefined();
    expect(output.participants.length).toBe(5);
    
    // We're expecting participants 6-10 on page 2 with limit 5
    for (let i = 0; i < output.participants.length; i++) {
      const expectedUserId = `user${i + 6}`;
      expect(output.participants).toContain(expectedUserId);
    }
    
    // Check pagination metadata
    expect(output.pagination.totalItems).toBe(25);
    expect(output.pagination.itemsPerPage).toBe(5);
    expect(output.pagination.currentPage).toBe(2);
    expect(output.pagination.totalPages).toBe(5); // 25 items with 5 per page = 5 pages
    expect(output.pagination.hasNextPage).toBe(true);
    expect(output.pagination.hasPreviousPage).toBe(true);
  });

  it('should handle the last page correctly', async () => {
    // Setup input with the last page (page=3, limit=10)
    const input: GetTournamentParticipantsInput = {
      tournamentId: existingTournamentId,
      page: 3,
      limit: 10
    };
    
    // Execute use case
    const result = await useCase.execute(input);
    
    // Assertions
    expect(result.isSuccess).toBe(true);
    
    const output = result.getValue();
    expect(output.participants).toBeDefined();
    expect(output.participants.length).toBe(5); // Last page has only 5 items
    
    // Check pagination metadata
    expect(output.pagination.totalItems).toBe(25);
    expect(output.pagination.itemsPerPage).toBe(10);
    expect(output.pagination.currentPage).toBe(3);
    expect(output.pagination.totalPages).toBe(3); // 25 items with 10 per page = 3 pages
    expect(output.pagination.hasNextPage).toBe(false);
    expect(output.pagination.hasPreviousPage).toBe(true);
  });

  it('should return empty array for a valid tournament with no participants', async () => {
    // Create a new tournament with no participants
    const emptyTournamentId = '123e4567-e89b-12d3-a456-426614174001';
    const emptyTournament = new Tournament(
      emptyTournamentId,
      'Empty Tournament',
      'Tournament with no participants',
      createDate(15, 7, 2023),
      createDate(20, 7, 2023),
      TournamentFormat.SINGLE_ELIMINATION,
      TournamentStatus.OPEN,
      'Madrid',
      16,
      createDate(10, 7, 2023),
      PlayerLevel.P1,
      'user1',
      createDate(1, 7, 2023),
      createDate(1, 7, 2023)
    );
    
    // Add the empty tournament to the repository
    await tournamentRepository.save(emptyTournament);
    
    // Setup input
    const input: GetTournamentParticipantsInput = {
      tournamentId: emptyTournamentId
    };
    
    // Execute use case
    const result = await useCase.execute(input);
    
    // Assertions
    expect(result.isSuccess).toBe(true);
    
    const output = result.getValue();
    expect(output.participants).toBeDefined();
    expect(output.participants.length).toBe(0);
    
    // Check pagination metadata
    expect(output.pagination.totalItems).toBe(0);
    expect(output.pagination.itemsPerPage).toBe(10);
    expect(output.pagination.currentPage).toBe(1);
    expect(output.pagination.totalPages).toBe(0);
    expect(output.pagination.hasNextPage).toBe(false);
    expect(output.pagination.hasPreviousPage).toBe(false);
  });

  it('should return error when tournament is not found', async () => {
    // Setup input with non-existing tournament ID
    const input: GetTournamentParticipantsInput = {
      tournamentId: nonExistingTournamentId
    };
    
    // Execute use case
    const result = await useCase.execute(input);
    
    // Assertions
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('not found');
  });

  it('should return error for invalid tournament ID format', async () => {
    // Setup input with invalid tournament ID
    const input = {
      tournamentId: invalidTournamentId
    } as GetTournamentParticipantsInput;
    
    // Execute use case
    const result = await useCase.execute(input);
    
    // Assertions
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Invalid input');
    expect(result.getError().message).toContain('UUID');
  });

  it('should return error for invalid pagination parameters', async () => {
    // Setup input with invalid page number
    const invalidPageInput = {
      tournamentId: existingTournamentId,
      page: -1
    } as GetTournamentParticipantsInput;
    
    // Execute use case
    const result = await useCase.execute(invalidPageInput);
    
    // Assertions
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Invalid input');
    
    // Setup input with invalid limit
    const invalidLimitInput = {
      tournamentId: existingTournamentId,
      limit: 101 // Max is 100
    } as GetTournamentParticipantsInput;
    
    // Execute use case
    const result2 = await useCase.execute(invalidLimitInput);
    
    // Assertions
    expect(result2.isFailure).toBe(true);
    expect(result2.getError().message).toContain('Invalid input');
  });
}); 