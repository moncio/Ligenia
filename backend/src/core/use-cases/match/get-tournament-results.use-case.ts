import { Match } from '../../domain/entities/match.entity';
import { IMatchRepository } from '../../domain/interfaces/match-repository.interface';
import { ITournamentRepository } from '../../domain/interfaces/tournament-repository.interface';
import { IUseCase, Result } from '../../domain/interfaces/use-case.interface';
import { MatchStatus } from '@prisma/client';

/**
 * Caso de uso para obtener los resultados de los partidos de un torneo
 */
export class GetTournamentResultsUseCase implements IUseCase<string, Match[]> {
  constructor(
    private readonly matchRepository: IMatchRepository,
    private readonly tournamentRepository: ITournamentRepository
  ) {}

  /**
   * Ejecuta el caso de uso
   * @param tournamentId ID del torneo del que se quieren obtener los resultados
   * @returns Resultado con los partidos completados del torneo o un error
   */
  async execute(tournamentId: string): Promise<Result<Match[]>> {
    try {
      // Verificar si el torneo existe
      const tournament = await this.tournamentRepository.findById(tournamentId);
      if (!tournament) {
        return Result.fail<Match[]>(new Error('El torneo no existe'));
      }

      // Obtener todos los partidos del torneo
      const matches = await this.matchRepository.findByTournament(tournamentId);
      
      // Filtrar solo los partidos completados con resultados
      const completedMatches = matches.filter(
        match => match.status === MatchStatus.COMPLETED && match.score
      );

      return Result.ok<Match[]>(completedMatches);
    } catch (error: any) {
      return Result.fail<Match[]>(new Error(`Error al obtener los resultados del torneo: ${error.message}`));
    }
  }
} 