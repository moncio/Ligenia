export enum TournamentFormat {
  SINGLE_ELIMINATION = 'SINGLE_ELIMINATION',
  DOUBLE_ELIMINATION = 'DOUBLE_ELIMINATION',
  ROUND_ROBIN = 'ROUND_ROBIN',
  SWISS = 'SWISS',
}

export enum TournamentStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PlayerLevel {
  P1 = 'P1',
  P2 = 'P2',
  P3 = 'P3',
  P4 = 'P4',
  P5 = 'P5',
}

export class Tournament {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public startDate: Date,
    public endDate: Date | null,
    public format: TournamentFormat,
    public status: TournamentStatus,
    public location: string | null,
    public maxParticipants: number | null,
    public registrationDeadline: Date | null,
    public category: PlayerLevel | null,
    public createdById: string,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}

  // Domain methods
  public canRegister(currentParticipants: number): boolean {
    if (this.status !== TournamentStatus.OPEN) {
      return false;
    }

    if (this.maxParticipants !== null && currentParticipants >= this.maxParticipants) {
      return false;
    }

    if (this.registrationDeadline !== null && new Date() > this.registrationDeadline) {
      return false;
    }

    return true;
  }

  public startTournament(): void {
    if (this.status !== TournamentStatus.OPEN) {
      throw new Error('Only open tournaments can be started');
    }

    this.status = TournamentStatus.ACTIVE;
    this.updatedAt = new Date();
  }

  public completeTournament(): void {
    if (this.status !== TournamentStatus.ACTIVE) {
      throw new Error('Only active tournaments can be completed');
    }

    this.status = TournamentStatus.COMPLETED;
    this.updatedAt = new Date();
  }

  public cancelTournament(): void {
    if (this.status === TournamentStatus.COMPLETED) {
      throw new Error('Completed tournaments cannot be cancelled');
    }

    this.status = TournamentStatus.CANCELLED;
    this.updatedAt = new Date();
  }

  public updateDetails(
    name?: string,
    description?: string,
    startDate?: Date,
    endDate?: Date | null,
    format?: TournamentFormat,
    location?: string | null,
    maxParticipants?: number | null,
    registrationDeadline?: Date | null,
    category?: PlayerLevel | null,
    status?: TournamentStatus,
  ): void {
    // Only draft or open tournaments can be updated
    if (this.status !== TournamentStatus.DRAFT && this.status !== TournamentStatus.OPEN) {
      throw new Error('Only draft or open tournaments can be updated');
    }

    if (name !== undefined) this.name = name;
    if (description !== undefined) this.description = description;
    if (startDate !== undefined) this.startDate = startDate;
    if (endDate !== undefined) this.endDate = endDate;
    if (format !== undefined) this.format = format;
    if (location !== undefined) this.location = location;
    if (maxParticipants !== undefined) this.maxParticipants = maxParticipants;
    if (registrationDeadline !== undefined) this.registrationDeadline = registrationDeadline;
    if (category !== undefined) this.category = category;
    if (status !== undefined) this.status = status;

    this.updatedAt = new Date();
  }
}
