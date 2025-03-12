import { Match, MatchScore } from '../../domain/entities/match.entity';
import { RegisterMatchResultDto } from '../../domain/dtos/register-match-result.dto';
import { IMatchRepository } from '../../domain/interfaces/match-repository.interface';
import { IUseCase, Result } from '../../domain/interfaces/use-case.interface';
import { MatchStatus } from '@prisma/client';

/**
 * Caso de uso para registrar el resultado de un partido
 */
export class RegisterMatchResultUseCase implements IUseCase<[string, RegisterMatchResultDto], Match> {
  constructor(private readonly matchRepository: IMatchRepository) {}

  /**
   * Ejecuta el caso de uso
   * @param input Array con el ID del partido y los datos del resultado
   * @returns Resultado con el partido actualizado o un error
   */
  async execute(input: [string, RegisterMatchResultDto]): Promise<Result<Match>> {
    try {
      const [id, data] = input;
      
      // Verificar si el partido existe
      const existingMatch = await this.matchRepository.findById(id);
      if (!existingMatch) {
        return Result.fail<Match>(new Error('El partido no existe'));
      }

      // Verificar si el partido ya tiene un resultado
      if (existingMatch.status === MatchStatus.COMPLETED && existingMatch.score) {
        return Result.fail<Match>(new Error('El partido ya tiene un resultado registrado'));
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
        score: data.score,
        status: MatchStatus.COMPLETED
      });

      if (!updatedMatch) {
        return Result.fail<Match>(new Error('No se pudo actualizar el partido con el resultado'));
      }

      return Result.ok<Match>(updatedMatch);
    } catch (error: any) {
      return Result.fail<Match>(new Error(`Error al registrar el resultado: ${error.message}`));
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