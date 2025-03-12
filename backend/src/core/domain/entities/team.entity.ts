/**
 * Entidad Team que representa un equipo dentro de un torneo
 */
export class Team {
  id: string;
  name: string;
  tournamentId: string;
  players: string[];
  ranking?: number;
  logoUrl?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: {
    id: string;
    name: string;
    tournamentId: string;
    players: string[];
    ranking?: number;
    logoUrl?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.tournamentId = data.tournamentId;
    this.players = data.players;
    this.ranking = data.ranking;
    this.logoUrl = data.logoUrl;
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();
  }

  /**
   * Valida que los datos del equipo sean correctos
   * @throws Error si los datos no son válidos
   */
  validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('El nombre del equipo es obligatorio');
    }

    if (this.name.length > 100) {
      throw new Error('El nombre del equipo no puede tener más de 100 caracteres');
    }

    if (!this.tournamentId) {
      throw new Error('El torneo al que pertenece el equipo es obligatorio');
    }

    if (!this.players || this.players.length === 0) {
      throw new Error('El equipo debe tener al menos un jugador');
    }

    if (this.players.length > 2) {
      throw new Error('El equipo no puede tener más de 2 jugadores');
    }
  }
} 