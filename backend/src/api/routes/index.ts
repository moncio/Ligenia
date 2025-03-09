import { Router } from 'express';
import { leagueRouter } from './league.routes';
import { LeagueController } from '../controllers/league.controller';
import { CreateLeagueUseCase } from '../../core/use-cases/league/create-league.use-case';
import { LeagueRepository } from '../../infrastructure/database/repositories/league.repository';

/**
 * Configuración de las rutas de la API
 */
export const setupRoutes = (): Router => {
  const router = Router();

  // Repositorios
  const leagueRepository = new LeagueRepository();

  // Casos de uso
  const createLeagueUseCase = new CreateLeagueUseCase(leagueRepository);

  // Controladores
  const leagueController = new LeagueController(createLeagueUseCase);

  // Rutas
  router.use('/leagues', leagueRouter(leagueController));

  return router;
}; 