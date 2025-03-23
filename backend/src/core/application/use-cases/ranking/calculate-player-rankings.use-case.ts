import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { z } from 'zod';
import { Ranking } from '../../../domain/ranking/ranking.entity';
import { IRankingRepository } from '../../interfaces/repositories/ranking.repository';
import { IStatisticRepository } from '../../interfaces/repositories/statistic.repository';
import { IPlayerRepository } from '../../interfaces/repositories/player.repository';
import { v4 as uuidv4 } from 'uuid';
import { Player } from '../../../domain/player/player.entity';

// Input validation schema
const CalculatePlayerRankingsInputSchema = z.object({
  // Optional parameter to recalculate all rankings or a specific player's ranking
  playerId: z.string().uuid({ message: 'Invalid player ID format' }).optional()
});

// Input type
export type CalculatePlayerRankingsInput = z.infer<typeof CalculatePlayerRankingsInputSchema>;

// Output type
export interface CalculatePlayerRankingsOutput {
  updatedRankings: Ranking[];
}

/**
 * Use case for calculating player rankings
 * Computes global rankings based on aggregated statistics like win ratio, total points, etc.
 */
export class CalculatePlayerRankingsUseCase extends BaseUseCase<
  CalculatePlayerRankingsInput,
  CalculatePlayerRankingsOutput
> {
  constructor(
    private readonly rankingRepository: IRankingRepository,
    private readonly statisticRepository: IStatisticRepository,
    private readonly playerRepository: IPlayerRepository
  ) {
    super();
  }

  protected async executeImpl(
    input: CalculatePlayerRankingsInput
  ): Promise<Result<CalculatePlayerRankingsOutput>> {
    try {
      // Validate input
      const validatedData = await CalculatePlayerRankingsInputSchema.parseAsync(input);

      // Array to store updated rankings
      const updatedRankings: Ranking[] = [];

      // If a specific player ID is provided, calculate only that player's ranking
      if (validatedData.playerId) {
        const player = await this.playerRepository.findById(validatedData.playerId);
        if (!player) {
          return Result.fail<CalculatePlayerRankingsOutput>(
            new Error('Player not found')
          );
        }

        const statistic = await this.statisticRepository.findByPlayerId(validatedData.playerId);
        if (!statistic) {
          return Result.fail<CalculatePlayerRankingsOutput>(
            new Error('Statistics not found for this player')
          );
        }

        // Get all statistics to determine relative ranking
        const allStatistics = await this.statisticRepository.findAll();
        
        // Calculate ranking points based on statistics
        // Formula: (winRate * 0.4) + (averageScore * 0.3) + (tournamentsWon * 15) + (matchesWon * 0.3)
        const rankingPoints = 
          (statistic.winRate * 0.4) + 
          (statistic.averageScore * 0.3) + 
          (statistic.tournamentsWon * 15) + 
          (statistic.matchesWon * 0.3);

        // Sort all statistics by calculated ranking points to determine positions
        const rankedStatistics = allStatistics.map(s => {
          const points = 
            (s.winRate * 0.4) + 
            (s.averageScore * 0.3) + 
            (s.tournamentsWon * 15) + 
            (s.matchesWon * 0.3);
          return { 
            playerId: s.playerId, 
            points 
          };
        }).sort((a, b) => b.points - a.points);
        
        // Find global position
        const globalPosition = rankedStatistics.findIndex(s => s.playerId === validatedData.playerId) + 1;
        
        // Get all players of the same level
        const playersInCategory = await this.playerRepository.findByLevel(player.level);
        const playerIdsInCategory = playersInCategory.map((p: Player) => p.id);
        
        // Filter statistics for players in the same category
        const categoryRankedStatistics = rankedStatistics
          .filter(rs => playerIdsInCategory.includes(rs.playerId))
          .sort((a, b) => b.points - a.points);
        
        // Find category position
        const categoryPosition = categoryRankedStatistics.findIndex(s => s.playerId === validatedData.playerId) + 1;
        
        // Check if player already has a ranking
        let playerRanking = await this.rankingRepository.findByPlayerId(validatedData.playerId);
        
        if (playerRanking) {
          // Update existing ranking
          playerRanking.updatePoints(rankingPoints);
          playerRanking.updateGlobalPosition(globalPosition);
          playerRanking.updateCategoryPosition(categoryPosition);
          playerRanking.updatePlayerLevel(player.level);
          
          await this.rankingRepository.update(playerRanking);
        } else {
          // Create new ranking
          playerRanking = new Ranking(
            uuidv4(),
            validatedData.playerId,
            rankingPoints,
            globalPosition,
            categoryPosition,
            player.level,
            null,  // No previous position
            0,     // No position change
            new Date(),
            new Date(),
            new Date()
          );
          
          await this.rankingRepository.save(playerRanking);
        }
        
        updatedRankings.push(playerRanking);
      } else {
        // Calculate rankings for all players
        
        // Get all player statistics
        const allStatistics = await this.statisticRepository.findAll();
        
        // Calculate ranking points for each player
        const playerRankings = allStatistics.map(s => {
          const points = 
            (s.winRate * 0.4) + 
            (s.averageScore * 0.3) + 
            (s.tournamentsWon * 15) + 
            (s.matchesWon * 0.3);
          
          return {
            playerId: s.playerId,
            points
          };
        });
        
        // Sort by ranking points to determine global positions
        const sortedRankings = [...playerRankings].sort((a, b) => b.points - a.points);
        
        // Get all players to determine their levels
        const allPlayers = await this.playerRepository.findAll();
        const playerMap = new Map(allPlayers.map(p => [p.id, p]));
        
        // Group players by level for category rankings
        const playersByLevel = allPlayers.reduce((acc, player) => {
          if (!acc[player.level]) {
            acc[player.level] = [];
          }
          acc[player.level].push(player.id);
          return acc;
        }, {} as Record<string, string[]>);
        
        // Calculate category positions
        const categoryPositions: Record<string, Record<string, number>> = {};
        
        for (const [level, playerIds] of Object.entries(playersByLevel)) {
          // Filter and sort rankings for this category
          const categoryRankings = sortedRankings
            .filter(r => playerIds.includes(r.playerId))
            .sort((a, b) => b.points - a.points);
          
          // Store category positions
          categoryPositions[level] = {};
          categoryRankings.forEach((r, index) => {
            categoryPositions[level][r.playerId] = index + 1;
          });
        }
        
        // Update all player rankings
        for (let i = 0; i < sortedRankings.length; i++) {
          const { playerId, points } = sortedRankings[i];
          const globalPosition = i + 1;
          
          // Get player to determine level
          const player = playerMap.get(playerId);
          
          if (!player) {
            continue; // Skip if player not found
          }
          
          const categoryPosition = categoryPositions[player.level][playerId];
          
          // Check if player already has a ranking
          let playerRanking = await this.rankingRepository.findByPlayerId(playerId);
          
          if (playerRanking) {
            // Update existing ranking
            playerRanking.updatePoints(points);
            playerRanking.updateGlobalPosition(globalPosition);
            playerRanking.updateCategoryPosition(categoryPosition);
            playerRanking.updatePlayerLevel(player.level);
            
            await this.rankingRepository.update(playerRanking);
          } else {
            // Create new ranking
            playerRanking = new Ranking(
              uuidv4(),
              playerId,
              points,
              globalPosition,
              categoryPosition,
              player.level,
              null,  // No previous position
              0,     // No position change
              new Date(),
              new Date(),
              new Date()
            );
            
            await this.rankingRepository.save(playerRanking);
          }
          
          updatedRankings.push(playerRanking);
        }
      }

      return Result.ok<CalculatePlayerRankingsOutput>({ updatedRankings });
    } catch (error) {
      return Result.fail<CalculatePlayerRankingsOutput>(
        error instanceof Error ? error : new Error('Failed to calculate player rankings')
      );
    }
  }
} 