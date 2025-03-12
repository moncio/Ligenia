import { Team } from '../../../../../src/core/domain/entities/team.entity';

describe('Team Entity', () => {
  it('should create a valid team', () => {
    const teamData = {
      id: '1',
      name: 'Test Team',
      tournamentId: '123',
      players: ['player1', 'player2'],
      ranking: 100,
      logoUrl: 'https://example.com/logo.png',
    };

    const team = new Team(teamData);

    expect(team.id).toBe(teamData.id);
    expect(team.name).toBe(teamData.name);
    expect(team.tournamentId).toBe(teamData.tournamentId);
    expect(team.players).toEqual(teamData.players);
    expect(team.ranking).toBe(teamData.ranking);
    expect(team.logoUrl).toBe(teamData.logoUrl);
    expect(team.createdAt).toBeInstanceOf(Date);
    expect(team.updatedAt).toBeInstanceOf(Date);
  });

  it('should create a team with default values', () => {
    const teamData = {
      id: '1',
      name: 'Test Team',
      tournamentId: '123',
      players: ['player1', 'player2'],
    };

    const team = new Team(teamData);

    expect(team.id).toBe(teamData.id);
    expect(team.name).toBe(teamData.name);
    expect(team.tournamentId).toBe(teamData.tournamentId);
    expect(team.players).toEqual(teamData.players);
    expect(team.ranking).toBeUndefined();
    expect(team.logoUrl).toBeUndefined();
    expect(team.createdAt).toBeInstanceOf(Date);
    expect(team.updatedAt).toBeInstanceOf(Date);
  });

  describe('validate', () => {
    it('should validate a valid team', () => {
      const team = new Team({
        id: '1',
        name: 'Test Team',
        tournamentId: '123',
        players: ['player1', 'player2'],
      });

      expect(() => team.validate()).not.toThrow();
    });

    it('should throw error if name is empty', () => {
      const team = new Team({
        id: '1',
        name: '',
        tournamentId: '123',
        players: ['player1', 'player2'],
      });

      expect(() => team.validate()).toThrow('El nombre del equipo es obligatorio');
    });

    it('should throw error if name is too long', () => {
      const team = new Team({
        id: '1',
        name: 'a'.repeat(101),
        tournamentId: '123',
        players: ['player1', 'player2'],
      });

      expect(() => team.validate()).toThrow('El nombre del equipo no puede tener más de 100 caracteres');
    });

    it('should throw error if tournamentId is missing', () => {
      const team = new Team({
        id: '1',
        name: 'Test Team',
        tournamentId: '',
        players: ['player1', 'player2'],
      });

      expect(() => team.validate()).toThrow('El torneo al que pertenece el equipo es obligatorio');
    });

    it('should throw error if players array is empty', () => {
      const team = new Team({
        id: '1',
        name: 'Test Team',
        tournamentId: '123',
        players: [],
      });

      expect(() => team.validate()).toThrow('El equipo debe tener al menos un jugador');
    });

    it('should throw error if players array has more than 2 players', () => {
      const team = new Team({
        id: '1',
        name: 'Test Team',
        tournamentId: '123',
        players: ['player1', 'player2', 'player3'],
      });

      expect(() => team.validate()).toThrow('El equipo no puede tener más de 2 jugadores');
    });
  });
}); 