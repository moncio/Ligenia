import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { z } from 'zod';
import { Ranking } from '../../../domain/ranking/ranking.entity';
import { IRankingRepository } from '../../interfaces/repositories/ranking.repository';
import { IPlayerRepository } from '../../interfaces/repositories/player.repository';
import { Player } from '../../../domain/player/player.entity';
import { PlayerLevel } from '../../../domain/tournament/tournament.entity';

// Input validation schema
const GetCategoryBasedRankingInputSchema = z.object({
  playerLevel: z.nativeEnum(PlayerLevel, {
    errorMap: () => ({ message: 'Invalid player level' }),
  }),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().min(0).default(0),
  sortBy: z.enum(['rankingPoints', 'categoryPosition']).default('categoryPosition'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Input type
export type GetCategoryBasedRankingInput = z.infer<typeof GetCategoryBasedRankingInputSchema>;

// Output type with pagination info
export interface GetCategoryBasedRankingOutput {
  rankings: (Ranking & { player?: Player })[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  playerLevel: PlayerLevel;
}

/**
 * Use case for retrieving rankings filtered by player category
 * Returns rankings filtered by player category (e.g., beginner, intermediate, pro)
 */
export class GetCategoryBasedRankingUseCase extends BaseUseCase<
  GetCategoryBasedRankingInput,
  GetCategoryBasedRankingOutput
> {
  constructor(
    private readonly rankingRepository: IRankingRepository,
    private readonly playerRepository: IPlayerRepository,
  ) {
    super();
  }

  protected async executeImpl(
    input: GetCategoryBasedRankingInput,
  ): Promise<Result<GetCategoryBasedRankingOutput>> {
    try {
      // Validate input
      const validatedData = await GetCategoryBasedRankingInputSchema.parseAsync(input);

      // Get total count of rankings in this category
      const totalCount = await this.rankingRepository.countByPlayerLevel(validatedData.playerLevel);

      // Get rankings for this category with specified sorting and pagination
      const rankings = await this.rankingRepository.findByPlayerLevel(validatedData.playerLevel, {
        limit: validatedData.limit,
        offset: validatedData.offset,
        sortBy: validatedData.sortBy,
        sortOrder: validatedData.sortOrder,
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
        hasMore: validatedData.offset + rankings.length < totalCount,
      };

      return Result.ok<GetCategoryBasedRankingOutput>({
        rankings: rankingsWithPlayer,
        pagination,
        playerLevel: validatedData.playerLevel,
      });
    } catch (error) {
      return Result.fail<GetCategoryBasedRankingOutput>(
        error instanceof Error ? error : new Error('Failed to get category-based ranking'),
      );
    }
  }
}
