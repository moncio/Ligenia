import {
  GetTournamentStandingsUseCase,
  GetTournamentStandingsInput,
} from '../../../../src/core/application/use-cases/tournament/get-tournament-standings.use-case';
import { ITournamentRepository } from '../../../../src/core/application/interfaces/repositories/tournament.repository';
import { IMatchRepository } from '../../../../src/core/application/interfaces/repositories/match.repository';
import {
  Tournament,
  TournamentFormat,
  TournamentStatus,
  PlayerLevel,
} from '../../../../src/core/domain/tournament/tournament.entity';
import { Match, MatchStatus } from '../../../../src/core/domain/match/match.entity';
import { v4 as uuidv4 } from 'uuid';

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
  countParticipantsByTournamentId: jest.fn(),
};

const mockMatchRepository: jest.Mocked<IMatchRepository> = {
  findById: jest.fn(),
  findByFilter: jest.fn(),
  findByTournamentAndRound: jest.fn(),
  findByPlayerId: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  tournamentHasMatches: jest.fn(),
  count: jest.fn(),
};

describe('GetTournamentStandingsUseCase', () => {
  let useCase: GetTournamentStandingsUseCase;
  let mockTournament: Tournament;
  let mockMatches: Match[];
  const tournamentId = uuidv4();
  const player1Id = uuidv4();
  const player2Id = uuidv4();
  const player3Id = uuidv4();
  const player4Id = uuidv4();

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create use case instance
    useCase = new GetTournamentStandingsUseCase(
      mockTournamentRepository,
      mockMatchRepository,
    );
    
    // Create mock tournament
    mockTournament = new Tournament(
      tournamentId,
      'Test Tournament',
      'A tournament for testing',
      new Date(),
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      TournamentFormat.SINGLE_ELIMINATION,
      TournamentStatus.ACTIVE,
      'Test Location',
      PlayerLevel.P3,
      32,
      new Date(),
      new Date(),
    );
    
    // Create mock matches
    mockMatches = [
      // Round 1, Match 1: Player 1 vs Player 2
      new Match(
        uuidv4(),
        tournamentId,
        player1Id,
        player1Id,
        player2Id,
        player2Id,
        1,
        new Date(),
        'Location 1',
        MatchStatus.COMPLETED,
        5, // Player 1 wins
        3,
      ),
      // Round 1, Match 2: Player 3 vs Player 4
      new Match(
        uuidv4(),
        tournamentId,
        player3Id,
        player3Id,
        player4Id,
        player4Id,
        1,
        new Date(),
        'Location 2',
        MatchStatus.COMPLETED,
        2,
        6, // Player 4 wins
      ),
      // Round 2: Player 1 vs Player 4
      new Match(
        uuidv4(),
        tournamentId,
        player1Id,
        player1Id,
        player4Id,
        player4Id,
        2,
        new Date(),
        'Final Location',
        MatchStatus.COMPLETED,
        7, // Player 1 wins the tournament
        4,
      ),
    ];
    
    // Set up repository mocks
    mockTournamentRepository.findById.mockResolvedValue(mockTournament);
    mockMatchRepository.findByFilter.mockResolvedValue(mockMatches);
  });

  it('should return tournament standings in correct order', async () => {
    // Call use case
    const input: GetTournamentStandingsInput = {
      tournamentId,
    };
    
    const result = await useCase.execute(input);
    
    // Verify success
    expect(result.isSuccess()).toBe(true);
    
    // Verify standings
    const output = result.getValue();
    expect(output.tournamentId).toBe(tournamentId);
    expect(output.tournamentName).toBe(mockTournament.name);
    expect(output.tournamentStatus).toBe(mockTournament.status);
    
    // Check standings array
    expect(output.standings).toHaveLength(4);
    
    // Check player order by points and position
    // Player 1 should be first with 2 wins (6 points)
    const player1Standing = output.standings.find(s => s.playerId === player1Id);
    expect(player1Standing).toBeDefined();
    expect(player1Standing?.position).toBe(1);
    expect(player1Standing?.wins).toBe(2);
    expect(player1Standing?.points).toBe(6);
    expect(player1Standing?.matchesPlayed).toBe(2);
    
    // Player 4 should be second with 1 win, 1 loss (3 points)
    const player4Standing = output.standings.find(s => s.playerId === player4Id);
    expect(player4Standing).toBeDefined();
    expect(player4Standing?.position).toBe(2);
    expect(player4Standing?.wins).toBe(1);
    expect(player4Standing?.losses).toBe(1);
    expect(player4Standing?.points).toBe(3);
    expect(player4Standing?.matchesPlayed).toBe(2);
    
    // Player 2 and 3 should have 0 wins, 1 loss (0 points)
    const player2Standing = output.standings.find(s => s.playerId === player2Id);
    expect(player2Standing).toBeDefined();
    expect(player2Standing?.wins).toBe(0);
    expect(player2Standing?.losses).toBe(1);
    expect(player2Standing?.points).toBe(0);
    expect(player2Standing?.matchesPlayed).toBe(1);
    
    const player3Standing = output.standings.find(s => s.playerId === player3Id);
    expect(player3Standing).toBeDefined();
    expect(player3Standing?.wins).toBe(0);
    expect(player3Standing?.losses).toBe(1);
    expect(player3Standing?.points).toBe(0);
    expect(player3Standing?.matchesPlayed).toBe(1);
  });

  it('should return error for non-existent tournament', async () => {
    // Set up repository to return null for tournament
    mockTournamentRepository.findById.mockResolvedValue(null);
    
    // Call use case
    const input: GetTournamentStandingsInput = {
      tournamentId: '00000000-0000-0000-0000-000000000000', // Valid UUID format for non-existent tournament
    };
    
    const result = await useCase.execute(input);
    
    // Verify failure
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('not found');
  });

  it('should handle tournaments with no matches', async () => {
    // Set up repository to return empty array for matches
    mockMatchRepository.findByFilter.mockResolvedValue([]);
    
    // Call use case
    const input: GetTournamentStandingsInput = {
      tournamentId,
    };
    
    const result = await useCase.execute(input);
    
    // Verify success
    expect(result.isSuccess()).toBe(true);
    
    // Verify empty standings
    const output = result.getValue();
    expect(output.tournamentId).toBe(tournamentId);
    expect(output.standings).toHaveLength(0);
  });

  it('should support pagination of standings', async () => {
    // Call use case with pagination
    const input: GetTournamentStandingsInput = {
      tournamentId,
      page: 1,
      limit: 2,
    };
    
    const result = await useCase.execute(input);
    
    // Verify success
    expect(result.isSuccess()).toBe(true);
    
    // Verify pagination
    const output = result.getValue();
    expect(output.pagination.currentPage).toBe(1);
    expect(output.pagination.itemsPerPage).toBe(2);
    expect(output.pagination.totalItems).toBe(4); // All players
    expect(output.pagination.totalPages).toBe(2); // 4 players divided by limit 2
    
    // Should only return first 2 players in standings
    expect(output.standings).toHaveLength(2);
  });
}); 