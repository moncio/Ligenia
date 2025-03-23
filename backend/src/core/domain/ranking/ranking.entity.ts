/**
 * Ranking entity class
 * Represents a player's ranking in the system
 */
export class Ranking {
  constructor(
    public id: string,
    public playerId: string,
    public rankingPoints: number = 0,
    public globalPosition: number = 0,
    public categoryPosition: number = 0,
    public playerLevel: string,
    public previousPosition: number | null = null,
    public positionChange: number = 0,
    public lastCalculated: Date = new Date(),
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  /**
   * Update ranking points
   * @param newPoints New ranking points
   */
  updatePoints(newPoints: number): void {
    this.rankingPoints = newPoints;
    this.updatedAt = new Date();
    this.lastCalculated = new Date();
  }

  /**
   * Update global position
   * @param newPosition New global position
   */
  updateGlobalPosition(newPosition: number): void {
    this.previousPosition = this.globalPosition;
    this.globalPosition = newPosition;
    this.positionChange = this.previousPosition !== null 
      ? this.previousPosition - newPosition 
      : 0;
    this.updatedAt = new Date();
    this.lastCalculated = new Date();
  }

  /**
   * Update category position
   * @param newPosition New category position
   */
  updateCategoryPosition(newPosition: number): void {
    this.categoryPosition = newPosition;
    this.updatedAt = new Date();
    this.lastCalculated = new Date();
  }

  /**
   * Update player level
   * @param newLevel New player level
   */
  updatePlayerLevel(newLevel: string): void {
    this.playerLevel = newLevel;
    this.updatedAt = new Date();
  }
} 