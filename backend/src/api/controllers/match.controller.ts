import { Request, Response } from 'express';
import { AuthRequest, AuthContainerRequest } from '../middlewares/auth.middleware';
import { MatchStatus } from '@prisma/client';
import { UserRole } from '../../core/domain/user/user.entity';
import { ContainerRequest } from '../middlewares/di.middleware';
import { isValidUUID } from '../utils/uuid-validator';
import { GetMatchByIdUseCase } from '../../core/application/use-cases/match/get-match-by-id.use-case';
import { CreateMatchUseCase } from '../../core/application/use-cases/match/create-match.use-case';
import { UpdateMatchDetailsUseCase } from '../../core/application/use-cases/match/update-match-details.use-case';
import { RecordMatchResultUseCase } from '../../core/application/use-cases/match/record-match-result.use-case';
import { DeleteMatchUseCase } from '../../core/application/use-cases/match/delete-match.use-case';
import { ListUserMatchesUseCase } from '../../core/application/use-cases/match/list-user-matches.use-case';
import { Match } from '../../core/domain/match/match.entity';

export class MatchController {
  /**
   * Get all matches
   * @route GET /api/matches
   */
  public getMatches = async (req: ContainerRequest, res: Response) => {
    try {
      console.log('Received request: getMatches');
      console.log('Query params:', req.query);
      
      // Obtener parámetros de filtrado (ya validados por el middleware)
      const { tournamentId, status, player1Id, player2Id, fromDate, toDate, limit = '10', page = '1' } = req.query;
      
      // Convert query parameters
      const limitNum = parseInt(limit as string, 10) || 10;
      const pageNum = parseInt(page as string, 10) || 1;
      
      const listUserMatchesUseCase = req.container?.get(ListUserMatchesUseCase);
      
      if (!listUserMatchesUseCase) {
        console.error('listUserMatchesUseCase is undefined or null');
        return res.status(500).json({ 
          status: 'error', 
          message: 'Internal server error - Use case not available' 
        });
      }
      
      // Prepare input for use case
      const input = {
        page: pageNum,
        limit: limitNum,
        tournamentId: tournamentId ? String(tournamentId) : undefined,
        status: status ? status as string : undefined,
        playerId: player1Id ? String(player1Id) : player2Id ? String(player2Id) : undefined,
        fromDate: fromDate ? String(fromDate) : undefined,
        toDate: toDate ? String(toDate) : undefined,
      };
      
      console.log('Executing listUserMatchesUseCase with input:', input);
      const result = await listUserMatchesUseCase.execute(input);
      
      if (result.isSuccess()) {
        const { matches, pagination } = result.getValue();
        return res.status(200).json({
          status: 'success',
          data: {
            matches,
            pagination,
          },
        });
      } else {
        console.error('Error from listUserMatchesUseCase:', result.getError());
        return res.status(400).json({
          status: 'error',
          message: result.getError().message,
        });
      }
    } catch (error) {
      console.error('Error getting matches:', error);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };

  /**
   * Get match by ID
   * @route GET /api/matches/:id
   */
  public getMatchById = async (req: ContainerRequest, res: Response) => {
    try {
      console.log('Received request: getMatchById');
      
      // El parámetro id ya ha sido validado por el middleware
      const { id } = req.params;
      console.log('Match ID:', id);
      
      const getMatchByIdUseCase = req.container?.get(GetMatchByIdUseCase);
      
      if (!getMatchByIdUseCase) {
        console.error('getMatchByIdUseCase is undefined or null');
        return res.status(500).json({ 
          status: 'error', 
          message: 'Internal server error - Use case not available' 
        });
      }
      
      const result = await getMatchByIdUseCase.execute({ id });
      
      if (result.isSuccess()) {
        return res.status(200).json({
          status: 'success',
          data: {
            match: result.getValue(),
          },
        });
      } else {
        const errorMessage = result.getError().message;
        if (errorMessage === 'Match not found') {
          return res.status(404).json({
            status: 'error',
            message: errorMessage,
          });
        }
        return res.status(400).json({
          status: 'error',
          message: errorMessage,
        });
      }
    } catch (error) {
      console.error('Error getting match:', error);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };

  /**
   * Create a new match
   * @route POST /api/matches
   */
  public createMatch = async (req: AuthContainerRequest, res: Response) => {
    try {
      console.log('Received request: createMatch');
      console.log('Request body:', req.body);
      
      // Only admins can create matches directly
      if (req.user?.role !== UserRole.ADMIN) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to access this resource',
        });
      }
      
      const createMatchUseCase = req.container?.get(CreateMatchUseCase);
      
      if (!createMatchUseCase) {
        console.error('createMatchUseCase is undefined or null');
        return res.status(500).json({ 
          status: 'error', 
          message: 'Internal server error - Use case not available' 
        });
      }
      
      const result = await createMatchUseCase.execute(req.body);
      
      if (result.isSuccess()) {
        return res.status(201).json({
          status: 'success',
          data: {
            match: result.getValue(),
          },
        });
      } else {
        return res.status(400).json({
          status: 'error',
          message: result.getError().message,
        });
      }
    } catch (error) {
      console.error('Error creating match:', error);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };

  /**
   * Update match details
   * @route PUT /api/matches/:id
   */
  public updateMatch = async (req: AuthContainerRequest, res: Response) => {
    try {
      console.log('Received request: updateMatch');
      
      const { id } = req.params;
      console.log('Match ID:', id);
      console.log('Request body:', req.body);
      
      // Only admins can update matches
      if (req.user?.role !== UserRole.ADMIN) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to access this resource',
        });
      }
      
      const updateMatchDetailsUseCase = req.container?.get(UpdateMatchDetailsUseCase);
      
      if (!updateMatchDetailsUseCase) {
        console.error('updateMatchDetailsUseCase is undefined or null');
        return res.status(500).json({ 
          status: 'error', 
          message: 'Internal server error - Use case not available' 
        });
      }
      
      // Combine ID from URL with body data
      const input = {
        id,
        ...req.body,
      };
      
      const result = await updateMatchDetailsUseCase.execute(input);
      
      if (result.isSuccess()) {
        return res.status(200).json({
          status: 'success',
          data: {
            match: result.getValue(),
          },
        });
      } else {
        const errorMessage = result.getError().message;
        if (errorMessage === 'Match not found') {
          return res.status(404).json({
            status: 'error',
            message: errorMessage,
          });
        }
        return res.status(400).json({
          status: 'error',
          message: errorMessage,
        });
      }
    } catch (error) {
      console.error('Error updating match:', error);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };

  /**
   * Update match score
   * @route PATCH /api/matches/:id/score
   */
  public updateScore = async (req: AuthContainerRequest, res: Response) => {
    try {
      console.log('Received request: updateScore');
      
      const { id } = req.params;
      console.log('Match ID:', id);
      console.log('Request body:', req.body);
      
      // Only admins can update match scores
      if (req.user?.role !== UserRole.ADMIN) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to access this resource',
        });
      }
      
      const recordMatchResultUseCase = req.container?.get(RecordMatchResultUseCase);
      
      if (!recordMatchResultUseCase) {
        console.error('recordMatchResultUseCase is undefined or null');
        return res.status(500).json({ 
          status: 'error', 
          message: 'Internal server error - Use case not available' 
        });
      }
      
      // Combine ID from URL with body data
      const input = {
        matchId: id,
        ...req.body,
      };
      
      const result = await recordMatchResultUseCase.execute(input);
      
      if (result.isSuccess()) {
        return res.status(200).json({
          status: 'success',
          data: {
            match: result.getValue(),
          },
        });
      } else {
        const errorMessage = result.getError().message;
        if (errorMessage === 'Match not found') {
          return res.status(404).json({
            status: 'error',
            message: errorMessage,
          });
        }
        return res.status(400).json({
          status: 'error',
          message: errorMessage,
        });
      }
    } catch (error) {
      console.error('Error updating match score:', error);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };

  /**
   * Delete a match
   * @route DELETE /api/matches/:id
   */
  public deleteMatch = async (req: AuthContainerRequest, res: Response) => {
    try {
      console.log('Received request: deleteMatch');
      
      const { id } = req.params;
      console.log('Match ID:', id);
      
      // Only admins can delete matches
      if (req.user?.role !== UserRole.ADMIN) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to access this resource',
        });
      }
      
      const deleteMatchUseCase = req.container?.get(DeleteMatchUseCase);
      
      if (!deleteMatchUseCase) {
        console.error('deleteMatchUseCase is undefined or null');
        return res.status(500).json({ 
          status: 'error', 
          message: 'Internal server error - Use case not available' 
        });
      }
      
      const result = await deleteMatchUseCase.execute({ 
        matchId: id,
        userId: req.user.id 
      });
      
      if (result.isSuccess()) {
        return res.status(200).json({
          status: 'success',
          data: null,
        });
      } else {
        const errorMessage = result.getError().message;
        if (errorMessage === 'Match not found') {
          return res.status(404).json({
            status: 'error',
            message: errorMessage,
          });
        } 
        if (errorMessage.includes('Permission denied')) {
          return res.status(403).json({
            status: 'error',
            message: errorMessage,
          });
        }
        return res.status(400).json({
          status: 'error',
          message: errorMessage,
        });
      }
    } catch (error) {
      console.error('Error deleting match:', error);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };
}
