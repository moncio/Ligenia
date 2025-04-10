/**
 * Statistics entity class
 * Represents player performance statistics in the system
 */
export class Statistic {
  constructor(
    public id: string,
    public playerId: string,
    public matchesPlayed: number = 0,
    public matchesWon: number = 0,
    public matchesLost: number = 0,
    public totalPoints: number = 0,
    public averageScore: number = 0,
    public tournamentsPlayed: number = 0,
    public tournamentsWon: number = 0,
    public winRate: number = 0,
    public lastUpdated: Date = new Date(),
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {
    // Calculate derived statistics if not explicitly provided
    if (matchesPlayed > 0 && winRate === 0) {
      this.winRate = (matchesWon / matchesPlayed) * 100;
    }

    if (matchesPlayed > 0 && totalPoints > 0 && averageScore === 0) {
      this.averageScore = totalPoints / matchesPlayed;
    }
  }

  /**
   * Update statistics after a match
   * @param won Whether the player won the match
   * @param score Player's score in the match
   */
  updateAfterMatch(won: boolean, score: number): void {
    this.matchesPlayed += 1;

    if (won) {
      this.matchesWon += 1;
    } else {
      this.matchesLost += 1;
    }

    this.totalPoints += score;
    this.averageScore = this.totalPoints / this.matchesPlayed;
    this.winRate = (this.matchesWon / this.matchesPlayed) * 100;
    this.lastUpdated = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Update statistics after a tournament
   * @param won Whether the player won the tournament
   */
  updateAfterTournament(won: boolean): void {
    this.tournamentsPlayed += 1;

    if (won) {
      this.tournamentsWon += 1;
    }

    this.lastUpdated = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Reset statistics to zero
   */
  reset(): void {
    this.matchesPlayed = 0;
    this.matchesWon = 0;
    this.matchesLost = 0;
    this.totalPoints = 0;
    this.averageScore = 0;
    this.tournamentsPlayed = 0;
    this.tournamentsWon = 0;
    this.winRate = 0;
    this.lastUpdated = new Date();
    this.updatedAt = new Date();
  }
}
