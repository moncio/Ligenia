import { TournamentFormat, TournamentStatus } from '@prisma/client';

export interface UpdateTournamentDto {
  name?: string;
  description?: string;
  leagueId?: string;
  format?: TournamentFormat;
  status?: TournamentStatus;
  startDate?: Date;
  endDate?: Date;
  maxParticipants?: number;
  minParticipants?: number;
  registrationDeadline?: Date;
} 