import { ListTournamentsUseCase, ListTournamentsInput } from '../../../../src/core/application/use-cases/tournament/list-tournaments.use-case';
import { ITournamentRepository, TournamentFilter, PaginationOptions } from '../../../../src/core/application/interfaces/repositories/tournament.repository';
import { Tournament, TournamentFormat, TournamentStatus, PlayerLevel } from '../../../../src/core/domain/tournament/tournament.entity';
import { Result } from '../../../../src/shared/result';

// Mock for Tournament Repository with pagination and filtering support
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

  async findAll(filter?: TournamentFilter, pagination?: PaginationOptions): Promise<Tournament[]> {
    let result = this.tournaments;

    // Apply filters
    if (filter) {
      // Filter by status
      if (filter.status) {
        result = result.filter(t => t.status === filter.status);
      }

      // Filter by category
      if (filter.category) {
        result = result.filter(t => t.category === filter.category);
      }

      // Filter by date range
      if (filter.dateRange) {
        if (filter.dateRange.from) {
          result = result.filter(t => t.startDate >= filter.dateRange!.from!);
        }
        if (filter.dateRange.to) {
          result = result.filter(t => t.startDate <= filter.dateRange!.to!);
        }
      }

      // Filter by search term (name or location)
      if (filter.searchTerm) {
        const term = filter.searchTerm.toLowerCase();
        result = result.filter(t => 
          t.name.toLowerCase().includes(term) || 
          (t.location && t.location.toLowerCase().includes(term))
        );
      }
    }

    // Apply sorting
    if (pagination?.sort) {
      const { field, order } = pagination.sort;
      
      if (field === 'startDate') {
        result = [...result].sort((a, b) => {
          if (order === 'asc') {
            return a.startDate.getTime() - b.startDate.getTime();
          } else {
            return b.startDate.getTime() - a.startDate.getTime();
          }
        });
      }
    }

    // Apply pagination
    if (pagination) {
      const { skip, limit } = pagination;
      result = result.slice(skip, skip + limit);
    }

    return result;
  }

  async count(filter?: TournamentFilter): Promise<number> {
    // We reuse the filtering logic but return the count instead
    const result = await this.findAll(filter);
    return result.length;
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

  async getParticipants(tournamentId: string, pagination?: PaginationOptions): Promise<string[]> {
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

describe('ListTournamentsUseCase', () => {
  let useCase: ListTournamentsUseCase;
  let tournamentRepository: ITournamentRepository;

  const createDate = (day: number, month: number, year: number): Date => {
    return new Date(year, month - 1, day);
  };

  beforeEach(() => {
    // Create sample tournaments for testing
    const sampleTournaments = [
      // OPEN tournaments
      new Tournament(
        '1',
        'Open Tournament 1',
        'First open tournament for testing',
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
      ),
      new Tournament(
        '2',
        'Open Tournament 2',
        'Second open tournament for testing',
        createDate(20, 8, 2023),
        createDate(25, 8, 2023),
        TournamentFormat.DOUBLE_ELIMINATION,
        TournamentStatus.OPEN,
        'Barcelona',
        32,
        createDate(15, 8, 2023),
        PlayerLevel.P2,
        'user1',
        createDate(5, 8, 2023),
        createDate(5, 8, 2023)
      ),
      // ACTIVE tournaments
      new Tournament(
        '3',
        'Active Tournament',
        'Active tournament for testing',
        createDate(10, 6, 2023),
        createDate(15, 6, 2023),
        TournamentFormat.SINGLE_ELIMINATION,
        TournamentStatus.ACTIVE,
        'Seville',
        16,
        createDate(5, 6, 2023),
        PlayerLevel.P3,
        'user2',
        createDate(1, 6, 2023),
        createDate(1, 6, 2023)
      ),
      // COMPLETED tournaments
      new Tournament(
        '4',
        'Completed Tournament',
        'Completed tournament for testing',
        createDate(1, 5, 2023),
        createDate(5, 5, 2023),
        TournamentFormat.ROUND_ROBIN,
        TournamentStatus.COMPLETED,
        'Valencia',
        8,
        createDate(25, 4, 2023),
        PlayerLevel.P1,
        'user3',
        createDate(20, 4, 2023),
        createDate(20, 4, 2023)
      ),
      // CANCELLED tournaments
      new Tournament(
        '5',
        'Cancelled Tournament',
        'Cancelled tournament for testing',
        createDate(10, 9, 2023),
        createDate(15, 9, 2023),
        TournamentFormat.SINGLE_ELIMINATION,
        TournamentStatus.CANCELLED,
        'Malaga',
        16,
        createDate(5, 9, 2023),
        PlayerLevel.P2,
        'user2',
        createDate(1, 9, 2023),
        createDate(1, 9, 2023)
      ),
      // More tournaments for pagination testing
      new Tournament(
        '6',
        'Summer Open P1',
        'Summer tournament for P1 players',
        createDate(1, 7, 2023),
        createDate(10, 7, 2023),
        TournamentFormat.SINGLE_ELIMINATION,
        TournamentStatus.OPEN,
        'Madrid',
        32,
        createDate(25, 6, 2023),
        PlayerLevel.P1,
        'user1',
        createDate(20, 6, 2023),
        createDate(20, 6, 2023)
      ),
      new Tournament(
        '7',
        'Summer Open P2',
        'Summer tournament for P2 players',
        createDate(15, 7, 2023),
        createDate(25, 7, 2023),
        TournamentFormat.DOUBLE_ELIMINATION,
        TournamentStatus.OPEN,
        'Barcelona',
        16,
        createDate(10, 7, 2023),
        PlayerLevel.P2,
        'user2',
        createDate(5, 7, 2023),
        createDate(5, 7, 2023)
      ),
      new Tournament(
        '8',
        'Fall Open P3',
        'Fall tournament for P3 players',
        createDate(10, 10, 2023),
        createDate(20, 10, 2023),
        TournamentFormat.SWISS,
        TournamentStatus.OPEN,
        'Valencia',
        24,
        createDate(5, 10, 2023),
        PlayerLevel.P3,
        'user3',
        createDate(1, 10, 2023),
        createDate(1, 10, 2023)
      ),
      new Tournament(
        '9',
        'Winter Championship',
        'Winter championship for all players',
        createDate(5, 12, 2023),
        createDate(15, 12, 2023),
        TournamentFormat.SINGLE_ELIMINATION,
        TournamentStatus.DRAFT,
        'Madrid',
        64,
        createDate(1, 12, 2023),
        PlayerLevel.P1,
        'user1',
        createDate(20, 11, 2023),
        createDate(20, 11, 2023)
      ),
      new Tournament(
        '10',
        'New Year Tournament',
        'New Year tournament to start 2024',
        createDate(5, 1, 2024),
        createDate(15, 1, 2024),
        TournamentFormat.ROUND_ROBIN,
        TournamentStatus.DRAFT,
        'Barcelona',
        16,
        createDate(1, 1, 2024),
        PlayerLevel.P2,
        'user2',
        createDate(20, 12, 2023),
        createDate(20, 12, 2023)
      ),
    ];

    // Initialize repository with sample tournaments
    tournamentRepository = new MockTournamentRepository(sampleTournaments);
    
    // Initialize use case
    useCase = new ListTournamentsUseCase(tournamentRepository);
  });

  it('should list tournaments with default pagination', async () => {
    // Default pagination: page=1, limit=10
    const input: ListTournamentsInput = {};
    const result = await useCase.execute(input);

    // Expect success
    expect(result.isSuccess).toBe(true);
    
    // Check response content
    const output = result.getValue();
    
    // Should return all 10 tournaments (default limit is 10)
    expect(output.tournaments.length).toBe(10);
    
    // Check pagination metadata
    expect(output.pagination.totalItems).toBe(10);
    expect(output.pagination.itemsPerPage).toBe(10);
    expect(output.pagination.currentPage).toBe(1);
    expect(output.pagination.totalPages).toBe(1);
    expect(output.pagination.hasNextPage).toBe(false);
    expect(output.pagination.hasPreviousPage).toBe(false);
  });

  it('should paginate tournaments correctly', async () => {
    // Request page 1 with limit 3
    const input: ListTournamentsInput = {
      page: 1,
      limit: 3
    };
    
    const result = await useCase.execute(input);
    expect(result.isSuccess).toBe(true);
    
    const output = result.getValue();
    
    // Should return 3 tournaments
    expect(output.tournaments.length).toBe(3);
    
    // Check pagination metadata
    expect(output.pagination.totalItems).toBe(10);
    expect(output.pagination.itemsPerPage).toBe(3);
    expect(output.pagination.currentPage).toBe(1);
    expect(output.pagination.totalPages).toBe(4); // 10 items / 3 per page = 4 pages (3+3+3+1)
    expect(output.pagination.hasNextPage).toBe(true);
    expect(output.pagination.hasPreviousPage).toBe(false);
    
    // Request page 2 with limit 3
    const inputPage2: ListTournamentsInput = {
      page: 2,
      limit: 3
    };
    
    const resultPage2 = await useCase.execute(inputPage2);
    expect(resultPage2.isSuccess).toBe(true);
    
    const outputPage2 = resultPage2.getValue();
    
    // Should return 3 different tournaments
    expect(outputPage2.tournaments.length).toBe(3);
    expect(outputPage2.tournaments[0].id).not.toBe(output.tournaments[0].id);
    
    // Check pagination metadata
    expect(outputPage2.pagination.currentPage).toBe(2);
    expect(outputPage2.pagination.hasNextPage).toBe(true);
    expect(outputPage2.pagination.hasPreviousPage).toBe(true);
  });

  it('should filter tournaments by status', async () => {
    // Filter by OPEN status
    const input: ListTournamentsInput = {
      status: TournamentStatus.OPEN
    };
    
    const result = await useCase.execute(input);
    expect(result.isSuccess).toBe(true);
    
    const output = result.getValue();
    
    // Should return only OPEN tournaments
    expect(output.tournaments.length).toBe(5);
    output.tournaments.forEach(tournament => {
      expect(tournament.status).toBe(TournamentStatus.OPEN);
    });
  });

  it('should filter tournaments by category', async () => {
    // Filter by P1 category
    const input: ListTournamentsInput = {
      category: PlayerLevel.P1
    };
    
    const result = await useCase.execute(input);
    expect(result.isSuccess).toBe(true);
    
    const output = result.getValue();
    
    // Should return only P1 tournaments
    expect(output.tournaments.length).toBe(4);
    output.tournaments.forEach(tournament => {
      expect(tournament.category).toBe(PlayerLevel.P1);
    });
  });

  it('should filter tournaments by date range', async () => {
    // Filter tournaments in July 2023
    const input: ListTournamentsInput = {
      startDateFrom: '2023-07-01T00:00:00.000Z',
      startDateTo: '2023-07-31T23:59:59.999Z'
    };
    
    const result = await useCase.execute(input);
    expect(result.isSuccess).toBe(true);
    
    const output = result.getValue();
    
    // Should return only tournaments starting in July 2023
    expect(output.tournaments.length).toBe(2);
    output.tournaments.forEach(tournament => {
      const month = tournament.startDate.getMonth() + 1; // JavaScript months are 0-indexed
      const year = tournament.startDate.getFullYear();
      expect(month).toBe(7);
      expect(year).toBe(2023);
    });
  });

  it('should filter tournaments by search term', async () => {
    // Search for tournaments with "Summer" in the name
    const input: ListTournamentsInput = {
      searchTerm: 'Summer'
    };
    
    const result = await useCase.execute(input);
    expect(result.isSuccess).toBe(true);
    
    const output = result.getValue();
    
    // Should return only tournaments with "Summer" in the name
    expect(output.tournaments.length).toBe(2);
    output.tournaments.forEach(tournament => {
      expect(tournament.name.includes('Summer')).toBe(true);
    });
  });

  it('should sort tournaments by start date', async () => {
    // Sort tournaments by start date in ascending order
    const inputAsc: ListTournamentsInput = {
      sortBy: 'startDate',
      sortOrder: 'asc'
    };
    
    const resultAsc = await useCase.execute(inputAsc);
    expect(resultAsc.isSuccess).toBe(true);
    
    const outputAsc = resultAsc.getValue();
    
    // Check if sorted in ascending order
    for (let i = 1; i < outputAsc.tournaments.length; i++) {
      expect(outputAsc.tournaments[i].startDate.getTime()).toBeGreaterThanOrEqual(
        outputAsc.tournaments[i-1].startDate.getTime()
      );
    }
    
    // Sort tournaments by start date in descending order
    const inputDesc: ListTournamentsInput = {
      sortBy: 'startDate',
      sortOrder: 'desc'
    };
    
    const resultDesc = await useCase.execute(inputDesc);
    expect(resultDesc.isSuccess).toBe(true);
    
    const outputDesc = resultDesc.getValue();
    
    // Check if sorted in descending order
    for (let i = 1; i < outputDesc.tournaments.length; i++) {
      expect(outputDesc.tournaments[i].startDate.getTime()).toBeLessThanOrEqual(
        outputDesc.tournaments[i-1].startDate.getTime()
      );
    }
  });

  it('should combine multiple filters', async () => {
    // Filter by OPEN status, P2 category, and containing "Summer" in the name
    const input: ListTournamentsInput = {
      status: TournamentStatus.OPEN,
      category: PlayerLevel.P2,
      searchTerm: 'Summer'
    };
    
    const result = await useCase.execute(input);
    expect(result.isSuccess).toBe(true);
    
    const output = result.getValue();
    
    // Should return only tournaments matching all criteria
    expect(output.tournaments.length).toBe(1);
    expect(output.tournaments[0].status).toBe(TournamentStatus.OPEN);
    expect(output.tournaments[0].category).toBe(PlayerLevel.P2);
    expect(output.tournaments[0].name.includes('Summer')).toBe(true);
  });

  it('should handle invalid page number', async () => {
    // Try with an invalid page number
    const input: ListTournamentsInput = {
      page: -1 // Invalid: page must be positive
    };
    
    const result = await useCase.execute(input);
    
    // Expect failure
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Invalid input');
  });

  it('should handle invalid date format', async () => {
    // Try with an invalid date format
    const input = {
      startDateFrom: 'invalid-date' // Invalid date format
    } as ListTournamentsInput;
    
    const result = await useCase.execute(input);
    
    // Expect failure
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Invalid input');
  });
}); 