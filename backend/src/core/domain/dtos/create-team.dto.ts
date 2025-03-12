/**
 * DTO para la creación de un equipo
 */
export class CreateTeamDto {
  name: string;
  tournamentId: string;
  players: string[];
  ranking?: number;
  logoUrl?: string;
} 