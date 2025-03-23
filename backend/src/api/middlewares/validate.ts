import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Middleware genérico para validar el cuerpo de la petición (request.body)
 * @param schema - Esquema Zod para validar el body
 * @returns Middleware de Express
 */
export const validateBody = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation error',
          errors: error.format()
        });
      }
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error during validation'
      });
    }
  };
};

/**
 * Middleware genérico para validar los parámetros de la petición (request.params)
 * @param schema - Esquema Zod para validar los params
 * @returns Middleware de Express
 */
export const validateParams = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = await schema.parseAsync(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation error in URL parameters',
          errors: error.format()
        });
      }
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error during parameter validation'
      });
    }
  };
};

/**
 * Middleware genérico para validar los query params de la petición (request.query)
 * @param schema - Esquema Zod para validar los query params
 * @returns Middleware de Express
 */
export const validateQuery = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation error in query parameters',
          errors: error.format()
        });
      }
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error during query validation'
      });
    }
  };
}; 