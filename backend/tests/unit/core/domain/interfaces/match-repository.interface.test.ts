import { IMatchRepository } from '../../../../../src/core/domain/interfaces/match-repository.interface';
import { Match } from '../../../../../src/core/domain/entities/match.entity';

// Mock implementation of the repository interface
class MockMatchRepository implements IMatchRepository {
  findById = jest.fn();
  findAll = jest.fn();
  create = jest.fn();
  update = jest.fn();
  delete = jest.fn();
  findByTournament = jest.fn();
  findByTeam = jest.fn();
  findPaginated = jest.fn();
  count = jest.fn();
  findAllPaginated = jest.fn();
}

describe('IMatchRepository Interface', () => {
  let repository: IMatchRepository;

  beforeEach(() => {
    repository = new MockMatchRepository();
  });

  it('should have findByTournament method', () => {
    expect(repository.findByTournament).toBeDefined();
  });

  it('should have findByTeam method', () => {
    expect(repository.findByTeam).toBeDefined();
  });

  it('should call findByTournament with correct parameters', async () => {
    const tournamentId = 'tournament-123';
    await repository.findByTournament(tournamentId);
    expect(repository.findByTournament).toHaveBeenCalledWith(tournamentId);
  });

  it('should call findByTeam with correct parameters', async () => {
    const teamId = 'team-1';
    await repository.findByTeam(teamId);
    expect(repository.findByTeam).toHaveBeenCalledWith(teamId);
  });
}); 