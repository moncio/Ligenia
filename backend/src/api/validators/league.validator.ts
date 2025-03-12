import { z } from 'zod';
import { createLeagueSchema } from '../../core/domain/dtos/create-league.dto';
import { updateLeagueSchema } from '../../core/domain/dtos/update-league.dto';
import { validate } from '../middlewares/validation.middleware';

/**
 * Validador para la creación de ligas
 */
export const validateCreateLeague = validate(
  z.object({
    body: createLeagueSchema,
  })
);

/**
 * Validador para la actualización de ligas
 */
export const validateUpdateLeague = validate(
  z.object({
    body: updateLeagueSchema,
  })
); 