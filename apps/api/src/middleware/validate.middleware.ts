import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ApiError } from '@dealflow/shared';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      const details = error.errors?.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      next(new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', details));
    }
  };
};
