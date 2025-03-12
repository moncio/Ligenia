import { IUseCase, Result } from '../../domain/interfaces/use-case.interface';
import { ITournamentRepository } from '../../domain/interfaces/tournament-repository.interface';
import { Tournament } from '../../domain/entities/tournament.entity';

export class GetTournamentByIdUseCase implements IUseCase<string, Tournament> {
  constructor(private readonly tournamentRepository: ITournamentRepository) {}

  /**
   * Obtiene un torneo por su ID
   * @param id ID del torneo a buscar
   * @returns Result con el torneo si existe, o un error si no existe
   */
  async execute(id: string): Promise<Result<Tournament>> {
    try {
      const tournament = await this.tournamentRepository.findById(id);

      if (!tournament) {
        return Result.fail<Tournament>(new Error('El torneo no existe'));
      }

      return Result.ok<Tournament>(tournament);
    } catch (error: any) {
      return Result.fail<Tournament>(new Error(`Error al obtener el torneo: ${error.message}`));
    }
  }
} 