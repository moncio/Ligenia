import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { UserRole, PlayerLevel, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class StatisticController {
  /**
   * Get all statistics
   * @route GET /api/statistics
   */
  public getStatistics = async (req: Request, res: Response) => {
    try {
      // Parámetros de consulta (ya validados por el middleware)
      const { userId, tournamentId, year, limit, offset } = req.query;

      // TODO: Implementar la lógica para obtener estadísticas desde el caso de uso correspondiente
      // En este punto solo implementamos una respuesta simulada

      const statistics = [
        {
          id: '1',
          userId: 'user1',
          userName: 'User 1',
          tournamentId: 'tournament1',
          tournamentName: 'Tournament 1',
          matchesPlayed: 10,
          wins: 8,
          losses: 2,
          points: 24,
          rank: 1
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'User 2',
          tournamentId: 'tournament1',
          tournamentName: 'Tournament 1',
          matchesPlayed: 10,
          wins: 6,
          losses: 4,
          points: 18,
          rank: 2
        }
      ];

      return res.status(200).json({
        status: 'success',
        data: {
          statistics
        }
      });
    } catch (error) {
      console.error('Error getting statistics:', error);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };

  /**
   * Get statistic by ID
   * @route GET /api/statistics/:id
   */
  public getStatisticById = async (req: Request, res: Response) => {
    try {
      // El parámetro id ya ha sido validado por el middleware
      const { id } = req.params;

      // TODO: Implementar la lógica para obtener una estadística por ID desde el caso de uso correspondiente
      // En este punto solo implementamos una respuesta simulada

      const statistic = {
        id,
        userId: 'user1',
        userName: 'User 1',
        tournamentId: 'tournament1',
        tournamentName: 'Tournament 1',
        matchesPlayed: 10,
        wins: 8,
        losses: 2,
        points: 24,
        rank: 1
      };

      return res.status(200).json({
        status: 'success',
        data: {
          statistic
        }
      });
    } catch (error) {
      console.error('Error getting statistic by ID:', error);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };

  /**
   * Create statistic
   * @route POST /api/statistics
   */
  public createStatistic = async (req: AuthRequest, res: Response) => {
    try {
      // Los datos ya han sido validados por el middleware
      const statisticData = req.body;

      // Verificar que el usuario esté autenticado y tenga rol de administrador
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to create statistics'
        });
      }

      // TODO: Implementar la lógica para crear una estadística desde el caso de uso correspondiente
      // En este punto solo implementamos una respuesta simulada

      const statistic = {
        id: 'generated-uuid',
        ...statisticData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return res.status(201).json({
        status: 'success',
        data: {
          statistic
        }
      });
    } catch (error) {
      console.error('Error creating statistic:', error);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };

  /**
   * Update statistic
   * @route PUT /api/statistics/:id
   */
  public updateStatistic = async (req: AuthRequest, res: Response) => {
    try {
      // El parámetro id y el body ya han sido validados por el middleware
      const { id } = req.params;
      const statisticData = req.body;

      // Verificar que el usuario esté autenticado y tenga rol de administrador
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to update statistics'
        });
      }

      // TODO: Implementar la lógica para actualizar una estadística desde el caso de uso correspondiente
      // En este punto solo implementamos una respuesta simulada

      const statistic = {
        id,
        userId: 'user1',
        tournamentId: 'tournament1',
        ...statisticData,
        updatedAt: new Date().toISOString()
      };

      return res.status(200).json({
        status: 'success',
        data: {
          statistic
        }
      });
    } catch (error) {
      console.error('Error updating statistic:', error);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };

  /**
   * Delete statistic
   * @route DELETE /api/statistics/:id
   */
  public deleteStatistic = async (req: AuthRequest, res: Response) => {
    try {
      // El parámetro id ya ha sido validado por el middleware
      const { id } = req.params;

      // Verificar que el usuario esté autenticado y tenga rol de administrador
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to delete statistics'
        });
      }

      // TODO: Implementar la lógica para eliminar una estadística desde el caso de uso correspondiente
      // En este punto solo implementamos una respuesta simulada

      return res.status(200).json({
        status: 'success',
        message: 'Statistic deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting statistic:', error);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };

  /**
   * Get user statistics
   * @route GET /api/statistics/user/:userId
   */
  public getUserStatistics = async (req: Request, res: Response) => {
    try {
      // El parámetro userId ya ha sido validado por el middleware
      const { userId } = req.params;

      // TODO: Implementar la lógica para obtener estadísticas de un usuario desde el caso de uso correspondiente
      // En este punto solo implementamos una respuesta simulada

      const statistics = [
        {
          id: '1',
          userId,
          tournamentId: 'tournament1',
          tournamentName: 'Tournament 1',
          matchesPlayed: 10,
          wins: 8,
          losses: 2,
          points: 24,
          rank: 1
        },
        {
          id: '2',
          userId,
          tournamentId: 'tournament2',
          tournamentName: 'Tournament 2',
          matchesPlayed: 8,
          wins: 5,
          losses: 3,
          points: 15,
          rank: 3
        }
      ];

      return res.status(200).json({
        status: 'success',
        data: {
          statistics
        }
      });
    } catch (error) {
      console.error('Error getting user statistics:', error);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };

  /**
   * Get tournament statistics
   * @route GET /api/statistics/tournament/:tournamentId
   */
  public getTournamentStatistics = async (req: Request, res: Response) => {
    try {
      // El parámetro tournamentId ya ha sido validado por el middleware
      const { tournamentId } = req.params;

      // TODO: Implementar la lógica para obtener estadísticas de un torneo desde el caso de uso correspondiente
      // En este punto solo implementamos una respuesta simulada

      const statistics = [
        {
          id: '1',
          userId: 'user1',
          userName: 'User 1',
          tournamentId,
          matchesPlayed: 10,
          wins: 8,
          losses: 2,
          points: 24,
          rank: 1
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'User 2',
          tournamentId,
          matchesPlayed: 10,
          wins: 6,
          losses: 4,
          points: 18,
          rank: 2
        }
      ];

      return res.status(200).json({
        status: 'success',
        data: {
          statistics
        }
      });
    } catch (error) {
      console.error('Error getting tournament statistics:', error);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
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
          rankings: playerRankings
        }
      });
    } catch (error) {
      console.error('Error getting rankings:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve rankings'
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
          message: 'Invalid player category'
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
          rankings: playerRankings
        }
      });
    } catch (error) {
      console.error('Error getting rankings by category:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve rankings by category'
      });
    }
  };
} 