import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Invalid request data',
      issues: err.errors,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.code ?? 'ERROR',
      message: err.message,
    });
    return;
  }

  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err instanceof Error
        ? err.message
        : 'Unknown error';

  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message,
  });
}
