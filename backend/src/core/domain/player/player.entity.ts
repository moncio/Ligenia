import { PlayerLevel } from '../tournament/tournament.entity';

/**
 * Player entity class
 * Represents a player in the system
 */
export class Player {
  constructor(
    public id: string,
    public userId: string,
    public level: PlayerLevel,
    public age: number | null = null,
    public country: string | null = null,
    public avatarUrl: string | null = null,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  /**
   * Update player level
   * @param newLevel New player level
   */
  updateLevel(newLevel: PlayerLevel): void {
    this.level = newLevel;
    this.updatedAt = new Date();
  }

  /**
   * Update player profile information
   * @param data Player data to update
   */
  updateProfile(data: {
    level?: PlayerLevel;
    age?: number | null;
    country?: string | null;
    avatarUrl?: string | null;
  }): void {
    if (data.level !== undefined) {
      this.level = data.level;
    }

    if (data.age !== undefined) {
      this.age = data.age;
    }

    if (data.country !== undefined) {
      this.country = data.country;
    }

    if (data.avatarUrl !== undefined) {
      this.avatarUrl = data.avatarUrl;
    }

    this.updatedAt = new Date();
  }
} 