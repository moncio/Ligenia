import { ITeamRepository } from '../../../../../src/core/domain/interfaces/team-repository.interface';
import { Team } from '../../../../../src/core/domain/entities/team.entity';

// Mock implementation of the repository interface
class MockTeamRepository implements ITeamRepository {
  findById = jest.fn();
  findAll = jest.fn();
  create = jest.fn();
  update = jest.fn();
  delete = jest.fn();
  findByTournament = jest.fn();
  existsByNameInTournament = jest.fn();
  findPaginated = jest.fn();
  count = jest.fn();
}

describe('ITeamRepository Interface', () => {
  let repository: ITeamRepository;

  beforeEach(() => {
    repository = new MockTeamRepository();
  });

  it('should have findByTournament method', () => {
    expect(repository.findByTournament).toBeDefined();
  });

  it('should have existsByNameInTournament method', () => {
    expect(repository.existsByNameInTournament).toBeDefined();
  });

  it('should call findByTournament with correct parameters', async () => {
    const tournamentId = 'tournament-123';
    await repository.findByTournament(tournamentId);
    expect(repository.findByTournament).toHaveBeenCalledWith(tournamentId);
  });

  it('should call existsByNameInTournament with correct parameters', async () => {
    const name = 'Team Name';
    const tournamentId = 'tournament-123';
    await repository.existsByNameInTournament(name, tournamentId);
    expect(repository.existsByNameInTournament).toHaveBeenCalledWith(name, tournamentId);
  });
}); 