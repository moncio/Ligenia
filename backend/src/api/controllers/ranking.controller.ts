import { Request, Response } from 'express';
import { ContainerRequest } from '../middlewares/di.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';
import { PlayerLevel } from '../../core/domain/tournament/tournament.entity';
import { GetGlobalRankingListUseCase } from '../../core/application/use-cases/ranking/get-global-ranking-list.use-case';
import { GetCategoryBasedRankingUseCase } from '../../core/application/use-cases/ranking/get-category-based-ranking.use-case';
import { UpdateRankingsAfterMatchUseCase } from '../../core/application/use-cases/ranking/update-rankings-after-match.use-case';
import { CalculatePlayerRankingsUseCase } from '../../core/application/use-cases/ranking/calculate-player-rankings.use-case';

export class RankingController {
  /**
   * Get global rankings list with optional filters and pagination
   */
  public getGlobalRankingList = async (req: ContainerRequest, res: Response): Promise<void> => {
    try {
      const limit = req.query.limit ? parseInt(String(req.query.limit)) : 10;
      const offset = req.query.offset ? parseInt(String(req.query.offset)) : 0;
      const playerLevel = req.query.playerLevel as unknown as PlayerLevel | undefined;
      const sortBy = (req.query.sortBy as 'rankingPoints' | 'globalPosition') || 'globalPosition';
      const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';

      const getGlobalRankingListUseCase = req.container?.get<GetGlobalRankingListUseCase>('getGlobalRankingListUseCase');
      
      if (!getGlobalRankingListUseCase) {
        res.status(500).json({ error: 'Use case not available' });
        return;
      }
      
      const result = await getGlobalRankingListUseCase.execute({
        limit,
        offset,
        playerLevel,
        sortBy,
        sortOrder,
      });

      if (result.isFailure) {
        res.status(400).json({ error: result.error?.message || 'Failed to get global rankings' });
        return;
      }

      res.status(200).json(result.getValue());
    } catch (error) {
      console.error('Error in getGlobalRankingList:', error);
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      res.status(500).json({ error: errorMessage });
    }
  };

  /**
   * Get rankings filtered by player category
   */
  public getCategoryBasedRanking = async (req: ContainerRequest, res: Response): Promise<void> => {
    try {
      const playerLevel = req.params.categoryId as unknown as PlayerLevel;
      const limit = req.query.limit ? parseInt(String(req.query.limit)) : 10;
      const offset = req.query.offset ? parseInt(String(req.query.offset)) : 0;
      const sortBy = (req.query.sortBy as 'rankingPoints' | 'categoryPosition') || 'categoryPosition';
      const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';

      const getCategoryBasedRankingUseCase = req.container?.get<GetCategoryBasedRankingUseCase>('getCategoryBasedRankingUseCase');
      
      if (!getCategoryBasedRankingUseCase) {
        res.status(500).json({ error: 'Use case not available' });
        return;
      }
      
      const result = await getCategoryBasedRankingUseCase.execute({
        playerLevel,
        limit,
        offset,
        sortBy,
        sortOrder,
      });

      if (result.isFailure) {
        if (result.error?.message?.includes('Invalid player level')) {
          res.status(400).json({ error: result.error.message });
          return;
        }
        res.status(400).json({ error: result.error?.message || 'Failed to get category rankings' });
        return;
      }

      res.status(200).json(result.getValue());
    } catch (error) {
      console.error('Error in getCategoryBasedRanking:', error);
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      res.status(500).json({ error: errorMessage });
    }
  };

  /**
   * Update rankings after a match has been completed
   */
  public updateRankingsAfterMatch = async (req: ContainerRequest, res: Response): Promise<void> => {
    try {
      const matchId = req.params.matchId;
      const updateRankingsAfterMatchUseCase = req.container?.get<UpdateRankingsAfterMatchUseCase>('updateRankingsAfterMatchUseCase');
      
      if (!updateRankingsAfterMatchUseCase) {
        res.status(500).json({ error: 'Use case not available' });
        return;
      }
      
      const result = await updateRankingsAfterMatchUseCase.execute({
        matchId,
      });

      if (result.isFailure) {
        const errorMessage = result.error?.message || 'Failed to update rankings';
        
        if (errorMessage === 'Match not found') {
          res.status(404).json({ error: errorMessage });
          return;
        }
        if (errorMessage === 'Cannot update rankings for a match that is not completed' ||
            errorMessage === 'Match scores not recorded') {
          res.status(400).json({ error: errorMessage });
          return;
        }
        res.status(400).json({ error: errorMessage });
        return;
      }

      res.status(200).json(result.getValue());
    } catch (error) {
      console.error('Error in updateRankingsAfterMatch:', error);
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      res.status(500).json({ error: errorMessage });
    }
  };

  /**
   * Calculate or recalculate player rankings
   */
  public calculatePlayerRankings = async (req: ContainerRequest, res: Response): Promise<void> => {
    try {
      const playerId = req.body.playerId;
      const calculatePlayerRankingsUseCase = req.container?.get<CalculatePlayerRankingsUseCase>('calculatePlayerRankingsUseCase');
      
      if (!calculatePlayerRankingsUseCase) {
        res.status(500).json({ error: 'Use case not available' });
        return;
      }
      
      const result = await calculatePlayerRankingsUseCase.execute({
        playerId,
      });

      if (result.isFailure) {
        const errorMessage = result.error?.message || 'Failed to calculate rankings';
        
        if (errorMessage === 'Player not found') {
          res.status(404).json({ error: errorMessage });
          return;
        }
        if (errorMessage === 'Statistics not found for this player') {
          res.status(404).json({ error: errorMessage });
          return;
        }
        res.status(400).json({ error: errorMessage });
        return;
      }

      res.status(200).json(result.getValue());
    } catch (error) {
      console.error('Error in calculatePlayerRankings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      res.status(500).json({ error: errorMessage });
    }
  };

  /**
   * Legacy method for backward compatibility with existing routing
   * @deprecated Use getGlobalRankingList instead
   */
  public getRankings = this.getGlobalRankingList;

  /**
   * Legacy method for backward compatibility with existing routing
   * @deprecated Use getCategoryBasedRanking instead
   */
  public getRankingsByCategory = this.getCategoryBasedRanking;
} 