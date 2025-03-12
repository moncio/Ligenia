import { IMatchRepository } from '../../domain/interfaces/match-repository.interface';
import { IUseCase, Result } from '../../domain/interfaces/use-case.interface';

/**
 * Caso de uso para eliminar un partido
 */
export class DeleteMatchUseCase implements IUseCase<string, boolean> {
  constructor(private readonly matchRepository: IMatchRepository) {}

  /**
   * Ejecuta el caso de uso
   * @param id ID del partido a eliminar
   * @returns Resultado con true si se eliminó correctamente, o un error si no se pudo eliminar
   */
  async execute(id: string): Promise<Result<boolean>> {
    try {
      // Verificar si el partido existe
      const existingMatch = await this.matchRepository.findById(id);
      if (!existingMatch) {
        return Result.fail<boolean>(new Error('El partido no existe'));
      }

      // Eliminar el partido
      const deleted = await this.matchRepository.delete(id);
      if (!deleted) {
        return Result.fail<boolean>(new Error('No se pudo eliminar el partido'));
      }

      return Result.ok<boolean>(true);
    } catch (error: any) {
      return Result.fail<boolean>(new Error(`Error al eliminar el partido: ${error.message}`));
    }
  }
} 