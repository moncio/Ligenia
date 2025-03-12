import { Request, Response } from 'express';
import { CreateTournamentUseCase } from '../../core/use-cases/tournament/create-tournament.use-case';
import { GetTournamentByIdUseCase } from '../../core/use-cases/tournament/get-tournament-by-id.use-case';
import { GetAllTournamentsUseCase } from '../../core/use-cases/tournament/get-all-tournaments.use-case';
import { UpdateTournamentUseCase } from '../../core/use-cases/tournament/update-tournament.use-case';
import { DeleteTournamentUseCase } from '../../core/use-cases/tournament/delete-tournament.use-case';
import { CreateTournamentDto, createTournamentSchema } from '../../core/domain/dtos/create-tournament.dto';
import { UpdateTournamentDto } from '../../core/domain/dtos/update-tournament.dto';
import { BadRequestError, ConflictError, NotFoundError } from '../middlewares/error.middleware';

/**
 * Controlador para los torneos
 */
export class TournamentController {
  constructor(
    private readonly createTournamentUseCase: CreateTournamentUseCase,
    private readonly getTournamentByIdUseCase: GetTournamentByIdUseCase,
    private readonly getAllTournamentsUseCase: GetAllTournamentsUseCase,
    private readonly updateTournamentUseCase: UpdateTournamentUseCase,
    private readonly deleteTournamentUseCase: DeleteTournamentUseCase
  ) {}

  /**
   * Crea un nuevo torneo
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      // Validar los datos de entrada
      const tournamentData = createTournamentSchema.parse(req.body);

      // Ejecutar el caso de uso
      const result = await this.createTournamentUseCase.execute(tournamentData as CreateTournamentDto);

      // Manejar el resultado
      if (result.isSuccess) {
        res.status(201).json({
          status: 'success',
          data: result.getValue(),
        });
      } else {
        // Determinar el tipo de error
        const error = result.getError();
        if (error.message.includes('La liga especificada no existe')) {
          throw new NotFoundError(error.message);
        } else if (error.message.includes('Ya existe un torneo con el nombre')) {
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

  /**
   * Obtiene un torneo por su ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Ejecutar el caso de uso
      const result = await this.getTournamentByIdUseCase.execute(id);

      // Manejar el resultado
      if (result.isSuccess) {
        res.status(200).json({
          status: 'success',
          data: result.getValue(),
        });
      } else {
        // Determinar el tipo de error
        const error = result.getError();
        if (error.message.includes('El torneo no existe')) {
          throw new NotFoundError(error.message);
        } else {
          throw new BadRequestError(error.message);
        }
      }
    } catch (error) {
      // Los errores serán manejados por el middleware de errores
      throw error;
    }
  }

  /**
   * Obtiene todos los torneos con paginación y filtrado opcional
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      // Extraer parámetros de consulta
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const leagueId = req.query.leagueId as string;

      // Ejecutar el caso de uso
      const result = await this.getAllTournamentsUseCase.execute({
        pagination: { page, limit },
        leagueId,
      });

      // Manejar el resultado
      if (result.isSuccess) {
        res.status(200).json({
          status: 'success',
          ...result.getValue(),
        });
      } else {
        throw new BadRequestError(result.getError().message);
      }
    } catch (error) {
      // Los errores serán manejados por el middleware de errores
      throw error;
    }
  }

  /**
   * Actualiza un torneo existente
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body as UpdateTournamentDto;

      // Ejecutar el caso de uso
      const result = await this.updateTournamentUseCase.execute([id, updateData]);

      // Manejar el resultado
      if (result.isSuccess) {
        res.status(200).json({
          status: 'success',
          data: result.getValue(),
        });
      } else {
        // Determinar el tipo de error
        const error = result.getError();
        if (error.message.includes('El torneo no existe')) {
          throw new NotFoundError(error.message);
        } else if (error.message.includes('La liga especificada no existe')) {
          throw new NotFoundError(error.message);
        } else if (error.message.includes('Ya existe un torneo con el nombre')) {
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

  /**
   * Elimina un torneo
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Ejecutar el caso de uso
      const result = await this.deleteTournamentUseCase.execute(id);

      // Manejar el resultado
      if (result.isSuccess) {
        res.status(200).json({
          status: 'success',
          message: 'Torneo eliminado correctamente',
        });
      } else {
        // Determinar el tipo de error
        const error = result.getError();
        if (error.message.includes('El torneo no existe')) {
          throw new NotFoundError(error.message);
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