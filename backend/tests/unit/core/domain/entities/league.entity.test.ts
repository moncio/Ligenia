import { League } from '../../../../../src/core/domain/entities/league.entity';
import { ScoringType } from '@prisma/client';

describe('League Entity', () => {
  it('should create a valid league', () => {
    const leagueData = {
      id: '1',
      name: 'Test League',
      adminId: 'admin-123',
      scoringType: ScoringType.STANDARD,
      description: 'Test description',
      logoUrl: 'https://example.com/logo.png',
      isPublic: true,
      creationDate: new Date(),
    };

    const league = new League(leagueData);

    expect(league.id).toBe(leagueData.id);
    expect(league.name).toBe(leagueData.name);
    expect(league.adminId).toBe(leagueData.adminId);
    expect(league.scoringType).toBe(leagueData.scoringType);
    expect(league.description).toBe(leagueData.description);
    expect(league.logoUrl).toBe(leagueData.logoUrl);
    expect(league.isPublic).toBe(leagueData.isPublic);
    expect(league.creationDate).toBe(leagueData.creationDate);
    expect(league.createdAt).toBeInstanceOf(Date);
    expect(league.updatedAt).toBeInstanceOf(Date);
  });

  it('should create a league with default values', () => {
    const leagueData = {
      id: '1',
      name: 'Test League',
      adminId: 'admin-123',
      scoringType: ScoringType.STANDARD,
    };

    const league = new League(leagueData);

    expect(league.id).toBe(leagueData.id);
    expect(league.name).toBe(leagueData.name);
    expect(league.adminId).toBe(leagueData.adminId);
    expect(league.scoringType).toBe(leagueData.scoringType);
    expect(league.description).toBeUndefined();
    expect(league.logoUrl).toBeUndefined();
    expect(league.isPublic).toBe(true); // Valor por defecto
    expect(league.creationDate).toBeInstanceOf(Date);
    expect(league.createdAt).toBeInstanceOf(Date);
    expect(league.updatedAt).toBeInstanceOf(Date);
  });

  describe('validate', () => {
    it('should validate a valid league', () => {
      const league = new League({
        id: '1',
        name: 'Test League',
        adminId: 'admin-123',
        scoringType: ScoringType.STANDARD,
      });

      expect(() => league.validate()).not.toThrow();
    });

    it('should throw error if name is empty', () => {
      const league = new League({
        id: '1',
        name: '',
        adminId: 'admin-123',
        scoringType: ScoringType.STANDARD,
      });

      expect(() => league.validate()).toThrow('El nombre de la liga es obligatorio');
    });

    it('should throw error if name is too long', () => {
      const league = new League({
        id: '1',
        name: 'a'.repeat(101),
        adminId: 'admin-123',
        scoringType: ScoringType.STANDARD,
      });

      expect(() => league.validate()).toThrow('El nombre de la liga no puede tener más de 100 caracteres');
    });

    it('should throw error if adminId is missing', () => {
      const league = new League({
        id: '1',
        name: 'Test League',
        adminId: '',
        scoringType: ScoringType.STANDARD,
      });

      expect(() => league.validate()).toThrow('El administrador de la liga es obligatorio');
    });

    it('should throw error if scoringType is invalid', () => {
      const league = new League({
        id: '1',
        name: 'Test League',
        adminId: 'admin-123',
        scoringType: 'INVALID' as ScoringType,
      });

      expect(() => league.validate()).toThrow('El tipo de puntuación no es válido');
    });
  });
}); 