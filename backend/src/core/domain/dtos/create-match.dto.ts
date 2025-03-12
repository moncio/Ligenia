import { MatchStatus } from '@prisma/client';
import { MatchScore } from '../entities/match.entity';

/**
 * DTO para la creación de un partido
 */
export class CreateMatchDto {
  tournamentId: string;
  team1Id: string;
  team2Id: string;
  scheduledDate: Date;
  courtId?: string;
  status?: MatchStatus;
  score?: MatchScore;
  notes?: string;
  round?: number;
  matchNumber?: number;
} 