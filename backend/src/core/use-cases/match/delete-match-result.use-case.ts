import { Match } from '../../domain/entities/match.entity';
import { IMatchRepository } from '../../domain/interfaces/match-repository.interface';
import { IUseCase, Result } from '../../domain/interfaces/use-case.interface';
import { MatchStatus } from '@prisma/client';

/**
 * Caso de uso para eliminar el resultado de un partido
 */
export class DeleteMatchResultUseCase implements IUseCase<string, Match> {
  constructor(private readonly matchRepository: IMatchRepository) {}

  /**
   * Ejecuta el caso de uso
   * @param id ID del partido del que se eliminará el resultado
   * @returns Resultado con el partido actualizado o un error
   */
  async execute(id: string): Promise<Result<Match>> {
    try {
      // Verificar si el partido existe
      const existingMatch = await this.matchRepository.findById(id);
      if (!existingMatch) {
        return Result.fail<Match>(new Error('El partido no existe'));
      }

      // Verificar si el partido tiene un resultado para eliminar
      if (existingMatch.status !== MatchStatus.COMPLETED || !existingMatch.score) {
        return Result.fail<Match>(new Error('El partido no tiene un resultado para eliminar'));
      }

      // Actualizar el partido eliminando el resultado
      const updatedMatch = await this.matchRepository.update(id, {
        score: undefined,
        status: MatchStatus.SCHEDULED
      });

      if (!updatedMatch) {
        return Result.fail<Match>(new Error('No se pudo eliminar el resultado del partido'));
      }

      return Result.ok<Match>(updatedMatch);
    } catch (error: any) {
      return Result.fail<Match>(new Error(`Error al eliminar el resultado: ${error.message}`));
    }
  }
} 