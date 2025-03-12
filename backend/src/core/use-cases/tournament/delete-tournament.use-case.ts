import { IUseCase, Result } from '../../domain/interfaces/use-case.interface';
import { ITournamentRepository } from '../../domain/interfaces/tournament-repository.interface';

export class DeleteTournamentUseCase implements IUseCase<string, boolean> {
  constructor(private readonly tournamentRepository: ITournamentRepository) {}

  /**
   * Elimina un torneo por su ID
   * @param id ID del torneo a eliminar
   * @returns Result con true si se eliminó correctamente, o un error si no se pudo eliminar
   */
  async execute(id: string): Promise<Result<boolean>> {
    try {
      // Verificar si el torneo existe
      const existingTournament = await this.tournamentRepository.findById(id);
      if (!existingTournament) {
        return Result.fail<boolean>(new Error('El torneo no existe'));
      }

      // Eliminar el torneo
      const deleted = await this.tournamentRepository.delete(id);
      if (!deleted) {
        return Result.fail<boolean>(new Error('No se pudo eliminar el torneo'));
      }

      return Result.ok<boolean>(true);
    } catch (error: any) {
      return Result.fail<boolean>(new Error(`Error al eliminar el torneo: ${error.message}`));
    }
  }
} 