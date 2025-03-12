import { Team } from '../../domain/entities/team.entity';
import { UpdateTeamDto } from '../../domain/dtos/update-team.dto';
import { ITeamRepository } from '../../domain/interfaces/team-repository.interface';
import { IUseCase, Result } from '../../domain/interfaces/use-case.interface';

/**
 * Caso de uso para actualizar un equipo
 */
export class UpdateTeamUseCase implements IUseCase<[string, UpdateTeamDto], Team> {
  constructor(private readonly teamRepository: ITeamRepository) {}

  /**
   * Ejecuta el caso de uso
   * @param input Array con el ID del equipo y los datos a actualizar
   * @returns Resultado con el equipo actualizado o un error
   */
  async execute(input: [string, UpdateTeamDto]): Promise<Result<Team>> {
    try {
      const [id, data] = input;
      
      // Verificar si el equipo existe
      const existingTeam = await this.teamRepository.findById(id);
      if (!existingTeam) {
        return Result.fail<Team>(new Error('El equipo no existe'));
      }

      // Si se está actualizando el nombre, verificar que no exista otro equipo con el mismo nombre en el mismo torneo
      if (data.name && data.name !== existingTeam.name) {
        const nameExists = await this.teamRepository.existsByNameInTournament(data.name, existingTeam.tournamentId);
        if (nameExists) {
          return Result.fail<Team>(new Error(`Ya existe un equipo con el nombre "${data.name}" en el torneo`));
        }
      }

      // Actualizar el equipo
      const updatedTeam = await this.teamRepository.update(id, data);
      if (!updatedTeam) {
        return Result.fail<Team>(new Error('No se pudo actualizar el equipo'));
      }

      return Result.ok<Team>(updatedTeam);
    } catch (error: any) {
      return Result.fail<Team>(new Error(`Error al actualizar el equipo: ${error.message}`));
    }
  }
} 