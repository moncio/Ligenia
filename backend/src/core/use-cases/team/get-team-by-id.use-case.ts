import { Team } from '../../domain/entities/team.entity';
import { ITeamRepository } from '../../domain/interfaces/team-repository.interface';
import { IUseCase, Result } from '../../domain/interfaces/use-case.interface';

/**
 * Caso de uso para obtener un equipo por su ID
 */
export class GetTeamByIdUseCase implements IUseCase<string, Team> {
  constructor(private readonly teamRepository: ITeamRepository) {}

  /**
   * Ejecuta el caso de uso
   * @param id ID del equipo a buscar
   * @returns Resultado con el equipo si existe, o un error si no existe
   */
  async execute(id: string): Promise<Result<Team>> {
    try {
      const team = await this.teamRepository.findById(id);

      if (!team) {
        return Result.fail<Team>(new Error('Equipo no encontrado'));
      }

      return Result.ok<Team>(team);
    } catch (error) {
      return Result.fail<Team>(error instanceof Error ? error : new Error('Error al obtener el equipo'));
    }
  }
} 