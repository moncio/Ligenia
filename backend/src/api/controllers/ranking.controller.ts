import { Request, Response } from 'express';
import { ContainerRequest } from '../middlewares/di.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';
import { PlayerLevel } from '../../core/domain/tournament/tournament.entity';
import { GetGlobalRankingListUseCase } from '../../core/application/use-cases/ranking/get-global-ranking-list.use-case';
import { UpdateRankingsAfterMatchUseCase } from '../../core/application/use-cases/ranking/update-rankings-after-match.use-case';
import { CalculatePlayerRankingsUseCase } from '../../core/application/use-cases/ranking/calculate-player-rankings.use-case';

export class RankingController {
  /**
   * Get global rankings list with optional filters and pagination
   */
  public getGlobalRankingList = async (req: ContainerRequest, res: Response) => {
    try {
      console.log('Received request: getGlobalRankingList');
      console.log('Query params:', req.query);
      
      const limit = req.query.limit ? parseInt(String(req.query.limit)) : 10;
      const offset = req.query.offset ? parseInt(String(req.query.offset)) : 0;
      const sortBy = (req.query.sortBy as 'rankingPoints' | 'globalPosition') || 'globalPosition';
      const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';

      console.log('Input for getGlobalRankingList:', { limit, offset, sortBy, sortOrder });
      
      // Use direct database access to calculate rankings from statistics
      try {
        console.log('Using direct database access for global rankings');
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        // Get all players with their statistics
        const players = await prisma.player.findMany({
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                statistics: true
              }
            }
          }
        });
        
        console.log(`Found ${players.length} players`);
        
        // Calculate total points for each player
        const playerRankings = players.map((player: any) => {
          const totalPoints = player.user.statistics.reduce((sum: number, stat: any) => sum + stat.points, 0);
          return {
            id: `ranking-${player.id}`,
            playerId: player.id,
            globalPosition: 0, // We'll calculate this after sorting
            categoryPosition: 0, // We'll calculate this after grouping and sorting
            rankingPoints: totalPoints,
            category: player.level,
            lastUpdated: new Date(),
            player: {
              id: player.id,
              level: player.level,
              country: player.country,
              avatar_url: player.avatar_url,
              name: player.user?.name,
              email: player.user?.email
            }
          };
        });
        
        // Sort by total points (descending)
        playerRankings.sort((a: any, b: any) => b.rankingPoints - a.rankingPoints);
        
        // Assign global positions
        playerRankings.forEach((ranking: any, index: number) => {
          ranking.globalPosition = index + 1;
        });
        
        // Apply pagination
        const totalCount = playerRankings.length;
        const paginatedRankings = playerRankings.slice(offset, offset + limit);
        
        console.log(`Successfully calculated global rankings for ${totalCount} players`);
        
        // Create pagination info
        const pagination = {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + paginatedRankings.length < totalCount,
        };
        
        console.log(`Returning ${paginatedRankings.length} rankings after pagination`);
        
        return res.status(200).json({
          rankings: paginatedRankings,
          pagination
        });
      } catch (dbError) {
        console.error('Error accessing database for global rankings:', dbError);
        return res.status(500).json({ 
          status: 'error', 
          message: 'Internal server error - Database access failed' 
        });
      }
    } catch (error) {
      console.error('Error in getGlobalRankingList:', error);
      return res.status(500).json({ 
        status: 'error', 
        message: 'Internal server error' 
      });
    }
  };

  /**
   * Update rankings after a match
   */
  public updateRankingsAfterMatch = async (req: ContainerRequest, res: Response): Promise<void> => {
    try {
      const matchId = req.body.matchId;
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
  public getRankings = async (req: ContainerRequest, res: Response) => {
    // Call directly to the same code as getGlobalRankingList
    // but adjust the response to maintain compatibility with the old format
    try {
      console.log('Received request: getRankings (legacy endpoint)');
      console.log('Query params:', req.query);
      
      const limit = req.query.limit ? parseInt(String(req.query.limit)) : 10;
      const offset = req.query.offset ? parseInt(String(req.query.offset)) : 0;
      // We don't pass playerLevel on purpose to get all rankings
      const sortBy = 'globalPosition';
      const sortOrder = 'asc';

      const getGlobalRankingListUseCase = req.container?.get<GetGlobalRankingListUseCase>('getGlobalRankingListUseCase');
      
      if (!getGlobalRankingListUseCase) {
        console.error('getGlobalRankingListUseCase is undefined or null');
        return res.status(500).json({ 
          status: 'error', 
          message: 'Internal server error - Use case not available' 
        });
      }
      
      console.log('Executing getGlobalRankingListUseCase for legacy endpoint');
      
      const result = await getGlobalRankingListUseCase.execute({
        limit,
        offset,
        sortBy,
        sortOrder,
      });

      if (!result.isSuccess()) {
        console.error('Error from getGlobalRankingListUseCase:', result.getError());
        return res.status(400).json({
          status: 'error',
          message: result.getError()?.message || 'Failed to get global rankings',
        });
      }

      const data = result.getValue();
      
      // Transform to the format expected by the old API
      console.log(`Formatting response with ${data.rankings.length} rankings`);
      
      return res.status(200).json({
        status: 'success',
        data: {
          rankings: data.rankings,
          pagination: {
            total: data.pagination.total,
            page: Math.floor(data.pagination.offset / data.pagination.limit) + 1,
            limit: data.pagination.limit,
            totalPages: Math.ceil(data.pagination.total / data.pagination.limit),
          },
        },
      });
    } catch (error) {
      console.error('Error in getRankings:', error);
      return res.status(500).json({ 
        status: 'error', 
        message: 'Internal server error' 
      });
    }
  };

  /**
   * Get current authenticated user's ranking position
   * @route GET /api/rankings/me
   */
  public getCurrentUserRanking = async (req: ContainerRequest, res: Response) => {
    try {
      console.log('Received request: getCurrentUserRanking');
      
      // Get the authenticated user's ID from the request
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          status: 'error',
          message: 'User not authenticated'
        });
      }
      
      console.log(`Getting ranking position for user ${userId}`);
      
      try {
        // Use prisma to get the player info and ranking
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        // First, find the player associated with this user
        const player = await prisma.player.findFirst({
          where: {
            userId: userId
          },
          select: {
            id: true,
            user: {
              select: {
                name: true
              }
            }
          }
        });
        
        if (!player) {
          console.log(`No player profile found for user ${userId}`);
          return res.status(200).json({
            status: 'success',
            data: {
              position: null,
              player: null
            }
          });
        }
        
        console.log(`Found player with ID ${player.id}`);
        
        // Get all players with their total points (similar to getGlobalRankingList)
        const players = await prisma.player.findMany({
          include: {
            user: {
              select: {
                id: true,
                name: true,
                statistics: true
              }
            }
          }
        });
        
        // Calculate total points for each player
        const playerRankings = players.map((p: any) => {
          const totalPoints = p.user.statistics.reduce((sum: number, stat: any) => sum + stat.points, 0);
          return {
            playerId: p.id,
            userId: p.user.id,
            name: p.user.name,
            points: totalPoints
          };
        });
        
        // Sort by total points (descending)
        playerRankings.sort((a: any, b: any) => b.points - a.points);
        
        // Find the position of the current user's player
        const position = playerRankings.findIndex((p: any) => p.playerId === player.id) + 1; // +1 because index is 0-based
        
        console.log(`User's ranking position: ${position}`);
        
        return res.status(200).json({
          status: 'success',
          data: {
            position: position > 0 ? position : null,
            player: {
              id: player.id,
              name: player.user.name
            }
          }
        });
      } catch (dbError) {
        console.error('Error accessing database for user ranking:', dbError);
        return res.status(500).json({ 
          status: 'error', 
          message: 'Internal server error - Database access failed' 
        });
      }
    } catch (error) {
      console.error('Error in getCurrentUserRanking:', error);
      return res.status(500).json({ 
        status: 'error', 
        message: 'Internal server error' 
      });
    }
  };
} 