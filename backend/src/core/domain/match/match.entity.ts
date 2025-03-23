export enum MatchStatus {
  PENDING = 'PENDING',
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED'
}

export class Match {
  constructor(
    public id: string,
    public tournamentId: string,
    public homePlayerOneId: string,
    public homePlayerTwoId: string,
    public awayPlayerOneId: string,
    public awayPlayerTwoId: string,
    public round: number,
    public date: Date | null,
    public location: string | null,
    public status: MatchStatus,
    public homeScore: number | null,
    public awayScore: number | null,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  // Domain methods

  /**
   * Update match scores
   */
  public updateScore(homeScore: number, awayScore: number): void {
    if (this.status === MatchStatus.CANCELED) {
      throw new Error('Cannot update score for a canceled match');
    }

    this.homeScore = homeScore;
    this.awayScore = awayScore;
    this.status = MatchStatus.COMPLETED;
    this.updatedAt = new Date();
  }

  /**
   * Schedule match
   */
  public schedule(date: Date, location: string | null = null): void {
    if (this.status === MatchStatus.COMPLETED || this.status === MatchStatus.CANCELED) {
      throw new Error('Cannot schedule a completed or canceled match');
    }

    this.date = date;
    if (location) {
      this.location = location;
    }
    this.status = MatchStatus.SCHEDULED;
    this.updatedAt = new Date();
  }

  /**
   * Start match
   */
  public startMatch(): void {
    if (this.status !== MatchStatus.SCHEDULED) {
      throw new Error('Only scheduled matches can be started');
    }

    this.status = MatchStatus.IN_PROGRESS;
    this.updatedAt = new Date();
  }

  /**
   * Cancel match
   */
  public cancelMatch(): void {
    if (this.status === MatchStatus.COMPLETED) {
      throw new Error('Cannot cancel a completed match');
    }

    this.status = MatchStatus.CANCELED;
    this.updatedAt = new Date();
  }

  /**
   * Update match details
   */
  public updateDetails(
    homePlayerOneId?: string,
    homePlayerTwoId?: string,
    awayPlayerOneId?: string,
    awayPlayerTwoId?: string,
    round?: number,
    date?: Date | null,
    location?: string | null,
    status?: MatchStatus
  ): void {
    // Only pending, scheduled or in progress matches can be updated
    if (
      this.status !== MatchStatus.PENDING && 
      this.status !== MatchStatus.SCHEDULED &&
      this.status !== MatchStatus.IN_PROGRESS
    ) {
      throw new Error('Only pending, scheduled, or in-progress matches can be updated');
    }

    if (homePlayerOneId !== undefined) this.homePlayerOneId = homePlayerOneId;
    if (homePlayerTwoId !== undefined) this.homePlayerTwoId = homePlayerTwoId;
    if (awayPlayerOneId !== undefined) this.awayPlayerOneId = awayPlayerOneId;
    if (awayPlayerTwoId !== undefined) this.awayPlayerTwoId = awayPlayerTwoId;
    if (round !== undefined) this.round = round;
    if (date !== undefined) this.date = date;
    if (location !== undefined) this.location = location;
    if (status !== undefined) this.status = status;

    this.updatedAt = new Date();
  }

  /**
   * Check if the match can be modified
   */
  public canModify(): boolean {
    return this.status !== MatchStatus.COMPLETED && this.status !== MatchStatus.CANCELED;
  }

  /**
   * Get winner team ids
   */
  public getWinnerIds(): string[] | null {
    if (this.status !== MatchStatus.COMPLETED || this.homeScore === null || this.awayScore === null) {
      return null;
    }

    if (this.homeScore > this.awayScore) {
      return [this.homePlayerOneId, this.homePlayerTwoId];
    } else if (this.awayScore > this.homeScore) {
      return [this.awayPlayerOneId, this.awayPlayerTwoId];
    }

    return null; // Tie
  }
} 