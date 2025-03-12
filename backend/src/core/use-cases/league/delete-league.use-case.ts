import { IUseCase, Result } from '../../domain/interfaces/use-case.interface';
import { ILeagueRepository } from '../../domain/interfaces/league-repository.interface';
import { ITournamentRepository } from '../../domain/interfaces/tournament-repository.interface';

/**
 * Caso de uso para eliminar una liga
 */
export class DeleteLeagueUseCase implements IUseCase<string, boolean> {
  constructor(
    private readonly leagueRepository: ILeagueRepository,
    private readonly tournamentRepository: ITournamentRepository
  ) {}

  /**
   * Ejecuta el caso de uso
   * @param id ID de la liga a eliminar
   * @returns Resultado con true si se eliminó correctamente o un error
   */
  async execute(id: string): Promise<Result<boolean>> {
    try {
      // Verificar si la liga existe
      const existingLeague = await this.leagueRepository.findById(id);
      if (!existingLeague) {
        return Result.fail(new Error('La liga no existe'));
      }

      // Verificar si la liga tiene torneos asociados
      const tournaments = await this.tournamentRepository.findByLeague(id);
      if (tournaments.length > 0) {
        return Result.fail(new Error('No se puede eliminar la liga porque tiene torneos asociados'));
      }

      // Eliminar la liga
      const deleted = await this.leagueRepository.delete(id);
      if (!deleted) {
        return Result.fail(new Error('No se pudo eliminar la liga'));
      }

      return Result.ok(true);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error : new Error('Error al eliminar la liga')
      );
    }
  }
} 