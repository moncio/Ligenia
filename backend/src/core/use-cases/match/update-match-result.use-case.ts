import { Match, MatchScore } from '../../domain/entities/match.entity';
import { UpdateMatchResultDto } from '../../domain/dtos/update-match-result.dto';
import { IMatchRepository } from '../../domain/interfaces/match-repository.interface';
import { IUseCase, Result } from '../../domain/interfaces/use-case.interface';
import { MatchStatus } from '@prisma/client';

/**
 * Caso de uso para actualizar el resultado de un partido
 */
export class UpdateMatchResultUseCase implements IUseCase<[string, UpdateMatchResultDto], Match> {
  constructor(private readonly matchRepository: IMatchRepository) {}

  /**
   * Ejecuta el caso de uso
   * @param input Array con el ID del partido y los datos del resultado a actualizar
   * @returns Resultado con el partido actualizado o un error
   */
  async execute(input: [string, UpdateMatchResultDto]): Promise<Result<Match>> {
    try {
      const [id, data] = input;
      
      // Verificar si el partido existe
      const existingMatch = await this.matchRepository.findById(id);
      if (!existingMatch) {
        return Result.fail<Match>(new Error('El partido no existe'));
      }

      // Verificar si el partido tiene un resultado para actualizar
      if (existingMatch.status !== MatchStatus.COMPLETED || !existingMatch.score) {
        return Result.fail<Match>(new Error('El partido no tiene un resultado para actualizar'));
      }

      // Validar el resultado
      if (!this.isValidScore(data.score)) {
        return Result.fail<Match>(new Error('El resultado debe tener al menos un set'));
      }

      // Verificar que no haya puntos negativos
      if (this.hasNegativePoints(data.score)) {
        return Result.fail<Match>(new Error('Los puntos no pueden ser negativos'));
      }

      // Actualizar el partido con el resultado
      const updatedMatch = await this.matchRepository.update(id, {
        score: data.score
      });

      if (!updatedMatch) {
        return Result.fail<Match>(new Error('No se pudo actualizar el resultado del partido'));
      }

      return Result.ok<Match>(updatedMatch);
    } catch (error: any) {
      return Result.fail<Match>(new Error(`Error al actualizar el resultado: ${error.message}`));
    }
  }

  /**
   * Verifica si el resultado es válido (tiene al menos un set)
   */
  private isValidScore(score: MatchScore): boolean {
    return score.sets && score.sets.length > 0;
  }

  /**
   * Verifica si hay puntos negativos en el resultado
   */
  private hasNegativePoints(score: MatchScore): boolean {
    return score.sets.some(set => set.team1 < 0 || set.team2 < 0);
  }
} 