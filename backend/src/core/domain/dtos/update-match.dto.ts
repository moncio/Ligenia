import { MatchStatus } from '@prisma/client';
import { MatchScore } from '../entities/match.entity';

/**
 * DTO para la actualización de un partido
 */
export class UpdateMatchDto {
  team1Id?: string;
  team2Id?: string;
  scheduledDate?: Date;
  courtId?: string;
  status?: MatchStatus;
  score?: MatchScore;
  notes?: string;
  round?: number;
  matchNumber?: number;
} 