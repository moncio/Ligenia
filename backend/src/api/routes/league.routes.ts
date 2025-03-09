import { Router } from 'express';
import { LeagueController } from '../controllers/league.controller';
import { validateCreateLeague } from '../validators/league.validator';
import { authenticate, authorize } from '../middlewares/auth.middleware';

/**
 * Rutas para las ligas
 */
export const leagueRouter = (leagueController: LeagueController): Router => {
  const router = Router();

  /**
   * @route   POST /api/leagues
   * @desc    Crear una nueva liga
   * @access  Privado (solo usuarios autenticados)
   */
  router.post(
    '/',
    authenticate,
    validateCreateLeague,
    (req, res) => leagueController.create(req, res)
  );

  return router;
}; 