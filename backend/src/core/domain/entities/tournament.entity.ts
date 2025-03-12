import { TournamentFormat, TournamentStatus } from '@prisma/client';

/**
 * Entidad Tournament que representa un torneo dentro de una liga
 */
export class Tournament {
  id: string;
  name: string;
  leagueId: string;
  format: TournamentFormat;
  status: TournamentStatus;
  startDate: Date;
  endDate?: Date;
  description?: string;
  maxParticipants?: number;
  minParticipants?: number;
  registrationDeadline?: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: {
    id: string;
    name: string;
    leagueId: string;
    format: TournamentFormat;
    status: TournamentStatus;
    startDate: Date;
    endDate?: Date;
    description?: string;
    maxParticipants?: number;
    minParticipants?: number;
    registrationDeadline?: Date;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.leagueId = data.leagueId;
    this.format = data.format;
    this.status = data.status;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.description = data.description;
    this.maxParticipants = data.maxParticipants;
    this.minParticipants = data.minParticipants;
    this.registrationDeadline = data.registrationDeadline;
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();
  }

  /**
   * Valida que los datos del torneo sean correctos
   * @throws Error si los datos no son válidos
   */
  validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('El nombre del torneo es obligatorio');
    }

    if (this.name.length > 100) {
      throw new Error('El nombre del torneo no puede tener más de 100 caracteres');
    }

    if (!this.leagueId) {
      throw new Error('La liga del torneo es obligatoria');
    }

    if (!this.startDate) {
      throw new Error('La fecha de inicio del torneo es obligatoria');
    }

    if (this.endDate && this.endDate < this.startDate) {
      throw new Error('La fecha de fin no puede ser anterior a la fecha de inicio');
    }

    if (this.registrationDeadline && this.registrationDeadline > this.startDate) {
      throw new Error('La fecha límite de registro no puede ser posterior a la fecha de inicio');
    }

    if (this.minParticipants && this.maxParticipants && this.minParticipants > this.maxParticipants) {
      throw new Error('El número mínimo de participantes no puede ser mayor que el máximo');
    }

    if (this.minParticipants && this.minParticipants < 2) {
      throw new Error('El número mínimo de participantes debe ser al menos 2');
    }

    if (!Object.values(TournamentFormat).includes(this.format)) {
      throw new Error('El formato del torneo no es válido');
    }

    if (!Object.values(TournamentStatus).includes(this.status)) {
      throw new Error('El estado del torneo no es válido');
    }
  }
} 