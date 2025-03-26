import {
  GetTournamentDetailsUseCase,
  GetTournamentDetailsInput,
} from '../../../../src/core/application/use-cases/tournament/get-tournament-details.use-case';
import { ITournamentRepository } from '../../../../src/core/application/interfaces/repositories/tournament.repository';
import {
  Tournament,
  TournamentFormat,
  TournamentStatus,
  PlayerLevel,
} from '../../../../src/core/domain/tournament/tournament.entity';

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

describe('GetTournamentDetailsUseCase', () => {
  let useCase: GetTournamentDetailsUseCase;
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
      'Tournament for testing the get details use case',
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
      createDate(1, 7, 2023),
    );

    // Initialize repository with sample tournament
    tournamentRepository = new MockTournamentRepository([sampleTournament]);

    // Register some participants
    tournamentRepository.registerParticipant(existingTournamentId, 'user1');
    tournamentRepository.registerParticipant(existingTournamentId, 'user2');
    tournamentRepository.registerParticipant(existingTournamentId, 'user3');

    // Initialize use case
    useCase = new GetTournamentDetailsUseCase(tournamentRepository);
  });

  it('should retrieve tournament details successfully', async () => {
    // Setup input
    const input: GetTournamentDetailsInput = {
      tournamentId: existingTournamentId,
    };

    // Execute use case
    const result = await useCase.execute(input);

    // Assertions
    expect(result.isSuccess()).toBe(true);

    const output = result.getValue();
    expect(output.tournament).toBeDefined();
    expect(output.tournament.id).toBe(existingTournamentId);
    expect(output.tournament.name).toBe('Test Tournament');
    expect(output.tournament.format).toBe(TournamentFormat.SINGLE_ELIMINATION);
    expect(output.tournament.status).toBe(TournamentStatus.OPEN);

    // Participant info should not be included by default
    expect(output.participantCount).toBeUndefined();
    expect(output.participants).toBeUndefined();
  });

  it('should include participant information when requested', async () => {
    // Setup input with includeParticipants flag
    const input: GetTournamentDetailsInput = {
      tournamentId: existingTournamentId,
      includeParticipants: true,
    };

    // Execute use case
    const result = await useCase.execute(input);

    // Assertions
    expect(result.isSuccess()).toBe(true);

    const output = result.getValue();
    expect(output.tournament).toBeDefined();
    expect(output.tournament.id).toBe(existingTournamentId);

    // Participant info should be included
    expect(output.participantCount).toBe(3);
    expect(output.participants).toBeDefined();
    expect(output.participants!.length).toBe(3);
    expect(output.participants).toContain('user1');
    expect(output.participants).toContain('user2');
    expect(output.participants).toContain('user3');
  });

  it('should return error when tournament is not found', async () => {
    // Setup input with non-existing tournament ID
    const input: GetTournamentDetailsInput = {
      tournamentId: nonExistingTournamentId,
    };

    // Execute use case
    const result = await useCase.execute(input);

    // Assertions
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('not found');
  });

  it('should return error for invalid tournament ID format', async () => {
    // Setup input with invalid tournament ID
    const input = {
      tournamentId: invalidTournamentId,
    } as GetTournamentDetailsInput;

    // Execute use case
    const result = await useCase.execute(input);

    // Assertions
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('Invalid input');
    expect(result.getError().message).toContain('UUID');
  });
});
