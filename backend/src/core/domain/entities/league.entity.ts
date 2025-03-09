import { ScoringType } from '@prisma/client';

/**
 * Entidad League que representa una liga deportiva
 */
export class League {
  id: string;
  name: string;
  adminId: string;
  scoringType: ScoringType;
  description?: string;
  logoUrl?: string;
  isPublic: boolean;
  creationDate: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: {
    id: string;
    name: string;
    adminId: string;
    scoringType: ScoringType;
    description?: string;
    logoUrl?: string;
    isPublic?: boolean;
    creationDate?: Date;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.adminId = data.adminId;
    this.scoringType = data.scoringType;
    this.description = data.description;
    this.logoUrl = data.logoUrl;
    this.isPublic = data.isPublic ?? true;
    this.creationDate = data.creationDate ?? new Date();
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();
  }

  /**
   * Valida que los datos de la liga sean correctos
   * @throws Error si los datos no son válidos
   */
  validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('El nombre de la liga es obligatorio');
    }

    if (this.name.length > 100) {
      throw new Error('El nombre de la liga no puede tener más de 100 caracteres');
    }

    if (!this.adminId) {
      throw new Error('El administrador de la liga es obligatorio');
    }

    // Validar que el tipo de puntuación sea válido
    if (!Object.values(ScoringType).includes(this.scoringType)) {
      throw new Error('El tipo de puntuación no es válido');
    }
  }
} 