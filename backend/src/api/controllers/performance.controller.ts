import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { UserRole } from '@prisma/client';
import { TrackPerformanceTrendsUseCase } from '../../core/application/use-cases/performance-history/track-performance-trends.use-case';
import { GetPlayerPerformanceHistoryUseCase } from '../../core/application/use-cases/performance-history/get-player-performance-history.use-case';
import { GetPerformanceSummaryUseCase } from '../../core/application/use-cases/performance-history/get-performance-summary.use-case';
import { RecordPerformanceEntryUseCase } from '../../core/application/use-cases/performance-history/record-performance-entry.use-case';
import { ContainerRequest } from '../middlewares/di.middleware';
import { Container } from 'inversify';
import { User } from '@prisma/client';

export class PerformanceController {
  /**
   * Get performance history
   * @route GET /api/performance
   */
  public getPerformanceHistory = async (req: Request, res: Response) => {
    try {
      // Parámetros de consulta (ya validados por el middleware)
      const { userId, year, month, limit, offset } = req.query;

      // TODO: Implementar la lógica para obtener historial de rendimiento desde el caso de uso correspondiente
      // En este punto solo implementamos una respuesta simulada

      const performanceRecords = [
        {
          id: '1',
          userId: userId || 'user1',
          userName: 'User 1',
          year: year || 2023,
          month: month || 1,
          matchesPlayed: 15,
          wins: 10,
          losses: 5,
          points: 30,
          createdAt: '2023-01-31T23:59:59Z',
          updatedAt: '2023-01-31T23:59:59Z',
        },
        {
          id: '2',
          userId: userId || 'user1',
          userName: 'User 1',
          year: year || 2023,
          month: month || 2,
          matchesPlayed: 18,
          wins: 12,
          losses: 6,
          points: 36,
          createdAt: '2023-02-28T23:59:59Z',
          updatedAt: '2023-02-28T23:59:59Z',
        },
      ];

      return res.status(200).json({
        status: 'success',
        data: {
          performance: performanceRecords,
        },
      });
    } catch (error) {
      console.error('Error getting performance history:', error);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };

  /**
   * Get performance by ID
   * @route GET /api/performance/:id
   */
  public getPerformanceById = async (req: Request, res: Response) => {
    try {
      // El parámetro id ya ha sido validado por el middleware
      const { id } = req.params;

      // TODO: Implementar la lógica para obtener un registro de rendimiento por ID desde el caso de uso correspondiente
      // En este punto solo implementamos una respuesta simulada

      const performance = {
        id,
        userId: 'user1',
        userName: 'User 1',
        year: 2023,
        month: 1,
        matchesPlayed: 15,
        wins: 10,
        losses: 5,
        points: 30,
        createdAt: '2023-01-31T23:59:59Z',
        updatedAt: '2023-01-31T23:59:59Z',
      };

      return res.status(200).json({
        status: 'success',
        data: {
          performance,
        },
      });
    } catch (error) {
      console.error('Error getting performance by ID:', error);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };

  /**
   * Get user performance history
   * @route GET /api/performance/user/:userId
   */
  public getUserPerformance = async (req: Request, res: Response) => {
    try {
      // El parámetro userId ya ha sido validado por el middleware
      const { userId } = req.params;
      // Parámetros de consulta opcionales (ya validados por el middleware)
      const { year, month } = req.query;

      // TODO: Implementar la lógica para obtener historial de rendimiento de un usuario desde el caso de uso correspondiente
      // En este punto solo implementamos una respuesta simulada

      const performanceRecords = [
        {
          id: '1',
          userId,
          userName: 'User Name',
          year: year || 2023,
          month: month || 1,
          matchesPlayed: 15,
          wins: 10,
          losses: 5,
          points: 30,
          createdAt: '2023-01-31T23:59:59Z',
          updatedAt: '2023-01-31T23:59:59Z',
        },
        {
          id: '2',
          userId,
          userName: 'User Name',
          year: year || 2023,
          month: month || 2,
          matchesPlayed: 18,
          wins: 12,
          losses: 6,
          points: 36,
          createdAt: '2023-02-28T23:59:59Z',
          updatedAt: '2023-02-28T23:59:59Z',
        },
      ];

      return res.status(200).json({
        status: 'success',
        data: {
          performance: performanceRecords,
        },
      });
    } catch (error) {
      console.error('Error getting user performance:', error);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };

  /**
   * Create performance record
   * @route POST /api/performance
   */
  public createPerformance = async (req: AuthRequest, res: Response) => {
    try {
      // Los datos ya han sido validados por el middleware
      const performanceData = req.body;

      // Verificar que el usuario esté autenticado y tenga rol de administrador
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to create performance records',
        });
      }

      // TODO: Implementar la lógica para crear un registro de rendimiento desde el caso de uso correspondiente
      // En este punto solo implementamos una respuesta simulada

      const performance = {
        id: 'generated-uuid',
        ...performanceData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return res.status(201).json({
        status: 'success',
        data: {
          performance,
        },
      });
    } catch (error) {
      console.error('Error creating performance record:', error);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };

  /**
   * Update performance record
   * @route PUT /api/performance/:id
   */
  public updatePerformance = async (req: AuthRequest, res: Response) => {
    try {
      // El parámetro id y el body ya han sido validados por el middleware
      const { id } = req.params;
      const performanceData = req.body;

      // Verificar que el usuario esté autenticado y tenga rol de administrador
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to update performance records',
        });
      }

      // TODO: Implementar la lógica para actualizar un registro de rendimiento desde el caso de uso correspondiente
      // En este punto solo implementamos una respuesta simulada

      const performance = {
        id,
        userId: 'user1',
        year: 2023,
        month: 1,
        ...performanceData,
        updatedAt: new Date().toISOString(),
      };

      return res.status(200).json({
        status: 'success',
        data: {
          performance,
        },
      });
    } catch (error) {
      console.error('Error updating performance record:', error);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };

  /**
   * Delete performance record
   * @route DELETE /api/performance/:id
   */
  public deletePerformance = async (req: AuthRequest, res: Response) => {
    try {
      // El parámetro id ya ha sido validado por el middleware
      const { id } = req.params;

      // Verificar que el usuario esté autenticado y tenga rol de administrador
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to delete performance records',
        });
      }

      // TODO: Implementar la lógica para eliminar un registro de rendimiento desde el caso de uso correspondiente
      // En este punto solo implementamos una respuesta simulada

      return res.status(200).json({
        status: 'success',
        data: null,
      });
    } catch (error) {
      console.error('Error deleting performance record:', error);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };

  /**
   * Get performance summary
   * @route GET /api/performance/summary
   */
  public getPerformanceSummary = async (req: Request, res: Response) => {
    try {
      // Parámetros de consulta (ya validados por el middleware)
      const { userId, year } = req.query;

      // TODO: Implementar la lógica para obtener resumen de rendimiento desde el caso de uso correspondiente
      // En este punto solo implementamos una respuesta simulada

      const summary = {
        userId: userId || 'user1',
        totalMatches: 33,
        totalWins: 22,
        totalLosses: 11,
        winRate: 66.67,
        totalPoints: 66,
        averagePointsPerMatch: 2,
        bestMonth: {
          year: 2023,
          month: 2,
          wins: 12,
          winRate: 66.67,
        },
      };

      return res.status(200).json({
        status: 'success',
        data: {
          summary,
        },
      });
    } catch (error) {
      console.error('Error getting performance summary:', error);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };

  /**
   * Track performance trends
   * @route GET /api/performance/trends
   */
  public trackPerformanceTrends = async (req: ContainerRequest, res: Response) => {
    try {
      // Parámetros de consulta (ya validados por el middleware)
      const { userId, timeframe = 'monthly' } = req.query;

      const trackPerformanceTrendsUseCase = req.container?.get(
        'trackPerformanceTrendsUseCase'
      ) as TrackPerformanceTrendsUseCase;

      if (!trackPerformanceTrendsUseCase) {
        console.error('trackPerformanceTrendsUseCase is undefined or null');
        return res.status(500).json({ 
          status: 'error', 
          message: 'Internal server error - Use case not available' 
        });
      }

      const result = await trackPerformanceTrendsUseCase.execute({
        userId: userId as string,
        timeframe: timeframe as 'monthly' | 'yearly' | 'all',
      });

      if (result.isSuccess()) {
        return res.status(200).json({
          status: 'success',
          data: {
            trends: result.getValue(),
          },
        });
      } else {
        const errorMessage = result.getError().message;
        return res.status(400).json({
          status: 'error',
          message: errorMessage,
        });
      }
    } catch (error) {
      console.error('Error tracking performance trends:', error);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };

  /**
   * Get player performance history
   * @route GET /api/performance/player/:playerId/history
   */
  public getPlayerPerformanceHistory = async (req: ContainerRequest, res: Response) => {
    try {
      const { playerId } = req.params;
      const { year, month } = req.query;

      const result = await req.container
        .get<GetPlayerPerformanceHistoryUseCase>('GetPlayerPerformanceHistoryUseCase')
        .execute({ playerId, year: year ? Number(year) : undefined, month: month ? Number(month) : undefined });

      if (!result.isSuccess) {
        const error = result.error;
        if (error.message === 'Invalid player ID format') {
          return res.status(400).json({ error: 'Invalid player ID format' });
        }
        if (error.message === 'Player not found') {
          return res.status(404).json({ error: 'Player not found' });
        }
        return res.status(500).json({ error: 'Internal server error' });
      }

      return res.status(200).json({ data: result.value });
    } catch (error) {
      console.error('Error in getPlayerPerformanceHistory:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * Get player performance summary
   * @route GET /api/performance/player/:playerId/summary
   */
  public getPlayerPerformanceSummary = async (req: ContainerRequest, res: Response) => {
    try {
      const { playerId } = req.params;
      const { year } = req.query;

      const result = await req.container
        .get<GetPerformanceSummaryUseCase>('GetPerformanceSummaryUseCase')
        .execute({ playerId, year: year ? Number(year) : undefined });

      if (!result.isSuccess) {
        const error = result.error;
        if (error.message === 'Invalid player ID format') {
          return res.status(400).json({ error: 'Invalid player ID format' });
        }
        if (error.message === 'Player not found') {
          return res.status(404).json({ error: 'Player not found' });
        }
        return res.status(500).json({ error: 'Internal server error' });
      }

      return res.status(200).json({ data: result.value });
    } catch (error) {
      console.error('Error in getPlayerPerformanceSummary:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * Get player performance trends
   * @route GET /api/performance/player/:playerId/trends
   */
  public getPlayerPerformanceTrends = async (req: ContainerRequest, res: Response) => {
    try {
      const { playerId } = req.params;
      const { timeframe } = req.query;

      const result = await req.container
        .get<TrackPerformanceTrendsUseCase>('TrackPerformanceTrendsUseCase')
        .execute({ playerId, timeframe: timeframe as string });

      if (!result.isSuccess) {
        const error = result.error;
        if (error.message === 'Invalid player ID format') {
          return res.status(400).json({ error: 'Invalid player ID format' });
        }
        if (error.message === 'Player not found') {
          return res.status(404).json({ error: 'Player not found' });
        }
        if (error.message === 'Invalid timeframe') {
          return res.status(400).json({ error: 'Invalid timeframe' });
        }
        return res.status(500).json({ error: 'Internal server error' });
      }

      return res.status(200).json({ data: result.value });
    } catch (error) {
      console.error('Error in getPlayerPerformanceTrends:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * Record player performance
   * @route POST /api/performance/player/:playerId/record
   */
  public recordPlayerPerformance = async (req: ContainerRequest & AuthRequest, res: Response) => {
    try {
      const { playerId } = req.params;
      const performanceData = req.body;

      // Verify admin role
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Unauthorized: Admin access required' });
      }

      const result = await req.container
        .get<RecordPerformanceEntryUseCase>('RecordPerformanceEntryUseCase')
        .execute({ playerId, performanceData });

      if (!result.isSuccess) {
        const error = result.error;
        if (error.message === 'Invalid player ID format') {
          return res.status(400).json({ error: 'Invalid player ID format' });
        }
        if (error.message === 'Player not found') {
          return res.status(404).json({ error: 'Player not found' });
        }
        if (error.message.includes('Invalid performance data')) {
          return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Internal server error' });
      }

      return res.status(201).json({ data: result.value });
    } catch (error) {
      console.error('Error in recordPlayerPerformance:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}
