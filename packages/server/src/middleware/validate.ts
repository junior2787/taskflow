import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from './errorHandler.js';

export const validate = (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        throw new AppError(400, 'Dados inválidos', error.errors);
      }
      next(error);
    }
  };