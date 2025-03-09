import { Request, Response } from 'express';
import { CreateLeagueUseCase } from '../../core/use-cases/league/create-league.use-case';
import { CreateLeagueDto, createLeagueSchema } from '../../core/domain/dtos/create-league.dto';
import { BadRequestError, ConflictError } from '../middlewares/error.middleware';

/**
 * Controlador para las ligas
 */
export class LeagueController {
  constructor(private readonly createLeagueUseCase: CreateLeagueUseCase) {}

  /**
   * Crea una nueva liga
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      // Validar los datos de entrada
      const leagueData = createLeagueSchema.parse(req.body);

      // Asignar el ID del usuario autenticado como administrador si no se proporciona
      if (!leagueData.adminId && req.user) {
        leagueData.adminId = req.user.userId;
      }

      // Ejecutar el caso de uso
      const result = await this.createLeagueUseCase.execute(leagueData as CreateLeagueDto);

      // Manejar el resultado
      if (result.isSuccess) {
        res.status(201).json({
          status: 'success',
          data: result.getValue(),
        });
      } else {
        // Determinar el tipo de error
        const error = result.getError();
        if (error.message.includes('Ya existe una liga con el nombre')) {
          throw new ConflictError(error.message);
        } else {
          throw new BadRequestError(error.message);
        }
      }
    } catch (error) {
      // Los errores serán manejados por el middleware de errores
      throw error;
    }
  }
} 