import { Match } from '../../../../../src/core/domain/entities/match.entity';
import { MatchStatus } from '@prisma/client';

describe('Match Entity', () => {
  it('should create a valid match', () => {
    const scheduledDate = new Date();
    const matchData = {
      id: '1',
      tournamentId: 'tournament-123',
      team1Id: 'team-1',
      team2Id: 'team-2',
      scheduledDate,
      courtId: 'court-1',
      status: MatchStatus.SCHEDULED,
      score: { sets: [{ team1: 6, team2: 4 }, { team1: 6, team2: 3 }] },
      notes: 'Test match notes',
      round: 1,
      matchNumber: 1,
    };

    const match = new Match(matchData);

    expect(match.id).toBe(matchData.id);
    expect(match.tournamentId).toBe(matchData.tournamentId);
    expect(match.team1Id).toBe(matchData.team1Id);
    expect(match.team2Id).toBe(matchData.team2Id);
    expect(match.scheduledDate).toBe(matchData.scheduledDate);
    expect(match.courtId).toBe(matchData.courtId);
    expect(match.status).toBe(matchData.status);
    expect(match.score).toEqual(matchData.score);
    expect(match.notes).toBe(matchData.notes);
    expect(match.round).toBe(matchData.round);
    expect(match.matchNumber).toBe(matchData.matchNumber);
    expect(match.createdAt).toBeInstanceOf(Date);
    expect(match.updatedAt).toBeInstanceOf(Date);
  });

  it('should create a match with default values', () => {
    const scheduledDate = new Date();
    const matchData = {
      id: '1',
      tournamentId: 'tournament-123',
      team1Id: 'team-1',
      team2Id: 'team-2',
      scheduledDate,
    };

    const match = new Match(matchData);

    expect(match.id).toBe(matchData.id);
    expect(match.tournamentId).toBe(matchData.tournamentId);
    expect(match.team1Id).toBe(matchData.team1Id);
    expect(match.team2Id).toBe(matchData.team2Id);
    expect(match.scheduledDate).toBe(matchData.scheduledDate);
    expect(match.courtId).toBeUndefined();
    expect(match.status).toBe(MatchStatus.SCHEDULED); // Valor por defecto
    expect(match.score).toBeUndefined();
    expect(match.notes).toBeUndefined();
    expect(match.round).toBeUndefined();
    expect(match.matchNumber).toBeUndefined();
    expect(match.createdAt).toBeInstanceOf(Date);
    expect(match.updatedAt).toBeInstanceOf(Date);
  });

  describe('validate', () => {
    it('should validate a valid match', () => {
      const match = new Match({
        id: '1',
        tournamentId: 'tournament-123',
        team1Id: 'team-1',
        team2Id: 'team-2',
        scheduledDate: new Date(),
        status: MatchStatus.SCHEDULED,
      });

      expect(() => match.validate()).not.toThrow();
    });

    it('should throw error if tournamentId is missing', () => {
      const match = new Match({
        id: '1',
        tournamentId: '',
        team1Id: 'team-1',
        team2Id: 'team-2',
        scheduledDate: new Date(),
        status: MatchStatus.SCHEDULED,
      });

      expect(() => match.validate()).toThrow('El torneo al que pertenece el partido es obligatorio');
    });

    it('should throw error if team1Id is missing', () => {
      const match = new Match({
        id: '1',
        tournamentId: 'tournament-123',
        team1Id: '',
        team2Id: 'team-2',
        scheduledDate: new Date(),
        status: MatchStatus.SCHEDULED,
      });

      expect(() => match.validate()).toThrow('El equipo 1 es obligatorio');
    });

    it('should throw error if team2Id is missing', () => {
      const match = new Match({
        id: '1',
        tournamentId: 'tournament-123',
        team1Id: 'team-1',
        team2Id: '',
        scheduledDate: new Date(),
        status: MatchStatus.SCHEDULED,
      });

      expect(() => match.validate()).toThrow('El equipo 2 es obligatorio');
    });

    it('should throw error if scheduledDate is missing', () => {
      const match = new Match({
        id: '1',
        tournamentId: 'tournament-123',
        team1Id: 'team-1',
        team2Id: 'team-2',
        scheduledDate: null as unknown as Date,
        status: MatchStatus.SCHEDULED,
      });

      expect(() => match.validate()).toThrow('La fecha programada del partido es obligatoria');
    });

    it('should throw error if status is invalid', () => {
      const match = new Match({
        id: '1',
        tournamentId: 'tournament-123',
        team1Id: 'team-1',
        team2Id: 'team-2',
        scheduledDate: new Date(),
        status: 'INVALID' as MatchStatus,
      });

      expect(() => match.validate()).toThrow('El estado del partido no es válido');
    });

    it('should throw error if team1Id and team2Id are the same', () => {
      const match = new Match({
        id: '1',
        tournamentId: 'tournament-123',
        team1Id: 'team-1',
        team2Id: 'team-1',
        scheduledDate: new Date(),
        status: MatchStatus.SCHEDULED,
      });

      expect(() => match.validate()).toThrow('Los equipos no pueden ser iguales');
    });
  });
}); 