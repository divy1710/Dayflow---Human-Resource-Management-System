import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const firstError = error.errors[0];
        const fieldPath = firstError.path.join('.');
        return res.status(400).json({
          status: 'error',
          message: `${firstError.message}`,
          field: fieldPath,
          errors: error.errors,
        });
      }
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
      });
    }
  };
};
