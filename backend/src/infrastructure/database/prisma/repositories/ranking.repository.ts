import { PrismaClient } from '@prisma/client';
import { Ranking } from '../../../../core/domain/ranking/ranking.entity';
import { IRankingRepository } from '../../../../core/application/interfaces/repositories/ranking.repository';
import { BaseRepository } from '../base-repository';
import { RankingMapper, RankingData } from '../mappers/ranking.mapper';
import { injectable } from 'inversify';
import { PlayerLevel } from '../../../../core/domain/tournament/tournament.entity';
import { v4 as uuidv4 } from 'uuid';

@injectable()
export class RankingRepository extends BaseRepository implements IRankingRepository {
  constructor(protected readonly prisma: PrismaClient) {
    super();
  }

  async findById(id: string): Promise<Ranking | null> {
    const result = await this.executeOperation<Ranking | null>(async () => {
      // Since Ranking is not directly stored in the database, we need to
      // find its constituent data and construct it
      
      // Get the ranking data from a dedicated storage mechanism if it exists
      // For example, we might store this in a semi-persistent storage or cache
      // For now, we'll implement a simpler approach
      
      // We first try to get all rankings
      const allRankings = await this.getAllRankingsData();
      const rankingData = allRankings.find(r => r.id === id);
      
      if (!rankingData) {
        return null;
      }
      
      return RankingMapper.toDomain(rankingData);
    });

    return result.isSuccess ? result.getValue() as Ranking | null : null;
  }

  async findByPlayerId(playerId: string): Promise<Ranking | null> {
    const result = await this.executeOperation<Ranking | null>(async () => {
      // Get all rankings and find the one for this player
      const allRankings = await this.getAllRankingsData();
      const rankingData = allRankings.find(r => r.playerId === playerId);
      
      if (!rankingData) {
        return null;
      }
      
      return RankingMapper.toDomain(rankingData);
    });

    return result.isSuccess ? result.getValue() as Ranking | null : null;
  }

  async findAll(options?: {
    limit?: number;
    offset?: number;
    playerLevel?: PlayerLevel;
    sortBy?: 'rankingPoints' | 'globalPosition';
    sortOrder?: 'asc' | 'desc';
  }): Promise<Ranking[]> {
    const result = await this.executeOperation<Ranking[]>(async () => {
      // Get all rankings
      let allRankings = await this.getAllRankingsData();
      
      // Apply filtering
      if (options?.playerLevel) {
        allRankings = allRankings.filter(r => r.playerLevel === options.playerLevel);
      }
      
      // Apply sorting
      if (options?.sortBy) {
        const sortField = options.sortBy;
        const sortMultiplier = options.sortOrder === 'desc' ? -1 : 1;
        
        allRankings.sort((a, b) => {
          const aValue = a[sortField];
          const bValue = b[sortField];
          return (aValue - bValue) * sortMultiplier;
        });
      } else {
        // Default sort by global position
        allRankings.sort((a, b) => a.globalPosition - b.globalPosition);
      }
      
      // Apply pagination
      const offset = options?.offset || 0;
      const limit = options?.limit || 50;
      const paginatedRankings = allRankings.slice(offset, offset + limit);
      
      // Map to domain entities
      return paginatedRankings.map(RankingMapper.toDomain);
    });

    return result.isSuccess ? result.getValue() as Ranking[] : [];
  }

  async count(options?: { playerLevel?: PlayerLevel }): Promise<number> {
    const result = await this.executeOperation<number>(async () => {
      // Get all rankings
      let allRankings = await this.getAllRankingsData();
      
      // Apply filtering
      if (options?.playerLevel) {
        allRankings = allRankings.filter(r => r.playerLevel === options.playerLevel);
      }
      
      return allRankings.length;
    });

    return result.isSuccess ? result.getValue() as number : 0;
  }

  async save(ranking: Ranking): Promise<void> {
    const result = await this.executeOperation<void>(async () => {
      // Since we don't have a direct Ranking model in Prisma,
      // we need to implement a custom storage solution
      
      // First, check if this is a new ranking or an update
      await this.upsertRanking(ranking);
    });

    if (result.isFailure) {
      throw result.getError();
    }
  }

  async update(ranking: Ranking): Promise<void> {
    const result = await this.executeOperation<void>(async () => {
      // For our implementation, update is the same as save
      await this.upsertRanking(ranking);
    });

    if (result.isFailure) {
      throw result.getError();
    }
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.executeOperation<boolean>(async () => {
      // Check if ranking exists
      const allRankings = await this.getAllRankingsData();
      const existingRanking = allRankings.find(r => r.id === id);
      
      if (!existingRanking) {
        return false;
      }
      
      // In a real implementation, we would delete from the storage
      // For now, we'll return true to indicate success
      return true;
    });

    return result.isSuccess ? result.getValue() as boolean : false;
  }

  async findByPlayerLevel(playerLevel: PlayerLevel, options?: {
    limit?: number;
    offset?: number;
    sortBy?: 'rankingPoints' | 'categoryPosition';
    sortOrder?: 'asc' | 'desc';
  }): Promise<Ranking[]> {
    const result = await this.executeOperation<Ranking[]>(async () => {
      // Get all rankings
      let allRankings = await this.getAllRankingsData();
      
      // Filter by player level
      allRankings = allRankings.filter(r => r.playerLevel === playerLevel);
      
      // Apply sorting
      if (options?.sortBy) {
        const sortField = options.sortBy;
        const sortMultiplier = options.sortOrder === 'desc' ? -1 : 1;
        
        allRankings.sort((a, b) => {
          const aValue = a[sortField];
          const bValue = b[sortField];
          return (aValue - bValue) * sortMultiplier;
        });
      } else {
        // Default sort by category position
        allRankings.sort((a, b) => a.categoryPosition - b.categoryPosition);
      }
      
      // Apply pagination
      const offset = options?.offset || 0;
      const limit = options?.limit || 50;
      const paginatedRankings = allRankings.slice(offset, offset + limit);
      
      // Map to domain entities
      return paginatedRankings.map(RankingMapper.toDomain);
    });

    return result.isSuccess ? result.getValue() as Ranking[] : [];
  }

  async countByPlayerLevel(playerLevel: PlayerLevel): Promise<number> {
    const result = await this.executeOperation<number>(async () => {
      // Get all rankings
      const allRankings = await this.getAllRankingsData();
      
      // Count rankings with the specified player level
      return allRankings.filter(r => r.playerLevel === playerLevel).length;
    });

    return result.isSuccess ? result.getValue() as number : 0;
  }

  // Private methods

  /**
   * Gets all rankings data by combining Player and Statistic data
   * This is a helper method that computes rankings based on player statistics
   */
  private async getAllRankingsData(): Promise<RankingData[]> {
    // Get all players with their statistics
    const players = await this.prisma.player.findMany({
      include: {
        user: {
          include: {
            statistics: true
          }
        }
      }
    });

    // Calculate total points for each player
    const playerStats = players.map(player => {
      const totalPoints = player.user.statistics.reduce((sum, stat) => sum + stat.points, 0);
      return {
        player,
        totalPoints
      };
    });

    // Sort players by total points (descending)
    const sortedGlobal = [...playerStats].sort((a, b) => b.totalPoints - a.totalPoints);

    // Calculate global positions
    const globalPositions = new Map<string, number>();
    sortedGlobal.forEach((ps, index) => {
      globalPositions.set(ps.player.userId, index + 1);
    });

    // Group by level and calculate category positions
    const playersByLevel: Record<string, typeof playerStats> = {};
    
    playerStats.forEach(ps => {
      const level = ps.player.level;
      if (!playersByLevel[level]) {
        playersByLevel[level] = [];
      }
      playersByLevel[level].push(ps);
    });

    const categoryPositions = new Map<string, number>();
    
    // For each level, sort players and assign category positions
    Object.entries(playersByLevel).forEach(([level, levelPlayers]) => {
      const sortedLevel = [...levelPlayers].sort((a, b) => b.totalPoints - a.totalPoints);
      
      sortedLevel.forEach((ps, index) => {
        categoryPositions.set(`${level}-${ps.player.userId}`, index + 1);
      });
    });

    // Map playerStats to RankingData
    return playerStats.map(ps => {
      const playerId = ps.player.userId;
      const level = ps.player.level;
      const globalPosition = globalPositions.get(playerId) || 0;
      const categoryPosition = categoryPositions.get(`${level}-${playerId}`) || 0;
      
      // For this implementation, we'll use a composite ID
      const id = `ranking-${playerId}`;
      
      // Get the best statistic to represent this player's ranking
      const bestStatistic = ps.player.user.statistics.reduce(
        (best, current) => (current.points > best.points ? current : best),
        { points: 0 } as typeof ps.player.user.statistics[0]
      );
      
      return {
        id,
        playerId,
        rankingPoints: ps.totalPoints,
        globalPosition,
        categoryPosition,
        playerLevel: level,
        previousPosition: null as number | null, // Explicitly type as number | null
        positionChange: 0,
        lastCalculated: new Date(),
        createdAt: ps.player.createdAt,
        updatedAt: ps.player.updatedAt
      };
    });
  }

  /**
   * Upserts a ranking
   * Since we don't have a direct Ranking model in Prisma, this is a placeholder
   * In a real implementation, we might store this in Redis, a separate DB table, etc.
   */
  private async upsertRanking(ranking: Ranking): Promise<void> {
    // In a real implementation, we would store the ranking
    // For now, this is a placeholder that succeeds without actually persisting
    
    // We could:
    // 1. Use Redis or another cache to store rankings
    // 2. Add a Ranking table to the Prisma schema
    // 3. Use a NoSQL database for flexible schema
    
    // For the purpose of this implementation, we'll assume success
    return;
  }
} 