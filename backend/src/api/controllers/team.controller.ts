import { Request, Response } from 'express';
import { CreateTeamUseCase } from '../../core/use-cases/team/create-team.use-case';
import { GetTeamByIdUseCase } from '../../core/use-cases/team/get-team-by-id.use-case';
import { GetAllTeamsUseCase } from '../../core/use-cases/team/get-all-teams.use-case';
import { UpdateTeamUseCase } from '../../core/use-cases/team/update-team.use-case';
import { DeleteTeamUseCase } from '../../core/use-cases/team/delete-team.use-case';
import { PaginationOptions } from '../../core/domain/interfaces/repository.interface';

/**
 * Controlador para las operaciones de equipos
 */
export class TeamController {
  constructor(
    private readonly createTeamUseCase: CreateTeamUseCase,
    private readonly getTeamByIdUseCase: GetTeamByIdUseCase,
    private readonly getAllTeamsUseCase: GetAllTeamsUseCase,
    private readonly updateTeamUseCase: UpdateTeamUseCase,
    private readonly deleteTeamUseCase: DeleteTeamUseCase,
  ) {}

  /**
   * Crea un nuevo equipo
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.createTeamUseCase.execute(req.body);

      if (result.success) {
        res.status(201).json(result.data);
      } else {
        res.status(400).json({ error: result.error });
      }
    } catch (error) {
      // Los errores serán manejados por el middleware de errores
      throw error;
    }
  }

  /**
   * Obtiene un equipo por su ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.getTeamByIdUseCase.execute(id);

      if (result.success) {
        res.status(200).json(result.data);
      } else {
        res.status(404).json({ error: result.error });
      }
    } catch (error) {
      // Los errores serán manejados por el middleware de errores
      throw error;
    }
  }

  /**
   * Obtiene todos los equipos con paginación
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { page = '1', limit = '10', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

      const options: PaginationOptions = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      };

      const result = await this.getAllTeamsUseCase.execute(options);

      if (result.success) {
        res.status(200).json(result.data);
      } else {
        res.status(400).json({ error: result.error });
      }
    } catch (error) {
      // Los errores serán manejados por el middleware de errores
      throw error;
    }
  }

  /**
   * Actualiza un equipo existente
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.updateTeamUseCase.execute([id, req.body]);

      if (result.success) {
        res.status(200).json(result.data);
      } else {
        res.status(400).json({ error: result.error });
      }
    } catch (error) {
      // Los errores serán manejados por el middleware de errores
      throw error;
    }
  }

  /**
   * Elimina un equipo
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.deleteTeamUseCase.execute(id);

      if (result.success) {
        res.status(204).send();
      } else {
        res.status(400).json({ error: result.error });
      }
    } catch (error) {
      // Los errores serán manejados por el middleware de errores
      throw error;
    }
  }
} 