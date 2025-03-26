import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { UserRole, PlayerLevel, PrismaClient } from '@prisma/client';
import { GetPlayerStatisticsUseCase } from '../../core/application/use-cases/statistic/get-player-statistics.use-case';
import { GetTournamentStatisticsUseCase } from '../../core/application/use-cases/statistic/get-tournament-statistics.use-case';
import { ListGlobalStatisticsUseCase } from '../../core/application/use-cases/statistic/list-global-statistics.use-case';
import { UpdateStatisticsAfterMatchUseCase } from '../../core/application/use-cases/statistic/update-statistics-after-match.use-case';
import { IStatisticRepository } from '../../core/application/interfaces/repositories/statistic.repository';
import { IPlayerRepository } from '../../core/application/interfaces/repositories/player.repository';
import { ITournamentRepository } from '../../core/application/interfaces/repositories/tournament.repository';
import { IMatchRepository } from '../../core/application/interfaces/repositories/match.repository';
import { ContainerRequest } from '../middlewares/di.middleware';

const prisma = new PrismaClient();

export class StatisticController {
  /**
   * Get player statistics
   */
  public getPlayerStatistics = async (req: ContainerRequest, res: Response): Promise<void> => {
    try {
      const playerId = req.params.playerId;
      const getPlayerStatisticsUseCase = req.container?.get('getPlayerStatisticsUseCase');
      
      if (!getPlayerStatisticsUseCase) {
        res.status(500).json({ error: 'Use case not available' });
        return;
      }
      
      const result = await getPlayerStatisticsUseCase.execute({
        playerId,
        dateRange: req.query.dateRange 
          ? JSON.parse(String(req.query.dateRange)) 
          : undefined,
      });

      if (result.isFailure) {
        if (result.error.message === 'Player not found') {
          res.status(404).json({ error: result.error.message });
          return;
        }
        if (result.error.message === 'Statistics not found for this player') {
          res.status(404).json({ error: result.error.message });
          return;
        }
        res.status(400).json({ error: result.error.message });
        return;
      }

      res.status(200).json(result.getValue());
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * Get tournament statistics
   */
  public getTournamentStatistics = async (req: ContainerRequest, res: Response): Promise<void> => {
    try {
      const tournamentId = req.params.tournamentId;
      const getTournamentStatisticsUseCase = req.container?.get('getTournamentStatisticsUseCase');
      
      if (!getTournamentStatisticsUseCase) {
        res.status(500).json({ message: 'Use case not available' });
        return;
      }
      
      const result = await getTournamentStatisticsUseCase.execute({
        tournamentId,
      });

      if (result.isFailure) {
        if (result.error.message === 'Tournament not found') {
          res.status(404).json({ message: result.error.message });
          return;
        }
        if (result.error.message === 'No statistics found for this tournament') {
          res.status(404).json({ message: result.error.message });
          return;
        }
        res.status(400).json({ message: result.error.message });
        return;
      }

      res.status(200).json(result.getValue());
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  /**
   * Get global statistics with pagination and filters
   */
  public getGlobalStatistics = async (req: ContainerRequest, res: Response): Promise<void> => {
    try {
      const page = req.query.page ? parseInt(String(req.query.page)) : 1;
      const limit = req.query.limit ? parseInt(String(req.query.limit)) : 10;
      const sortBy = req.query.sortBy ? String(req.query.sortBy) : 'totalPoints';
      const sortOrder = req.query.sortOrder === 'desc' ? 'desc' : 'asc';
      const playerLevel = req.query.playerLevel ? String(req.query.playerLevel) : undefined;
      
      const listGlobalStatisticsUseCase = req.container?.get('listGlobalStatisticsUseCase');
      
      if (!listGlobalStatisticsUseCase) {
        res.status(500).json({ error: 'Use case not available' });
        return;
      }

      const result = await listGlobalStatisticsUseCase.execute({
        pagination: {
          page,
          limit,
          sortBy: sortBy as 'winRate' | 'matchesPlayed' | 'matchesWon' | 'totalPoints' | 'averageScore',
          sortOrder: sortOrder as 'asc' | 'desc'
        },
        playerLevel: playerLevel as any
      });

      if (result.isFailure) {
        res.status(400).json({ error: result.error.message });
        return;
      }

      res.status(200).json(result.getValue());
    } catch (error) {
      console.error('Error in getGlobalStatistics:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * Update statistics after a match
   */
  public updateStatisticsAfterMatch = async (req: ContainerRequest, res: Response): Promise<void> => {
    try {
      const matchId = req.params.matchId;
      const updateStatisticsAfterMatchUseCase = req.container?.get('updateStatisticsAfterMatchUseCase');
      
      if (!updateStatisticsAfterMatchUseCase) {
        res.status(500).json({ error: 'Use case not available' });
        return;
      }
      
      const result = await updateStatisticsAfterMatchUseCase.execute({
        matchId,
      });

      if (result.isFailure) {
        if (result.error.message === 'Match not found') {
          res.status(404).json({ error: result.error.message });
          return;
        }
        if (result.error.message === 'Cannot update statistics for a match that is not completed' ||
            result.error.message === 'Match scores not recorded') {
          res.status(400).json({ error: result.error.message });
          return;
        }
        res.status(400).json({ error: result.error.message });
        return;
      }

      res.status(200).json(result.getValue());
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * Get all statistics (admin functionality)
   * @deprecated Not used in MVP / External or future scope
   */
  public getStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      // This functionality is not used in the frontend MVP
      // Keeping as a mock implementation for potential future use
      res.status(200).json({
        message: 'Mock implementation for getting all statistics (admin)',
        query: req.query,
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * Get statistic by ID (admin functionality)
   * @deprecated Not used in MVP / External or future scope
   */
  public getStatisticById = async (req: Request, res: Response): Promise<void> => {
    try {
      // This functionality is not used in the frontend MVP
      // Keeping as a mock implementation for potential future use
      const id = req.params.id;
      res.status(200).json({
        message: 'Mock implementation for getting statistic by ID (admin)',
        id,
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * Create statistic (admin functionality)
   * @deprecated Not used in MVP / External or future scope
   */
  public createStatistic = async (req: Request, res: Response): Promise<void> => {
    try {
      // This functionality is not used in the frontend MVP
      // Keeping as a mock implementation for potential future use
      res.status(201).json({
        message: 'Mock implementation for creating statistic (admin)',
        body: req.body,
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * Update statistic (admin functionality)
   * @deprecated Not used in MVP / External or future scope
   */
  public updateStatistic = async (req: Request, res: Response): Promise<void> => {
    try {
      // This functionality is not used in the frontend MVP
      // Keeping as a mock implementation for potential future use
      const id = req.params.id;
      res.status(200).json({
        message: 'Mock implementation for updating statistic (admin)',
        id,
        body: req.body,
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * Delete statistic (admin functionality)
   * @deprecated Not used in MVP / External or future scope
   */
  public deleteStatistic = async (req: Request, res: Response): Promise<void> => {
    try {
      // This functionality is not used in the frontend MVP
      // Keeping as a mock implementation for potential future use
      const id = req.params.id;
      res.status(200).json({
        message: 'Mock implementation for deleting statistic (admin)',
        id,
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * Get user statistics (deprecated - use getPlayerStatistics instead)
   * @deprecated Use getPlayerStatistics instead
   */
  public getUserStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId;
      res.status(200).json({
        message: 'This endpoint is deprecated. Use /api/statistics/player/:playerId instead',
        userId,
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

export class RankingController {
  // Helper function to transform BigInt values to regular numbers
  private transformRankingResults(results: any[]) {
    return results.map(item => {
      const transformed: Record<string, any> = {};
      for (const key in item) {
        // Convert BigInt to Number
        if (typeof item[key] === 'bigint') {
          transformed[key] = Number(item[key]);
        } else {
          transformed[key] = item[key];
        }
      }
      return transformed;
    });
  }

  /**
   * Get rankings - Returns players ordered by total points accumulated across all tournaments
   * @route GET /api/rankings
   */
  public getRankings = async (req: Request, res: Response) => {
    try {
      // Get query parameters (limit and offset for pagination)
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

      // Query the database to get player rankings based on total points
      const rawPlayerRankings = await prisma.$queryRaw`
        SELECT 
          u.id as player_id, 
          u.name as full_name, 
          COALESCE(SUM(s.points), 0) as total_points,
          RANK() OVER (ORDER BY COALESCE(SUM(s.points), 0) DESC) as position
        FROM 
          "User" u
        LEFT JOIN 
          "Statistic" s ON u.id = s."userId"
        WHERE 
          u.role = 'PLAYER'
        GROUP BY 
          u.id, u.name
        ORDER BY 
          total_points DESC, full_name ASC
        LIMIT ${limit} OFFSET ${offset}
      `;

      // Transform any BigInt values to regular numbers
      const playerRankings = this.transformRankingResults(rawPlayerRankings as any[]);

      return res.status(200).json({
        status: 'success',
        data: {
          rankings: playerRankings,
        },
      });
    } catch (error) {
      console.error('Error getting rankings:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve rankings',
      });
    }
  };

  /**
   * Get rankings by category - Returns rankings filtered by player category/level
   * @route GET /api/rankings/:categoryId
   */
  public getRankingsByCategory = async (req: Request, res: Response) => {
    try {
      const { categoryId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

      // Validate that categoryId is a valid PlayerLevel
      if (!Object.values(PlayerLevel).includes(categoryId as PlayerLevel)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid player category',
        });
      }

      // Query the database to get player rankings for a specific category
      const rawPlayerRankings = await prisma.$queryRaw`
        SELECT 
          u.id as player_id, 
          u.name as full_name, 
          COALESCE(SUM(s.points), 0) as total_points,
          RANK() OVER (ORDER BY COALESCE(SUM(s.points), 0) DESC) as position
        FROM 
          "User" u
        JOIN 
          "Player" p ON u.id = p."userId"
        LEFT JOIN 
          "Statistic" s ON u.id = s."userId"
        WHERE 
          u.role = 'PLAYER' AND p.level = ${categoryId}::\"PlayerLevel\"
        GROUP BY 
          u.id, u.name
        ORDER BY 
          total_points DESC, full_name ASC
        LIMIT ${limit} OFFSET ${offset}
      `;

      // Transform any BigInt values to regular numbers
      const playerRankings = this.transformRankingResults(rawPlayerRankings as any[]);

      return res.status(200).json({
        status: 'success',
        data: {
          rankings: playerRankings,
        },
      });
    } catch (error) {
      console.error('Error getting rankings by category:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve rankings by category',
      });
    }
  };
}
