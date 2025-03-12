import { MatchStatus } from '@prisma/client';

/**
 * Tipo para representar el marcador de un partido
 */
export type MatchScore = {
  sets: {
    team1: number;
    team2: number;
  }[];
};

/**
 * Entidad Match que representa un partido dentro de un torneo
 */
export class Match {
  id: string;
  tournamentId: string;
  team1Id: string;
  team2Id: string;
  scheduledDate: Date;
  courtId?: string;
  status: MatchStatus;
  score?: MatchScore;
  notes?: string;
  round?: number;
  matchNumber?: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: {
    id: string;
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
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = data.id;
    this.tournamentId = data.tournamentId;
    this.team1Id = data.team1Id;
    this.team2Id = data.team2Id;
    this.scheduledDate = data.scheduledDate;
    this.courtId = data.courtId;
    this.status = data.status ?? MatchStatus.SCHEDULED;
    this.score = data.score;
    this.notes = data.notes;
    this.round = data.round;
    this.matchNumber = data.matchNumber;
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();
  }

  /**
   * Valida que los datos del partido sean correctos
   * @throws Error si los datos no son válidos
   */
  validate(): void {
    if (!this.tournamentId) {
      throw new Error('El torneo al que pertenece el partido es obligatorio');
    }

    if (!this.team1Id) {
      throw new Error('El equipo 1 es obligatorio');
    }

    if (!this.team2Id) {
      throw new Error('El equipo 2 es obligatorio');
    }

    if (this.team1Id === this.team2Id) {
      throw new Error('Los equipos no pueden ser iguales');
    }

    if (!this.scheduledDate) {
      throw new Error('La fecha programada del partido es obligatoria');
    }

    if (!Object.values(MatchStatus).includes(this.status)) {
      throw new Error('El estado del partido no es válido');
    }
  }
} 