import { ITeamRepository } from '../../domain/interfaces/team-repository.interface';
import { IUseCase, Result } from '../../domain/interfaces/use-case.interface';

/**
 * Caso de uso para eliminar un equipo
 */
export class DeleteTeamUseCase implements IUseCase<string, boolean> {
  constructor(private readonly teamRepository: ITeamRepository) {}

  /**
   * Ejecuta el caso de uso
   * @param id ID del equipo a eliminar
   * @returns Resultado con true si se eliminó correctamente, o un error si no se pudo eliminar
   */
  async execute(id: string): Promise<Result<boolean>> {
    try {
      // Verificar si el equipo existe
      const existingTeam = await this.teamRepository.findById(id);
      if (!existingTeam) {
        return Result.fail<boolean>(new Error('El equipo no existe'));
      }

      // Eliminar el equipo
      const deleted = await this.teamRepository.delete(id);
      if (!deleted) {
        return Result.fail<boolean>(new Error('No se pudo eliminar el equipo'));
      }

      return Result.ok<boolean>(true);
    } catch (error: any) {
      return Result.fail<boolean>(new Error(`Error al eliminar el equipo: ${error.message}`));
    }
  }
} 