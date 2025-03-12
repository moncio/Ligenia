import { Router } from 'express';
import { TournamentController } from '../controllers/tournament.controller';
import { validateCreateTournament, validateUpdateTournament } from '../validators/tournament.validator';
import { authenticate } from '../middlewares/auth.middleware';

/**
 * Rutas para los torneos
 */
export const tournamentRouter = (tournamentController: TournamentController): Router => {
  const router = Router();

  /**
   * @route   POST /api/tournaments
   * @desc    Crear un nuevo torneo
   * @access  Privado (solo usuarios autenticados)
   */
  router.post(
    '/',
    authenticate,
    validateCreateTournament,
    (req, res) => tournamentController.create(req, res)
  );

  /**
   * @route   GET /api/tournaments/:id
   * @desc    Obtener un torneo por su ID
   * @access  Público
   */
  router.get(
    '/:id',
    (req, res) => tournamentController.getById(req, res)
  );

  /**
   * @route   GET /api/tournaments
   * @desc    Obtener todos los torneos con paginación y filtrado opcional
   * @access  Público
   */
  router.get(
    '/',
    (req, res) => tournamentController.getAll(req, res)
  );

  /**
   * @route   PUT /api/tournaments/:id
   * @desc    Actualizar un torneo existente
   * @access  Privado (solo usuarios autenticados)
   */
  router.put(
    '/:id',
    authenticate,
    validateUpdateTournament,
    (req, res) => tournamentController.update(req, res)
  );

  /**
   * @route   DELETE /api/tournaments/:id
   * @desc    Eliminar un torneo
   * @access  Privado (solo usuarios autenticados)
   */
  router.delete(
    '/:id',
    authenticate,
    (req, res) => tournamentController.delete(req, res)
  );

  return router;
}; 