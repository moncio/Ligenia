import { Router } from 'express';
import { LeagueController } from '../controllers/league.controller';
import { validateCreateLeague } from '../validators/league.validator';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateUpdateLeague } from '../validators/league.validator';

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

  /**
   * @route   GET /api/leagues/:id
   * @desc    Obtener una liga por su ID
   * @access  Público
   */
  router.get(
    '/:id',
    (req, res) => leagueController.getById(req, res)
  );

  /**
   * @route   GET /api/leagues
   * @desc    Obtener todas las ligas con paginación
   * @access  Público
   */
  router.get(
    '/',
    (req, res) => leagueController.getAll(req, res)
  );

  /**
   * @route   PUT /api/leagues/:id
   * @desc    Actualizar una liga existente
   * @access  Privado (solo usuarios autenticados)
   */
  router.put(
    '/:id',
    authenticate,
    validateUpdateLeague,
    (req, res) => leagueController.update(req, res)
  );

  /**
   * @route   DELETE /api/leagues/:id
   * @desc    Eliminar una liga existente
   * @access  Privado (solo usuarios autenticados y administradores)
   */
  router.delete(
    '/:id',
    authenticate,
    (req, res) => leagueController.delete(req, res)
  );

  return router;
}; 