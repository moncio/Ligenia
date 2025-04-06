import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { z } from 'zod';
import { Ranking } from '../../../domain/ranking/ranking.entity';
import { IRankingRepository } from '../../interfaces/repositories/ranking.repository';
import { IPlayerRepository } from '../../interfaces/repositories/player.repository';
import { Player } from '../../../domain/player/player.entity';
import { PlayerLevel } from '../../../domain/tournament/tournament.entity';
import { injectable, inject } from 'inversify';

// Input validation schema
const GetGlobalRankingListInputSchema = z.object({
  limit: z.number().int().positive().default(10),
  offset: z.number().int().min(0).default(0),
  playerLevel: z.enum(['P1', 'P2', 'P3']).optional(),
  sortBy: z.enum(['rankingPoints', 'globalPosition']).default('globalPosition'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
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
@injectable()
export class GetGlobalRankingListUseCase extends BaseUseCase<
  GetGlobalRankingListInput,
  GetGlobalRankingListOutput
> {
  constructor(
    @inject('RankingRepository') private readonly rankingRepository: IRankingRepository,
    @inject('PlayerRepository') private readonly playerRepository: IPlayerRepository,
  ) {
    super();
  }

  protected async executeImpl(
    input: GetGlobalRankingListInput,
  ): Promise<Result<GetGlobalRankingListOutput>> {
    try {
      // Validate input with more flexible handling for playerLevel
      let validatedInput;
      try {
        // First try to validate the input directly
        validatedInput = await GetGlobalRankingListInputSchema.parseAsync(input);
        console.log("Input validated successfully:", validatedInput);
      } catch (validationError) {
        console.warn('Validation error in GetGlobalRankingListUseCase, removing problematic fields', validationError);
        
        // Create a clean input without the playerLevel field
        const { playerLevel, ...cleanInput } = input;
        
        // Try to validate without the problematic field
        validatedInput = await GetGlobalRankingListInputSchema.parseAsync(cleanInput);
        console.log("Input validated after removing playerLevel:", validatedInput);
      }

      // Get total count for pagination
      console.log(`Finding total rankings count with playerLevel: ${validatedInput.playerLevel || 'all'}`);
      const totalCount = await this.rankingRepository.count({
        playerLevel: validatedInput.playerLevel as PlayerLevel | undefined,
      });

      // Get rankings with pagination and sorting
      console.log(`Finding rankings with pagination: limit=${validatedInput.limit}, offset=${validatedInput.offset}`);
      const rankings = await this.rankingRepository.findAll({
        limit: validatedInput.limit,
        offset: validatedInput.offset,
        playerLevel: validatedInput.playerLevel as PlayerLevel | undefined,
        sortBy: validatedInput.sortBy,
        sortOrder: validatedInput.sortOrder,
      });

      console.log(`Found ${rankings.length} rankings`);

      // Get player details for each ranking
      const playerIds = rankings.map(ranking => ranking.playerId);
      console.log(`Getting player details for ${playerIds.length} players`);
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
        limit: validatedInput.limit,
        offset: validatedInput.offset,
        hasMore: validatedInput.offset + rankings.length < totalCount,
      };

      return Result.ok<GetGlobalRankingListOutput>({
        rankings: rankingsWithPlayer,
        pagination,
      });
    } catch (error) {
      console.error('Error in GetGlobalRankingListUseCase:', error);
      return Result.fail<GetGlobalRankingListOutput>(
        error instanceof Error ? error : new Error('Failed to get global ranking list'),
      );
    }
  }
}
