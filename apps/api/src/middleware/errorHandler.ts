import { Request, Response, NextFunction } from 'express';
import { handleApiError } from '@dealflow/shared';

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { statusCode, message, code } = handleApiError(error);

  // Log error in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error:', error);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code,
    },
  });
};
