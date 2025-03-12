/**
 * DTO para la actualización de un equipo
 */
export class UpdateTeamDto {
  name?: string;
  players?: string[];
  ranking?: number;
  logoUrl?: string;
} 