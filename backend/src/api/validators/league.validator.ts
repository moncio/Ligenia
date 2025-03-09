import { z } from 'zod';
import { createLeagueSchema } from '../../core/domain/dtos/create-league.dto';
import { validate } from '../middlewares/validation.middleware';

/**
 * Validador para la creación de ligas
 */
export const validateCreateLeague = validate(
  z.object({
    body: createLeagueSchema,
  })
); 