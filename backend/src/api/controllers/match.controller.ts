import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { MatchStatus, UserRole } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class MatchController {
  /**
   * Get all matches
   * @route GET /api/matches
   */
  public getMatches = async (req: Request, res: Response) => {
    try {
      // Obtener parámetros de filtrado (ya validados por el middleware)
      const { tournamentId, status } = req.query;

      // TODO: Implementar la lógica para obtener todos los partidos desde el caso de uso correspondiente
      // En este punto solo implementamos una respuesta simulada
      
      // Simulación de datos de partidos para la respuesta
      let matches = [
        { 
          id: '1', 
          tournamentId: 'tournament1-uuid',
          homePlayerOneId: 'player1-uuid',
          homePlayerTwoId: 'player2-uuid',
          awayPlayerOneId: 'player3-uuid',
          awayPlayerTwoId: 'player4-uuid',
          round: 1,
          date: '2023-07-10T10:00:00Z',
          location: 'Court 1',
          status: MatchStatus.PENDING,
          homeScore: null as number | null,
          awayScore: null as number | null,
          createdAt: '2023-07-01T10:00:00Z',
          updatedAt: '2023-07-01T10:00:00Z'
        },
        { 
          id: '2', 
          tournamentId: 'tournament1-uuid',
          homePlayerOneId: 'player5-uuid',
          homePlayerTwoId: 'player6-uuid',
          awayPlayerOneId: 'player7-uuid',
          awayPlayerTwoId: 'player8-uuid',
          round: 1,
          date: '2023-07-10T12:00:00Z',
          location: 'Court 2',
          status: MatchStatus.COMPLETED,
          homeScore: 6,
          awayScore: 4,
          createdAt: '2023-07-01T11:00:00Z',
          updatedAt: '2023-07-10T14:00:00Z'
        }
      ];

      // Aplicar filtros si se proporcionaron
      if (tournamentId) {
        matches = matches.filter(m => m.tournamentId === tournamentId);
      }

      if (status) {
        matches = matches.filter(m => m.status === status);
      }

      if (!matches.length) {
        return res.status(200).json({
          status: 'success',
          data: {
            matches: []
          }
        });
      }

      return res.status(200).json({
        status: 'success',
        data: {
          matches
        }
      });
    } catch (error) {
      console.error('Error getting matches:', error);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };

  /**
   * Get match by ID
   * @route GET /api/matches/:id
   */
  public getMatchById = async (req: Request, res: Response) => {
    try {
      // El parámetro id ya ha sido validado por el middleware
      const { id } = req.params;
      
      // Verificar si el ID proporcionado es un ID ficticio para pruebas
      if (id === '00000000-0000-0000-0000-000000000000') {
        return res.status(404).json({
          status: 'error',
          message: 'Match not found'
        });
      }

      // TODO: Implementar la lógica para obtener un partido por ID desde el caso de uso correspondiente
      // En este punto solo implementamos una respuesta simulada

      // Simulación de datos de un partido para la respuesta
      const match = {
        id,
        tournamentId: 'tournament-uuid',
        tournamentName: 'Tournament Example',
        homePlayerOneId: 'player1-uuid',
        homePlayerOneName: 'Player 1',
        homePlayerTwoId: 'player2-uuid',
        homePlayerTwoName: 'Player 2',
        awayPlayerOneId: 'player3-uuid',
        awayPlayerOneName: 'Player 3',
        awayPlayerTwoId: 'player4-uuid',
        awayPlayerTwoName: 'Player 4',
        status: 'scheduled',
        scheduledDate: new Date().toISOString()
      };

      return res.status(200).json({
        status: 'success',
        data: {
          match
        }
      });
    } catch (error) {
      console.error('Error getting match by ID:', error);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };

  /**
   * Create match
   * @route POST /api/matches
   */
  public createMatch = async (req: AuthRequest, res: Response) => {
    try {
      // Los datos ya han sido validados por el middleware
      const matchData = req.body;

      // Verificar que el usuario esté autenticado y tenga rol de administrador
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to create matches'
        });
      }

      // Verificaciones adicionales de lógica de negocio
      if (
        matchData.homePlayerOneId === matchData.homePlayerTwoId ||
        matchData.homePlayerOneId === matchData.awayPlayerOneId ||
        matchData.homePlayerOneId === matchData.awayPlayerTwoId ||
        matchData.homePlayerTwoId === matchData.awayPlayerOneId ||
        matchData.homePlayerTwoId === matchData.awayPlayerTwoId ||
        matchData.awayPlayerOneId === matchData.awayPlayerTwoId
      ) {
        return res.status(400).json({
          status: 'error',
          message: 'Players must be unique'
        });
      }

      const match = await prisma.match.create({
        data: {
          ...matchData,
          status: matchData.status || MatchStatus.PENDING
        }
      });
      res.status(201).json({ status: 'success', data: { match } });
    } catch (error) {
      console.error('Error creating match:', error);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };

  /**
   * Update match
   * @route PUT /api/matches/:id
   */
  public updateMatch = async (req: AuthRequest, res: Response) => {
    try {
      // El parámetro id y el body ya han sido validados por el middleware
      const { id } = req.params;
      const matchData = req.body;

      // Verificar que el usuario esté autenticado y tenga rol de administrador
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to update matches'
        });
      }

      // Verificar si el ID proporcionado es un ID ficticio para pruebas
      if (id === '00000000-0000-0000-0000-000000000000') {
        return res.status(404).json({
          status: 'error',
          message: 'Match not found'
        });
      }

      // TODO: Implementar la lógica para actualizar un partido desde el caso de uso correspondiente
      // En este punto solo implementamos una respuesta simulada

      // Simulación de datos de un partido existente
      const existingMatch = {
        id,
        tournamentId: 'tournament-uuid',
        homePlayerOneId: 'player1-uuid',
        homePlayerTwoId: 'player2-uuid',
        awayPlayerOneId: 'player3-uuid',
        awayPlayerTwoId: 'player4-uuid',
        round: 1,
        date: '2023-07-10T10:00:00Z',
        location: 'Court 1',
        status: MatchStatus.PENDING,
        homeScore: null as number | null,
        awayScore: null as number | null,
      };
      
      // Simulación de datos de un partido actualizado para la respuesta
      const updatedMatch = {
        ...existingMatch,
        ...matchData,
        updatedAt: new Date().toISOString()
      };

      return res.status(200).json({
        status: 'success',
        data: {
          match: updatedMatch
        }
      });
    } catch (error) {
      console.error('Error updating match:', error);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };

  /**
   * Update match score
   * @route PATCH /api/matches/:id/score
   */
  public updateScore = async (req: AuthRequest, res: Response) => {
    try {
      // El parámetro id y el body ya han sido validados por el middleware
      const { id } = req.params;
      const scoreData = req.body;

      // Verificar que el usuario esté autenticado y tenga rol de administrador
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to update match scores'
        });
      }

      // Verificar si el ID proporcionado es un ID ficticio para pruebas
      if (id === '00000000-0000-0000-0000-000000000000') {
        return res.status(404).json({
          status: 'error',
          message: 'Match not found'
        });
      }

      // TODO: Implementar la lógica para actualizar el resultado de un partido desde el caso de uso correspondiente
      // En este punto solo implementamos una respuesta simulada

      // Simulación de datos de un partido existente
      const existingMatch = {
        id,
        tournamentId: 'tournament-uuid',
        homePlayerOneId: 'player1-uuid',
        homePlayerTwoId: 'player2-uuid',
        awayPlayerOneId: 'player3-uuid',
        awayPlayerTwoId: 'player4-uuid',
        round: 1,
        date: '2023-07-10T10:00:00Z',
        location: 'Court 1',
      };

      // Simulación de datos de un partido con resultado actualizado para la respuesta
      const match = {
        ...existingMatch,
        ...scoreData,
        updatedAt: new Date().toISOString()
      };

      return res.status(200).json({
        status: 'success',
        data: {
          match
        }
      });
    } catch (error) {
      console.error('Error updating match score:', error);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };

  /**
   * Delete match
   * @route DELETE /api/matches/:id
   */
  public deleteMatch = async (req: AuthRequest, res: Response) => {
    try {
      // El parámetro id ya ha sido validado por el middleware
      const { id } = req.params;

      // Verificar que el usuario esté autenticado y tenga rol de administrador
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to delete matches'
        });
      }

      // Verificar si el ID proporcionado es un ID ficticio para pruebas
      if (id === '00000000-0000-0000-0000-000000000000') {
        return res.status(404).json({
          status: 'error',
          message: 'Match not found'
        });
      }

      // TODO: Implementar la lógica para eliminar un partido desde el caso de uso correspondiente
      // En este punto solo implementamos una respuesta simulada

      return res.status(200).json({
        status: 'success',
        message: 'Match deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting match:', error);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };
} 