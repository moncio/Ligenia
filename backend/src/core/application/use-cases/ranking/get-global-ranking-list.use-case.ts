import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { z } from 'zod';
import { Ranking } from '../../../domain/ranking/ranking.entity';
import { IRankingRepository } from '../../interfaces/repositories/ranking.repository';
import { IPlayerRepository } from '../../interfaces/repositories/player.repository';
import { Player } from '../../../domain/player/player.entity';
import { PlayerLevel } from '../../../domain/tournament/tournament.entity';

// Input validation schema
const GetGlobalRankingListInputSchema = z.object({
  limit: z.number().int().positive().default(10),
  offset: z.number().int().min(0).default(0),
  playerLevel: z.nativeEnum(PlayerLevel).optional(),
  sortBy: z.enum(['rankingPoints', 'globalPosition']).default('globalPosition'),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
});

// Input type
export type GetGlobalRankingListInput = z.infer<typeof GetGlobalRankingListInputSchema>;

// Output type with pagination info
export interface GetGlobalRankingListOutput {
  rankings: (Ranking & { player?: Player })[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/**
 * Use case for retrieving a global ranking list
 * Returns a paginated and optionally filtered/sorted list of all ranked players
 */
export class GetGlobalRankingListUseCase extends BaseUseCase<
  GetGlobalRankingListInput,
  GetGlobalRankingListOutput
> {
  constructor(
    private readonly rankingRepository: IRankingRepository,
    private readonly playerRepository: IPlayerRepository
  ) {
    super();
  }

  protected async executeImpl(
    input: GetGlobalRankingListInput
  ): Promise<Result<GetGlobalRankingListOutput>> {
    try {
      // Validate input
      const validatedData = await GetGlobalRankingListInputSchema.parseAsync(input);

      // Get total count for pagination
      const totalCount = await this.rankingRepository.count({
        playerLevel: validatedData.playerLevel
      });

      // Get rankings with pagination and sorting
      const rankings = await this.rankingRepository.findAll({
        limit: validatedData.limit,
        offset: validatedData.offset,
        playerLevel: validatedData.playerLevel,
        sortBy: validatedData.sortBy,
        sortOrder: validatedData.sortOrder
      });

      // Get player details for each ranking
      const playerIds = rankings.map(ranking => ranking.playerId);
      const players = await this.playerRepository.findAll();
      const playerMap = new Map(players.filter(p => playerIds.includes(p.id)).map(p => [p.id, p]));

      // Combine ranking with player details
      const rankingsWithPlayer = rankings.map(ranking => {
        // Create a new object that maintains Ranking's methods
        const rankingWithPlayer = Object.create(Object.getPrototypeOf(ranking));
        // Copy all properties
        Object.assign(rankingWithPlayer, ranking);
        // Add player property
        rankingWithPlayer.player = playerMap.get(ranking.playerId);
        return rankingWithPlayer;
      });

      // Create pagination info
      const pagination = {
        total: totalCount,
        limit: validatedData.limit,
        offset: validatedData.offset,
        hasMore: validatedData.offset + rankings.length < totalCount
      };

      return Result.ok<GetGlobalRankingListOutput>({
        rankings: rankingsWithPlayer,
        pagination
      });
    } catch (error) {
      return Result.fail<GetGlobalRankingListOutput>(
        error instanceof Error ? error : new Error('Failed to get global ranking list')
      );
    }
  }
} 