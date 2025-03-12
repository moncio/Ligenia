import { MatchScore } from '../entities/match.entity';

/**
 * DTO para la actualización de resultados de un partido
 */
export class UpdateMatchResultDto {
  score: MatchScore;
} 