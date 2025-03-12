import { body, ValidationChain } from 'express-validator';
import { validateRequest } from '../middlewares/validation.middleware';

/**
 * Validación para la creación de equipos
 */
export const validateCreateTeam = [
  body('name')
    .notEmpty().withMessage('El nombre del equipo es obligatorio')
    .isString().withMessage('El nombre debe ser un texto')
    .isLength({ max: 100 }).withMessage('El nombre no puede tener más de 100 caracteres'),
  
  body('tournamentId')
    .notEmpty().withMessage('El ID del torneo es obligatorio')
    .isString().withMessage('El ID del torneo debe ser un texto'),
  
  body('players')
    .isArray().withMessage('Los jugadores deben ser un array')
    .notEmpty().withMessage('Debe haber al menos un jugador')
    .custom((value) => {
      if (value.length > 2) {
        throw new Error('No puede haber más de 2 jugadores');
      }
      return true;
    }),
  
  body('ranking')
    .optional()
    .isInt({ min: 0 }).withMessage('El ranking debe ser un número entero positivo'),
  
  body('logoUrl')
    .optional()
    .isURL().withMessage('La URL del logo debe ser una URL válida'),
  
  validateRequest,
];

/**
 * Validación para la actualización de equipos
 */
export const validateUpdateTeam = [
  body('name')
    .optional()
    .isString().withMessage('El nombre debe ser un texto')
    .isLength({ max: 100 }).withMessage('El nombre no puede tener más de 100 caracteres'),
  
  body('players')
    .optional()
    .isArray().withMessage('Los jugadores deben ser un array')
    .notEmpty().withMessage('Debe haber al menos un jugador')
    .custom((value) => {
      if (value.length > 2) {
        throw new Error('No puede haber más de 2 jugadores');
      }
      return true;
    }),
  
  body('ranking')
    .optional()
    .isInt({ min: 0 }).withMessage('El ranking debe ser un número entero positivo'),
  
  body('logoUrl')
    .optional()
    .isURL().withMessage('La URL del logo debe ser una URL válida'),
  
  validateRequest,
]; 