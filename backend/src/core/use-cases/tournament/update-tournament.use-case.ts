import { IUseCase, Result } from '../../domain/interfaces/use-case.interface';
import { ITournamentRepository } from '../../domain/interfaces/tournament-repository.interface';
import { ILeagueRepository } from '../../domain/interfaces/league-repository.interface';
import { Tournament } from '../../domain/entities/tournament.entity';
import { UpdateTournamentDto } from '../../domain/dtos/update-tournament.dto';

export class UpdateTournamentUseCase implements IUseCase<[string, UpdateTournamentDto], Tournament> {
  constructor(
    private readonly tournamentRepository: ITournamentRepository,
    private readonly leagueRepository: ILeagueRepository
  ) {}

  /**
   * Actualiza un torneo existente
   * @param input Array con el ID del torneo y los datos a actualizar
   * @returns Result con el torneo actualizado o un error
   */
  async execute(input: [string, UpdateTournamentDto]): Promise<Result<Tournament>> {
    try {
      const [id, data] = input;
      
      // Verificar si el torneo existe
      const existingTournament = await this.tournamentRepository.findById(id);
      if (!existingTournament) {
        return Result.fail<Tournament>(new Error('El torneo no existe'));
      }

      // Si se está actualizando la liga, verificar que exista
      if (data.leagueId && data.leagueId !== existingTournament.leagueId) {
        const leagueExists = await this.leagueRepository.findById(data.leagueId);
        if (!leagueExists) {
          return Result.fail<Tournament>(new Error('La liga especificada no existe'));
        }
      }

      // Si se está actualizando el nombre, verificar que no exista otro torneo con el mismo nombre en la misma liga
      if (data.name && data.name !== existingTournament.name) {
        const leagueId = data.leagueId || existingTournament.leagueId;
        const nameExists = await this.tournamentRepository.existsByNameInLeague(data.name, leagueId);
        if (nameExists) {
          return Result.fail<Tournament>(new Error(`Ya existe un torneo con el nombre "${data.name}" en la liga especificada`));
        }
      }

      // Actualizar el torneo
      const updatedTournament = await this.tournamentRepository.update(id, data);
      if (!updatedTournament) {
        return Result.fail<Tournament>(new Error('No se pudo actualizar el torneo'));
      }

      return Result.ok<Tournament>(updatedTournament);
    } catch (error: any) {
      return Result.fail<Tournament>(new Error(`Error al actualizar el torneo: ${error.message}`));
    }
  }
} 