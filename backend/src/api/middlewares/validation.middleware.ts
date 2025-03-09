import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { BadRequestError } from './error.middleware';

/**
 * Middleware para validar datos de la solicitud con Zod
 */
export const validate = (schema: AnyZodObject) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Validar los datos de la solicitud (body, query, params)
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Formatear los errores de validación
        const formattedErrors = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
        }));
        
        next(new BadRequestError(`Validation error: ${JSON.stringify(formattedErrors)}`));
      } else {
        next(error);
      }
    }
  };
}; 