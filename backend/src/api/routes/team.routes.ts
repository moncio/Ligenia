import { Router } from 'express';
import { TeamController } from '../controllers/team.controller';
import { validateCreateTeam, validateUpdateTeam } from '../validators/team.validator';
import { authenticate } from '../middlewares/auth.middleware';

/**
 * Rutas para los equipos
 */
export const teamRouter = (teamController: TeamController): Router => {
  const router = Router();

  /**
   * @route   POST /api/teams
   * @desc    Crear un nuevo equipo
   * @access  Privado (solo usuarios autenticados)
   */
  router.post(
    '/',
    authenticate,
    validateCreateTeam,
    (req, res) => teamController.create(req, res)
  );

  /**
   * @route   GET /api/teams/:id
   * @desc    Obtener un equipo por su ID
   * @access  Público
   */
  router.get(
    '/:id',
    (req, res) => teamController.getById(req, res)
  );

  /**
   * @route   GET /api/teams
   * @desc    Obtener todos los equipos con paginación y filtrado opcional
   * @access  Público
   */
  router.get(
    '/',
    (req, res) => teamController.getAll(req, res)
  );

  /**
   * @route   PUT /api/teams/:id
   * @desc    Actualizar un equipo existente
   * @access  Privado (solo usuarios autenticados)
   */
  router.put(
    '/:id',
    authenticate,
    validateUpdateTeam,
    (req, res) => teamController.update(req, res)
  );

  /**
   * @route   DELETE /api/teams/:id
   * @desc    Eliminar un equipo
   * @access  Privado (solo usuarios autenticados)
   */
  router.delete(
    '/:id',
    authenticate,
    (req, res) => teamController.delete(req, res)
  );

  return router;
}; 